// routes/statistics.routes.ts
import { Router } from "express";
import { getStatistics } from "./statistics.controller";
import { roleCheck, useAuth } from "../../common/middlewares/auth.middleware";
import { ERoleType } from "../../common/enum/user-role.enum";
import { StatisticsService } from "./statistics.service";

const statisticsRouter = Router();

statisticsRouter.get("/get-all-statistics", useAuth, roleCheck([ERoleType.ADMIN]), getStatistics);
statisticsRouter.get("/refresh", useAuth, roleCheck([ERoleType.ADMIN]), async (req, res) => {
  const data = await StatisticsService.getStatistics();
  res.json(data);
});


// statisticsRouter.post("/update", updateStatistics);

export default statisticsRouter;
