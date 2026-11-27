export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface CatalogCategory extends Category {
  gameCount: number;
}

export interface Game {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  imageUrl: string;
  bannerUrl: string | null;
  accentColor: string;
  isFeatured: boolean;
  developer: string | null;
  publisher: string | null;
  releaseDate: string | null;
  createdAt: string;
  category: Category;
}

export type GameSort =
  | 'title_asc'
  | 'title_desc'
  | 'price_asc'
  | 'price_desc'
  | 'newest';

export interface GameFilters {
  search?: string;
  category?: string;
  featured?: boolean;
  sort?: GameSort;
  page?: number;
  limit?: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface GamesResponse {
  games: Game[];
  pagination: Pagination;
}

export interface GameResponse {
  game: Game;
}

export interface CategoriesResponse {
  categories: CatalogCategory[];
}