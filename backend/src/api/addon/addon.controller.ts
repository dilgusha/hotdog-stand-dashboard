import { Request, Response } from "express";
import { getAllAddons } from "./addon.service";


export class AddonController {
  constructor() {} // No dependencies if using static method

  static async getAll(req: Request, res: Response) {
    try {
      const addons = await getAllAddons();
      res.json({ success: true, data: addons });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: "An unknown error occurred" });
      }
    }
  }
}