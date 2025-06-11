import { Column, Entity } from "typeorm";
import { CommonEntity } from "./Common.model";

@Entity({ name: "inventory" })
export class Inventory extends CommonEntity {
  @Column({ type: "varchar", length: 150 })
  ingredient: string;  

  @Column({ type: "int" })
  quantity: number;  
}
