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
import { ProductCategory } from "../../common/enum/product-category.enum";

export const createOrder = async (orderData: {
  userId: number;
  items: {
    productId?: number;
    units: { quantity: number; addonIds?: number[]; drinkIds?: number[] }[];
  }[];
}) => {
  const { userId, items } = orderData;
  console.log("✅ [createOrder] Gələn userId:", userId);
  console.log("✅ [BACKEND] createOrder daxil oldu. Gələn userId:", userId);

  console.log(`[DEBUG] Creating order for user ID: ${userId}`);

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
        const { productId, units } = item;
        let product: Product | null = null;

        // === Handle Product and its Recipe ===
        if (productId) {
          product = await transactionalEntityManager.findOneBy(Product, {
            id: productId,
          });
          if (!product) {
            console.error(`[ERROR] Product not found: ID ${productId}`);
            throw new Error(`Product not found: ID ${productId}`);
          }
        }

        for (const unit of units) {
          const { quantity, addonIds, drinkIds } = unit;
          const orderItem = new OrderItem();
          orderItem.quantity = quantity;

          let basePrice = product ? product.price * quantity : 0;

          if (product) {
            orderItem.product = product;
            const recipes = await transactionalEntityManager.find(Recipe, {
              where: { product: { id: product.id } },
              relations: ["ingredient"],
              cache: false,
            });

            const usedIngredients: Inventory[] = [];
            for (const r of recipes) {
              const inventoryItem = await transactionalEntityManager.findOneBy(
                Inventory,
                { id: r.ingredient.id }
              );
              if (!inventoryItem) {
                console.error(
                  `[ERROR] Inventory item not found for ingredient ID: ${r.ingredient.id}`
                );
                throw new Error(
                  `Inventory item not found for ingredient ID: ${r.ingredient.id}`
                );
              }
              if (inventoryItem.quantity >= r.quantityNeeded * quantity) {
                const newQuantity =
                  inventoryItem.quantity - r.quantityNeeded * quantity;
                await transactionalEntityManager.update(
                  Inventory,
                  { id: inventoryItem.id },
                  { quantity: newQuantity }
                );
                const updatedInventory =
                  await transactionalEntityManager.findOneBy(Inventory, {
                    id: inventoryItem.id,
                  });
                console.log(
                  `[DEBUG] Inventory updated: ${inventoryItem.ingredient} now at ${updatedInventory?.quantity} grams`
                );
                inventoryItem.quantity = newQuantity;
                usedIngredients.push(inventoryItem);
              } else {
                console.error(
                  `[ERROR] Insufficient inventory: ${inventoryItem.quantity} ${inventoryItem.ingredient} for ${quantity} ${product.name}`
                );
                throw new Error(
                  `${inventoryItem.quantity || 0} ${inventoryItem.ingredient} is not enough for ${quantity} ${product.name}`
                );
              }
            }
            orderItem.ingredients = usedIngredients;
          }

          // === Handle Addons ===
          if (addonIds && Array.isArray(addonIds)) {
            const addons = await transactionalEntityManager.find(Addon, {
              where: { id: In(addonIds) },
              relations: ["inventory"],
              cache: false,
            });
            if (!addons.length) {
              console.warn(`[WARN] No addons found for IDs: ${addonIds}`);
            }

            orderItem.addons = addons;

            for (const addon of addons) {
              if (addon.inventory) {
                const inventoryItem =
                  await transactionalEntityManager.findOneBy(Inventory, {
                    id: addon.inventory.id,
                  });
                if (!inventoryItem) {
                  console.error(
                    `[ERROR] Inventory item not found for addon ID: ${addon.inventory.id}`
                  );
                  throw new Error(
                    `Inventory item not found for addon ID: ${addon.inventory.id}`
                  );
                }
                const quantityToDeduct = addon.quantityNeeded * quantity;
                if (inventoryItem.quantity >= quantityToDeduct) {
                  const newQuantity = inventoryItem.quantity - quantityToDeduct;
                  await transactionalEntityManager.update(
                    Inventory,
                    { id: inventoryItem.id },
                    { quantity: newQuantity }
                  );
                  const updatedInventory =
                    await transactionalEntityManager.findOneBy(Inventory, {
                      id: inventoryItem.id,
                    });
                  inventoryItem.quantity = newQuantity;
                  basePrice += addon.price * quantity; // Multiply addon price by quantity for each unit
                } else {
                  console.error(
                    `[ERROR] Insufficient inventory: ${inventoryItem.quantity} ${addon.name}, requires ${quantityToDeduct}`
                  );
                  throw new Error(
                    `${inventoryItem.quantity || 0} ${addon.name} is not enough, requires ${quantityToDeduct}`
                  );
                }
              } else {
                console.error(
                  `[ERROR] No inventory linked to addon ${addon.name}`
                );
                throw new Error(`No inventory linked to addon ${addon.name}`);
              }
            }
          }

          // === Handle Drinks ===
          if (drinkIds && Array.isArray(drinkIds)) {
            const drinks = await transactionalEntityManager.find(Drink, {
              where: { id: In(drinkIds) },
              relations: ["inventory"],
              cache: false,
            });
            console.log(
              `[DEBUG] Drinks found: ${drinks.length}, IDs: ${drinkIds}`
            );

            orderItem.drinks = drinks;

            if (
              !productId ||
              (product && product.category !== ProductCategory.COMBOS)
            ) {
              for (const drink of drinks) {
                basePrice += drink.price * quantity;
                console.log(
                  `[DEBUG] Adding drink price: ${drink.name} (${drink.price}₼ x ${quantity})`
                );
              }
            } else {
              console.log(
                `[DEBUG] Skipping drink price for combo: ${product?.name || "N/A"}`
              );
            }

            for (const drink of drinks) {
              if (!drink.inventory) {
                console.error(
                  `[ERROR] Drink ${drink.name} not linked to inventory`
                );
                throw new Error(
                  `Drink ${drink.name} is not linked to any inventory item.`
                );
              }
              const inventoryItem = await transactionalEntityManager.findOneBy(
                Inventory,
                { id: drink.inventory.id }
              );
              if (!inventoryItem) {
                console.error(
                  `[ERROR] Inventory item not found for drink ID: ${drink.inventory.id}`
                );
                throw new Error(
                  `Inventory item not found for drink ID: ${drink.inventory.id}`
                );
              }
              console.log(
                `[DEBUG] Drink ${drink.name}: Current inventory ${inventoryItem.ingredient}: ${inventoryItem.quantity}, Deducting ${quantity} units`
              );
              if (inventoryItem.quantity >= quantity) {
                const newQuantity = inventoryItem.quantity - quantity;
                await transactionalEntityManager.update(
                  Inventory,
                  { id: inventoryItem.id },
                  { quantity: newQuantity }
                );
                const updatedInventory =
                  await transactionalEntityManager.findOneBy(Inventory, {
                    id: inventoryItem.id,
                  });
                inventoryItem.quantity = newQuantity;
              } else {
                console.error(
                  `[ERROR] Insufficient inventory: ${inventoryItem.quantity} ${drink.name}`
                );
                throw new Error(
                  `${inventoryItem.quantity || 0} ${drink.name} is not enough`
                );
              }
            }
          }

          orderItem.price = parseFloat(basePrice.toFixed(2)); // Ensure price is a number with 2 decimal places
          totalPrice += orderItem.price;
          totalQuantity += quantity;

          console.log(
            `[DEBUG] OrderItem: Product=${product?.name || "N/A"}, Quantity=${quantity}, BasePrice=${orderItem.price}₼, Addons=${addonIds?.length || 0}, Drinks=${drinkIds?.length || 0}`
          );

          await transactionalEntityManager.save(orderItem);
          orderItems.push(orderItem);
        }
      }

      const order = new Order();
      order.totalAmount = totalQuantity;
      order.createdBy = user;
      order.price = totalPrice;
      order.items = orderItems;

      const finalInventories = await transactionalEntityManager.find(
        Inventory,
        { cache: false }
      );
      await transactionalEntityManager.save(order);
      console.log(
        `[DEBUG] Saved order: ID ${order.id}, Total Price: ${totalPrice}₼, Total Quantity: ${totalQuantity}`
      );
    });

    const savedOrder = await orderRepo.findOne({
      where: { id: orderItems[0].order?.id },
      relations: [
        "items",
        "items.product",
        "items.drinks",
        "items.addons",
        "createdBy",
      ],
    });
    return (
      savedOrder ||
      (await orderRepo.findOne({
        where: { createdBy: { id: userId } },
        order: { created_at: "DESC" },
        relations: [
          "items",
          "items.product",
          "items.drinks",
          "items.addons",
          "createdBy",
        ],
      }))
    );
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

type OrdersPage = {
  data: Order[];
  nextCursor: string | null;
};

export const getOrdersPage = async (
  cursor?: string,
  limit = 10
): Promise<OrdersPage> => {
  const orderRepo = AppDataSource.getRepository(Order);

  const qb = orderRepo
    .createQueryBuilder("order")
    .leftJoinAndSelect("order.createdBy", "user")
    .leftJoinAndSelect("order.items", "item")
    .leftJoinAndSelect("item.product", "product")
    .leftJoinAndSelect("item.drinks", "drinks")
    .leftJoinAndSelect("item.addons", "addons")
    .orderBy("order.created_at", "DESC")
    .take(limit + 1);

  if (cursor) {
    qb.where("order.created_at < :cursor", { cursor: new Date(cursor) });
  }

  const items = await qb.getMany();
  const hasMore = items.length > limit;

  if (hasMore) {
    items.pop(); // extra nəticəni sil
  }

  const nextCursor = hasMore
    ? items[items.length - 1].created_at.toISOString()
    : null;

  return { data: items, nextCursor };
};
