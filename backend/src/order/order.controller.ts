import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard'; 
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator'; 
import { ERoleType } from '../common/enum/user-role.enum';
import { OrderService } from './order.service';
import { CreateOrderDto, GetOrdersQueryDto, OrderResponseDto } from './order.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @Request() req: any,
  ): Promise<{
    success: boolean;
    message: string;
    data: OrderResponseDto;
  }> {
    const order = await this.orderService.createOrder(createOrderDto, req.user.id);
    
    return {
      success: true,
      message: 'Order created successfully',
      data: order,
    };
  }

  @Get()
  async getAllOrders(
    @Query() query: GetOrdersQueryDto,
  ): Promise<{
    success: boolean;
    message: string;
    data: {
      orders: OrderResponseDto[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    };
  }> {
    const result = await this.orderService.getAllOrders(query);
    
    return {
      success: true,
      message: 'Orders retrieved successfully',
      data: {
        orders: result.orders,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit),
        },
      },
    };
  }

  @Get(':id')
  async getOrderById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{
    success: boolean;
    message: string;
    data: OrderResponseDto;
  }> {
    const order = await this.orderService.getOrderById(id);
    
    return {
      success: true,
      message: 'Order retrieved successfully',
      data: order,
    };
  }

  @Get('date-range/:startDate/:endDate')
  @UseGuards(RolesGuard)
  @Roles(ERoleType.ADMIN)
  async getOrdersByDateRange(
    @Param('startDate') startDate: string,
    @Param('endDate') endDate: string,
  ): Promise<{
    success: boolean;
    message: string;
    data: {
      orders: OrderResponseDto[];
      summary: {
        totalOrders: number;
        totalRevenue: number;
        averageOrderValue: number;
      };
    };
  }> {
    const orders = await this.orderService.getOrdersByDateRange(startDate, endDate);
    
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
    
    return {
      success: true,
      message: 'Orders retrieved successfully',
      data: {
        orders,
        summary: {
          totalOrders: orders.length,
          totalRevenue: Number(totalRevenue.toFixed(2)),
          averageOrderValue: Number(averageOrderValue.toFixed(2)),
        },
      },
    };
  }
}