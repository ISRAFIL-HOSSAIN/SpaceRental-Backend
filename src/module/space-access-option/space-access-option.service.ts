import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { PaginatedResponseDto } from "../common/dto/paginated-response.dto";
import { SuccessResponseDto } from "../common/dto/success-response.dto";
import { CreateSpaceAccessOptionDto } from "./dto/create-space-access-option.dto";
import { ListSpaceAccessOptionQuery } from "./dto/list-space-access-option-query.dto";
import { UpdateSpaceAccessOptionDto } from "./dto/update-space-access-option.dto";
import {
  SpaceAccessOptionModel,
  SpaceAccessOptionModelType,
} from "./entities/space-access-option.entity";

@Injectable()
export class SpaceAccessOptionService {
  private readonly _logger: Logger = new Logger(SpaceAccessOptionService.name);

  constructor(
    @InjectModel(SpaceAccessOptionModel.name)
    private _spaceAccessOptionModelType: SpaceAccessOptionModelType,
  ) {}

  async create(
    createSpaceAccessOptionDto: CreateSpaceAccessOptionDto,
    userId: string,
  ): Promise<SuccessResponseDto> {
    try {
      const newSpaceAccessOption = new this._spaceAccessOptionModelType({
        ...createSpaceAccessOptionDto,
        createdBy: userId,
      });
      await newSpaceAccessOption.save();

      return new SuccessResponseDto(
        "Document created successfully",
        newSpaceAccessOption,
      );
    } catch (error) {
      if (error?.name === "MongoServerError" && error?.code === 11000) {
        this._logger.error("Duplicate key error:", error);
        throw new ConflictException("Document already exists");
      }

      this._logger.error("Error creating new document:", error);
      throw new BadRequestException("Error creating new document");
    }
  }

  async findAll({
    Page = 1,
    PageSize = 10,
    Name = "",
  }: ListSpaceAccessOptionQuery): Promise<PaginatedResponseDto> {
    try {
      // Search query setup
      const searchQuery: Record<string, any> = {};
      if (Name) {
        searchQuery["name"] = { $regex: Name, $options: "i" };
      }

      // Pagination setup
      const totalRecords = await this._spaceAccessOptionModelType
        .where(searchQuery)
        .countDocuments()
        .exec();
      const skip = (Page - 1) * PageSize;

      const result = await this._spaceAccessOptionModelType
        .where(searchQuery)
        .find()
        .skip(skip)
        .limit(PageSize)
        .exec();

      return new PaginatedResponseDto(totalRecords, Page, PageSize, result);
    } catch (error) {
      this._logger.error("Error finding all document:", error);
      throw new BadRequestException("Could not get all document");
    }
  }

  async findOne(id: string): Promise<SuccessResponseDto> {
    const result = await this._spaceAccessOptionModelType
      .findById(id)
      .populate([
        {
          path: "createdBy",
          select: "id email fullName",
        },
        {
          path: "updatedBy",
          select: "id email fullName",
        },
      ])
      .exec();

    if (!result) {
      this._logger.error(`Document not found with ID: ${id}`);
      throw new NotFoundException(`Could not find document with ID: ${id}`);
    }

    return new SuccessResponseDto("Document found successfully", result);
  }

  async update(
    id: string,
    updateSpaceAccessOptionDto: UpdateSpaceAccessOptionDto,
    userId: string,
  ): Promise<SuccessResponseDto> {
    try {
      const updatedSpaceAccessOption = await this._spaceAccessOptionModelType
        .findByIdAndUpdate(
          id,
          {
            ...updateSpaceAccessOptionDto,
            updatedBy: userId,
            updatedAt: new Date(),
          },
          { new: true },
        )
        .exec();

      if (!updatedSpaceAccessOption) {
        this._logger.error(`Document not found with ID: ${id}`);
        throw new NotFoundException(`Could not find document with ID: ${id}`);
      }

      return new SuccessResponseDto(
        "Document updated successfully",
        updatedSpaceAccessOption,
      );
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
    const result = await this._spaceAccessOptionModelType
      .findByIdAndDelete(id)
      .exec();

    if (!result) {
      this._logger.error(`Document not found with ID: ${id}`);
      throw new BadRequestException(`Could not delete document with ID: ${id}`);
    }

    return new SuccessResponseDto("Document deleted successfully");
  }

  //#region InternalMethods
  async validateObjectId(id: string): Promise<void> {
    const result = await this._spaceAccessOptionModelType
      .findById(id)
      .select("_id")
      .exec();

    if (!result) {
      this._logger.error(`Invalid space access option ID: ${id}`);
      throw new BadRequestException("Invalid space access option ID");
    }
  }
  //#endregion
}
