import { Inventory } from "../../models/Inventory.model";

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
