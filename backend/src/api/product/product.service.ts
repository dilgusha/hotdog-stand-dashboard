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
