import { Statistics } from "../../models/Statistics.model";
import { AppDataSource } from "../../config/data-source";
import { Order } from "../../models/Order.model";
import { startOfDay, startOfMonth } from "date-fns";
import { MoreThanOrEqual } from "typeorm";

export const StatisticsService = {
  getStatistics: async () => {
    const orderRepo = AppDataSource.getRepository(Order);
    const statsRepo = AppDataSource.getRepository(Statistics);

    const now = new Date();
    const todayStart = startOfDay(now);
    const monthStart = startOfMonth(now);

    const [todayOrders, monthOrders, allOrders] = await Promise.all([
      orderRepo.find({ where: { created_at: MoreThanOrEqual(todayStart) } }),
      orderRepo.find({ where: { created_at: MoreThanOrEqual(monthStart) } }),
      orderRepo.find(),
    ]);

    const calcRevenue = (orders: Order[]): number => {
      return orders.reduce((sum, order) => sum + Number(order.price || 0), 0);
    };

    const todayRevenue = Number(calcRevenue(todayOrders).toFixed(2));
    const monthRevenue = Number(calcRevenue(monthOrders).toFixed(2));
    const totalRevenue = Number(calcRevenue(allOrders).toFixed(2));

    let statistics = await statsRepo.findOne({ where: {} });

    if (!statistics) {
      // Create if not found
      statistics = statsRepo.create({
        todayRevenue,
        monthRevenue,
        totalRevenue,
        todayOrders: todayOrders.length,
        monthOrders: monthOrders.length,
        totalOrders: allOrders.length,
        lastUpdated: now,
      });
    } else {
      // Update if already exists
      statistics.todayRevenue = todayRevenue;
      statistics.monthRevenue = monthRevenue;
      statistics.totalRevenue = totalRevenue;
      statistics.todayOrders = todayOrders.length;
      statistics.monthOrders = monthOrders.length;
      statistics.totalOrders = allOrders.length;
      statistics.lastUpdated = now;
    }

    await statsRepo.save(statistics);
    return statistics;
  },
};
