import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { PaginatedResponseDto } from "../common/dto/paginated-response.dto";
import { SuccessResponseDto } from "../common/dto/success-response.dto";
import { EncryptionService } from "../encryption/encryption.service";
import { ImageMetaService } from "../image-meta/image-meta.service";
import { CreateApplicationUserDto } from "./dto/create-application-user.dto";
import { ListApplicationUserQuery } from "./dto/list-application-user-query.dto";
import { UpdateApplicationUserProfilePictureDto } from "./dto/update-application-user-profile-picture.dto";
import { UpdateApplicationUserDto } from "./dto/update-application-user.dto";
import { ApplicationUserRepository } from "./repository/application-user.repository";

@Injectable()
export class ApplicationUserService {
  private readonly _logger: Logger = new Logger(ApplicationUserService.name);

  constructor(
    private readonly _applicationUserRepository: ApplicationUserRepository,

    private readonly _encryptionService: EncryptionService,
    private readonly _imageService: ImageMetaService,
  ) {}

  async create(
    userCreateDto: CreateApplicationUserDto,
  ): Promise<SuccessResponseDto> {
    try {
      userCreateDto["password"] = await this._encryptionService.hashPassword(
        userCreateDto.password,
      );

      const newUser =
        await this._applicationUserRepository.create(userCreateDto);

      return new SuccessResponseDto("User created successfully", newUser);
    } catch (error) {
      if (error?.options?.cause === "RepositoryException") {
        throw error;
      }

      this._logger.error("Error creating new document:", error.description);
      throw new BadRequestException("Error creating new document");
    }
  }

  async findAll({
    Page = 1,
    PageSize = 10,
    Name = "",
    Email = "",
    UserRole,
  }: ListApplicationUserQuery): Promise<PaginatedResponseDto> {
    try {
      // Search query setup
      const searchQuery: Record<string, any> = {};
      if (Email) {
        searchQuery["email"] = { $regex: Email, $options: "i" };
      }
      if (Name) {
        searchQuery["fullName"] = { $regex: Name, $options: "i" };
      }
      if (UserRole) {
        searchQuery["role"] = UserRole;
      }

      // Pagination setup
      const totalRecords =
        await this._applicationUserRepository.count(searchQuery);
      const skip = (Page - 1) * PageSize;

      const result = await this._applicationUserRepository.find(searchQuery, {
        limit: PageSize,
        skip,
      });

      return new PaginatedResponseDto(totalRecords, Page, PageSize, result);
    } catch (error) {
      this._logger.error("Error finding users:", error);
      throw new BadRequestException("Could not get all users");
    }
  }

  async findOne(id: string): Promise<SuccessResponseDto> {
    const user = await this._applicationUserRepository.findById(id);

    if (!user) {
      this._logger.error(`User Document not found with ID: ${id}`);
      throw new NotFoundException(`Could not find user with ID: ${id}`);
    }

    return new SuccessResponseDto("User found successfully", user);
  }

  async update(id: string, updateUserDto: UpdateApplicationUserDto) {
    try {
      const result = await this._applicationUserRepository.updateOneById(
        id,
        updateUserDto,
      );

      return new SuccessResponseDto("User updated successfully", result);
    } catch (error) {
      if (error?.options?.cause === "RepositoryException") {
        throw error;
      }

      this._logger.error("Error updating new document:", error.description);
      throw new BadRequestException("Error updating new document");
    }
  }

  async remove(id: string): Promise<SuccessResponseDto> {
    const result = await this._applicationUserRepository.removeOneById(id);
    if (!result) {
      this._logger.error(`User Document not delete with ID: ${id}`);
      throw new BadRequestException(`Could not delete user with ID: ${id}`);
    }

    return new SuccessResponseDto("User deleted successfully");
  }

  async updateProfilePicture(
    { profilePicture }: UpdateApplicationUserProfilePictureDto,
    userId: string,
  ): Promise<SuccessResponseDto> {
    try {
      const user = await this._applicationUserRepository.findById(userId);

      if (!user) {
        this._logger.error(`User Document not found with ID: ${userId}`);
        throw new NotFoundException(`Could not find user with ID: ${userId}`);
      }

      if (user?.profilePicture) {
        await this._imageService.removeImage(
          user?.profilePicture as unknown as string,
          userId,
        );
      }

      const createdImage = await this._imageService.createSingleImage(
        profilePicture,
        userId,
      );

      await this._applicationUserRepository.updateOneById(user?.id, {
        profilePicture: createdImage.id,
      });

      return new SuccessResponseDto("Profile picture updated successfully");
    } catch (error) {
      if (error?.options?.cause === "RepositoryException") {
        throw error;
      }

      this._logger.error("Error updating new document:", error.description);
      throw new BadRequestException("Error updating new document");
    }
  }
}