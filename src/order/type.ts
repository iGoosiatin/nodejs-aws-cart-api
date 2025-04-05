import { AvailableProduct } from 'src/product/models';
import { CartItem } from 'src/entities/entity.cartItem';
import { Order } from 'src/entities/entity.order';

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
  delivery: Address;
};

export type OrderWithProducts = Order & {
  items: AvailableProduct[] | CartItem[];
};
