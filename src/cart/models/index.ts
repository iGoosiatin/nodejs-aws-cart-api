export enum CartStatuses {
  OPEN = 'OPEN',
  STATUS = 'STATUS',
}

export type CartItem = {
  productId: string;
  count: number;
};

export type Cart = {
  id: string;
  user_id: string;
  created_at: number;
  updated_at: number;
  status: CartStatuses;
  items: CartItem[];
};
