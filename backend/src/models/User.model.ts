import { Column, Entity, JoinTable, ManyToMany, OneToMany, Unique } from "typeorm";
import { CommonEntity } from "./Common.model";

export enum ERoleType {
    USER = "USER",
    ADMIN = "ADMIN",
}

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

}