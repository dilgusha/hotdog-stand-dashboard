import { Router } from "express";
import { authRoutes } from "../auth/auth.routes";
export const routes = Router();

routes.use("/auth", authRoutes);