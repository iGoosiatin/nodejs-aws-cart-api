import { CartProduct } from '../models';

export function calculateCartTotal(items: CartProduct[]): number {
  return items.length
    ? items.reduce(
        (acc: number, { product: { price }, count }: CartProduct) => {
          return (acc += price * count);
        },
        0,
      )
    : 0;
}
