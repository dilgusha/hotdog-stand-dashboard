
// import { AppDataSource } from "./config/data-source";
// import { Inventory } from "./models/Inventory.model";
// import { AddOn } from "./models/AddOn.model";
// import { ProductCategory } from "./common/enum/product-category.enum";
// import { Product } from "./models/Product.model";
// import { Recipe } from "./models/Recipe.model";

// const seedDatabase = async () => {
//   try {
//     await AppDataSource.initialize();
//     console.log("Database connected!");

//     const inventoryRepository = AppDataSource.getRepository(Inventory);
//     const addOnRepository = AppDataSource.getRepository(AddOn);
//     const productRepository = AppDataSource.getRepository(Product);
//     const recipeRepository = AppDataSource.getRepository(Recipe);

//     // Check if inventory items already exist
//     const existingInventoryCount = await inventoryRepository.count();
//     if (existingInventoryCount > 0) {
//       console.log("Inventory items already exist, skipping inventory seeding.");
//     } else {
//       const ingredientsData = [
//         { name: "Beef Hotdog", quantity: 100 },
//         { name: "Bun", quantity: 100 },
//         { name: "Ketchup", quantity: 100 },
//         { name: "Mustard", quantity: 100 },
//         { name: "Melted Cheese", quantity: 100 },
//         { name: "Hot Sauce", quantity: 100 },
//         { name: "Jalapeños", quantity: 100 },
//         { name: "Basil Pesto", quantity: 100 },
//         { name: "Grated Parmesan", quantity: 100 },
//         { name: "BBQ Sauce", quantity: 100 },
//         { name: "Crispy Onions", quantity: 100 },
//         { name: "Honey Mustard", quantity: 100 },
//         { name: "Pickles", quantity: 100 },
//         { name: "Chicken Pieces", quantity: 100 },
//         { name: "Potatoes", quantity: 100 },
//         { name: "Mozzarella", quantity: 100 },
//         { name: "Sausages", quantity: 100 },
//         { name: "House Sauces", quantity: 100 },
//       ];

//       const ingredientsMap = new Map<string, Inventory>();

//       for (const { name, quantity } of ingredientsData) {
//         const inv = new Inventory();
//         inv.ingredient = name;
//         inv.quantity = quantity;
//         await inventoryRepository.save(inv);
//         ingredientsMap.set(name, inv);
//       }
//       console.log("Inventory items seeded successfully.");
//     }

//     // Check if add-ons already exist
//     const existingAddOnsCount = await addOnRepository.count();
//     if (existingAddOnsCount > 0) {
//       console.log("Add-ons already exist, skipping add-ons seeding.");
//     } else {
//       const addOnsData = [
//         "Extra Cheese",
//         "Jalapeños",
//         "BBQ Sauce",
//         "Crispy Onions",
//         "Honey Mustard",
//         "Pickles",
//       ];

//       for (const name of addOnsData) {
//         const addon = new AddOn();
//         addon.name = name;
//         await addOnRepository.save(addon);
//       }
//       console.log("Add-ons seeded successfully.");
//     }

//     // Check if products already exist
//     const existingProductsCount = await productRepository.count();
//     if (existingProductsCount > 0) {
//       console.log("Products already exist, skipping products and recipes seeding.");
//     } else {
//       // Load ingredients for mapping (if not seeded above)
//       const ingredients = await inventoryRepository.find();
//       const ingredientsMap = new Map<string, Inventory>(
//         ingredients.map((inv) => [inv.ingredient, inv]),
//       );

