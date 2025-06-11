import { Router } from "express";
import { authRoutes } from "../api/auth/auth.routes";
export const routes = Router();

routes.use("/auth", authRoutes);