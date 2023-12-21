import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";

enum UserRole {
  RENTER = "RENTER",
  SPACE_OWNER = "OWNER",
}

export class CreateUserDto {
  @ApiProperty({ description: "User's email", example: "user@example.com" })
  @IsNotEmpty({ message: "Email is required" })
  @IsEmail({}, { message: "Invalid email format" })
  email: string;

  @ApiProperty({ description: "User's password", example: "Password123!" })
  @IsNotEmpty({ message: "Password is required" })
  @IsString({ message: "Password must be a string" })
  password: string;

  @ApiProperty({
    description: "User's role",
    enum: UserRole,
    example: UserRole.RENTER,
  })
  @IsEnum(UserRole, { message: "Invalid user role" })
  role: UserRole;

  @ApiProperty({ description: "User's full name", required: false })
  @IsOptional()
  @IsString({ message: "Full name must be a string" })
  fullName?: string;

  @ApiProperty({ description: "User's phone number", required: false })
  @IsOptional()
  @IsString({ message: "Phone number must be a string" })
  phoneNumber?: string;

  @ApiProperty({ description: "User's country code", required: false })
  @IsOptional()
  @IsString({ message: "Country code must be a string" })
  countryCode?: string;

  @ApiProperty({ description: "User's date of birth", required: false })
  @IsOptional()
  @Transform(({ value }) => value && new Date(value))
  @IsDate({
    message: "Invalid date of birth format, please provide a valid date",
  })
  dateOfBirth?: Date;
}
