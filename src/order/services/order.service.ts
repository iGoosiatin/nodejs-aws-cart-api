import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderPayload } from '../type';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from 'src/entities/entity.order';
import { DataSource, Repository } from 'typeorm';
import { Cart } from 'src/entities/entity.cart';
import { CartService } from 'src/cart/services';
import { calculateCartTotal } from '../models-rules';
import { ProductService } from 'src/product/services';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private cartService: CartService,
    private productService: ProductService,
    private dataSource: DataSource,
  ) {}

  async getAll(joinCartItems = false) {
    return await this.orderRepository.find({
      relations: {
        cart: {
          cartItems: joinCartItems,
        },
      },
    });
  }

  async findById(id: string, joinCartItems = false): Promise<Order> {
    return await this.orderRepository.findOne({
      where: { id },
      relations: {
        cart: {
          cartItems: joinCartItems,
        },
      },
    });
  }

  async getOrdersWithItems() {
    const orders = await this.getAll(true);
    return orders.map((order) => {
      const items = order.cart.cartItems;
      return {
        id: order.id,
        address: order.delivery,
        status: order.status,
        items,
      };
    });
  }

  async create(data: CreateOrderPayload) {
    const { userId, delivery } = data;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const cart = await queryRunner.manager.findOne(Cart, {
        where: { userId: data.userId },
        relations: {
          cartItems: true,
        },
      });

      if (!(cart && cart.cartItems.length)) {
        throw new BadRequestException('Cart is empty');
      }

      const { cartItems } = cart;

      const cartProduct = await this.cartService.addProductsData(cartItems);

      const total = calculateCartTotal(cartProduct);

      const order = queryRunner.manager.create(Order, {
        userId,
        delivery,
        cart,
        total,
      });

      await queryRunner.manager.save(order);

      await queryRunner.manager.update(Cart, { userId }, { status: 'ORDERED' });

      // This is not part of transaction, as not is not controlled by ORM
      await this.productService.updateStocksFromOrderCart(cartItems);

      await queryRunner.commitTransaction();

      return order;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteById(id: string) {
    const order = await this.findById(id, true);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return await this.orderRepository.remove(order);
  }
}
