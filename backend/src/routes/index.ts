import { Router } from "express";
import { authRoutes } from "../api/auth/auth.routes";
import { productRoutes } from "../api/product/product.route";
import { inventoryRoutes } from "../api/inventory/inventory.route";
export const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/products", productRoutes);
routes.use("/inventory", inventoryRoutes);