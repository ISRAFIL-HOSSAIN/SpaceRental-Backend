import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsArray,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from "class-validator";

export class CreateSpaceForRentDto {
  //#region Space Core Properties
  @ApiProperty({ required: true, description: "The name of the space" })
  @IsNotEmpty({ message: "Name is required" })
  @IsString({ message: "Name must be a string" })
  name: string;

  @ApiProperty({ required: true, description: "The description of the space" })
  @IsNotEmpty({ message: "Description is required" })
  @IsString({ message: "Description must be a string" })
  description: string;

  @ApiProperty({ required: true, description: "The location of the space" })
  @IsNotEmpty({ message: "Location is required" })
  @IsString({ message: "Location must be a string" })
  location: string;

  @ApiProperty({
    required: true,
    description: "The area of the space in square meters",
  })
  @IsNotEmpty({ message: "Area is required" })
  @IsNumber({}, { message: "Area must be a number" })
  area: number;

  @ApiProperty({
    required: true,
    description: "The height of the space in meters",
  })
  @IsNotEmpty({ message: "Height is required" })
  @IsNumber({}, { message: "Height must be a number" })
  height: number;

  @ApiProperty({
    required: true,
    description: "The price of the space per month",
  })
  @IsNotEmpty({ message: "Price is required" })
  @IsNumber({}, { message: "Price must be a number" })
  pricePerMonth: number;

  @ApiProperty({
    description: "The number of minimum months for the booking.",
    type: Number,
    default: 1,
  })
  @IsInt({ message: "Minimum booking months must be an integer." })
  @Min(1, { message: "Minimum booking months must be at least 1." })
  @IsNotEmpty({ message: "Minimum booking months cannot be empty." })
  minimumBookingDays: number;

  @ApiProperty({
    required: true,
    description: "An array of space images",
    type: "file",
    isArray: true,
  })
  spaceImages: Express.Multer.File[];
  //#endregion

  //#region Space related features
  @ApiProperty({
    required: true,
    description: "The type of space (e.g., office, storage, warehouse)",
  })
  @IsNotEmpty({ message: "Space type is required" })
  @IsMongoId({ message: "Invalid space type" })
  type: string;

  @ApiProperty({
    required: true,
    description: "The access method for the space (e.g., keycard, access code)",
  })
  @IsNotEmpty({ message: "Access method is required" })
  @IsMongoId({ message: "Invalid access method" })
  accessMethod: string;
  //#endregion

  //#region List of Space related features
  @ApiProperty({
    required: false,
    description:
      "An array of storage condition IDs (e.g., temperature-controlled, humidity-controlled)",
  })
  @IsArray({ message: "Storage conditions must be an array" })
  @IsMongoId({ each: true, message: "Invalid storage condition" })
  @Transform(({ value }) => (Array.isArray(value) ? value : value?.split(",")))
  storageConditions?: string[] = [];

  @ApiProperty({
    required: false,
    description:
      "An array of unloading/moving option IDs (e.g., truck access, loading dock)",
  })
  @IsArray({ message: "Unloading/moving options must be an array" })
  @IsMongoId({ each: true, message: "Invalid unloading/moving option" })
  @Transform(({ value }) => (Array.isArray(value) ? value : value?.split(",")))
  unloadingMovings?: string[] = [];

  @ApiProperty({
    required: false,
    description:
      "An array of space security feature IDs (e.g., alarm system, surveillance cameras)",
  })
  @IsArray({ message: "Space security features must be an array" })
  @IsMongoId({ each: true, message: "Invalid space security feature" })
  @Transform(({ value }) => (Array.isArray(value) ? value : value?.split(",")))
  spaceSecurities?: string[] = [];

  @ApiProperty({
    required: false,
    description:
      "An array of space schedule IDs (e.g., 24/7 access, restricted access)",
  })
  @IsArray({ message: "Space schedules must be an array" })
  @IsMongoId({ each: true, message: "Invalid space schedule" })
  @Transform(({ value }) => (Array.isArray(value) ? value : value?.split(",")))
  spaceSchedules?: string[] = [];

  //#endregion
}
