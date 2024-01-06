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
import { SpaceForRentService } from "../space-for-rent/space-for-rent.service";
import { CreateSpaceReviewDto } from "./dto/create-space-review.dto";
import { ListSpaceReviewQuery } from "./dto/list-space-review-query.dto";
import {
  SpaceReviewModel,
  SpaceReviewModelType,
} from "./entities/space-review.entity";

@Injectable()
export class SpaceReviewService {
  private readonly _logger: Logger = new Logger(SpaceReviewService.name);

  constructor(
    @InjectModel(SpaceReviewModel.name)
    private _spaceReviewModelType: SpaceReviewModelType,
    private _spaceForRentService: SpaceForRentService,
  ) {}

  async create(
    createSpaceReviewDto: CreateSpaceReviewDto,
    userId: string,
  ): Promise<SuccessResponseDto> {
    try {
      // validate relations
      if (createSpaceReviewDto.space) {
        await this._spaceForRentService.validateObjectId(
          createSpaceReviewDto.space,
        );
      }

      const newItem = new this._spaceReviewModelType({
        ...createSpaceReviewDto,
        reviewer: userId,
        createdBy: userId,
      });
      await newItem.save();

      return new SuccessResponseDto("Document created successfully", newItem);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

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
  }: ListSpaceReviewQuery): Promise<PaginatedResponseDto> {
    try {
      // Search query setup
      const searchQuery: Record<string, any> = {};
      // if (Name) {
      //   searchQuery["name"] = { $regex: Name, $options: "i" };
      // }

      // Pagination setup
      const totalRecords = await this._spaceReviewModelType
        .where(searchQuery)
        .countDocuments()
        .exec();
      const skip = (Page - 1) * PageSize;

      const result = await this._spaceReviewModelType
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
    const result = await this._spaceReviewModelType
      .findById(id)
      .populate([
        {
          path: "reviewer",
          select: "id email fullName profilePicture",
        },
      ])
      .exec();

    if (!result) {
      this._logger.error(`Document not found with ID: ${id}`);
      throw new NotFoundException(`Could not find document with ID: ${id}`);
    }

    return new SuccessResponseDto("Document found successfully", result);
  }

  // update(id: number, updateSpaceReviewDto: UpdateSpaceReviewDto) {
  //   return `This action updates a #${id} spaceReview`;
  // }

  async remove(id: string): Promise<SuccessResponseDto> {
    const result = await this._spaceReviewModelType
      .findByIdAndDelete(id)
      .exec();

    if (!result) {
      this._logger.error(`Document not found with ID: ${id}`);
      throw new BadRequestException(`Could not delete document with ID: ${id}`);
    }

    return new SuccessResponseDto("Document deleted successfully");
  }
}