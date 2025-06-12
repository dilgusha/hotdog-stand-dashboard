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

import { Request, Response } from "express";
import { createOrder } from "./order.service";



export const OrderController = {
  createOrder: async (req: Request, res: Response) => {
    try {
      const orderData = req.body; // Sifariş məlumatlarını alırıq
      const order = await createOrder(orderData);
      res.status(200).json({ message: "Order placed successfully", order });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  },
};
