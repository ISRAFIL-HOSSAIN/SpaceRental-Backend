import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { PaginatedResponseDto } from "../common/dto/paginated-response.dto";
import { SuccessResponseDto } from "../common/dto/success-response.dto";
import { CreateSpaceAccessMethodDto } from "./dto/create-space-access-method.dto";
import { ListSpaceAccessMethodQuery } from "./dto/list-space-access-method-query.dto";
import { UpdateSpaceAccessMethodDto } from "./dto/update-space-access-method.dto";
import { SpaceAccessMethodRepository } from "./space-access-method.repository";

@Injectable()
export class SpaceAccessMethodService {
  private readonly _logger: Logger = new Logger(SpaceAccessMethodService.name);

  constructor(
    private readonly _spaceAccessMethodRepository: SpaceAccessMethodRepository,
  ) {}

  async create(
    createSpaceAccessMethodDto: CreateSpaceAccessMethodDto,
    userId: string,
  ): Promise<SuccessResponseDto> {
    try {
      const result = await this._spaceAccessMethodRepository.create({
        ...createSpaceAccessMethodDto,
        createdBy: userId,
      });

      return new SuccessResponseDto(
        `Document created successfully with ID: ${result.id}`,
      );
    } catch (error) {
      if (error?.options?.cause === "RepositoryException") {
        throw error;
      }

      this._logger.error("Error creating new document:", error);
      throw new BadRequestException("Error creating new document");
    }
  }

  async findAll({
    Page = 1,
    PageSize: limit = 10,
    Name = "",
  }: ListSpaceAccessMethodQuery): Promise<PaginatedResponseDto> {
    try {
      // Search query setup
      const searchQuery: Record<string, any> = {};
      if (Name) {
        searchQuery["name"] = { $regex: Name, $options: "i" };
      }

      const count = await this._spaceAccessMethodRepository.count(searchQuery);
      const skip = (Page - 1) * limit;

      const result = await this._spaceAccessMethodRepository.find(searchQuery, {
        limit,
        skip,
      });

      return new PaginatedResponseDto(count, Page, limit, result);
    } catch (error) {
      this._logger.error("Error finding all document:", error);
      throw new BadRequestException("Could not get all document");
    }
  }

  async findOne(id: string): Promise<SuccessResponseDto> {
    const result = await this._spaceAccessMethodRepository.findById(id, {
      populate: [
        {
          path: "createdBy",
          select: "id email fullName",
        },
        {
          path: "updatedBy",
          select: "id email fullName",
        },
      ],
    });

    if (!result) {
      this._logger.error(`Document not found with ID: ${id}`);
      throw new NotFoundException(`Could not find document with ID: ${id}`);
    }

    return new SuccessResponseDto("Document found successfully", result);
  }

  async update(
    id: string,
    updateSpaceAccessMethodDto: UpdateSpaceAccessMethodDto,
    userId: string,
  ): Promise<SuccessResponseDto> {
    try {
      const result = await this._spaceAccessMethodRepository.updateOneById(
        id,
        {
          ...updateSpaceAccessMethodDto,
          updatedBy: userId,
          updatedAt: new Date(),
        },
        { new: true },
      );

      if (!result) {
        this._logger.error(`Document not found with ID: ${id}`);
        throw new NotFoundException(`Could not find document with ID: ${id}`);
      }

      return new SuccessResponseDto("Document updated successfully", result);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error.name === "MongoError" && error.code === 11000) {
        this._logger.error("Duplicate key error:", error);
        throw new ConflictException("Document already exists");
      }

      this._logger.error("Error updating document:", error);
      throw new BadRequestException("Error updating document");
    }
  }

  async remove(id: string): Promise<SuccessResponseDto> {
    const result = await this._spaceAccessMethodRepository.removeOneById(id);

    if (!result) {
      this._logger.error(`Document not found with ID: ${id}`);
      throw new BadRequestException(`Could not delete document with ID: ${id}`);
    }

    return new SuccessResponseDto("Document deleted successfully");
  }

  //#region InternalMethods
  //#endregion
}