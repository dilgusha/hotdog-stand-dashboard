import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Order } from '../models/Order.model';
import { OrderItem } from '../models/OrderItem.model';
import { Product } from '../models/Product.model';
import { Customization } from '../models/Customization.model';
import { User } from '../models/User.model';
import { Inventory } from '../models/Inventory.model';
import { Recipe } from '../models/Recipe.model';
import { Statistics } from '../models/Statistics.model';
import { CreateOrderDto, CreateOrderItemDto, GetOrdersQueryDto, OrderResponseDto } from './order.dto';



@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(Order)
        private orderRepository: Repository<Order>,
        @InjectRepository(OrderItem)
        private orderItemRepository: Repository<OrderItem>,
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
        @InjectRepository(Customization)
        private customizationRepository: Repository<Customization>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Inventory)
        private inventoryRepository: Repository<Inventory>,
        @InjectRepository(Recipe)
        private recipeRepository: Repository<Recipe>,
        @InjectRepository(Statistics)
        private statisticsRepository: Repository<Statistics>,
    ) { }

    async createOrder(createOrderDto: CreateOrderDto, userId: number): Promise<OrderResponseDto> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const orderItemsData = await this.validateAndCalculateOrderItems(createOrderDto.items);

        await this.deductInventory(orderItemsData);


        const order = this.orderRepository.create({
            createdBy: user,
            totalAmount: orderItemsData.reduce((sum, item) => sum + item.totalPrice, 0),
        });

        const savedOrder = await this.orderRepository.save(order);

        const orderItems = [];
        for (const itemData of orderItemsData) {
            const orderItem = this.orderItemRepository.create({
                order: savedOrder,
                product: itemData.product,
                quantity: itemData.quantity,
                unitPrice: itemData.unitPrice,
                totalPrice: itemData.totalPrice,
                customizations: itemData.customizations,
            });
            orderItems.push(await this.orderItemRepository.save(orderItem));
        }

        savedOrder.items = orderItems;
        await this.orderRepository.save(savedOrder);

        // Update statistics
        await this.updateStatistics(savedOrder);

        return this.transformToResponseDto(savedOrder);
    }

    async getAllOrders(query: GetOrdersQueryDto): Promise<{ orders: OrderResponseDto[]; total: number; page: number; limit: number }> {
        const { startDate, endDate, page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;

        let whereCondition = {};

        if (startDate && endDate) {
            whereCondition = {
                created_at: Between(new Date(startDate), new Date(endDate)),
            };
        } else if (startDate) {
            whereCondition = {
                created_at: Between(new Date(startDate), new Date()),
            };
        }

        const [orders, total] = await this.orderRepository.findAndCount({
            where: whereCondition,
            relations: ['createdBy', 'items', 'items.product', 'items.customizations'],
            order: { created_at: 'DESC' },
            skip,
            take: limit,
        });

        const transformedOrders = orders.map(order => this.transformToResponseDto(order));

        return {
            orders: transformedOrders,
            total,
            page,
            limit,
        };
    }

    async getOrderById(id: number): Promise<OrderResponseDto> {
        const order = await this.orderRepository.findOne({
            where: { id },
            relations: ['createdBy', 'items', 'items.product', 'items.customizations'],
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        return this.transformToResponseDto(order);
    }

    async getOrdersByDateRange(startDate: string, endDate: string): Promise<OrderResponseDto[]> {
        const orders = await this.orderRepository.find({
            where: {
                created_at: Between(new Date(startDate), new Date(endDate)),
            },
            relations: ['createdBy', 'items', 'items.product', 'items.customizations'],
            order: { created_at: 'DESC' },
        });

        return orders.map(order => this.transformToResponseDto(order));
    }

    private async validateAndCalculateOrderItems(items: CreateOrderItemDto[]) {
    const orderItemsData = [];

    for (const item of items) {
      const product = await this.productRepository.findOne({ where: { id: item.productId } });
      if (!product) {
        throw new NotFoundException(`Product with ID ${item.productId} not found`);
      }

      if (!product.isAvailable) {
        throw new BadRequestException(`Product ${product.name} is not available`);
      }

      let customizations: Customization[] = [];
      let customizationPrice = 0;

      if (item.customizationIds && item.customizationIds.length > 0) {
        customizations = await this.customizationRepository.findByIds(item.customizationIds);
        if (customizations.length !== item.customizationIds.length) {
          throw new NotFoundException('One or more customizations not found');
        }
        customizationPrice = customizations.reduce((sum, custom) => sum + Number(custom.price), 0);
      }

      const unitPrice = Number(product.price) + customizationPrice;
      const totalPrice = unitPrice * item.quantity;

      orderItemsData.push({
        product,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        customizations,
      });
    }

    return orderItemsData;
  }


    private async deductInventory(orderItemsData: any[]) {
        for (const itemData of orderItemsData) {
            const recipes = await this.recipeRepository.find({
                where: { product: { id: itemData.product.id } },
                relations: ['ingredient'],
            });

            for (const recipe of recipes) {
                const totalNeeded = Number(recipe.quantityNeeded) * itemData.quantity;
                const inventory = await this.inventoryRepository.findOne({
                    where: { id: recipe.ingredient.id },
                });

                if (!inventory) {
                    throw new NotFoundException(`Inventory item not found for ingredient: ${recipe.ingredient.ingredient}`);
                }

                if (inventory.quantity < totalNeeded) {
                    throw new BadRequestException(
                        `Insufficient inventory for ${recipe.ingredient.ingredient}. Required: ${totalNeeded}, Available: ${inventory.quantity}`
                    );
                }

                inventory.quantity -= totalNeeded;
                await this.inventoryRepository.save(inventory);
            }
        }
    }

    private async updateStatistics(order: Order) {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        let statistics = await this.statisticsRepository.findOne({ where: {} });

        if (!statistics) {
            statistics = this.statisticsRepository.create({
                todayRevenue: 0,
                monthRevenue: 0,
                totalRevenue: 0,
                todayOrders: 0,
                monthOrders: 0,
                totalOrders: 0,
                popularItems: [],
                revenueByDay: [],
            });
        }

        // Check if order is from today
        if (order.created_at >= startOfDay) {
            statistics.todayRevenue += Number(order.totalAmount);
            statistics.todayOrders += 1;
        }

        // Check if order is from this month
        if (order.created_at >= startOfMonth) {
            statistics.monthRevenue += Number(order.totalAmount);
            statistics.monthOrders += 1;
        }

        statistics.totalRevenue += Number(order.totalAmount);
        statistics.totalOrders += 1;

        // Update popular items
        const productNames = order.items.map(item => item.product.name);
        const currentPopularItems = statistics.popularItems || [];

        for (const productName of productNames) {
            if (!currentPopularItems.includes(productName)) {
                currentPopularItems.push(productName);
            }
        }
        statistics.popularItems = currentPopularItems.slice(0, 10); 

        const todayStr = today.toISOString().split('T')[0];
        const revenueByDay = statistics.revenueByDay || [];
        const todayRevenueEntry = revenueByDay.find(entry => entry.startsWith(todayStr));

        if (todayRevenueEntry) {
            const [date, amount] = todayRevenueEntry.split(':');
            const newAmount = Number(amount) + Number(order.totalAmount);
            const index = revenueByDay.indexOf(todayRevenueEntry);
            revenueByDay[index] = `${date}:${newAmount}`;
        } else {
            revenueByDay.push(`${todayStr}:${order.totalAmount}`);
        }

        statistics.revenueByDay = revenueByDay.slice(-30); 

        await this.statisticsRepository.save(statistics);
    }

    private transformToResponseDto(order: Order): OrderResponseDto {
        return {
            id: order.id,
            createdBy: {
                id: order.createdBy.id,
                name: order.createdBy.name,
            },
            items: order.items.map(item => ({
                id: item.id,
                productId: item.product.id,
                productName: item.product.name,
                quantity: item.quantity,
                unitPrice: Number(item.unitPrice),
                totalPrice: Number(item.totalPrice),
                customizations: (item.customizations || []).map(custom => ({
                    id: custom.id,
                    name: custom.name,
                    price: Number(custom.price),
                })),
            })),
            totalAmount: Number(order.totalAmount),
            created_at: order.created_at,
            updated_at: order.updated_at,
        };
    }
}