// import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, OneToOne } from "typeorm";
// import { CommonEntity } from "./Common.model";
// import { ProductCategory } from "../common/enum/product-category.enum";
// import { Inventory } from "./Inventory.model";
// import { AddOn } from "./AddOn.model";
// import { Recipe } from "./Recipe.model";

// @Entity({ name: "products" })
// export class Product extends CommonEntity {
//   @Column({ type: "varchar", length: 150 })
//   name: string;

//   @Column({ type: "enum", enum: ProductCategory })
//   category: ProductCategory;

//   @Column({ type: "decimal", precision: 5, scale: 2 })
//   price: number;

//   @Column({ type: "text" })
//   description: string;

//   //  @ManyToMany(() => Inventory, (inventory) => inventory.products)
//   // @JoinTable({
//   //   name: "recipes", // join table adı
//   //   joinColumn: { name: "product_id", referencedColumnName: "id" },
//   //   inverseJoinColumn: { name: "ingredient_id", referencedColumnName: "id" },
//   // })
//   // ingredients: Inventory[];

//   @OneToMany(() => Recipe, (recipe) => recipe.product)
//   recipes: Recipe[];


//   @ManyToMany(() => AddOn)
//   @JoinTable() // Ürün ile eklenti arasında ilişki
//   addons: AddOn[];
// }


import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from "typeorm";
import { Inventory } from "./Inventory.model";
import { Addon } from "./AddOn.model";
import { CommonEntity } from "./Common.model";
import { ProductCategory } from "../common/enum/product-category.enum";

@Entity({ name: "products" })
export class Product extends CommonEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column("decimal", { precision: 6, scale: 2 })
  price: number;

  @Column({ type: "enum", enum: ProductCategory })
  category: ProductCategory;

  @ManyToMany(() => Inventory, (inventory) => inventory.products)
  ingredients: Inventory[];  // Məhsulun tərkibində istifadə olunan maddələr

  @ManyToMany(() => Addon, (addon) => addon.products, { eager: true })
  @JoinTable()
  addons: Addon[];  // Məhsulun daxil olduğu əlavələr

  @Column({ type: "text" , nullable: true})
  description: string; 
}
