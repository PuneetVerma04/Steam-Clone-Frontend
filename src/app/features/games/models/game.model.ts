export interface Game {
  id: number;
  title: string;
  description: string;
  price: number;
  genre: string;
  imageUrl: string;
  releaseDate: string;
  publisherId: number;
  publisherName: string;
}

export interface GameQueryParameters {
  pageNumber?: number;
  pageSize?: number;
  genre?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: string;
  searchTerm?: string;
}

export interface PagedGameResponse {
  games: Game[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}
