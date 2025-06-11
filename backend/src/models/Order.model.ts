import { Column, Entity, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { CommonEntity } from "./Common.model";
import { User } from "./User.model";
import { OrderItem } from "./OrderItem.model";


@Entity({ name: "orders" })
export class Order extends CommonEntity {
  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: "created_by" })  
  createdBy: User; 

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  items: OrderItem[];

  @Column({ type: "decimal", precision: 6, scale: 2 })
  totalAmount: number;
}
