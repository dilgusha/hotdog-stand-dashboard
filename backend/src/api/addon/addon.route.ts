import { Router } from "express";
import { AddonController } from "./addon.controller";

export const addonRoutes = Router();
addonRoutes.get("/get-all-addons", AddonController.getAll);