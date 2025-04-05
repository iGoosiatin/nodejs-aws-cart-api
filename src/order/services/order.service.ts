import { Injectable } from '@nestjs/common';
import { CreateOrderPayload } from '../type';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from 'src/entities/entity.order';
import { Repository } from 'typeorm';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
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
    const userCart = this.orderRepository.create(data);
    return await this.orderRepository.save(userCart);
  }

  async deleteById(id: string) {
    return await this.orderRepository.delete({ id });
  }
}
