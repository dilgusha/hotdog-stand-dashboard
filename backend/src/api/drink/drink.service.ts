import { Drink } from "../../models/Drink.model";

export const getAllDrinks = async () => {
  try {
    const drinks = await Drink.find({ relations: ["inventory"] });
    return drinks;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching drinks:", error.message);
    } else {
      console.error("Error fetching drinks:", "Unknown error");
    }
    throw new Error("Failed to get drinks");
  }
};
