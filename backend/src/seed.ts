import { AppDataSource } from "./config/data-source";
import { Inventory } from "./models/Inventory.model";
import { ProductCategory } from "./common/enum/product-category.enum";
import { Product } from "./models/Product.model";
import { Recipe } from "./models/Recipe.model";
import { Addon } from "./models/AddOn.model";
import { Statistics } from "./models/Statistics.model";
import { Drink } from "./models/Drink.model";

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
                { name: "Cola" }, { name: "Cola Zero" },
                { name: "Sprite" }, { name: "Fuse Tea Lemon" },
                { name: "Fuse Tea Peach" }, { name: "Fuse Tea Mango" },
            ];

            for (const { name } of ingredientsData) {
                const inv = new Inventory();
                inv.ingredient = name;
                // inv.price = isDrink ? price : null;  // Set price only for drinks
                await inventoryRepository.save(inv);
            }
            console.log("Inventory items seeded successfully.");
        }
const existingDrinksCount = await AppDataSource.getRepository(Drink).count(); // düzgün repository
        if (existingDrinksCount > 0) {
            console.log("Drinks already exist, skipping drinks seeding.");
        } else {
            console.log("Drinks not found, seeding drinks...");

            const drinksData = [
                { name: "Cola", price: 4, inventoryName: "Cola" },
                { name: "Cola Zero", price: 4, inventoryName: "Cola Zero" },
                { name: "Sprite", price: 4, inventoryName: "Sprite" },
                { name: "Fuse Tea Lemon", price: 4, inventoryName: "Fuse Tea Lemon" },
                { name: "Fuse Tea Peach", price: 4, inventoryName: "Fuse Tea Peach" },
                { name: "Fuse Tea Mango", price: 4, inventoryName: "Fuse Tea Mango" },
            ];

            const inventories = await inventoryRepository.find();
            const inventoryMap = new Map(inventories.map(inv => [inv.ingredient, inv])); 

            for (const drink of drinksData) {
                const inventory = inventoryMap.get(drink.inventoryName); // Fetch the inventory item by name

                if (inventory) {
                    const drinkEntity = new Drink();  // Assuming Drink is an entity in your database
                    drinkEntity.name = drink.name;
                    drinkEntity.price = drink.price;

                    drinkEntity.inventory = inventory; // Assign inventory to the drink

                    await AppDataSource.getRepository(Drink).save(drinkEntity);  // Save the drink entity to the repository

                    console.log("Add-ons seeded successfully.");
                } else {
                    throw new Error(`Inventory item ${drink.inventoryName} not found for addon ${drink.name}`);
                }
            }

            console.log("Drinks seeded successfully.");
        }
        const existingAddOnsCount = await addOnRepository.count();
        if (existingAddOnsCount > 0) {
            console.log("Add-ons already exist, skipping add-ons seeding.");
        } else {
            const addOnsData = [
              {
                name: "Extra Cheese",
                price: 1,
                inventoryName: "Melted Cheese",
                quantityNeeded: 50,
              },
              {
                name: "Jalapeños",
                price: 0.7,
                inventoryName: "Jalapeños",
                quantityNeeded: 50,
              },
              {
                name: "Crispy Onions",
                price: 0.7,
                inventoryName: "Crispy Onions",
                quantityNeeded: 50,
              },
              {
                name: "Pickles",
                price: 0.5,
                inventoryName: "Pickles",
                quantityNeeded: 50,
              },
              {
                name: "Extra Ketchup",
                price: 0.5,
                inventoryName: "Ketchup",
                quantityNeeded: 50,
              },
              {
                name: "Extra Mustard",
                price: 0.5,
                inventoryName: "Mustard",
                quantityNeeded: 50,
              },
              {
                name: "Extra BBQ Sauce",
                price: 0.5,
                inventoryName: "BBQ Sauce",
                quantityNeeded: 50,
              },
              {
                name: "Extra Hot Sauce",
                price: 0.5,
                inventoryName: "Hot Sauce",
                quantityNeeded: 50,
              },
              {
                name: "Extra Honey Mustard",
                price: 0.5,
                inventoryName: "Honey Mustard",
                quantityNeeded: 50,
              },
              {
                name: "Extra House Sauces",
                price: 0.5,
                inventoryName: "House Sauces",
                quantityNeeded: 50,
              },
              {
                name: "Extra Basil Pesto",
                price: 0.5,
                inventoryName: "Basil Pesto",
                quantityNeeded: 50,
              },
              {
                name: "Double Hotdog",
                price: 3,
                inventoryName: "Beef Hotdog",
                quantityNeeded: 1,
              },
            ];

            const inventories = await inventoryRepository.find();
            const inventoryMap = new Map(
              inventories.map((inv) => [inv.ingredient, inv])
            );
            for (const addOn of addOnsData) {
              const addon = new Addon();
              addon.name = addOn.name;
              addon.price = addOn.price;
              addon.quantityNeeded = addOn.quantityNeeded;
              const inventory = inventoryMap.get(addOn.inventoryName);
              if (inventory) {
                addon.inventory = inventory;
              } else {
                throw new Error(
                  `Inventory item ${addOn.inventoryName} not found for addon ${addOn.name}`
                );
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
                { name: "Classic Dog", price: 7.20, category: ProductCategory.HOTDOG, description: "Beef hotdog, bun, ketchup & mustard", ingredients: [{ name: "Beef Hotdog", qty: 1 }, { name: "Bun", qty: 1 }, { name: "Ketchup", qty: 50 }, { name: "Mustard", qty: 50 }] },
                { name: "Cheese Dog", price: 7.60, category: ProductCategory.HOTDOG, description: "Beef hotdog, bun, melted cheese", ingredients: [{ name: "Beef Hotdog", qty: 1 }, { name: "Bun", qty: 1 }, { name: "Melted Cheese", qty: 50 }] },
                { name: "Spicy Dog", price: 8.10, category: ProductCategory.HOTDOG, description: "Beef hotdog, bun, hot sauce & jalapeños", ingredients: [{ name: "Beef Hotdog", qty: 1 }, { name: "Bun", qty: 1 }, { name: "Hot Sauce", qty: 50 }, { name: "Jalapeños", qty: 50 }] },
                { name: "Italian Dog", price: 9.40, category: ProductCategory.HOTDOG, description: "Beef hotdog, bun, basil pesto & grated parmesan", ingredients: [{ name: "Beef Hotdog", qty: 1 }, { name: "Bun", qty: 1 }, { name: "Basil Pesto", qty: 50 }, { name: "Grated Parmesan", qty: 20 }] },
                { name: "BBQ Crunch Dog", price: 9.10, category: ProductCategory.HOTDOG, description: "Beef hotdog, bun, BBQ sauce & crispy onions", ingredients: [{ name: "Beef Hotdog", qty: 1 }, { name: "Bun", qty: 1 }, { name: "BBQ Sauce", qty: 50 }, { name: "Crispy Onions", qty: 50 }] },
                { name: "Honey Mustard Dog", price: 8.70, category: ProductCategory.HOTDOG, description: "Beef hotdog, bun, honey mustard & pickles", ingredients: [{ name: "Beef Hotdog", qty: 1 }, { name: "Bun", qty: 1 }, { name: "Honey Mustard", qty: 50 }, { name: "Pickles", qty: 50 }] },
                { name: "Chicken Nuggets (4 pcs)", price: 6.50, category: ProductCategory.SIDES, description: "Crispy breaded chicken bites", ingredients: [{ name: "Chicken Pieces", qty: 4 }] },
                { name: "French Fries", price: 4.50, category: ProductCategory.SIDES, description: "Golden fried potato sticks", ingredients: [{ name: "Potatoes", qty: 200 }] },
                { name: "Mozzarella Sticks (4 pcs)", price: 6.50, category: ProductCategory.SIDES, description: "Breaded mozzarella, fried to perfection", ingredients: [{ name: "Mozzarella", qty: 200 }] },
                { name: "Animal Style Fries", price: 9.70, category: ProductCategory.SIDES, description: "French fries topped with sausages, melted cheese, crispy onions & house sauces", ingredients: [{ name: "Potatoes", qty: 200 }, { name: "Sausages", qty: 100 }, { name: "Melted Cheese", qty: 50 }, { name: "Crispy Onions", qty: 50 }, { name: "House Sauces", qty: 50 }] },
                { name: "Classic Combo", price: 13.50, category: ProductCategory.COMBOS, description: "Classic Dog + French Fries + Drink", ingredients: [{ name: "Beef Hotdog", qty: 1 }, { name: "Bun", qty: 1 }, { name: "Ketchup", qty: 50 }, { name: "Mustard", qty: 50 }, { name: "Potatoes", qty: 200 }] },
                { name: "Cheesy Combo", price: 16.00, category: ProductCategory.COMBOS, description: "Cheese Dog + Mozzarella Sticks (4 pcs) + Drink", ingredients: [{ name: "Beef Hotdog", qty: 1 }, { name: "Bun", qty: 1 }, { name: "Melted Cheese", qty: 50 }, { name: "Mozzarella", qty: 200 }] },
                { name: "Meat Lover’s Double Pack", price: 32.00, category: ProductCategory.COMBOS, description: "BBQ Crunch Dog (Double) + Spicy Dog (Double) + French Fries + Chicken Nuggets (4 pcs) + 2 Drinks", ingredients: [{ name: "Beef Hotdog", qty: 4 }, { name: "Bun", qty: 2 }, { name: "BBQ Sauce", qty: 50 }, { name: "Crispy Onions", qty: 50 }, { name: "Hot Sauce", qty: 50 }, { name: "Jalapeños", qty: 50 }, { name: "Potatoes", qty: 200 }, { name: "Chicken Pieces", qty: 4 }] },
            ];
            const inventories = await inventoryRepository.find();
            const inventoryMap = new Map(inventories.map(inv => [inv.ingredient, inv]));
            for (const pdata of productsData) {
                const product = new Product();
                product.name = pdata.name;
                product.price = pdata.price;
                product.description = pdata.description;
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