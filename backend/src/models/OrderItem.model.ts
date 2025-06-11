import { Column, Entity, ManyToOne, JoinColumn, ManyToMany, JoinTable } from "typeorm";
import { CommonEntity } from "./Common.model";
import { Product } from "./Product.model";
import { Order } from "./Order.model";
import { Customization } from "./Customization.model";

@Entity({ name: "order_items" })
export class OrderItem extends CommonEntity {
  @ManyToOne(() => Order, (order) => order.items)
  @JoinColumn({ name: "order_id" })
  order: Order;

  @ManyToOne(() => Product, (product) => product.id)
  @JoinColumn({ name: "product_id" })
  product: Product;

  @Column({ type: "int" })
  quantity: number;

  @Column({ type: "decimal", precision: 5, scale: 2 })
  unitPrice: number;

  @Column({ type: "decimal", precision: 6, scale: 2 })
  price: number;

   @ManyToMany(() => Customization)
   @JoinTable({
    name: "order_item_customizations",
    joinColumn: { name: "order_item_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "customization_id", referencedColumnName: "id" }
  })
  customizations: Customization[];
}

