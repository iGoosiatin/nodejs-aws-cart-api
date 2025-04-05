export type Product = {
  id: string;
  title: string;
  price: number;
  description: string;
};

export type Stock = {
  id: string;
  count: number;
};

export type AvailableProduct = Product & Stock;
