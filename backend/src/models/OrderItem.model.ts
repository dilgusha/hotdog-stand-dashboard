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

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinColumn, JoinTable } from "typeorm";
import { Product } from "./Product.model";
import { Inventory } from "./Inventory.model";
import { Order } from "./Order.model";
import { Addon } from "./AddOn.model";
import { CommonEntity } from "./Common.model";
import { Drink } from "./Drink.model";

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

  @ManyToMany(() => Addon)
  @JoinTable({
    name: "order_item_addons",
    joinColumn: { name: "order_item_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "addon_id", referencedColumnName: "id" },
  })
  addons: Addon[];

  @ManyToMany(() => Inventory)
  @JoinTable({
    name: "order_item_ingredients",
    joinColumn: { name: "order_item_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "inventory_id", referencedColumnName: "id" },
  })
  ingredients: Inventory[];

  @ManyToMany(() => Drink)
  @JoinTable({
    name: "order_item_drinks",
    joinColumn: { name: "order_item_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "drink_id", referencedColumnName: "id" },
  })
  drinks: Drink[];

}
