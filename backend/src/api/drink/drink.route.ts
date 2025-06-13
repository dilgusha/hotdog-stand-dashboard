import { Router } from "express";
import { DrinkController } from "./drink.controller";

export const drinkRoutes = Router();
drinkRoutes.get("/get-all-drinks", DrinkController.getAll); // Match the frontend URL
