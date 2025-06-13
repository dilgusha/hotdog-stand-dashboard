import { Addon } from "../../models/AddOn.model";

export const getAllAddons = async () => {
  try {
    const addons = await Addon.find({ relations: ["inventory"] });
    return addons;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching addons:", error.message);
    } else {
      console.error("Error fetching addons:", "Unknown error");
    }
    throw new Error("Failed to get addons");
  }
};