// routes/statistics.routes.ts
import { Router } from "express";
import { getStatistics } from "./statistics.controller";

const statisticsRouter = Router();

statisticsRouter.get("/all-statistics", getStatistics);

// statisticsRouter.post("/update", updateStatistics);

export default statisticsRouter;
