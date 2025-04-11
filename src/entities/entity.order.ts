import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderStatus } from 'src/order/type';
import { Cart } from './entity.cart';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @OneToOne(() => Cart, { onDelete: 'CASCADE', cascade: true })
  @JoinColumn()
  cart: Cart;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.Open })
  status: string;

  @Column({ type: 'float' })
  total: number;

  @Column({ type: 'text', nullable: true })
  comments: string;

  @Column({ type: 'json', nullable: true })
  payment: Record<string, any>;

  @Column({ type: 'json' })
  delivery: Record<string, any>;
}
