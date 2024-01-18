import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { jwtConfig } from "../../config/jwt.config";
import {
  RefreshToken,
  RefreshTokenSchema,
} from "./entities/refresh-token.entity";
import { RefreshTokenRepository } from "./repository/refresh-token.repository";
import { UserTokenService } from "./user-token.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RefreshToken.name, schema: RefreshTokenSchema },
    ]),
    JwtModule.registerAsync(jwtConfig),
  ],
  providers: [UserTokenService, RefreshTokenRepository],
  exports: [UserTokenService],
})
export class UserTokenModule {}
