import { IsNotEmpty, IsUUID, IsNumber, Min } from 'class-validator';

export class CartItemDto {
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @Min(0)
  count: number;
}
