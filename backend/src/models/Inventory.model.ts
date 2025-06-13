// import { Column, Entity, ManyToMany } from "typeorm";
// import { CommonEntity } from "./Common.model";
// import { Product } from "./Product.model";

// @Entity({ name: "inventory" })
// export class Inventory extends CommonEntity {
//   @Column({ type: "varchar", length: 150 })
//   ingredient: string;

//   @Column({ type: "int" })
//   quantity: number;

//   // @ManyToMany(() => Product, (product) => product.ingredients)
//   // products: Product[];
// }


import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";
import { Product } from "./Product.model";
import { CommonEntity } from "./Common.model";

@Entity({ name: "inventory" })
export class Inventory extends CommonEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ingredient: string;  // Maddənin adı (ingredient)

  @Column("decimal", { precision: 6, scale: 2, nullable: true })
  price: number | null; 

  @Column("int", { default: 0 })
  quantity: number;

  @ManyToMany(() => Product, (product) => product.ingredients)
  products: Product[];

  @Column("boolean", { default: false }) // New field to mark if the ingredient is a drink
  isDrink: boolean;
}
