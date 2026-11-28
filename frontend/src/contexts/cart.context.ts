import { createContext } from 'react';

import type { CartItem } from '../types/cart';
import type { Game } from '../types/game';

export interface CartContextValue {
  items: CartItem[];

  itemCount: number;

  subtotal: number;

  addItem: (game: Game) => void;

  removeItem: (gameId: string) => void;

  hasItem: (gameId: string) => boolean;

  clearCart: () => void;
}

export const CartContext =
  createContext<CartContextValue | undefined>(
    undefined,
  );