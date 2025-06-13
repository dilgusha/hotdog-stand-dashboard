import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, ManyToOne } from "typeorm";
import { CommonEntity } from "./Common.model";
import { OrderItem } from "./OrderItem.model";
import { Inventory } from "./Inventory.model";

@Entity({ name: "drinks" })
export class Drink extends CommonEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column("decimal", { precision: 6, scale: 2 })
    price: number;

    @ManyToMany(() => OrderItem, (orderItem) => orderItem.drinks)
    orderItems: OrderItem[];

    
   @ManyToOne(() => Inventory)
    @JoinTable({
        name: "drink_inventory",
    })
    inventory: Inventory;

}
