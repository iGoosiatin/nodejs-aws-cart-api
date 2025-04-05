import {
  Controller,
  Get,
  Put,
  Body,
  Req,
  UseGuards,
  BadRequestException,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { BasicAuthGuard } from '../auth';
import { OrderService } from '../order';
import { AppRequest, getUserIdFromRequest } from '../shared';
import { CartStatus } from 'src/entities/entity.cart';
import { CartService } from 'src/cart';
import { OrderDto, UuidParams } from './dto/order.dto';

@Controller('api/order')
export class OrderController {
  constructor(
    private cartService: CartService,
    private orderService: OrderService,
  ) {}

  // @UseGuards(JwtAuthGuard)
  @UseGuards(BasicAuthGuard)
  @Put()
  async checkout(@Req() req: AppRequest, @Body() body: OrderDto) {
    const userId = getUserIdFromRequest(req);

    const order = await this.orderService.create({
      userId,
      delivery: body.address,
    });

    this.cartService.updateStatusById(order.cart.id, CartStatus.ORDERED);

    return {
      order,
    };
  }

  @UseGuards(BasicAuthGuard)
  @Get()
  async getOrders() {
    return await this.orderService.getOrdersWithItems();
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOrder(@Param() { id }: UuidParams) {
    const result = await this.orderService.deleteById(id);
    if (!result.affected) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
  }
}
