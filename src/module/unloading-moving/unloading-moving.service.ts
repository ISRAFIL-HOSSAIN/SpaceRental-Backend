import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from "@nestjs/common";
import { SuccessResponseDto } from "../common/dto/success-response.dto";
import { CreateUnloadingMovingDto } from "./dto/create-unloading-moving.dto";
import { UnloadingMovingRepository } from "./unloading-moving.repository";

@Injectable()
export class UnloadingMovingService {
  private readonly logger: Logger = new Logger(UnloadingMovingService.name);

  constructor(
    private readonly unloadingMovingRepository: UnloadingMovingRepository,
  ) {}

  async create(
    createSpaceDto: CreateUnloadingMovingDto,
    userId: string,
  ): Promise<SuccessResponseDto> {
    try {
      const newSpaceType = await this.unloadingMovingRepository.create({
        ...createSpaceDto,
        createdBy: userId,
      });

      return new SuccessResponseDto(
        "New document created successfully",
        newSpaceType,
      );
    } catch (error) {
      if (error?.name === "MongoServerError" && error?.code === 11000) {
        this.logger.error("Duplicate key error:", error);
        throw new ConflictException("Document already exists");
      }

      this.logger.error("Error creating new document:", error);
      throw new BadRequestException("Error creating new document");
    }
  }

  async findAll(): Promise<SuccessResponseDto> {
    try {
      const results = await this.unloadingMovingRepository.findAll();

      return new SuccessResponseDto("All document fetched", results);
    } catch (error) {
      this.logger.error("Error finding all document:", error);
      throw new BadRequestException("Could not get all document");
    }
  }

  async remove(id: string): Promise<SuccessResponseDto> {
    const result = await this.unloadingMovingRepository.removeOneById(id);

    if (!result) {
      this.logger.error(`Document not delete with ID: ${id}`);
      throw new BadRequestException(`Could not delete document with ID: ${id}`);
    }

    return new SuccessResponseDto("Document deleted successfully");
  }
}
