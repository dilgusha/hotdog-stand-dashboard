import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "@prisma/client";
import { CreateUserDTO } from "./auth.dto";

export class AuthService {
  async register(dto: CreateUserDTO) {
    const { username, password } = dto;

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      throw new Error("This username is already taken");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = User.create({
      username,
      password: hashedPassword,
    });

    await newUser.save();

    return User.findOne({
      where: { username },
      select: ["id", "username"],
    });
  }

  async login(username: string, password: string) {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      throw new Error("Invalid username or password");
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error("Invalid username or password");
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
      select: ["id", "username"],
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }
}