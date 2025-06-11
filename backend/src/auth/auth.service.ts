import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User.model"
import { CreateUserDTO } from "./auth.dto";
import { appConfig } from "../config/consts";

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
      throw new Error("Неверное имя или пароль");
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error("Неверное имя или пароль");
    }

    const jwt_payload = { sub: user.id };
    const jwtSecret = String(appConfig.JWT_SECRET);

    const token = jwt.sign(jwt_payload, jwtSecret, {
      algorithm: "HS256",
      expiresIn: "1d",
    });

    return { access_token: token };
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