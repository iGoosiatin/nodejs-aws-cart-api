import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Cart } from './entity.cart';

@Entity('cart_items')
export class CartItem {
  @PrimaryColumn({ type: 'uuid', nullable: false })
  productId: string;

  @Column({ type: 'int', nullable: false })
  count: number;

  @ManyToOne(() => Cart, (cart) => cart.cartItems)
  cart: Cart;
}
