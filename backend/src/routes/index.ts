import { Router } from "express";
import { authRoutes } from "../api/auth/auth.routes";
import { productRoutes } from "../api/product/product.route";
import { inventoryRoutes } from "../api/inventory/inventory.route";
import orderRoutes from "../api/order/order.routes";
import statisticsRouter from "../api/statistics/statistics.route";
import { addonRoutes } from "../api/addon/addon.route";
import { drinkRoutes } from "../api/drink/drink.route";
export const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/products", productRoutes);
routes.use("/inventory", inventoryRoutes);
routes.use("/order", orderRoutes);
routes.use("/statistics", statisticsRouter);
routes.use("/addons", addonRoutes);
routes.use("/drinks", drinkRoutes);