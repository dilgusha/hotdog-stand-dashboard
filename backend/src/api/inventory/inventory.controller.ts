import express, { NextFunction, Request, Response } from "express";
import {  getInventories, updateInventoryItemQuantity } from "./inventory.service";
;


const updateInventoryQuantity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const id = Number(req.params.id);
    const { quantity } = req.body;

    if (typeof quantity !== "number") {
        res.status(400).json({ message: "Quantity must be a number" });
        return
    }

    try {
        const updatedItem = await updateInventoryItemQuantity(id, quantity);
        res.json({ message: "Quantity updated successfully", data: updatedItem });
    } catch (error: any) {
        res.status(404).json({ message: error.message || "Error updating quantity" });
    }
}

const getInventory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Envanteri veritabanından alıyoruz
        const inventory = await getInventories(); 

        // Eğer envanter verisi bulunmazsa, uygun bir hata dönebiliriz
        if (!inventory || inventory.length === 0) {
            res.status(404).json({ message: "No inventory items found" });
            return;
        }

        // Başarıyla envanteri döndürüyoruz
        res.status(200).json({ data: inventory });
    } catch (error: any) {
        // Hata durumunda, uygun hata mesajı ile 500 döndürüyoruz
        res.status(500).json({ message: error.message || "Error fetching inventory" });
    }
}

// export const getDrink = async (req: Request, res: Response) => {
//   try {
//     const drinks = await getDrinks();
//     if (drinks.length === 0) {
//       res.status(404).json({ message: "No drinks found in the inventory" });
//       return;
//     }
//     res.json({ data: drinks });
//     return;
//   } catch (error) {
//     console.error("Error fetching drinks:", error);
//     res.status(500).json({ message: "Failed to fetch drinks" });
//     return;
//   }
// };

export const InventoryController = () => ({
    updateInventoryQuantity,
    getInventory,
    // getDrink
});