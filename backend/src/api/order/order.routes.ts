/*import { Router } from "express";
import { OrderController } from "./order.controller";
import { CreateOrderDto, GetOrdersQueryDto } from "./order.dto";
import { validateBody, validateQuery } from "../../common/middlewares/validation.middleware";
import { useAuth } from "../../common/middlewares/auth.middleware";
const router = Router();
const controller = new OrderController();

router.post("/", useAuth, validateBody(CreateOrderDto), controller.createOrder);


router.get("/", useAuth, validateQuery(GetOrdersQueryDto), controller.getAllOrders);

export default router;
*/

import { Router } from "express";
import { OrderController } from "./order.controller";

const orderRoutes = Router();

orderRoutes.post("/create", OrderController.createOrders); 

export default orderRoutes;
