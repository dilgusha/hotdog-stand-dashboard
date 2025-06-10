import { IsDefined, IsString, MaxLength, MinLength } from "class-validator";

export class CreateUserDTO {
  @IsDefined({ message: "Username is required" })
  @IsString()
  @MaxLength(150, { message: "Username is too long" })
  @MinLength(3, { message: "Username must be at least 3 characters" })
  username: string;

  @IsDefined({ message: "Password is required" })
  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters" })
  @MaxLength(15, { message: "Password is too long" })
  password: string;
}