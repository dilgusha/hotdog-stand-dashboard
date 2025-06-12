// import { MoreThanOrEqual } from "typeorm";
// import { Order } from "../../models/Order.model";
// import { startOfDay, startOfMonth } from 'date-fns';
// import { AppDataSource } from "../../config/data-source";
// import { Statistics } from "../../models/Statistics.model";

// export const StatisticsService = {
//   getStatistics: async () => {
//     const orderRepo = AppDataSource.getRepository(Order);

//     const now = new Date();
//     const todayStart = startOfDay(now);
//     const monthStart = startOfMonth(now);

//     const [todayOrders, monthOrders, allOrders] = await Promise.all([
//       orderRepo.find({ where: { created_at: MoreThanOrEqual(todayStart) } }),  
//       orderRepo.find({ where: { created_at: MoreThanOrEqual(monthStart) } }),
//       orderRepo.find(),
//     ]);

//      const calcRevenue = (orders: any) => orders.reduce((sum: number, order: any) => {
//       // Ensure that the order has items and items is an array
//       if (order.items && Array.isArray(order.items)) {
//         const orderItemTotal = order.items.reduce((itemSum: number, item: any) => {
//           // Ensure item has price and quantity properties
//           if (item.price && item.quantity) {
//             return itemSum + (item.price * item.quantity);  // Multiply price by quantity
//           }
//           return itemSum;
//         }, 0);
//         return sum + orderItemTotal;
//       }
//       return sum;
//     }, 0);

//     const todayRevenue = calcRevenue(todayOrders);
//     const monthRevenue = calcRevenue(monthOrders);
//     const totalRevenue = calcRevenue(allOrders);

//     const todayOrdersCount = todayOrders.length;
//     const monthOrdersCount = monthOrders.length;
//     const totalOrdersCount = allOrders.length;

//     const items = await orderRepo.find({ relations: ['items', 'items.product'] });

//     const itemFrequency: Record<string, number> = {};

//     items.forEach((item: any) => {
//       const productName = item.product?.name || 'Unknown';
//       itemFrequency[productName] = (itemFrequency[productName] || 0) + item.quantity;
//     });

  

//     return {
//       todayRevenue,
//       monthRevenue,
//       totalRevenue,
//       todayOrders: todayOrdersCount,
//       monthOrders: monthOrdersCount,
//       totalOrders: totalOrdersCount,
//     };
//   },

//   updateStatistics: async (newRevenue: number) => {
//     const statisticsRepo = AppDataSource.getRepository(Statistics);
//     let stats = await statisticsRepo.findOne({ where: { id: 1 } });

//     if (!stats) {
//       stats = new Statistics();
//     }

//     stats.totalRevenue += newRevenue;
//     stats.monthRevenue += newRevenue;
//     stats.todayRevenue += newRevenue;

//     await statisticsRepo.save(stats);
//     return stats;
//   },
// };


// import { MoreThanOrEqual } from "typeorm";
// import { Order } from "../../models/Order.model";
// import { startOfDay, startOfMonth } from 'date-fns';
// import { AppDataSource } from "../../config/data-source";
// import { Statistics } from "../../models/Statistics.model";

// export const StatisticsService = {
//   getStatistics: async () => {
//     const orderRepo = AppDataSource.getRepository(Order);

//     const now = new Date();
//     const todayStart = startOfDay(now);
//     const monthStart = startOfMonth(now);

//     // Fetch orders with items and addons (eagerly load related entities)
//     const [todayOrders, monthOrders, allOrders] = await Promise.all([
//       orderRepo.find({ 
//         where: { created_at: MoreThanOrEqual(todayStart) },
//         relations: ['items', 'items.addons']  // Ensure the related entities are loaded
//       }),
//       orderRepo.find({ 
//         where: { created_at: MoreThanOrEqual(monthStart) },
//         relations: ['items', 'items.addons']  // Same for month orders
//       }),
//       orderRepo.find({
//         relations: ['items', 'items.addons']  // Same for all orders
//       }),
//     ]);

//     // Revenue calculation
//     const calcRevenue = (orders: any) => orders.reduce((sum: number, order: any) => {
//       if (order.items && Array.isArray(order.items)) {
//         const orderItemTotal = order.items.reduce((itemSum: number, item: any) => {
//           let itemTotal = 0;

//           // Ensure item has price and quantity properties
//           if (item.price && item.quantity) {
//             itemTotal += item.price * item.quantity; // Multiply price by quantity

//             // Add revenue from add-ons
//             if (item.addons && Array.isArray(item.addons)) {
//               item.addons.forEach((addon: any) => {
//                 if (addon.price && item.quantity) {
//                   itemTotal += addon.price * item.quantity; // Multiply addon price by quantity
//                 }
//               });
//             }
//           }

//           return itemSum + itemTotal;
//         }, 0);

//         return sum + orderItemTotal;
//       }
//       return sum;
//     }, 0);

//     const todayRevenue = calcRevenue(todayOrders);
//     const monthRevenue = calcRevenue(monthOrders);
//     const totalRevenue = calcRevenue(allOrders);

//     const todayOrdersCount = todayOrders.length;
//     const monthOrdersCount = monthOrders.length;
//     const totalOrdersCount = allOrders.length;

//     return {
//       todayRevenue,
//       monthRevenue,
//       totalRevenue,
//       todayOrders: todayOrdersCount,
//       monthOrders: monthOrdersCount,
//       totalOrders: totalOrdersCount,
//     };
//   },

//   updateStatistics: async (newRevenue: number) => {
//     const statisticsRepo = AppDataSource.getRepository(Statistics);
//     let stats = await statisticsRepo.findOne({ where: { id: 1 } });

//     if (!stats) {
//       stats = new Statistics();
//     }

