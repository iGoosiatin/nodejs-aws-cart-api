import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Cart, CartStatus } from 'src/entities/entity.cart';
import { CartItem } from 'src/entities/entity.cartItem';
import { CartItemDto } from '../dto/cartItem.dto';
import { ProductService } from 'src/product/services';
import { InsufficientStockException } from '../exceptions';
import { CartProduct } from '../models';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartsRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemsRepository: Repository<CartItem>,
    private productService: ProductService,
  ) {}

  async findByUserId(userId: string): Promise<Cart | null> {
    return await this.cartsRepository.findOne({
      where: { userId, status: Not(CartStatus.ORDERED) },
      relations: ['cartItems'],
    });
  }

  async addProductsData(cartItems: Cart['cartItems']): Promise<CartProduct[]> {
    if (cartItems.length === 0) {
      return [];
    }
    const products = await this.productService.getByIds(
      cartItems.map(({ productId }) => productId),
    );

    return cartItems.map((cartItem) => ({
      product: products.find(({ id }) => id === cartItem.productId),
      count: cartItem.count,
    }));
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
    const { productId, count } = payload;

    const product = await this.productService.getById(productId);

    if (count && count > product.count) {
      throw new InsufficientStockException(product.count);
    }

    const userCart = await this.findOrCreateByUserId(userId);

    const index = (userCart.cartItems || []).findIndex(
      (cartItem) => cartItem.productId === productId,
    );

    if (index === -1) {
      const newCartItem = this.cartItemsRepository.create({
        productId,
        count: count,
        cart: userCart,
      });
      await this.cartItemsRepository.save(newCartItem);
    } else if (count === 0) {
      await this.cartItemsRepository.delete({
        productId,
      });
    } else {
      await this.cartItemsRepository.update({ productId }, { count });
    }

    return await this.findByUserId(userId);
  }

  async removeByUserId(userId: string) {
    return await this.cartsRepository.delete({ userId });
  }

  updateStatusById(cartId: string, status: CartStatus): void {
    this.cartsRepository.update({ id: cartId }, { status });
  }
}
