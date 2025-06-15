

import { Router } from "express";
import { OrderController } from "./order.controller";
import { roleCheck, useAuth } from "../../common/middlewares/auth.middleware";
import { ERoleType } from "../../common/enum/user-role.enum";

const orderRoutes = Router();

orderRoutes.post("/make-order", useAuth, OrderController.createOrders); 
orderRoutes.get("/get-all-orders", useAuth, roleCheck([ERoleType.ADMIN]), OrderController.getAllOrders); 
orderRoutes.get(
  "/get-orders-page",
  useAuth,
  roleCheck([ERoleType.ADMIN]),
  OrderController.getOrdersPage
);

export default orderRoutes;
