// import { Column, Entity, ManyToOne, JoinColumn, ManyToMany, JoinTable } from "typeorm";
// import { CommonEntity } from "./Common.model";
// import { Product } from "./Product.model";
// import { Order } from "./Order.model";
// import { Customization } from "./Customization.model";

// @Entity({ name: "order_items" })
// export class OrderItem extends CommonEntity {

//    @ManyToOne(() => Product, (product) => product.orderItems)
//   @JoinColumn({ name: "product_id" })
//   product: Product;

//   @ManyToOne(() => Order, (order) => order.orderItems)
//   order: Order;

//   @Column("decimal", { precision: 6, scale: 2 })
//   price: number;

//   @Column("int")
//   quantity: number;

//   @Column({ nullable: true })
//   addon: string; 
// }

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinColumn } from "typeorm";
import { Product } from "./Product.model";
import { Inventory } from "./Inventory.model";
import { Order } from "./Order.model";
import { Addon } from "./AddOn.model";
import { CommonEntity } from "./Common.model";

@Entity({ name: "order_items" })
export class OrderItem extends CommonEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("decimal", { precision: 6, scale: 2 })
  price: number;

  @Column("int")
  quantity: number;

  @ManyToOne(() => Product, (product) => product.id)
  @JoinColumn({ name: "product_id" })
  product: Product;

  @ManyToOne(() => Order, (order) => order.items)
  @JoinColumn({ name: "order_id" })
  order: Order;

  @ManyToMany(() => Addon, (addon) => addon.id)
  @JoinColumn({ name: "addon_id" })
  addons: Addon[];  // Bu sifariş maddəsində olan əlavələr

  @ManyToMany(() => Inventory, (inventory) => inventory.id)
  @JoinColumn({ name: "inventory_id" })
  ingredients: Inventory[];  // Bu sifariş maddəsində olan maddələr
}
