import { AppDataSource } from "./config/data-source";
import { Inventory } from "./models/Inventory.model";
import { ProductCategory } from "./common/enum/product-category.enum";
import { Product } from "./models/Product.model";
import { Recipe } from "./models/Recipe.model";
import { Addon } from "./models/AddOn.model";
import { Statistics } from "./models/Statistics.model";

const seedDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Database connected!");

    const inventoryRepository = AppDataSource.getRepository(Inventory);
    const productRepository = AppDataSource.getRepository(Product);
    const recipeRepository = AppDataSource.getRepository(Recipe);
    const addOnRepository = AppDataSource.getRepository(Addon);

    const existingInventoryCount = await inventoryRepository.count();
    if (existingInventoryCount > 0) {
      console.log("Inventory items already exist, skipping inventory seeding.");
    } else {
      const ingredientsData = [
        { name: "Beef Hotdog" }, { name: "Bun" }, { name: "Ketchup" }, { name: "Mustard" },
        { name: "Melted Cheese" }, { name: "Hot Sauce" }, { name: "Jalapeños" }, { name: "Basil Pesto" },
        { name: "Grated Parmesan" }, { name: "BBQ Sauce" }, { name: "Crispy Onions" }, { name: "Honey Mustard" },
        { name: "Pickles" }, { name: "Chicken Pieces" }, { name: "Potatoes" }, { name: "Mozzarella" },
        { name: "Sausages" }, { name: "House Sauces" },
        { name: "Cola", isDrink: true, price: 4 }, { name: "Cola Zero", isDrink: true, price: 4 },
        { name: "Sprite", isDrink: true, price: 4 }, { name: "Fuse Tea Lemon", isDrink: true, price: 4 },
        { name: "Fuse Tea Peach", isDrink: true, price: 4 }, { name: "Fuse Tea Mango", isDrink: true, price: 4 },
      ];

      for (const { name, isDrink = false, price = null } of ingredientsData) {
        const inv = new Inventory();
        inv.ingredient = name;
        inv.isDrink = isDrink;  // Assign isDrink flag properly
        inv.price = isDrink ? price : null;  // Set price only for drinks
        await inventoryRepository.save(inv);
      }
      console.log("Inventory items seeded successfully.");
    }

    const existingAddOnsCount = await addOnRepository.count();
    if (existingAddOnsCount > 0) {
      console.log("Add-ons already exist, skipping add-ons seeding.");
    } else {
      const addOnsData = [
        { name: "Extra Cheese", price: 1, inventoryName: "Melted Cheese" },
        { name: "Jalapeños", price: 0.7, inventoryName: "Jalapeños" },
        { name: "Crispy Onions", price: 0.7, inventoryName: "Crispy Onions" },
        { name: "Pickles", price: 0.5, inventoryName: "Pickles" },
        { name: "Extra Ketchup", price: 0.5, inventoryName: "Ketchup" },
        { name: "Extra Mustard", price: 0.5, inventoryName: "Mustard" },
        { name: "Extra BBQ Sauce", price: 0.5, inventoryName: "BBQ Sauce" },
        { name: "Double Hotdog", price: 3, inventoryName: "Beef Hotdog" },
      ];
      const inventories = await inventoryRepository.find();
      const inventoryMap = new Map(inventories.map(inv => [inv.ingredient, inv]));
      for (const addOn of addOnsData) {
        const addon = new Addon();
        addon.name = addOn.name;
        addon.price = addOn.price;
        const inventory = inventoryMap.get(addOn.inventoryName); // Can be undefined
        if (inventory) {
          addon.inventory = inventory; // Assign only if found
        } else {
          throw new Error(`Inventory item ${addOn.inventoryName} not found for addon ${addOn.name}`);
        }
        await addOnRepository.save(addon);
      }
      console.log("Add-ons seeded successfully.");
    }


    const existingProductsCount = await productRepository.count();
    if (existingProductsCount > 0) {
      console.log("Products already exist, skipping products and recipes seeding.");
    } else {
      const productsData = [
        { name: "Classic Dog", price: 7.20, category: ProductCategory.HOTDOG, description: "Beef hotdog, bun, ketchup & mustard", ingredients: [{ name: "Beef Hotdog", qty: 1 }, { name: "Bun", qty: 1 }, { name: "Ketchup", qty: 1 }, { name: "Mustard", qty: 1 }] },
        { name: "Cheese Dog", price: 7.60, category: ProductCategory.HOTDOG, description: "Beef hotdog, bun, melted cheese", ingredients: [{ name: "Beef Hotdog", qty: 1 }, { name: "Bun", qty: 1 }, { name: "Melted Cheese", qty: 1 }] },
        { name: "Spicy Dog", price: 8.10, category: ProductCategory.HOTDOG, description: "Beef hotdog, bun, hot sauce & jalapeños", ingredients: [{ name: "Beef Hotdog", qty: 1 }, { name: "Bun", qty: 1 }, { name: "Hot Sauce", qty: 1 }, { name: "Jalapeños", qty: 1 }] },
        { name: "Italian Dog", price: 9.40, category: ProductCategory.HOTDOG, description: "Beef hotdog, bun, basil pesto & grated parmesan", ingredients: [{ name: "Beef Hotdog", qty: 1 }, { name: "Bun", qty: 1 }, { name: "Basil Pesto", qty: 1 }, { name: "Grated Parmesan", qty: 1 }] },
        { name: "BBQ Crunch Dog", price: 9.10, category: ProductCategory.HOTDOG, description: "Beef hotdog, bun, BBQ sauce & crispy onions", ingredients: [{ name: "Beef Hotdog", qty: 1 }, { name: "Bun", qty: 1 }, { name: "BBQ Sauce", qty: 1 }, { name: "Crispy Onions", qty: 1 }] },
        { name: "Honey Mustard Dog", price: 8.70, category: ProductCategory.HOTDOG, description: "Beef hotdog, bun, honey mustard & pickles", ingredients: [{ name: "Beef Hotdog", qty: 1 }, { name: "Bun", qty: 1 }, { name: "Honey Mustard", qty: 1 }, { name: "Pickles", qty: 1 }] },
        { name: "Chicken Nuggets (4 pcs)", price: 6.50, category: ProductCategory.SIDES, description: "Crispy breaded chicken bites", ingredients: [{ name: "Chicken Pieces", qty: 4 }] },
        { name: "French Fries", price: 4.50, category: ProductCategory.SIDES, description: "Golden fried potato sticks", ingredients: [{ name: "Potatoes", qty: 1 }] },
        { name: "Mozzarella Sticks (4 pcs)", price: 6.50, category: ProductCategory.SIDES, description: "Breaded mozzarella, fried to perfection", ingredients: [{ name: "Mozzarella", qty: 4 }] },
        { name: "Animal Style Fries", price: 9.70, category: ProductCategory.SIDES, description: "French fries topped with sausages, melted cheese, crispy onions & house sauces", ingredients: [{ name: "Potatoes", qty: 1 }, { name: "Sausages", qty: 1 }, { name: "Melted Cheese", qty: 1 }, { name: "Crispy Onions", qty: 1 }, { name: "House Sauces", qty: 1 }] },
        { name: "Classic Combo", price: 13.50, category: ProductCategory.COMBOS, description: "Classic Dog + French Fries + Drink", ingredients: [{ name: "Beef Hotdog", qty: 1 }, { name: "Bun", qty: 1 }, { name: "Ketchup", qty: 1 }, { name: "Mustard", qty: 1 }, { name: "Potatoes", qty: 1 }, { name: "Cola", qty: 1 }] },
        { name: "Cheesy Combo", price: 16.00, category: ProductCategory.COMBOS, description: "Cheese Dog + Mozzarella Sticks (4 pcs) + Drink", ingredients: [{ name: "Beef Hotdog", qty: 1 }, { name: "Bun", qty: 1 }, { name: "Melted Cheese", qty: 1 }, { name: "Mozzarella", qty: 4 }, { name: "Cola", qty: 1 }] },
        { name: "Meat Lover’s Double Pack", price: 32.00, category: ProductCategory.COMBOS, description: "BBQ Crunch Dog (Double) + Spicy Dog (Double) + French Fries + Chicken Nuggets (4 pcs) + 2 Drinks", ingredients: [{ name: "Beef Hotdog", qty: 4 }, { name: "Bun", qty: 4 }, { name: "BBQ Sauce", qty: 2 }, { name: "Crispy Onions", qty: 2 }, { name: "Hot Sauce", qty: 2 }, { name: "Jalapeños", qty: 2 }, { name: "Potatoes", qty: 1 }, { name: "Chicken Pieces", qty: 4 }, { name: "Cola", qty: 2 }] },
      ];
      const inventories = await inventoryRepository.find();
      const inventoryMap = new Map(inventories.map(inv => [inv.ingredient, inv]));
      for (const pdata of productsData) {
        const product = new Product();
        product.name = pdata.name;
        product.price = pdata.price;
        product.category = pdata.category;
        await productRepository.save(product);
        for (const ing of pdata.ingredients) {
          const ingredient = inventoryMap.get(ing.name);
          if (ingredient) {
            const recipe = new Recipe();
            recipe.product = product;
            recipe.ingredient = ingredient;
            recipe.quantityNeeded = ing.qty;
            await recipeRepository.save(recipe);
          } else {
            throw new Error(`Inventory item ${ing.name} not found for product ${pdata.name}`);
          }
        }
      }
      console.log("Products and recipes seeded successfully.");
    }

    console.log("Seed data insertion completed!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await AppDataSource.destroy();
  }
};

seedDatabase();