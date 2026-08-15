export interface CartItem {
  gameId: number;
  title: string;
  quantity: number;
  price: number;
  imageUrl: string;
}

export interface CartRequest {
  gameId: number;
  quantity: number;
}
