import type { Category } from './game';

export interface LibraryGame {
  id: string;
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
  bannerUrl: string | null;
  accentColor: string;
  developer: string | null;
  publisher: string | null;
  category: Category;
}

export interface LibraryItem {
  id: string;
  acquiredAt: string;
  game: LibraryGame;
}

export interface LibraryResponse {
  items: LibraryItem[];
  total: number;
}