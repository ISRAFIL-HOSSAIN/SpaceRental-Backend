import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ApplicationUserRepository } from "../application-user/application-user.repository";
import { ApplicationUserDocument } from "../application-user/entities/application-user.entity";
import { ApplicationUserRoleEnum } from "../application-user/enum/application-user-role.enum";
import { SuccessResponseDto } from "../common/dto/success-response.dto";
import { EmailService } from "../email/email.service";
import { EncryptionService } from "../encryption/encryption.service";
import { AdminSignInDto } from "./dto/admin-sign-in.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { SignInDto } from "./dto/sign-in.dto";
import { SignUpDto } from "./dto/sign-up.dto";
import { TokenResponseDto } from "./dto/token-response.dto";
import { RefreshTokenRepository } from "./refresh-token.repository";

@Injectable()
export class AuthenticationService {
  private readonly logger: Logger = new Logger(AuthenticationService.name);

  constructor(
    private readonly applicationUserRepository: ApplicationUserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,

    private readonly jwtService: JwtService,
    private readonly encryptionService: EncryptionService,
    private readonly mailService: EmailService,
  ) {}

  async signUp(signupDto: SignUpDto): Promise<SuccessResponseDto> {
    try {
      signupDto.password = await this.encryptionService.hashPassword(
        signupDto.password,
      );

      const newUser = await this.applicationUserRepository.create(signupDto);

      const accessToken = await this.generateAccessToken(
        newUser?.id?.toString(),
        newUser?.role,
      );

      const refreshToken = await this.createRefreshToken(
        newUser?.id?.toString(),
      );

      const tokenDto = new TokenResponseDto(accessToken, refreshToken, newUser);

      this.mailService.sendUserSignupMail(
        newUser.email,
        newUser.fullName ?? "",
      );

      return new SuccessResponseDto("User registered successfully", tokenDto);
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error(`Error creating user:`, error);
      throw new BadRequestException("Could not register user");
    }
  }

  async signIn(
    signInDto: SignInDto,
    userRole?: ApplicationUserRoleEnum,
  ): Promise<SuccessResponseDto> {
    try {
      const user = await this.applicationUserRepository.findOneWhere({
        email: signInDto.email,
        role: userRole ? userRole : signInDto.role,
      });

      if (!user) {
        throw new NotFoundException(
          `No user found with email: ${signInDto.email}`,
        );
      }
      if (
        !(await this.encryptionService.verifyPassword(
          signInDto.password,
          user.password,
        ))
      ) {
        this.logger.error(
          `Invalid credentials provided with email: ${signInDto.email}`,
        );
        throw new UnauthorizedException("Invalid credentials provided");
      }

      if (user.isPasswordLess) {
        this.logger.error(
          `Password-less login attempted with email: ${signInDto.email}`,
        );
        throw new BadRequestException(
          "To enable password-based login, please set up a password for your account alongside social login.",
        );
      }

      const accessToken = await this.generateAccessToken(
        user?.id?.toString(),
        user?.role,
      );
      const refreshToken = await this.createRefreshToken(user?.id?.toString());

      user.lastLogin = new Date();
      await user.save();

      const tokenDto = new TokenResponseDto(accessToken, refreshToken, user);
      this.mailService.sendUserSigninMail(user.email, user.fullName ?? "");

      return new SuccessResponseDto("Authenticated successfully", tokenDto);
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error(`Error authenticating user:`, error);
      throw new BadRequestException("Could not authenticate user");
    }
  }

  async adminSignIn(
    adminSignInDto: AdminSignInDto,
  ): Promise<SuccessResponseDto> {
    const signInDto = new SignInDto();
    signInDto.email = adminSignInDto.email;
    signInDto.password = adminSignInDto.password;

    const userRole = ApplicationUserRoleEnum.ADMIN;

    return this.signIn(signInDto, userRole);
  }

