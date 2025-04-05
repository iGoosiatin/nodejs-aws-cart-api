import { Module } from '@nestjs/common';

import { OrderModule } from '../order/order.module';
import { ProductModule } from 'src/product/product.module';

import { CartController } from './cart.controller';
import { CartService } from './services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from 'src/entities/entity.cart';
import { CartItem } from 'src/entities/entity.cartItem';

@Module({
  imports: [
    OrderModule,
    ProductModule,
    TypeOrmModule.forFeature([Cart, CartItem]),
  ],
  providers: [CartService],
  controllers: [CartController],
})
export class CartModule {}
