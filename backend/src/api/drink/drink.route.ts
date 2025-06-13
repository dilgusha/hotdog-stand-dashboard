import { Router } from "express";
import { DrinkController } from "./drink.controller";
import { useAuth } from "../../common/middlewares/auth.middleware";

export const drinkRoutes = Router();
drinkRoutes.get("/get-all-drinks", useAuth, DrinkController.getAll); // Match the frontend URL
