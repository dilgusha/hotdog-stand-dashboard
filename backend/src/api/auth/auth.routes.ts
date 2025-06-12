import { Router } from "express";
import { AuthController } from "./auth.controller";
import { useAuth } from "../../common/middlewares/auth.middleware"; 
import { AuthRequest } from "../../types";

export const authRoutes = Router();
const controller = AuthController();

authRoutes.post("/register", controller.register);
authRoutes.post("/login", controller.login);

authRoutes.get("/verify", useAuth, (req, res) => {
  const user = (req as AuthRequest).user;
  if (!user) {
    res.status(401).json({ message: "Token etibarsızdır" });
    return;
  }

  res.json({
    id: user.id,
    name: user.name,
    role: user.role,
  });
});
