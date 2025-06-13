import { Router } from "express";
import { InventoryController } from "./inventory.controller";
import { roleCheck, useAuth } from "../../common/middlewares/auth.middleware";
import { ERoleType } from "../../common/enum/user-role.enum";


export const inventoryRoutes = Router();
const controller = InventoryController();

inventoryRoutes.patch("/:id/quantity", useAuth, roleCheck([ERoleType.ADMIN]), controller.updateInventoryQuantity);
inventoryRoutes.get("/", useAuth, controller.getInventory);  
// inventoryRoutes.get("/drinks", controller.getDrink);  // Route to get drinks

