import { Request, Response } from "express";
import { StatisticsService } from "./statistics.service";


export const getStatistics = async (req: Request, res: Response) => {
  try {
    const stats = await StatisticsService.getStatistics();
    res.status(200).json(stats);
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({ message: "Failed to fetch statistics", error });
  }
};

