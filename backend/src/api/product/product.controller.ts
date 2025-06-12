import { Request, Response, NextFunction } from "express";
import { CreateProductDTO } from "./product.dto";
import { createProduct, getAllProducts, getProductById } from "./product.service";

export const ProductController = {
  create: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = new CreateProductDTO();
      dto.name = req.body.name;
      dto.price = req.body.price;
      dto.description = req.body.description;
      dto.category = req.body.category;

      const product = await createProduct(dto);
      res.status(201).json(product);
    } catch (error: any) {
      if (error.validationErrors) {
        res.status(422).json(error.validationErrors);
        return;
      }

      res.status(500).json({
        message: "An error occurred while creating the product",
        error: error.message || error,
      });
    }
  },

  getAll: async (req: Request, res: Response) => {
    try {
      const products = await getAllProducts();
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to get products" });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
         res.status(400).json({ message: "Invalid product ID" });
         return
      }

      const product = await getProductById(id);
      res.status(200).json(product);
    } catch (error) {
      res.status(404).json({ message: error || "Product not found" });
    }
  },
};
