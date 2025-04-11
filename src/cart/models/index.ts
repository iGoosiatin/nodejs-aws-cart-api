import { Cart } from 'src/entities/entity.cart';
import { Product } from 'src/product/models';

export type CartProduct = {
  product: Product;
  count: number;
};

export type CartWithProductsData = Omit<Cart, 'cartItems'> & {
  cartItems: CartProduct[];
};
