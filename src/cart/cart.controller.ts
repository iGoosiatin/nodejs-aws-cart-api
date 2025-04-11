import {
  Controller,
  Get,
  Delete,
  Put,
  Body,
  Req,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { BasicAuthGuard } from '../auth';
import { AppRequest, getUserIdFromRequest } from '../shared';
import { CartService } from './services';
import { CartItemDto } from './dto/cartItem.dto';
import { InvalidProductException } from './exceptions';
import { ProductNotFound } from 'src/product/errors';
import { CartProduct } from './models';

@Controller('api/profile/cart')
export class CartController {
  constructor(private cartService: CartService) {}

  // @UseGuards(JwtAuthGuard)
  @UseGuards(BasicAuthGuard)
  @Get()
  async findUserCart(@Req() req: AppRequest): Promise<CartProduct[]> {
    const cart = await this.cartService.findOrCreateByUserId(
      getUserIdFromRequest(req),
    );

    return await this.cartService.addProductsData(cart.cartItems || []);
  }

  // @UseGuards(JwtAuthGuard)
  @UseGuards(BasicAuthGuard)
  @Put()
  async updateUserCart(
    @Req() req: AppRequest,
    @Body() body: CartItemDto,
  ): Promise<CartProduct[]> {
    try {
      const cart = await this.cartService.updateByUserId(
        getUserIdFromRequest(req),
        body,
      );

      return await this.cartService.addProductsData(cart.cartItems || []);
    } catch (error) {
      if (error instanceof ProductNotFound) {
        throw new InvalidProductException(body.productId);
      } else throw error;
    }
  }

  // @UseGuards(JwtAuthGuard)
  @UseGuards(BasicAuthGuard)
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearUserCart(@Req() req: AppRequest) {
    return await this.cartService.removeByUserId(getUserIdFromRequest(req));
  }
}
