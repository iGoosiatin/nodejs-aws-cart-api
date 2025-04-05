import { CartItem } from '../models';

export function calculateCartTotal(items: any[]): number {
  return items.length
    ? items.reduce((acc: number, { product: { price }, count }: any) => {
        return (acc += price * count);
      }, 0)
    : 0;
}
