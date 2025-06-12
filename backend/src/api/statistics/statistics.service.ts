// // services/statistics.service.ts

// import { MoreThanOrEqual } from "typeorm";
// import { AppDataSource } from "../../config/data-source";
// import { Order } from "../../models/Order.model";
// import { OrderItem } from "../../models/OrderItem.model";
// import { Statistics } from "../../models/Statistics.model";

// export const StatisticsService = {
//   // Statistikaları əldə etmək
//   getStatistics: async () => {
//      const orderRepo = AppDataSource.getRepository(Order);

//   const now = new Date();
//   const todayStart = startOfDay(now);
//   const monthStart = startOfMonth(now);

//   const [todayOrders, monthOrders, allOrders] = await Promise.all([
//     orderRepo.find({ where: { createdAt: MoreThanOrEqual(todayStart) } }),
//     orderRepo.find({ where: { createdAt: MoreThanOrEqual(monthStart) } }),
//     orderRepo.find(),
//   ]);

//   // Revenue calculation
//   const calcRevenue = (orders) => orders.reduce((sum, o) => sum + Number(o.totalPrice), 0);

//   const todayRevenue = calcRevenue(todayOrders);
//   const monthRevenue = calcRevenue(monthOrders);
//   const totalRevenue = calcRevenue(allOrders);

//   // Order counts
//   const todayOrdersCount = todayOrders.length;
//   const monthOrdersCount = monthOrders.length;
//   const totalOrdersCount = allOrders.length;

//   // Popular items (simplified)
//  // Load order items with products
// const items = await orderRepo.find({ relations: ['product'] });

// const itemFrequency: Record<string, number> = {};

// items.forEach((item:any) => {
//   const productName = item.product?.name || 'Unknown';
//   itemFrequency[productName] = (itemFrequency[productName] || 0) + item.quantity;
// });


//   const popularItems = Object.entries(itemFrequency)
//     .sort((a, b) => b[1] - a[1])
//     .slice(0, 5)
//     .map(([item]) => item);

//   return {
//     todayRevenue,
//     monthRevenue,
//     totalRevenue,
//     todayOrders: todayOrdersCount,
//     monthOrders: monthOrdersCount,
//     totalOrders: totalOrdersCount,
//     popularItems,
//     revenueByDay: [],
//   }
//   },

//   // Statistikaları yeniləmə funksiyası
//   updateStatistics: async (newRevenue: number) => {
//     const statisticsRepo = AppDataSource.getRepository(Statistics);
//     let stats = await statisticsRepo.findOne({ where: { id: 1 } });

//     if (!stats) {
//       stats = new Statistics();
//     }

//     // Statistikaları yeniləyirik
//     stats.totalRevenue += newRevenue;
//     stats.monthRevenue += newRevenue;
//     stats.todayRevenue += newRevenue;

//     await statisticsRepo.save(stats);
//     return stats;
//   },
// };
// function startOfDay(now: Date) {
//   throw new Error("Function not implemented.");
// }

// function startOfMonth(now: Date) {
//   throw new Error("Function not implemented.");
// }



import { MoreThanOrEqual } from "typeorm";
import { Order } from "../../models/Order.model";
import { startOfDay, startOfMonth } from 'date-fns';
import { AppDataSource } from "../../config/data-source";
import { Statistics } from "../../models/Statistics.model";

export const StatisticsService = {
  // Statistics retrieval
  getStatistics: async () => {
    const orderRepo = AppDataSource.getRepository(Order);

    const now = new Date();
    const todayStart = startOfDay(now);
    const monthStart = startOfMonth(now);

    // Fetching orders created on or after 'todayStart' and 'monthStart'
    const [todayOrders, monthOrders, allOrders] = await Promise.all([
      orderRepo.find({ where: { created_at: MoreThanOrEqual(todayStart) } }),  // Make sure createdAt exists in the entity
      orderRepo.find({ where: { created_at: MoreThanOrEqual(monthStart) } }),
      orderRepo.find(),
    ]);

    // Calculate revenue for each group of orders
    const calcRevenue = (orders:any) => orders.reduce((sum:any, o:any) => sum + Number(o.totalAmount), 0);

    const todayRevenue = calcRevenue(todayOrders);
    const monthRevenue = calcRevenue(monthOrders);
    const totalRevenue = calcRevenue(allOrders);

    // Order counts
    const todayOrdersCount = todayOrders.length;
    const monthOrdersCount = monthOrders.length;
    const totalOrdersCount = allOrders.length;

    // Popular items (simplified logic)
    const items = await orderRepo.find({ relations: ['items', 'items.product'] });

    const itemFrequency: Record<string, number> = {};

    items.forEach((item: any) => {
      const productName = item.product?.name || 'Unknown';
      itemFrequency[productName] = (itemFrequency[productName] || 0) + item.quantity;
    });

    const popularItems = Object.entries(itemFrequency)
      .sort((a, b) => b[1] - a[1]) // Sort by frequency descending
      .slice(0, 5)
      .map(([item]) => item); // Get the most popular items (names)

    return {
      todayRevenue,
      monthRevenue,
      totalRevenue,
      todayOrders: todayOrdersCount,
      monthOrders: monthOrdersCount,
      totalOrders: totalOrdersCount,
      popularItems,
      revenueByDay: [], // Optional: You can implement this later if you want daily revenue breakdown
    };
  },


  // Statistikaları yeniləmə funksiyası
  updateStatistics: async (newRevenue: number) => {
    const statisticsRepo = AppDataSource.getRepository(Statistics);
    let stats = await statisticsRepo.findOne({ where: { id: 1 } });

    if (!stats) {
      stats = new Statistics();
    }

    // Update statistics
    stats.totalRevenue += newRevenue;
    stats.monthRevenue += newRevenue;
    stats.todayRevenue += newRevenue;

    await statisticsRepo.save(stats);
    return stats;
  },
};
