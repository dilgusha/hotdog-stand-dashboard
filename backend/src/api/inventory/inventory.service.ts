import { AppDataSource } from "../../config/data-source";
import { Inventory } from "../../models/Inventory.model";

const inventoryRepository = AppDataSource.getRepository(Inventory);

export async function updateInventoryItemQuantity(id: number, quantity: number) {
  const inventoryItem = await Inventory.findOneBy({ id });
  if (!inventoryItem) {
    throw new Error("Inventory item not found");
  }
  inventoryItem.quantity = quantity;
  return inventoryItem.save();
}

export async function getInventories() {
     const inventory = await Inventory.find();

  if (!inventory || inventory.length === 0) {
    throw new Error("No inventory items found");
  }
  

  return inventory;
}


// export async function getDrinks() {
//   try {
//     // Find drinks and select only ingredient and price
//     const drinks = await inventoryRepository.find({
//       where: { isDrink: true },
//       select: ["ingredient", "price"],  // Only select ingredient and price
//     });

//     return drinks;
//   } catch (error) {
//     console.error("Error fetching drinks:", error);
//     throw new Error("Failed to fetch drinks");
//   }
// }
