import { Column, Entity, OneToMany} from "typeorm";
import { CommonEntity } from "./Common.model";
import { ERoleType } from "../common/enum/user-role.enum";
import { Order } from "./Order.model";


@Entity({ name: "users" })
export class User extends CommonEntity {
  @Column({ type: "varchar", length: 150, default:null})
  name: string;

  @Column({ type: "varchar", length: 150 })
  password: string;

  @Column({
    type: "enum",
    enum: ERoleType,
    default: ERoleType.USER,
  })
  role: ERoleType;

  @OneToMany(() => Order, (order) => order.createdBy)
  orders: Order[]; 

}