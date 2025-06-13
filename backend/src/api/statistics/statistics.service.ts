import { MoreThanOrEqual } from "typeorm";
import { Order } from "../../models/Order.model";
import { AppDataSource } from "../../config/data-source";
import { startOfDay, startOfMonth } from "date-fns";

export const StatisticsService = {
  getStatistics: async () => {
    const orderRepo = AppDataSource.getRepository(Order);

    const now = new Date();
    const todayStart = startOfDay(now);
    const monthStart = startOfMonth(now);

    // Fetch orders for today, this month, and all time
    const [todayOrders, monthOrders, allOrders] = await Promise.all([
      orderRepo.find({ where: { created_at: MoreThanOrEqual(todayStart) } }),
      orderRepo.find({ where: { created_at: MoreThanOrEqual(monthStart) } }),
      orderRepo.find(),
    ]);

    // ✅ FIXED: Calculate revenue using order.price instead of totalAmount
    const calcRevenue = (orders: Order[]): number => {
      return orders.reduce((sum, order) => {
        return sum + Number(order.price || 0); // ✅ use price (₼), not quantity
      }, 0);
    };

    const todayRevenue = Number(calcRevenue(todayOrders).toFixed(2));
    const monthRevenue = Number(calcRevenue(monthOrders).toFixed(2));
    const totalRevenue = Number(calcRevenue(allOrders).toFixed(2));

    return {
      todayRevenue,
      monthRevenue,
      totalRevenue,
      todayOrders: todayOrders.length,
      monthOrders: monthOrders.length,
      totalOrders: allOrders.length,
    };
  }
};
