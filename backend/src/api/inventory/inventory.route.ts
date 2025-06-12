
import { Router } from "express";
import { InventoryController } from "./inventory.controller";

export const inventoryRoutes = Router();
const controller = InventoryController();

inventoryRoutes.patch("/:id/quantity", controller.updateInventoryQuantity);
inventoryRoutes.get("/", controller.getInventory);  
