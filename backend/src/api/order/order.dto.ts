import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  price: number; // This is total price (quantity * unit)

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  customizationIds?: number[];
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  @IsNotEmpty()
  items: CreateOrderItemDto[];
}

export class OrderItemResponseDto {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number; // Total price
  unitPrice: number; // Derived on backend if needed
  customizations: {
    id: number;
    name: string;
    price: number;
  }[];
}

export class OrderResponseDto {
  id: number;
  createdBy: {
    id: number;
    name: string;
  };
  items: OrderItemResponseDto[];
  totalAmount: number;
  created_at: Date;
  updated_at: Date;
}

export class GetOrdersQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}
