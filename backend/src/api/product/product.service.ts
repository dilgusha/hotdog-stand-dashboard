import { validate } from "class-validator";
import { CreateProductDTO } from "./product.dto";
import { Product } from "../../models/Product.model";

export const createProduct = async (dto: CreateProductDTO) => {
  const errors = await validate(dto);
  if (errors.length > 0) {
    const error = new Error("Validation failed");
    (error as any).validationErrors = errors;
    throw error;
  }

  const product = Product.create({
    name: dto.name,
    price: dto.price,
    category: dto.category,
  });

  await product.save();
  return product;
};

export const getAllProducts = async () => {
  try {
    const products = await Product.find({
      relations: ["addons"],
      select: ["id", "name", "price", "category", "description", "addons"],
    });
    return products.map((product) => ({
      ...product,
      addonIds: product.addons.map((addon) => addon.id),
    }));
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to get products: " + (error instanceof Error ? error.message : "Unknown error"));
  }
};

export const getProductById = async (id: number) => {
  const product = await Product.findOneBy({ id });
  if (!product) {
    throw new Error("Product not found");
  }
  return product;
};
