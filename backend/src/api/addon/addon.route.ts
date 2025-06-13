import { Router } from "express";
import { AddonController } from "./addon.controller";
import { useAuth } from "../../common/middlewares/auth.middleware";

export const addonRoutes = Router();
addonRoutes.get("/get-all-addons", useAuth, AddonController.getAll); // Match the frontend URL