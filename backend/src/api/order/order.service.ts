// import { AppDataSource } from "../../config/data-source";
// import { Customization } from "../../models/Customization.model";
// import { Order } from "../../models/Order.model";
// import { OrderItem } from "../../models/OrderItem.model";
// import { Product } from "../../models/Product.model";
// import { User } from "../../models/User.model";
// import { CreateOrderDto } from "./order.dto";

import { In } from "typeorm";
import { AppDataSource } from "../../config/data-source";
import { Addon } from "../../models/AddOn.model";
import { Inventory } from "../../models/Inventory.model";
import { Order } from "../../models/Order.model";
import { OrderItem } from "../../models/OrderItem.model";
import { Product } from "../../models/Product.model";
import { Recipe } from "../../models/Recipe.model";

// export class OrderService {
//   private orderRepo = AppDataSource.getRepository(Order);
//   private orderItemRepo = AppDataSource.getRepository(OrderItem);
//   private productRepo = AppDataSource.getRepository(Product);
//   private customizationRepo = AppDataSource.getRepository(Customization);
//   private userRepo = AppDataSource.getRepository(User);

//   async createOrder(dto: CreateOrderDto, userId: number) {
//     const user = await this.userRepo.findOneByOrFail({ id: userId });

//     const order = this.orderRepo.create({ createdBy: user, totalAmount: 0, price: 0 });
//     order.items = [];

//     let total = 0;

//     for (const itemDto of dto.items) {
//       const product = await this.productRepo.findOneByOrFail({ id: itemDto.productId });
//       const unitPrice = product.price;
//       let customizations: Customization[] = [];
//       let customizationTotal = 0;

//       if (itemDto.customizationIds && itemDto.customizationIds.length) {
//         customizations = await this.customizationRepo.findByIds(itemDto.customizationIds);
//         customizationTotal = customizations.reduce((sum, c) => sum + Number(c.price), 0);
//       }

//       const price = (Number(unitPrice) + customizationTotal) * itemDto.quantity;

//       const orderItem = this.orderItemRepo.create({
//         product,
//         quantity: itemDto.quantity,
//         price,
//         unitPrice,
//         customizations,
//       });

//       total += price;
//       order.items.push(orderItem);
//     }

//     order.totalAmount = total;
//     order.price = total;

//     await this.orderRepo.save(order);
//     return order;
//   }

//   async getAllOrders(query: any) {
//     const { startDate, endDate, page = 1, limit = 10 } = query;

//     const qb = this.orderRepo.createQueryBuilder('order')
//       .leftJoinAndSelect('order.items', 'items')
//       .leftJoinAndSelect('items.product', 'product')
//       .leftJoinAndSelect('items.customizations', 'customizations')
//       .leftJoinAndSelect('order.createdBy', 'createdBy')
//       .skip((page - 1) * limit)
//       .take(limit);

//     if (startDate) qb.andWhere('order.created_at >= :startDate', { startDate });
//     if (endDate) qb.andWhere('order.created_at <= :endDate', { endDate });

//     const [orders, total] = await qb.getManyAndCount();

//     return {
//       data: orders,
//       total,
//       page: Number(page),
//       limit: Number(limit),
//     };
//   }
// }




// export const createOrder = async (orderData: any) => {
//   try {
//     const orderRepository = AppDataSource.getRepository(Order);
//     const productRepository = AppDataSource.getRepository(Product);
//     const inventoryRepository = AppDataSource.getRepository(Inventory);

//     const order = new Order();
//     order.totalAmount = orderData.totalAmount;
//     order.price = orderData.price;
//     await orderRepository.save(order);

//     for (const item of orderData.items) {
//       const product = await productRepository.findOne({
//         where: { id: item.productId },
//         relations: ["ingredients"], 
//       });

//       if (product) {
//         for (const ingredient of product.ingredients) {
//           const inventoryItem = await inventoryRepository.findOne({
//             where: { id: ingredient.id },
//           });

//           if (inventoryItem) {
//             inventoryItem.quantity -= ingredient.quantity; 
//             await inventoryRepository.save(inventoryItem); 
//           }
//         }
//       }
//     }

//     console.log("Order placed and inventory updated.");
//     return order;
//   } catch (error) {
//     console.error("Error placing order:", error);
//     throw new Error("Failed to place order");
//   }
// };


// order.service.ts
export const createOrder = async (orderData: any) => {
  const { items } = orderData;

  const orderRepo = AppDataSource.getRepository(Order);
  const orderItemRepo = AppDataSource.getRepository(OrderItem);
  const productRepo = AppDataSource.getRepository(Product);
  const inventoryRepo = AppDataSource.getRepository(Inventory);
  const addonRepo = AppDataSource.getRepository(Addon);
  const recipeRepo = AppDataSource.getRepository(Recipe);

  let totalPrice = 0;
  const orderItems: OrderItem[] = [];

  for (const item of items) {
    const product = await productRepo.findOneBy({ id: item.productId });
    if (!product) continue;

    const orderItem = new OrderItem();
    const quantity = item.quantity || 1;

    orderItem.product = product;
    orderItem.price = product.price * quantity;
    orderItem.quantity = quantity;

    totalPrice += orderItem.price;

    const recipes = await recipeRepo.find({
      where: { product: { id: product.id } },
      relations: ["ingredient"],
    });

    const usedIngredients: Inventory[] = [];
    for (const r of recipes) {
      const inventoryItem = await inventoryRepo.findOneBy({ id: r.ingredient.id });
      if (inventoryItem) {
        inventoryItem.quantity -= r.quantityNeeded * quantity;
        await inventoryRepo.save(inventoryItem);
        usedIngredients.push(inventoryItem);
      }
    }
    orderItem.ingredients = usedIngredients;

    if (item.addonIds && Array.isArray(item.addonIds)) {
      const addons = await addonRepo.findBy({ id: In(item.addonIds) });
      orderItem.addons = addons;

      for (const addon of addons) {
        totalPrice += addon.price * quantity;
        orderItem.price += addon.price * quantity;
      }
    }

    await orderItemRepo.save(orderItem);
    orderItems.push(orderItem);
  }

  const order = new Order();
  order.totalAmount = orderItems.length;
  order.price = totalPrice;
  order.items = orderItems;

  return await orderRepo.save(order);  // ❗ burada response yox, return var
};
