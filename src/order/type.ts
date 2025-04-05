import { AvailableProduct } from 'src/product/models';
import { CartItem } from 'src/entities/entity.cartItem';
import { Order } from 'src/entities/entity.order';
import { Cart } from 'src/entities/entity.cart';

export enum OrderStatus {
  Open = 'OPEN',
  Approved = 'APPROVED',
  Confirmed = 'CONFIRMED',
  Sent = 'SENT',
  Completed = 'COMPLETED',
  Cancelled = 'CANCELLED',
}

export type Address = {
  address: string;
  firstName: string;
  lastName: string;
  comment: string;
};

export type CreateOrderPayload = {
  userId: string;
  cart: Cart;
  delivery: Address;
  total: number;
};

export type OrderWithProducts = Order & {
  items: AvailableProduct[] | CartItem[];
};
