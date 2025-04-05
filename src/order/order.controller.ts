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
import { calculateCartTotal } from './models-rules';
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
    const cart = await this.cartService.findByUserId(userId);

    if (!(cart && cart.cartItems.length)) {
      throw new BadRequestException('Cart is empty');
    }

    const { id: cartId, cartItems } = cart;
    const cartProduct = await this.cartService.addProductsData(cartItems);
    const total = calculateCartTotal(cartProduct);
    const order = await this.orderService.create({
      userId,
      cart,
      delivery: body.address,
      total,
    });
    this.cartService.updateStatusById(cartId, CartStatus.ORDERED);

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
