import { Router } from "express";
import { AuthController } from "./auth.controller";


export const authRoutes = Router();
const controller = AuthController();

authRoutes.post("/register", controller.register);
authRoutes.post("/login", controller.login);