//     stats.totalRevenue += newRevenue;
//     stats.monthRevenue += newRevenue;
//     stats.todayRevenue += newRevenue;

//     await statisticsRepo.save(stats);
//     return stats;
//   },
// };


import { MoreThanOrEqual } from "typeorm";
import { Order } from "../../models/Order.model";
import { startOfDay, startOfMonth } from "date-fns";
import { AppDataSource } from "../../config/data-source";
import { Statistics } from "../../models/Statistics.model";

export const StatisticsService = {
  getStatistics: async () => {
    const orderRepo = AppDataSource.getRepository(Order);

    const now = new Date();
    const todayStart = startOfDay(now);
    const monthStart = startOfMonth(now);

    // Fetch orders with items and addons
    const [todayOrders, monthOrders, allOrders] = await Promise.all([
      orderRepo.find({
        where: { created_at: MoreThanOrEqual(todayStart) },
        relations: ["items", "items.addons", "items.product"],
      }),
      orderRepo.find({
        where: { created_at: MoreThanOrEqual(monthStart) },
        relations: ["items", "items.addons", "items.product"],
      }),
      orderRepo.find({
        relations: ["items", "items.addons", "items.product"],
      }),
    ]);

    // Revenue calculation
    const calcRevenue = (orders: Order[]): number => {
      return orders.reduce((sum: number, order: Order) => {
        let orderTotal = 0;

        // Try using totalAmount first
        if (typeof order.totalAmount === "number" && order.totalAmount > 0) {
          orderTotal = order.totalAmount;
          console.log(`Order ${order.id}: Using totalAmount = ${orderTotal}`);
        } else {
          // Fallback to calculating from items and addons
          if (order.items && Array.isArray(order.items)) {
            orderTotal = order.items.reduce((itemSum: number, item) => {
              let itemTotal = 0;

              // Calculate item price * quantity
              if (typeof item.price === "number" && typeof item.quantity === "number") {
                itemTotal += item.price * item.quantity;

                // Add addon prices
                if (item.addons && Array.isArray(item.addons)) {
                  itemTotal += item.addons.reduce((addonSum: number, addon) => {
                    if (typeof addon.price === "number") {
                      return addonSum + addon.price * item.quantity;
                    }
                    return addonSum;
                  }, 0);
                }
              } else {
                console.log(`Order ${order.id}, Item ${item.id}: Invalid price or quantity`);
              }

              return itemSum + itemTotal;
            }, 0);
            console.log(`Order ${order.id}: Calculated total = ${orderTotal} from items`);
          } else {
            console.log(`Order ${order.id}: No items found, total = 0`);
          }
        }

        return sum + Number(orderTotal.toFixed(2));
      }, 0);
    };

    const todayRevenue = Number(calcRevenue(todayOrders).toFixed(2));
    const monthRevenue = Number(calcRevenue(monthOrders).toFixed(2));
    const totalRevenue = Number(calcRevenue(allOrders).toFixed(2));

    const todayOrdersCount = todayOrders.length;
    const monthOrdersCount = monthOrders.length;
    const totalOrdersCount = allOrders.length;

    console.log({
      todayOrdersCount,
      monthOrdersCount,
      totalOrdersCount,
      todayRevenue,
      monthRevenue,
      totalRevenue,
      orders: allOrders.map((o) => ({
        id: o.id,
        totalAmount: o.totalAmount,
        items: o.items?.map((i) => ({
          id: i.id,
          price: i.price,
          quantity: i.quantity,
          addons: i.addons?.map((a) => ({ id: a.id, price: a.price })),
        })),
      })),
    });

    return {
      todayRevenue,
      monthRevenue,
      totalRevenue,
      todayOrders: todayOrdersCount,
      monthOrders: monthOrdersCount,
      totalOrders: totalOrdersCount,
    };
  },

  updateStatistics: async (newRevenue: number, newOrder: boolean = false) => {
    const statisticsRepo = AppDataSource.getRepository(Statistics);
    let stats = await statisticsRepo.findOne({ where: { id: 1 } });

    if (!stats) {
      stats = new Statistics();
      stats.id = 1;
      stats.todayRevenue = 0;
      stats.monthRevenue = 0;
      stats.totalRevenue = 0;
      stats.todayOrders = 0;
      stats.monthOrders = 0;
      stats.totalOrders = 0;
      stats.lastUpdated = new Date();
    }

    // Reset todayRevenue and todayOrders at the start of a new day
    const now = new Date();
    const todayStart = startOfDay(now);
    if (stats.lastUpdated && startOfDay(stats.lastUpdated) < todayStart) {
      stats.todayRevenue = 0;
      stats.todayOrders = 0;
      console.log("Reset todayRevenue and todayOrders");
    }

    // Reset monthRevenue and monthOrders at the start of a new month
    const monthStart = startOfMonth(now);
    if (stats.lastUpdated && startOfMonth(stats.lastUpdated) < monthStart) {
      stats.monthRevenue = 0;
      stats.monthOrders = 0;
      console.log("Reset monthRevenue and monthOrders");
    }

    // Update revenue and order counts
    stats.todayRevenue = Number((stats.todayRevenue + newRevenue).toFixed(2));
    stats.monthRevenue = Number((stats.monthRevenue + newRevenue).toFixed(2));
    stats.totalRevenue = Number((stats.totalRevenue + newRevenue).toFixed(2));

    if (newOrder) {
      stats.todayOrders += 1;
      stats.monthOrders += 1;
      stats.totalOrders += 1;
    }

    // Update lastUpdated timestamp
    stats.lastUpdated = now;

    await statisticsRepo.save(stats);
    console.log("Updated statistics:", stats);

    return stats;
  },
};