  async refreshAccessToken(refreshToken: string): Promise<SuccessResponseDto> {
    try {
      const refreshTokenDoc = await this.refreshTokenRepository.findOneWhere(
        {
          token: refreshToken,
          expiresAt: { $gt: new Date() },
        },
        {
          populate: [
            {
              path: "user",
              select: "role",
            },
          ],
        },
      );

      if (!refreshTokenDoc) {
        this.logger.error("Refresh token is invalid or expired");
        throw new BadRequestException("Refresh token is invalid or expired");
      }

      const userData =
        refreshTokenDoc?.user as unknown as ApplicationUserDocument;

      const accessToken = await this.generateAccessToken(
        userData._id.toString(),
        userData.role,
      );

      const tokenDto = new TokenResponseDto(
        accessToken,
        refreshToken,
        userData,
      );

      return new SuccessResponseDto("Token refreshed successfully", tokenDto);
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error(`Error refreshing token:`, error);
      throw new BadRequestException("Could not refresh token");
    }
  }

  async revokeRefreshToken(refreshToken: string): Promise<SuccessResponseDto> {
    try {
      const refreshTokenDoc = await this.refreshTokenRepository.findOneWhere({
        token: refreshToken,
        expiresAt: { $gt: new Date() },
      });

      if (!refreshTokenDoc) {
        this.logger.error(
          `Token is either invalid or expired: ${refreshToken}`,
        );
        throw new BadRequestException(
          "Refresh token is either invalid or expired",
        );
      }

      await this.refreshTokenRepository.updateOneById(refreshTokenDoc.id, {
        expiresAt: new Date(),
      });

      return new SuccessResponseDto("Refresh token revoked successfully");
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error(`Error revoking token:`, error);
      throw new BadRequestException("Could not revoke token");
    }
  }

  async changePassword(
    changePasswordDto: ChangePasswordDto,
    userId: string,
  ): Promise<SuccessResponseDto> {
    try {
      const user = await this.applicationUserRepository.findById(userId);

      if (!user) {
        throw new NotFoundException(`No user found with id: ${userId}`);
      }

      if (
        !(await this.encryptionService.verifyPassword(
          changePasswordDto.oldPassword,
          user.password,
        ))
      ) {
        this.logger.error(
          `User ${userId} tried to change password with an incorrect old password`,
        );
        throw new BadRequestException("Old Password is incorrect");
      }

      const hashedPassword = await this.encryptionService.hashPassword(
        changePasswordDto.newPassword,
      );

      await this.applicationUserRepository.updateOneById(userId, {
        password: hashedPassword,
      });

      return new SuccessResponseDto("Password changed successfully");
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error(`Error changing password:`, error);
      throw new BadRequestException("Could not change password");
    }
  }

  async getLoggedInUser(userId: string): Promise<SuccessResponseDto> {
    try {
      const user = await this.applicationUserRepository.findById(userId, {
        populate: [
          {
            path: "profilePicture",
            select: "url",
            transform: (doc) => doc?.url ?? null,
          },
        ],
      });

      if (!user) {
        throw new NotFoundException(`No user found with id: ${userId}`);
      }

      return new SuccessResponseDto("Logged in user found", user);
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error(`Error getting current user:`, error);
      throw new BadRequestException("Could not get user info");
    }
  }

  // Private Helper Methods
  private async generateAccessToken(userId: string, userRole: string) {
    try {
      const tokenPayload: ITokenPayload = {
        userId,
        userRole,
      };

      return await this.jwtService.signAsync(tokenPayload);
    } catch (error) {
      this.logger.error("Error generating JWT token", error);
      throw new InternalServerErrorException("Error generating JWT token");
    }
  }

  private async createRefreshToken(userId: string): Promise<string> {
    try {
      const token = this.encryptionService.generateUniqueToken();

      const refreshToken = await this.refreshTokenRepository.create({
        token,
        user: userId,
      });

      return refreshToken.token;
    } catch (error) {
      this.logger.error("Error generating refresh token", error);
      throw new InternalServerErrorException("Error generating refresh token");
    }
  }
}
