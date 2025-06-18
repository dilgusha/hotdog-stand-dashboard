
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";
import { Product } from "./Product.model";
import { CommonEntity } from "./Common.model";

@Entity({ name: "inventory" })
export class Inventory extends CommonEntity {
  @Column()
  ingredient: string;  

  // @Column("decimal", { precision: 6, scale: 2, nullable: true })
  // price: number | null; 

  @Column("int", { default: 0 })
  quantity: number;

  @ManyToMany(() => Product, (product) => product.ingredients)
  products: Product[];

}
