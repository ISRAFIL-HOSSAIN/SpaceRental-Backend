import type { Request } from "express";

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { APP_GUARD, Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";

const IS_PUBLIC_KEY = "isPublic";
export const IsPublic = () => SetMetadata(IS_PUBLIC_KEY, true);

@Injectable()
class AuthGuard implements CanActivate {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    //#region Allow when IsPublic is used
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    //#endregion

    //#region Verify jwt token from request or throw
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>(
          "JWT_SECRET",
          "ACOMPLEXSECRETANDKEEPITSAFE",
        ),
      });

      request["user"] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
    //#endregion
  }

  //#region Private helper methods
  private extractTokenFromHeader(request: Request): string {
    const [type, token] = request?.headers?.authorization?.split(" ") ?? [];
    if (type !== "Bearer" || !token) {
      throw new UnauthorizedException();
    }

    return token;
  }
  //#endregion
}

export const AuthGuardProvider = {
  provide: APP_GUARD,
  useClass: AuthGuard,
};
