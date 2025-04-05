import { Module } from '@nestjs/common';

import { AppController } from './app.controller';

import { CartModule } from './cart/cart.module';
import { AuthModule } from './auth/auth.module';
import { OrderModule } from './order/order.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModule } from './product/product.module';

import databaseConfig from './config/database.config';

@Module({
  imports: [
    AuthModule,
    CartModule,
    OrderModule,
    ProductModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync(databaseConfig.asProvider()),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