//       const productsData = [
//         {
//           name: "Classic Dog",
//           price: 5.99,
//           category: ProductCategory.HOTDOG,
//           description: "Beef hotdog, bun, ketchup & mustard",
//           ingredients: [
//             { name: "Beef Hotdog", qty: 1 },
//             { name: "Bun", qty: 1 },
//             { name: "Ketchup", qty: 1 },
//             { name: "Mustard", qty: 1 },
//           ],
//         },
//         {
//           name: "Cheese Dog",
//           price: 6.49,
//           category: ProductCategory.HOTDOG,
//           description: "Beef hotdog, bun, melted cheese",
//           ingredients: [
//             { name: "Beef Hotdog", qty: 1 },
//             { name: "Bun", qty: 1 },
//             { name: "Melted Cheese", qty: 1 },
//           ],
//         },
//         {
//           name: "Spicy Dog",
//           price: 6.99,
//           category: ProductCategory.HOTDOG,
//           description: "Beef hotdog, bun, hot sauce & jalapeños",
//           ingredients: [
//             { name: "Beef Hotdog", qty: 1 },
//             { name: "Bun", qty: 1 },
//             { name: "Hot Sauce", qty: 1 },
//             { name: "Jalapeños", qty: 1 },
//           ],
//         },
//         {
//           name: "Italian Dog",
//           price: 7.49,
//           category: ProductCategory.HOTDOG,
//           description: "Beef hotdog, bun, basil pesto & grated parmesan",
//           ingredients: [
//             { name: "Beef Hotdog", qty: 1 },
//             { name: "Bun", qty: 1 },
//             { name: "Basil Pesto", qty: 1 },
//             { name: "Grated Parmesan", qty: 1 },
//           ],
//         },
//         {
//           name: "BBQ Crunch Dog",
//           price: 7.99,
//           category: ProductCategory.HOTDOG,
//           description: "Beef hotdog, bun, BBQ sauce & crispy onions",
//           ingredients: [
//             { name: "Beef Hotdog", qty: 1 },
//             { name: "Bun", qty: 1 },
//             { name: "BBQ Sauce", qty: 1 },
//             { name: "Crispy Onions", qty: 1 },
//           ],
//         },
//         {
//           name: "Honey Mustard Dog",
//           price: 6.79,
//           category: ProductCategory.HOTDOG,
//           description: "Beef hotdog, bun, honey mustard & pickles",
//           ingredients: [
//             { name: "Beef Hotdog", qty: 1 },
//             { name: "Bun", qty: 1 },
//             { name: "Honey Mustard", qty: 1 },
//             { name: "Pickles", qty: 1 },
//           ],
//         },
//         {
//           name: "Chicken Nuggets (6 pcs)",
//           price: 6.0,
//           category: ProductCategory.SIDES,
//           description: "Crispy breaded chicken bites",
//           ingredients: [{ name: "Chicken Pieces", qty: 6 }],
//         },
//         {
//           name: "French Fries",
//           price: 3.5,
//           category: ProductCategory.SIDES,
//           description: "Golden fried potato sticks",
//           ingredients: [{ name: "Potatoes", qty: 1 }],
//         },
//         {
//           name: "Mozzarella Sticks (5 pcs)",
//           price: 5.0,
//           category: ProductCategory.SIDES,
//           description: "Breaded mozzarella, fried to perfection",
//           ingredients: [{ name: "Mozzarella", qty: 5 }],
//         },
//         {
//           name: "Animal Style Fries",
//           price: 7.5,
//           category: ProductCategory.SIDES,
//           description: "French fries topped with sausages, melted cheese, crispy onions & house sauces",
//           ingredients: [
//             { name: "Potatoes", qty: 1 },
//             { name: "Sausages", qty: 1 },
//             { name: "Melted Cheese", qty: 1 },
//             { name: "Crispy Onions", qty: 1 },
//             { name: "House Sauces", qty: 1 },
//           ],
//         },
//       ];

//       for (const pdata of productsData) {
//         const product = new Product();
//         product.name = pdata.name;
//         product.price = pdata.price;
//         product.category = pdata.category;
//         product.description = pdata.description;
//         await productRepository.save(product);

//         for (const ing of pdata.ingredients) {
//           const ingredient = ingredientsMap.get(ing.name);
//           if (ingredient) {
//             const recipe = new Recipe();
//             recipe.product = product;
//             recipe.ingredient = ingredient;
//             recipe.quantityNeeded = ing.qty;
//             await recipeRepository.save(recipe);
//           }
//         }
//       }
//       console.log("Products and recipes seeded successfully.");
//     }

//     console.log("Seed data insertion completed!");
//   } catch (error) {
//     console.error("Error seeding database:", error);
//   } finally {
//     await AppDataSource.destroy();
//   }
// };

// seedDatabase();


import { AppDataSource } from "./config/data-source";
import { Inventory } from "./models/Inventory.model";
import { Addon } from "./models/AddOn.model";
import { ProductCategory } from "./common/enum/product-category.enum";
import { Product } from "./models/Product.model";
import { Recipe } from "./models/Recipe.model";
import { Statistics } from "./models/Statistics.model";

