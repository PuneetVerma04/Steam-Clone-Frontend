export interface Review {
  reviewId: number;
  userId: number;
  username?: string;
  gameId: number;
  comment?: string;
  rating: number; // 1–5
  reviewDate: Date;
}

export interface ReviewCreateDto {
  comment?: string;
  rating: number;
}

export interface ReviewUpdateDto {
  comment?: string;
  rating: number;
}
