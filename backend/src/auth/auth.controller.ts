import { NextFunction, Request, Response } from "express";
import { validate } from "class-validator";
import { CreateUserDTO } from "./auth.dto";
import { AuthService } from "./auth.service";

const authService = new AuthService();

const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dto = new CreateUserDTO();
    dto.name = req.body.name;
    dto.password = req.body.password;

    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(422).json("Необрабатываемая ошибка")
      return;
    }

    const user = await authService.register(dto);
    res.status(201).json(user);
    next();
  } catch (error) {
    res.status(500).json({
      message: "Что-то пошло не так",
      error: error instanceof Error ? error.message : error,
    });
  }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, password } = req.body;
    const result = await authService.login(name, password);
    res.status(201).json(result);
  } catch (error) {
    res.status(error instanceof Error && error.message === "Неверное имя или пароль" ? 401 : 500).json({
      message: error instanceof Error ? error.message : "Что-то пошло не так",
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const AuthController = () => ({
  register,
  login,
});