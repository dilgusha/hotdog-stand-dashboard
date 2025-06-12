import { Router } from "express";
import { roleCheck, useAuth } from "../../common/middlewares/auth.middleware";
import { ProductController } from "./product.controller";
import { ERoleType } from "../../common/enum/user-role.enum";

export const productRoutes = Router();
const controller = ProductController();

productRoutes.post("/create", useAuth, roleCheck([ERoleType.ADMIN]), controller.create);


