import { In } from "typeorm";
import { AppDataSource } from "../../config/data-source";
import { Inventory } from "../../models/Inventory.model";
import { Order } from "../../models/Order.model";
import { OrderItem } from "../../models/OrderItem.model";
import { Product } from "../../models/Product.model";
import { Recipe } from "../../models/Recipe.model";
import { Addon } from "../../models/AddOn.model";
import { User } from "../../models/User.model";
import { Drink } from "../../models/Drink.model";

export const createOrder = async (orderData: { userId: number; items: any[] }) => {
  const { userId, items } = orderData;

  const orderRepo = AppDataSource.getRepository(Order);
  const orderItemRepo = AppDataSource.getRepository(OrderItem);
  const productRepo = AppDataSource.getRepository(Product);
  const inventoryRepo = AppDataSource.getRepository(Inventory);
  const recipeRepo = AppDataSource.getRepository(Recipe);
  const addonRepo = AppDataSource.getRepository(Addon);
  const userRepo = AppDataSource.getRepository(User);
  const drinkRepo = AppDataSource.getRepository(Drink);

  let totalPrice = 0;
  let totalQuantity = 0;
  const orderItems: OrderItem[] = [];

  const user = await userRepo.findOneByOrFail({ id: userId });

  await AppDataSource.transaction(async (transactionalEntityManager) => {
    for (const item of items) {
      const quantity = item.quantity || 1;
      const orderItem = new OrderItem();
      orderItem.quantity = quantity;

      let basePrice = 0;

      // === ✅ Handle product and its recipe ===
      if (item.productId) {
        const product = await productRepo.findOneBy({ id: item.productId });
        if (!product) throw new Error("Product not found.");

        orderItem.product = product;
        basePrice += product.price * quantity;

        const recipes = await recipeRepo.find({
          where: { product: { id: product.id } },
          relations: ["ingredient"],
        });

        const usedIngredients: Inventory[] = [];
        for (const r of recipes) {
          const inventoryItem = await inventoryRepo.findOneBy({ id: r.ingredient.id });
          if (inventoryItem && inventoryItem.quantity >= r.quantityNeeded * quantity) {
            inventoryItem.quantity -= r.quantityNeeded * quantity;
            await transactionalEntityManager.save(inventoryItem);
            usedIngredients.push(inventoryItem);
          } else {
            throw new Error(`${inventoryItem?.quantity || 0} ${r.ingredient.ingredient} is not enough for ${quantity} ${product.name}`);
          }
        }
        orderItem.ingredients = usedIngredients;
      }

      // === ✅ Handle Addons ===
      if (item.addonIds && Array.isArray(item.addonIds)) {
        const addons = await addonRepo.find({
          where: { id: In(item.addonIds) },
          relations: ["inventory"],
        });

        orderItem.addons = addons;

        for (const addon of addons) {
          if (addon.inventory) {
            const inventoryItem = await inventoryRepo.findOneBy({ id: addon.inventory.id });
            if (inventoryItem && inventoryItem.quantity >= quantity) {
              inventoryItem.quantity -= quantity;
              await transactionalEntityManager.save(inventoryItem);
              basePrice += addon.price * quantity;
            } else {
              throw new Error(`${inventoryItem?.quantity || 0} ${addon.name} is not enough`);
            }
          } else {
            throw new Error(`No inventory linked to addon ${addon.name}`);
          }
        }
      }

      // === ✅ Handle Drinks ===
      if (item.drinkIds && Array.isArray(item.drinkIds)) {
        const drinks = await drinkRepo.find({
          where: { id: In(item.drinkIds) },
          relations: ["inventory"],
        });

        orderItem.drinks = drinks;

        for (const drink of drinks) {
          basePrice += drink.price * quantity;

          if (!drink.inventory) {
            throw new Error(`Drink ${drink.name} is not linked to any inventory item.`);
          }

          const inventoryItem = await inventoryRepo.findOneBy({ id: drink.inventory.id });
          if (inventoryItem && inventoryItem.quantity >= quantity) {
            inventoryItem.quantity -= quantity;
            await transactionalEntityManager.save(inventoryItem);
          } else {
            throw new Error(`${inventoryItem?.quantity || 0} ${drink.name} is not enough`);
          }
        }
      }

      orderItem.price = basePrice;
      totalPrice += basePrice;
      totalQuantity += quantity;

      await transactionalEntityManager.save(orderItem);
      orderItems.push(orderItem);
    }

    const order = new Order();
    order.createdBy = user;
    order.totalAmount = totalQuantity;
    order.price = totalPrice;
    order.items = orderItems;

    await transactionalEntityManager.save(order);
    return order;
  });
};

export const getAllOrders = async () => {
  const orderRepo = AppDataSource.getRepository(Order);

  const orders = await orderRepo.find({
    order: {
      created_at: "DESC", 
    },
    relations: ["createdBy", "items", "items.product"],
  });

  return orders;
};
