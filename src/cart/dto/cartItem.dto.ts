import { IsNotEmpty, IsUUID, IsNumber, Min } from 'class-validator';
import { CartItem } from '../models';

export class CartItemDto implements CartItem {
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @Min(0)
  count: number;
}
