// import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from "typeorm";
// import { Product } from "./Product.model";

// @Entity()
// export class AddOn {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @Column()
//   name: string;

//   @Column("decimal", { precision: 6, scale: 2 })
//   price: number;

//   @ManyToMany(() => Product)
//   @JoinTable()
//   products: Product[];
// }


import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, ManyToOne, JoinColumn } from "typeorm";
import { Product } from "./Product.model";
import { OrderItem } from "./OrderItem.model";
import { CommonEntity } from "./Common.model";
import { Inventory } from "./Inventory.model";

@Entity({ name: "addons" })
export class Addon extends CommonEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;  

  @Column("decimal", { precision: 6, scale: 2 })
  price: number;  

  @ManyToMany(() => Product, (product) => product.addons)
  products: Product[];  

  @ManyToMany(() => OrderItem, (orderItem) => orderItem.addons)
  orderItems: OrderItem[];  

  
  @ManyToOne(() => Inventory, (inventory) => inventory.id)
  @JoinColumn({ name: "inventory_id" })
  inventory: Inventory;
}
