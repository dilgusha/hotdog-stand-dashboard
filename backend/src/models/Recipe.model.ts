// import { Column, Entity, ManyToOne, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
// import { CommonEntity } from "./Common.model";
// import { Product } from "./Product.model";
// import { Inventory } from "./Inventory.model";

import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { CommonEntity } from "./Common.model";
import { Product } from "./Product.model";
import { Inventory } from "./Inventory.model";

// @Entity({ name: "recipes" })
// export class Recipe extends CommonEntity {
//   @ManyToOne(() => Product, (product) => product.recipes)
// @JoinColumn({ name: 'product_id' })
// product: Product;


//   @ManyToOne(() => Inventory, (inventory) => inventory.id)
//   @JoinColumn({ name: "ingredient_id" })
//   ingredient: Inventory;

//   @Column({ type: "decimal", precision: 5, scale: 2 })
//   quantityNeeded: number;

// }


@Entity({ name: "recipes" })
export class Recipe extends CommonEntity {
  @ManyToOne(() => Product, (product) => product.id)
  @JoinColumn({ name: "product_id" })
  product: Product;

  @ManyToOne(() => Inventory, (inventory) => inventory.id)
  @JoinColumn({ name: "inventory_id" })
  ingredient: Inventory; 

  @Column("int")
  quantityNeeded: number;  
}
