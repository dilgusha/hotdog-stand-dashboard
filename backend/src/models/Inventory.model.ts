import { Column, Entity, ManyToMany } from "typeorm";
import { CommonEntity } from "./Common.model";
import { Product } from "./Product.model";

@Entity({ name: "inventory" })
export class Inventory extends CommonEntity {
  @Column({ type: "varchar", length: 150 })
  ingredient: string;

  @Column({ type: "int" })
  quantity: number;

  // @ManyToMany(() => Product, (product) => product.ingredients)
  // products: Product[];
}
