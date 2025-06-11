import { IsDefined, IsString, MaxLength, MinLength } from "class-validator";

export class CreateUserDTO {
  @IsDefined({ message: "Требуетс имя" })
  @IsString()
  @MaxLength(150, { message: "Имя слишком длинное" })
  @MinLength(3, { message: "Имя должно быть не менее 3 символов" })
  name: string;

  @IsDefined({ message: "Требуется пароль" })
  @IsString()
  @MinLength(8, { message: "Пароль должен содержать не менее 8 символов." })
  @MaxLength(15, { message: "Пароль слишком длинный" })
  password: string;
}