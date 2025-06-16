import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../../models/User.model"
import { CreateUserDTO } from "./auth.dto";
import { appConfig } from "../../config/consts";

export class AuthService {
  async register(dto: CreateUserDTO) {
    const { name, password } = dto;

    const existingUser = await User.findOne({ where: { name } });
    if (existingUser) {
      throw new Error("Это имя уже занято");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = User.create({
      name,
      password: hashedPassword,
    });

    await newUser.save();

    return User.findOne({
      where: { name },
      select: ["id", "name"],
    });
  }

  async login(name: string, password: string) {

    const user = await User.findOne({ where: { name } });

    if (!user) {
      console.log("No user found with name:", name);
      throw new Error("Неверное имя или пароль");
    }

    let isValidPassword: boolean;
    try {
      isValidPassword = await bcrypt.compare(password, user.password);
      console.log("🔑 Password valid:", isValidPassword);
    } catch (err) {
      console.error("Error during bcrypt.compare:", err);
      throw new Error("Ошибка при проверке пароля");
    }

    if (!isValidPassword) {
      console.log("Password does not match for user:", name);
      throw new Error("Неверное имя или пароль");
    }

    const jwt_payload = { sub: user.id, role: user.role };
    const jwtSecret = String(appConfig.JWT_SECRET);

    let token: string;
    try {
      token = jwt.sign(jwt_payload, jwtSecret, {
        algorithm: "HS256",
        expiresIn: "1d",
      });
      console.log("JWT token generated");
    } catch (err) {
      console.error("Error during JWT sign:", err);
      throw new Error("Ошибка при создании токена");
    }

    return {
      id: user.id,
      access_token: token,
      name: user.name,
      role: user.role,
    };
  }

  async getUserInfo(userId: number) {
    const user = await User.findOne({
      where: { id: userId },
      select: ["id", "name"],
    });

    if (!user) {
      throw new Error("Пользователь не найден");
    }

    return user;
  }
}