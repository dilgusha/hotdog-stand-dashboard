import { IsDefined, IsString, MaxLength, MinLength } from "class-validator";

export class CreateUserDTO {
  @IsDefined({ message: "name is required" })
  @IsString()
  @MaxLength(150, { message: "name is too long" })
  @MinLength(3, { message: "name must be at least 3 characters" })
  name: string;

  @IsDefined({ message: "Password is required" })
  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters" })
  @MaxLength(15, { message: "Password is too long" })
  password: string;
}