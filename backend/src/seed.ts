// import { createConnection } from "typeorm";
// import { Inventory } from "./models/Inventory.model";
// import { AddOn } from "./models/AddOn.model";
// import { Product } from "./models/Product.model";
// import { AppDataSource } from "./config/data-source";
// import { ProductCategory } from "./common/enum/product-category.enum";



// const seedDatabase = async () => {
//   try {
//     // Veritabanı bağlantısını başlatıyoruz
//     await AppDataSource.initialize();
//     console.log("Veritabanına bağlantı sağlandı!");

//     // Repo'ları alıyoruz
//     const inventoryRepository = AppDataSource.getRepository(Inventory);
//     const addOnRepository = AppDataSource.getRepository(AddOn);
//     const productRepository = AppDataSource.getRepository(Product);

//     // Sabit malzemeleri (inventory) ekliyoruz
//     const beefHotdog = new Inventory();
//     beefHotdog.ingredient = "Beef Hotdog";
//     beefHotdog.quantity = 100; // Varsayılan miktar
//     await inventoryRepository.save(beefHotdog);

//     const bun = new Inventory();
//     bun.ingredient = "Bun";
//     bun.quantity = 100;
//     await inventoryRepository.save(bun);

//     const ketchup = new Inventory();
//     ketchup.ingredient = "Ketchup";
//     ketchup.quantity = 100;
//     await inventoryRepository.save(ketchup);

//     const mustard = new Inventory();
//     mustard.ingredient = "Mustard";
//     mustard.quantity = 100;
//     await inventoryRepository.save(mustard);

//     // Eklentileri (AddOns) ekliyoruz
//     const extraCheese = new AddOn();
//     extraCheese.name = "Extra Cheese";
//     await addOnRepository.save(extraCheese);

//     const jalapenos = new AddOn();
//     jalapenos.name = "Jalapeños";
//     await addOnRepository.save(jalapenos);

//     const bbqSauce = new AddOn();
//     bbqSauce.name = "BBQ Sauce";
//     await addOnRepository.save(bbqSauce);

//     const crispyOnions = new AddOn();
//     crispyOnions.name = "Crispy Onions";
//     await addOnRepository.save(crispyOnions);

//     const honeyMustard = new AddOn();
//     honeyMustard.name = "Honey Mustard";
//     await addOnRepository.save(honeyMustard);

//     const pickles = new AddOn();
//     pickles.name = "Pickles";
//     await addOnRepository.save(pickles);

//     // Sabit ürünleri (Hotdog'lar) ekliyoruz
//     const classicDog = new Product();
//     classicDog.name = "Classic Dog";
//     classicDog.price = 5.99;
//     classicDog.category = ProductCategory.HOTDOG;
//     classicDog.description = "Beef hotdog, bun, ketchup & mustard";
//     classicDog.ingredients = [beefHotdog, bun, ketchup, mustard]; // Sabit malzemeler
//     await productRepository.save(classicDog);

//     const cheeseDog = new Product();
//     cheeseDog.name = "Cheese Dog";
//     cheeseDog.price = 6.49;
//     cheeseDog.category = ProductCategory.HOTDOG;
//     cheeseDog.description = "Beef hotdog, bun, melted cheese";
//     cheeseDog.ingredients = [beefHotdog, bun];
//     await productRepository.save(cheeseDog);

//     const spicyDog = new Product();
//     spicyDog.name = "Spicy Dog";
//     spicyDog.price = 6.99;
//     spicyDog.category = ProductCategory.HOTDOG;
//     spicyDog.description = "Beef hotdog, bun, hot sauce & jalapeños";
//     spicyDog.ingredients = [beefHotdog, bun];
//     await productRepository.save(spicyDog);

//     const italianDog = new Product();
//     italianDog.name = "Italian Dog";
//     italianDog.price = 7.49;
//     italianDog.category = ProductCategory.HOTDOG;
//     italianDog.description = "Beef hotdog, bun, basil pesto & grated parmesan";
//     italianDog.ingredients = [beefHotdog, bun];
//     await productRepository.save(italianDog);

//     const bbqCrunchDog = new Product();
//     bbqCrunchDog.name = "BBQ Crunch Dog";
//     bbqCrunchDog.price = 7.99;
//     bbqCrunchDog.category = ProductCategory.HOTDOG;
//     bbqCrunchDog.description = "Beef hotdog, bun, BBQ sauce & crispy onions";
//     bbqCrunchDog.ingredients = [beefHotdog, bun];
//     await productRepository.save(bbqCrunchDog);

//     const honeyMustardDog = new Product();
//     honeyMustardDog.name = "Honey Mustard Dog";
//     honeyMustardDog.price = 6.79;
//     honeyMustardDog.category = ProductCategory.HOTDOG;
//     honeyMustardDog.description = "Beef hotdog, bun, honey mustard & pickles";
//     honeyMustardDog.ingredients = [beefHotdog, bun];
//     await productRepository.save(honeyMustardDog);

//     console.log("Sabit ürünler ve malzemeler veritabanına başarıyla eklendi!");
//   } catch (error) {
//     console.error("Veritabanı seed işlemi sırasında hata oluştu:", error);
//   }
// };

// // Seed işlemini başlatıyoruz
// seedDatabase();



// İndi productRepository, recipeRepository və inventoryRepository hazırdır fərz edək.
import { AppDataSource } from "./config/data-source";
import { Inventory } from "./models/Inventory.model";
import { AddOn } from "./models/AddOn.model";
import { ProductCategory } from "./common/enum/product-category.enum";
import { Product } from "./models/Product.model";
import { Recipe } from "./models/Recipe.model";

const seedDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Database connected!");

    const inventoryRepository = AppDataSource.getRepository(Inventory);
    const addOnRepository = AppDataSource.getRepository(AddOn);
    const productRepository = AppDataSource.getRepository(Product);
    const recipeRepository = AppDataSource.getRepository(Recipe);

    const ingredientsData = [
      "Beef Hotdog",
      "Bun",
      "Ketchup",
      "Mustard",
      "Melted Cheese",
      "Hot Sauce",
      "Jalapeños",
      "Basil Pesto",
      "Grated Parmesan",
      "BBQ Sauce",
      "Crispy Onions",
      "Honey Mustard",
      "Pickles",
      "Chicken Pieces",
      "Potatoes",
      "Mozzarella",
      "Sausages",
      "House Sauces"
    ];

    const ingredientsMap = new Map<string, Inventory>();

    for (const name of ingredientsData) {
      const inv = new Inventory();
      inv.ingredient = name;
      inv.quantity = 100;
      await inventoryRepository.save(inv);
      ingredientsMap.set(name, inv);
    }

    const addOnsData = [
      "Extra Cheese",
      "Jalapeños",
      "BBQ Sauce",
      "Crispy Onions",
      "Honey Mustard",
      "Pickles"
    ];

    for (const name of addOnsData) {
      const addon = new AddOn();
      addon.name = name;
      await addOnRepository.save(addon);
    }

    const productsData = [
      {
        name: "Classic Dog",
        price: 5.99,
        category: ProductCategory.HOTDOG,
        description: "Beef hotdog, bun, ketchup & mustard",
        ingredients: [
          { name: "Beef Hotdog", qty: 1 },
          { name: "Bun", qty: 1 },
          { name: "Ketchup", qty: 1 },
          { name: "Mustard", qty: 1 }
        ]
      },
      {
        name: "Cheese Dog",
        price: 6.49,
        category: ProductCategory.HOTDOG,
        description: "Beef hotdog, bun, melted cheese",
        ingredients: [
          { name: "Beef Hotdog", qty: 1 },
          { name: "Bun", qty: 1 },
          { name: "Melted Cheese", qty: 1 }
        ]
      },
      {
        name: "Spicy Dog",
        price: 6.99,
        category: ProductCategory.HOTDOG,
        description: "Beef hotdog, bun, hot sauce & jalapeños",
        ingredients: [
          { name: "Beef Hotdog", qty: 1 },
          { name: "Bun", qty: 1 },
          { name: "Hot Sauce", qty: 1 },
          { name: "Jalapeños", qty: 1 }
        ]
      },
      {
        name: "Italian Dog",
        price: 7.49,
        category: ProductCategory.HOTDOG,
        description: "Beef hotdog, bun, basil pesto & grated parmesan",
        ingredients: [
          { name: "Beef Hotdog", qty: 1 },
          { name: "Bun", qty: 1 },
          { name: "Basil Pesto", qty: 1 },
          { name: "Grated Parmesan", qty: 1 }
        ]
      },
      {
        name: "BBQ Crunch Dog",
        price: 7.99,
        category: ProductCategory.HOTDOG,
        description: "Beef hotdog, bun, BBQ sauce & crispy onions",
        ingredients: [
          { name: "Beef Hotdog", qty: 1 },
          { name: "Bun", qty: 1 },
          { name: "BBQ Sauce", qty: 1 },
          { name: "Crispy Onions", qty: 1 }
        ]
      },
      {
        name: "Honey Mustard Dog",
        price: 6.79,
        category: ProductCategory.HOTDOG,
        description: "Beef hotdog, bun, honey mustard & pickles",
        ingredients: [
          { name: "Beef Hotdog", qty: 1 },
          { name: "Bun", qty: 1 },
          { name: "Honey Mustard", qty: 1 },
          { name: "Pickles", qty: 1 }
        ]
      },
      {
        name: "Chicken Nuggets (6 pcs)",
        price: 6.0,
        category: ProductCategory.SIDES,
        description: "Crispy breaded chicken bites",
        ingredients: [
          { name: "Chicken Pieces", qty: 6 }
        ]
      },
      {
        name: "French Fries",
        price: 3.5,
        category: ProductCategory.SIDES,
        description: "Golden fried potato sticks",
        ingredients: [
          { name: "Potatoes", qty: 1 }
        ]
      },
      {
        name: "Mozzarella Sticks (5 pcs)",
        price: 5.0,
        category: ProductCategory.SIDES,
        description: "Breaded mozzarella, fried to perfection",
        ingredients: [
          { name: "Mozzarella", qty: 5 }
        ]
      },
      {
        name: "Animal Style Fries",
        price: 7.5,
        category: ProductCategory.SIDES,
        description: "French fries topped with sausages, melted cheese, crispy onions & house sauces",
        ingredients: [
          { name: "Potatoes", qty: 1 },
          { name: "Sausages", qty: 1 },
          { name: "Melted Cheese", qty: 1 },
          { name: "Crispy Onions", qty: 1 },
          { name: "House Sauces", qty: 1 }
        ]
      }
    ];

    for (const pdata of productsData) {
      const product = new Product();
      product.name = pdata.name;
      product.price = pdata.price;
      product.category = pdata.category;
      product.description = pdata.description;
      await productRepository.save(product);

      for (const ing of pdata.ingredients) {
        const ingredient = ingredientsMap.get(ing.name);
        if (ingredient) {
          const recipe = new Recipe();
          recipe.product = product;
          recipe.ingredient = ingredient;
          recipe.quantityNeeded = ing.qty;
          await recipeRepository.save(recipe);
        }
      }
    }

    console.log("Seed data inserted successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await AppDataSource.destroy();
  }
};

seedDatabase();