const seedDatabase = async () => {
    try {
        await AppDataSource.initialize();
        console.log("Database connected!");

        const inventoryRepository = AppDataSource.getRepository(Inventory);
        const addOnRepository = AppDataSource.getRepository(Addon);
        const productRepository = AppDataSource.getRepository(Product);
        const recipeRepository = AppDataSource.getRepository(Recipe);

        // Check if inventory items already exist
        const existingInventoryCount = await inventoryRepository.count();
        if (existingInventoryCount > 0) {
            console.log("Inventory items already exist, skipping inventory seeding.");
        } else {
            const ingredientsData = [
                { name: "Beef Hotdog" },
                { name: "Bun" },
                { name: "Ketchup" },
                { name: "Mustard" },
                { name: "Melted Cheese" },
                { name: "Hot Sauce" },
                { name: "Jalapeños" },
                { name: "Basil Pesto" },
                { name: "Grated Parmesan" },
                { name: "BBQ Sauce" },
                { name: "Crispy Onions" },
                { name: "Honey Mustard" },
                { name: "Pickles" },
                { name: "Chicken Pieces" },
                { name: "Potatoes" },
                { name: "Mozzarella" },
                { name: "Sausages" },
                { name: "House Sauces" },
                // DRINKS
                { name: "Cola - 4" },
                { name: "Cola Zero - 4" },
                { name: "Sprite - 4" },
                { name: "Fuse Tea – Lemon - 4" },
                { name: "Fuse Tea – Peach - 4" },
                { name: "Fuse Tea – Mango - 4" },
            ];


            for (const { name } of ingredientsData) {
                const inv = new Inventory();
                inv.ingredient = name;
                await inventoryRepository.save(inv);
            }
            console.log("Inventory items seeded successfully.");
        }

        // Check if add-ons already exist
        const existingAddOnsCount = await addOnRepository.count();
        if (existingAddOnsCount > 0) {
            console.log("Add-ons already exist, skipping add-ons seeding.");
        } else {
            const addOnsData = [
                { name: "Extra Cheese", price: 1 },
                { name: "Jalapeños", price: 0.7 },
                { name: "Crispy Onions", price: 0.7 },
                { name: "Pickles", price: 0.5 },
                { name: "Extra Sauce (any)", price: 0.5 },
                { name: "Double Hotdog", price: 3 },
            ];

            for (const addOn of addOnsData) {
                const addon = new Addon();
                addon.name = addOn.name;
                addon.price = addOn.price;
                await addOnRepository.save(addon);
            }
            console.log("Add-ons seeded successfully.");
        }

        // Check if products already exist
        const existingProductsCount = await productRepository.count();
        if (existingProductsCount > 0) {
            console.log("Products already exist, skipping products and recipes seeding.");
        } else {
            const productsData = [
                {
                    name: "Classic Dog",
                    price: 7.20,
                    category: ProductCategory.HOTDOG,
                    description: "Beef hotdog, bun, ketchup & mustard",
                    ingredients: [
                        { name: "Beef Hotdog", qty: 1 },
                        { name: "Bun", qty: 1 },
                        { name: "Ketchup", qty: 1 },
                        { name: "Mustard", qty: 1 },
                    ],
                },
                {
                    name: "Cheese Dog",
                    price: 7.60,
                    category: ProductCategory.HOTDOG,
                    description: "Beef hotdog, bun, melted cheese",
                    ingredients: [
                        { name: "Beef Hotdog", qty: 1 },
                        { name: "Bun", qty: 1 },
                        { name: "Melted Cheese", qty: 1 },
                    ],
                },
                {
                    name: "Spicy Dog",
                    price: 8.10,
                    category: ProductCategory.HOTDOG,
                    description: "Beef hotdog, bun, hot sauce & jalapeños",
                    ingredients: [
                        { name: "Beef Hotdog", qty: 1 },
                        { name: "Bun", qty: 1 },
                        { name: "Hot Sauce", qty: 1 },
                        { name: "Jalapeños", qty: 1 },
                    ],
                },
                {
                    name: "Italian Dog",
                    price: 9.40,
                    category: ProductCategory.HOTDOG,
                    description: "Beef hotdog, bun, basil pesto & grated parmesan",
                    ingredients: [
                        { name: "Beef Hotdog", qty: 1 },
                        { name: "Bun", qty: 1 },
                        { name: "Basil Pesto", qty: 1 },
                        { name: "Grated Parmesan", qty: 1 },
                    ],
                },
                {
                    name: "BBQ Crunch Dog",
                    price: 9.10,
                    category: ProductCategory.HOTDOG,
                    description: "Beef hotdog, bun, BBQ sauce & crispy onions",
                    ingredients: [
                        { name: "Beef Hotdog", qty: 1 },
                        { name: "Bun", qty: 1 },
                        { name: "BBQ Sauce", qty: 1 },
                        { name: "Crispy Onions", qty: 1 },
                    ],
                },
                {
                    name: "Honey Mustard Dog",
                    price: 8.70,
                    category: ProductCategory.HOTDOG,
                    description: "Beef hotdog, bun, honey mustard & pickles",
                    ingredients: [
                        { name: "Beef Hotdog", qty: 1 },
                        { name: "Bun", qty: 1 },
                        { name: "Honey Mustard", qty: 1 },
                        { name: "Pickles", qty: 1 },
                    ],
                },
                {
                    name: "Chicken Nuggets (4 pcs)",
                    price: 6.50,
                    category: ProductCategory.SIDES,
                    description: "Crispy breaded chicken bites",
                    ingredients: [{ name: "Chicken Pieces", qty: 4 }],
                },
                {
                    name: "French Fries",
                    price: 4.50,
                    category: ProductCategory.SIDES,
                    description: "Golden fried potato sticks",
                    ingredients: [{ name: "Potatoes", qty: 1 }],
                },
                {
                    name: "Mozzarella Sticks (4 pcs)",
                    price: 6.50,
                    category: ProductCategory.SIDES,
                    description: "Breaded mozzarella, fried to perfection",
                    ingredients: [{ name: "Mozzarella", qty: 4 }],
                },
                {
                    name: "Animal Style Fries",
                    price: 9.70,
                    category: ProductCategory.SIDES,
                    description: "French fries topped with sausages, melted cheese, crispy onions & house sauces",
                    ingredients: [
                        { name: "Potatoes", qty: 1 },
                        { name: "Sausages", qty: 1 },
                        { name: "Melted Cheese", qty: 1 },
                        { name: "Crispy Onions", qty: 1 },
                        { name: "House Sauces", qty: 1 },
                    ],
                },
                {
                    name: "Classic Combo",
                    price: 13.50,
                    category: ProductCategory.COMBOS,
                    description: "Classic Dog + French Fries + Drink",
                    ingredients: [
                        { name: "Classic Dog", qty: 1 },
                        { name: "French Fries", qty: 1 },
                        { name: "Cola", qty: 1 },  // Drink (İçki seçimi)
                    ],
                },
                {
                    name: "Cheesy Combo",
                    price: 16.00,
                    category: ProductCategory.COMBOS,
                    description: "Cheese Dog + Mozzarella Sticks (4 pcs) + Drink",
                    ingredients: [
                        { name: "Cheese Dog", qty: 1 },
                        { name: "Mozzarella Sticks (4 pcs)", qty: 1 },
                        { name: "Cola", qty: 1 },  // Drink (İçki seçimi)
                    ],
                },
                {
                    name: "Meat Lover’s Double Pack",
                    price: 32.00,
                    category: ProductCategory.COMBOS,
                    description: "BBQ Crunch Dog (Double) + Spicy Dog (Double) + French Fries + Chicken Nuggets (4 pcs) + 2 Drinks",
                    ingredients: [
                        { name: "BBQ Crunch Dog", qty: 2 },
                        { name: "Spicy Dog", qty: 2 },
                        { name: "French Fries", qty: 1 },
                        { name: "Chicken Nuggets (4 pcs)", qty: 1 },
                        { name: "Cola", qty: 2 },  // 2 Drinks
                    ],
                },
                {
                    name: "Cola",
                    price: 4,
                    category: ProductCategory.DRINK,
                    description: "Classic Cola drink",
                    ingredients: [],
                },
                {
                    name: "Cola Zero",
                    price: 4,
                    category: ProductCategory.DRINK,
                    description: "Sugar-free Cola",
                    ingredients: [],
                },
                {
                    name: "Sprite",
                    price: 4,
                    category: ProductCategory.DRINK,
                    description: "Lemon-lime soda",
                    ingredients: [],
                },
                {
                    name: "Fuse Tea – Lemon",
                    price: 4,
                    category: ProductCategory.DRINK,
                    description: "Lemon flavored Fuse Tea",
                    ingredients: [],
                },
                {
                    name: "Fuse Tea – Peach",
                    price: 4,
                    category: ProductCategory.DRINK,
                    description: "Peach flavored Fuse Tea",
                    ingredients: [],
                },
                {
                    name: "Fuse Tea – Mango",
                    price: 4,
                    category: ProductCategory.DRINK,
                    description: "Mango flavored Fuse Tea",
                    ingredients: [],
                },
            ];

            for (const pdata of productsData) {
                const product = new Product();
                product.name = pdata.name;
                product.price = pdata.price;
                product.category = pdata.category;
                await productRepository.save(product);

                for (const ing of pdata.ingredients) {
                    const ingredient = await inventoryRepository.findOne({ where: { ingredient: ing.name } });
                    if (ingredient) {
                        const recipe = new Recipe();
                        recipe.product = product;
                        recipe.ingredient = ingredient;
                        recipe.quantityNeeded = ing.qty;
                        await recipeRepository.save(recipe);
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




// export const seedStatistics = async () => {
//   const statisticsRepo = AppDataSource.getRepository(Statistics);
//   const stats = new Statistics();

//   stats.todayRevenue = 0;
//   stats.monthRevenue = 0;
//   stats.totalRevenue = 0;

//   await statisticsRepo.save(stats);
//   console.log("Statistics seeded successfully");
// };

// seedStatistics();
