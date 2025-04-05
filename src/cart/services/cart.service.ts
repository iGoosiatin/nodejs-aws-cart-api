import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from 'src/entities/entity.cart';
import { CartItem } from 'src/entities/entity.cartItem';
import { CartItemDto } from '../dto/cartItem.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartsRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemsRepository: Repository<CartItem>,
  ) {}

  async findByUserId(userId: string): Promise<Cart | null> {
    return await this.cartsRepository.findOne({
      where: { userId },
      relations: ['cartItems'],
    });
  }

  async createByUserId(userId: string): Promise<Cart> {
    const userCart = this.cartsRepository.create({ userId });
    return await this.cartsRepository.save(userCart);
  }

  async findOrCreateByUserId(userId: string): Promise<Cart> {
    const userCart = await this.findByUserId(userId);

    if (userCart) {
      return userCart;
    }

    return await this.createByUserId(userId);
  }

  async updateByUserId(userId: string, payload: CartItemDto): Promise<Cart> {
    const userCart = await this.findOrCreateByUserId(userId);

    const index = (userCart.cartItems || []).findIndex(
      (cartItem) => cartItem.productId === payload.productId,
    );

    if (index === -1) {
      const newCartItem = this.cartItemsRepository.create({
        productId: payload.productId,
        count: payload.count,
        cart: userCart,
      });
      await this.cartItemsRepository.save(newCartItem);
    } else if (payload.count === 0) {
      await this.cartItemsRepository.delete({
        productId: payload.productId,
      });
    } else {
      await this.cartItemsRepository.update(
        { productId: payload.productId },
        { count: payload.count },
      );
    }

    return await this.findByUserId(userId);
  }

  removeByUserId(userId: string): void {
    this.cartsRepository.delete({ userId });
  }
}
