import { Request, Response, NextFunction } from "express";
import { CreateProductDTO } from "./product.dto";
import { createProduct } from "./product.service";

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
            return
        }

        res.status(500).json({
            message: "An error occurred while creating the product",
            error: error.message || error,
        });
    }
};

export const ProductController = () => ({
    create,
});
