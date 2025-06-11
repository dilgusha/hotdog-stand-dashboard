import { Router } from "express";
import { AuthController } from "./auth.controller";
import { roleCheck } from "../../common/middlewares/auth.middleware";


export const authRoutes = Router();
const controller = AuthController();

authRoutes.post("/register", controller.register);
authRoutes.post("/login", roleCheck,controller.login);

// app.get('/api/admin', roleCheck([ERoleType.ADMIN]), (req, res) => {
//   res.json({ message: "Admin səhifəsinə girişi təsdiqlədik!" });
// });
