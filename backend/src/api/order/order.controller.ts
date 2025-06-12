/*import { Request, Response } from 'express';
import { CreateOrderDto } from './order.dto';
import { OrderService } from './order.service';
import { AuthRequest } from '../../types';


export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  createOrder = async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const dto: CreateOrderDto = req.body;
    const order = await this.orderService.createOrder(dto, user.id);
    return res.status(201).json(order);
  };

  getAllOrders = async (req: Request, res: Response) => {
    const query = req.query;
    const orders = await this.orderService.getAllOrders(query);
    return res.json(orders);
  };
}*/
// order.controller.ts
import { Request, Response } from "express";
import { createOrder } from "./order.service";

export const OrderController = {
  createOrders: async (req: Request, res: Response) => {
    try {
      const orderData = req.body;

      if (!orderData || !Array.isArray(orderData.items) || orderData.items.length === 0) {
         res.status(400).json({ message: "Order items are required" });
         return
      }

      const order = await createOrder(orderData); // ✅ burada yalnız 1 param
       res.status(201).json({
        message: "Order placed successfully",
        order,
      });
      return
    } catch (error) {
      console.error("OrderController error:", error);
       res.status(500).json({
        message: "Failed to create order",
        error: error instanceof Error ? error.message : error,
      });
      return
    }
  },
};
