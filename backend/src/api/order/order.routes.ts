

import { Router } from "express";
import { OrderController } from "./order.controller";
import { roleCheck, useAuth } from "../../common/middlewares/auth.middleware";
import { ERoleType } from "../../common/enum/user-role.enum";

const orderRoutes = Router();

orderRoutes.post("/make-order", OrderController.createOrders); 
orderRoutes.get("/get-all-orders", useAuth, roleCheck([ERoleType.ADMIN]), OrderController.getAllOrders); 


export default orderRoutes;
