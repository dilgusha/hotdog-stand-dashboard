import { Request, Response } from "express";
import { getAllDrinks } from "./drink.service";

export class DrinkController {
  constructor() {} // No dependencies if using static method

  static async getAll(req: Request, res: Response) {
    try {
      const drinks = await getAllDrinks();
      res.json({ success: true, data: drinks });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: "An unknown error occurred" });
      }
    }
  }
}
