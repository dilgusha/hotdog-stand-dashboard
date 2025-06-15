import { In } from "typeorm";
import { AppDataSource } from "../../config/data-source";
import { Inventory } from "../../models/Inventory.model";
import { Order } from "../../models/Order.model";
import { OrderItem } from "../../models/OrderItem.model";
import { Product } from "../../models/Product.model";
import { Recipe } from "../../models/Recipe.model";
import { Addon } from "../../models/AddOn.model";
import { Drink } from "../../models/Drink.model";
import { User } from "../../models/User.model";

export const createOrder = async (orderData: { userId: number; items: any[] }) =>  {
  const { userId, items } = orderData;

  const orderRepo = AppDataSource.getRepository(Order);
  const userRepo = AppDataSource.getRepository(User);
  const orderItemRepo = AppDataSource.getRepository(OrderItem);
  const productRepo = AppDataSource.getRepository(Product);
  const inventoryRepo = AppDataSource.getRepository(Inventory);
  const recipeRepo = AppDataSource.getRepository(Recipe);
  const addonRepo = AppDataSource.getRepository(Addon);
  const drinkRepo = AppDataSource.getRepository(Drink);

  let totalPrice = 0;
  let totalQuantity = 0;
  const orderItems: OrderItem[] = [];
  const user = await userRepo.findOneByOrFail({ id: userId });

  try {
    await AppDataSource.transaction(async (transactionalEntityManager) => {

      for (const item of items) {

        const quantity = item.quantity || 1;
        const orderItem = new OrderItem();
        orderItem.quantity = quantity;

        let basePrice = 0;

        // === Handle Product and its Recipe ===
        if (item.productId) {
          const product = await transactionalEntityManager.findOneBy(Product, { id: item.productId });
          if (!product) {
            console.error(`[ERROR] Product not found: ID ${item.productId}`);
            throw new Error(`Product not found: ID ${item.productId}`);
          }

          orderItem.product = product;
          basePrice += product.price * quantity;

          const recipes = await transactionalEntityManager.find(Recipe, {
            where: { product: { id: product.id } },
            relations: ["ingredient"],
            cache: false,
          });

          const usedIngredients: Inventory[] = [];
          for (const r of recipes) {
            const inventoryItem = await transactionalEntityManager.findOneBy(Inventory, { id: r.ingredient.id });
            if (!inventoryItem) {
              console.error(`[ERROR] Inventory item not found for ingredient ID: ${r.ingredient.id}`);
              throw new Error(`Inventory item not found for ingredient ID: ${r.ingredient.id}`);
            }
            if (inventoryItem.quantity >= r.quantityNeeded * quantity) {
              const newQuantity = inventoryItem.quantity - r.quantityNeeded * quantity;
              await transactionalEntityManager.update(Inventory, { id: inventoryItem.id }, { quantity: newQuantity });
              // Verify update
              const updatedInventory = await transactionalEntityManager.findOneBy(Inventory, { id: inventoryItem.id });
              console.log(`[DEBUG] Inventory updated: ${inventoryItem.ingredient} now at ${updatedInventory?.quantity} grams`);
              inventoryItem.quantity = newQuantity;
              usedIngredients.push(inventoryItem);
            } else {
              console.error(`[ERROR] Insufficient inventory: ${inventoryItem.quantity} ${inventoryItem.ingredient} for ${quantity} ${product.name}`);
              throw new Error(`${inventoryItem.quantity || 0} ${inventoryItem.ingredient} is not enough for ${quantity} ${product.name}`);
            }
          }
          orderItem.ingredients = usedIngredients;
        }

        // === Handle Addons ===
        if (item.addonIds && Array.isArray(item.addonIds)) {
          const addons = await transactionalEntityManager.find(Addon, {
            where: { id: In(item.addonIds) },
            relations: ["inventory"],
            cache: false,
          });
          if (!addons.length) {
            console.warn(`[WARN] No addons found for IDs: ${item.addonIds}`);
          }

          orderItem.addons = addons;

          for (const addon of addons) {
            if (addon.inventory) {
              const inventoryItem = await transactionalEntityManager.findOneBy(Inventory, { id: addon.inventory.id });
              if (!inventoryItem) {
                console.error(`[ERROR] Inventory item not found for addon ID: ${addon.inventory.id}`);
                throw new Error(`Inventory item not found for addon ID: ${addon.inventory.id}`);
              }
              const quantityToDeduct = addon.quantityNeeded * quantity;
              if (inventoryItem.quantity >= quantityToDeduct) {
                const newQuantity = inventoryItem.quantity - quantityToDeduct;
                await transactionalEntityManager.update(Inventory, { id: inventoryItem.id }, { quantity: newQuantity });
                // Verify update
                const updatedInventory = await transactionalEntityManager.findOneBy(Inventory, { id: inventoryItem.id });
                inventoryItem.quantity = newQuantity;
                basePrice += addon.price * quantity;
              } else {
                console.error(`[ERROR] Insufficient inventory: ${inventoryItem.quantity} ${addon.name}, requires ${quantityToDeduct}`);
                throw new Error(`${inventoryItem.quantity || 0} ${addon.name} is not enough, requires ${quantityToDeduct}`);
              }
            } else {
              console.error(`[ERROR] No inventory linked to addon ${addon.name}`);
              throw new Error(`No inventory linked to addon ${addon.name}`);
            }
          }
        }

        // === Handle Drinks ===
        if (item.drinkIds && Array.isArray(item.drinkIds)) {
          const drinks = await transactionalEntityManager.find(Drink, {
            where: { id: In(item.drinkIds) },
            relations: ["inventory"],
            cache: false,
          });
          console.log(`[DEBUG] Drinks found: ${drinks.length}`);

          orderItem.drinks = drinks;

          for (const drink of drinks) {
            basePrice += drink.price * quantity;

            if (!drink.inventory) {
              console.error(`[ERROR] Drink ${drink.name} not linked to inventory`);
              throw new Error(`Drink ${drink.name} is not linked to any inventory item.`);
            }

            const inventoryItem = await transactionalEntityManager.findOneBy(Inventory, { id: drink.inventory.id });
            if (!inventoryItem) {
              console.error(`[ERROR] Inventory item not found for drink ID: ${drink.inventory.id}`);
              throw new Error(`Inventory item not found for drink ID: ${drink.inventory.id}`);
            }
            console.log(`[DEBUG] Drink ${drink.name}: Current inventory ${inventoryItem.ingredient}: ${inventoryItem.quantity}, Deducting ${quantity} units`);
            if (inventoryItem.quantity >= quantity) {
              const newQuantity = inventoryItem.quantity - quantity;
              await transactionalEntityManager.update(Inventory, { id: inventoryItem.id }, { quantity: newQuantity });
              const updatedInventory = await transactionalEntityManager.findOneBy(Inventory, { id: inventoryItem.id });
              inventoryItem.quantity = newQuantity;
            } else {
              console.error(`[ERROR] Insufficient inventory: ${inventoryItem.quantity} ${drink.name}`);
              throw new Error(`${inventoryItem.quantity || 0} ${drink.name} is not enough`);
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
      order.totalAmount = totalQuantity;
      order.createdBy = user;
      order.price = totalPrice;
      order.items = orderItems;

      const finalInventories = await transactionalEntityManager.find(Inventory, { cache: false });
      await transactionalEntityManager.save(order);
      console.log(`[DEBUG] Saved order: ID ${order.id}, Total Price: ${totalPrice}, Total Quantity: ${totalQuantity}`);
    });
  } catch (error) {
    console.error("[ERROR] Transaction failed:", error);
    throw error;
  }
};

export const getAllOrders = async () => {
  const orderRepo = AppDataSource.getRepository(Order);

  const orders = await orderRepo.find({
    order: {
      created_at: "DESC",
    },
    relations: ["createdBy", "items", "items.product", "items.drinks", "items.addons"],
  });

  return orders;
};