import { getAllAddons } from "./addon.service";
import { Request, Response } from "express";

export const AddonController = {
  getAll: async (req: Request, res: Response) => {
    try {
      const addons = await getAllAddons();
      res.status(200).json(addons);
      return
    } catch (error) {
      res.status(500).json({ message: "Failed to get addons" });
    }
  },
};