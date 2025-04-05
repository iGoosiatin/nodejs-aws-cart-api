import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductModule } from 'src/product/product.module';

import { CartController } from './cart.controller';
import { CartService } from './services';
import { Cart } from 'src/entities/entity.cart';
import { CartItem } from 'src/entities/entity.cartItem';

@Module({
  imports: [ProductModule, TypeOrmModule.forFeature([Cart, CartItem])],
  providers: [CartService],
  controllers: [CartController],
  exports: [CartService],
})
export class CartModule {}
