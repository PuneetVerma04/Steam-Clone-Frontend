export enum OrderStatus {
  Pending = 'Pending',
  Completed = 'Completed',
  Failed = 'Failed',
  Refunded = 'Refunded',
  Cancelled = 'Cancelled',
}

export interface OrderItem {
  orderItemId: number;
  gameId: number;
  gameTitle?: string;
  title?: string;
  quantity: number;
  price: number;
}

export interface Order {
  orderId: number;
  userId: number;
  items: OrderItem[];
  totalPrice: number;
  orderDate: Date;
  status: OrderStatus;
}
