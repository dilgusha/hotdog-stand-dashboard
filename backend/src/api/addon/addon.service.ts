import { Addon } from "../../models/AddOn.model";

export const getAllAddons = async () => {
  try {
    const addons = await Addon.find();
    return addons;
  } catch (error) {
    console.error("Error fetching addons:", error);
    throw new Error("Failed to get addons");
  }
};