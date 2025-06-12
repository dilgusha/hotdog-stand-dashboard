import { IsEnum, IsNotEmpty, IsNumber, IsString, MaxLength } from "class-validator";
import { ProductCategory } from "../../common/enum/product-category.enum";

export class CreateProductDTO {
    @IsString()
    @MaxLength(150)
    @IsNotEmpty()
    name: string;

    @IsEnum(ProductCategory)
    category: ProductCategory;

    @IsNumber()
    price: number;

    @IsString()
    @IsNotEmpty()
    description: string;
}

export class EditProductDTO extends CreateProductDTO { }
