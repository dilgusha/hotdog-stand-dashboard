import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { CommonEntity } from "./Common.model";
import { Product } from "./Product.model";

@Entity({ name: "customizations" })
export class Customization extends CommonEntity {
  @ManyToOne(() => Product, (product) => product.id)
  @JoinColumn({ name: "product_id" })
  product: Product;

  @Column({ type: "varchar", length: 150 })
  name: string; 

  @Column({ type: "decimal", precision: 5, scale: 2 })
  price: number;  
}
