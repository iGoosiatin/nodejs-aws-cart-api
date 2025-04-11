import { registerAs } from '@nestjs/config';
import { Cart } from 'src/entities/entity.cart';
import { CartItem } from 'src/entities/entity.cartItem';
import { Order } from 'src/entities/entity.order';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

export default registerAs('database', () => ({
  type: 'postgres' as const,
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT ? Number(process.env.POSTGRES_PORT) : 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  entities: [Cart, CartItem, Order],
  synchronize: true,
  ssl: {
    rejectUnauthorized: false,
  },
  namingStrategy: new SnakeNamingStrategy(),
}));
