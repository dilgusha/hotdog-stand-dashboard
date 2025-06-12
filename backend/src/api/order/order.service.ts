import { AppDataSource } from "../../config/data-source";
import { Customization } from "../../models/Customization.model";
import { Order } from "../../models/Order.model";
import { OrderItem } from "../../models/OrderItem.model";
import { Product } from "../../models/Product.model";
import { User } from "../../models/User.model";
import { CreateOrderDto } from "./order.dto";

export class OrderService {
  private orderRepo = AppDataSource.getRepository(Order);
  private orderItemRepo = AppDataSource.getRepository(OrderItem);
  private productRepo = AppDataSource.getRepository(Product);
  private customizationRepo = AppDataSource.getRepository(Customization);
  private userRepo = AppDataSource.getRepository(User);

  async createOrder(dto: CreateOrderDto, userId: number) {
    const user = await this.userRepo.findOneByOrFail({ id: userId });

    const order = this.orderRepo.create({ createdBy: user, totalAmount: 0, price: 0 });
    order.items = [];

    let total = 0;

    for (const itemDto of dto.items) {
      const product = await this.productRepo.findOneByOrFail({ id: itemDto.productId });
      const unitPrice = product.price;
      let customizations: Customization[] = [];
      let customizationTotal = 0;

      if (itemDto.customizationIds && itemDto.customizationIds.length) {
        customizations = await this.customizationRepo.findByIds(itemDto.customizationIds);
        customizationTotal = customizations.reduce((sum, c) => sum + Number(c.price), 0);
      }

      const price = (Number(unitPrice) + customizationTotal) * itemDto.quantity;

      const orderItem = this.orderItemRepo.create({
        product,
        quantity: itemDto.quantity,
        price,
        unitPrice,
        customizations,
      });

      total += price;
      order.items.push(orderItem);
    }

    order.totalAmount = total;
    order.price = total;

    await this.orderRepo.save(order);
    return order;
  }

  async getAllOrders(query: any) {
    const { startDate, endDate, page = 1, limit = 10 } = query;

    const qb = this.orderRepo.createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('items.customizations', 'customizations')
      .leftJoinAndSelect('order.createdBy', 'createdBy')
      .skip((page - 1) * limit)
      .take(limit);

    if (startDate) qb.andWhere('order.created_at >= :startDate', { startDate });
    if (endDate) qb.andWhere('order.created_at <= :endDate', { endDate });

    const [orders, total] = await qb.getManyAndCount();

    return {
      data: orders,
      total,
      page: Number(page),
      limit: Number(limit),
    };
  }
}