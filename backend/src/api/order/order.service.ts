import { In } from "typeorm";
import { AppDataSource } from "../../config/data-source";
import { Inventory } from "../../models/Inventory.model";
import { Order } from "../../models/Order.model";
import { OrderItem } from "../../models/OrderItem.model";
import { Product } from "../../models/Product.model";
import { Recipe } from "../../models/Recipe.model";
import { ProductCategory } from "../../common/enum/product-category.enum";
import { Addon } from "../../models/AddOn.model";
import { User } from "../../models/User.model";

export const createOrder = async (orderData: { userId: number; items: any[] }) => {
  const { userId, items } = orderData;

  const orderRepo = AppDataSource.getRepository(Order);
  const orderItemRepo = AppDataSource.getRepository(OrderItem);
  const productRepo = AppDataSource.getRepository(Product);
  const inventoryRepo = AppDataSource.getRepository(Inventory);
  const recipeRepo = AppDataSource.getRepository(Recipe);
  const addonRepo = AppDataSource.getRepository(Addon);
  const userRepo = AppDataSource.getRepository(User);

  let totalPrice = 0;
  const orderItems: OrderItem[] = [];

  const user = await userRepo.findOneByOrFail({ id: userId });

  await AppDataSource.transaction(async (transactionalEntityManager) => {
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
        if (inventoryItem && inventoryItem.quantity >= r.quantityNeeded * quantity) {
          inventoryItem.quantity -= r.quantityNeeded * quantity;
          await transactionalEntityManager.save(inventoryItem);
          usedIngredients.push(inventoryItem);
        } else {
          throw new Error(`${inventoryItem?.quantity || 0} ${r.ingredient.ingredient} is not enough for ${quantity} ${product.name}`);
        }
      }
      orderItem.ingredients = usedIngredients;

      if (item.ingredientIds && Array.isArray(item.ingredientIds)) {
        const drinkInventories = await inventoryRepo.find({
          where: { id: In(item.ingredientIds) },
          relations: ["products"],
        });
        const validDrinks = drinkInventories.filter(inv =>
          inv.products.some(p => p.category === ProductCategory.DRINK)
        );
        if (validDrinks.length !== item.ingredientIds.length) {
          throw new Error("Some ingredients are not valid drinks");
        }
        usedIngredients.push(...validDrinks);
      }

      if (item.addonIds && Array.isArray(item.addonIds)) {
        const addons = await addonRepo.find({
          where: { id: In(item.addonIds) },
          relations: ["inventory"],
        });
        orderItem.addons = addons;

        for (const addon of addons) {
          if (addon.inventory) { // Check if inventory exists
            const inventoryItem = await inventoryRepo.findOneBy({ id: addon.inventory.id });
            if (inventoryItem && inventoryItem.quantity >= quantity) {
              inventoryItem.quantity -= quantity;
              await transactionalEntityManager.save(inventoryItem);
              totalPrice += addon.price * quantity;
              orderItem.price += addon.price * quantity;
            } else {
              throw new Error(`${inventoryItem?.quantity || 0} ${addon.name} is not enough`);
            }
          } else {
            throw new Error(`No inventory linked to addon ${addon.name}`);
          }
        }
      }

      await transactionalEntityManager.save(orderItem);
      orderItems.push(orderItem);
    }

    const order = new Order();
    order.createdBy = user;
    order.totalAmount = totalPrice;
    order.price = totalPrice;
    order.items = orderItems;

    await transactionalEntityManager.save(order);
    return order;
  });
};