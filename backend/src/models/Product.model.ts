import { Column, Entity } from "typeorm";
import { CommonEntity } from "./Common.model";
import { ProductCategory } from "../common/enum/product-category.enum";

@Entity({ name: "products" })
export class Product extends CommonEntity {
  @Column({ type: "varchar", length: 150 })
  name: string;

  @Column({ type: "enum", enum: ProductCategory })
  category: ProductCategory;

  @Column({ type: "decimal", precision: 5, scale: 2 })
  price: number;

  @Column({ type: "text" })
  description: string;
}
