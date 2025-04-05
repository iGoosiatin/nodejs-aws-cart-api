import { Module } from '@nestjs/common';
import { OrderService } from './services';
import { CartModule } from 'src/cart/cart.module';
import { ProductModule } from 'src/product/product.module';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/entities/entity.order';

@Module({
  imports: [CartModule, ProductModule, TypeOrmModule.forFeature([Order])],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
