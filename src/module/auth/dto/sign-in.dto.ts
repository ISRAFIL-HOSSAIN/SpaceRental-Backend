import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { UserRole } from "../../user/enum/user-role.enum";

export class SignInDto {
  @ApiProperty({
    description: "User's email",
    example: "user@example.com",
  })
  @IsNotEmpty({ message: "Email is required" })
  @IsEmail({}, { message: "Invalid email format" })
  email: string;

  @ApiProperty({
    description: "User's password",
    example: "Password123!",
  })
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
}
