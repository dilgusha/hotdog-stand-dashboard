import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class AddOn {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
