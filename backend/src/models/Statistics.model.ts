import { Column, Entity } from "typeorm";
import { CommonEntity } from "./Common.model";

@Entity({ name: "Statistics" })
export class Statistics extends CommonEntity {
  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  todayRevenue: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  monthRevenue: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  totalRevenue: number;

  @Column({ type: "int", default: 0 })
  todayOrders: number;

  @Column({ type: "int", default: 0 })
  monthOrders: number;

  @Column({ type: "int", default: 0 })
  totalOrders: number;

  @Column({ type: "timestamp", nullable: true })
  lastUpdated: Date;

}
