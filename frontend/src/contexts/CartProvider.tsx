import {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';

import type { ReactNode } from 'react';

import { CartContext } from './cart.context';

import { cartStorage } from '../services/cart-storage';

import type { CartItem } from '../types/cart';
import type { Game } from '../types/game';

interface CartProviderProps {
  children: ReactNode;
}

const MAX_CART_ITEMS = 50;

export function CartProvider({
  children,
}: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>(
    () => cartStorage.get(),
  );

  useEffect(() => {
    if (items.length === 0) {
      cartStorage.clear();
      return;
    }

    cartStorage.set(items);
  }, [items]);

  const addItem = useCallback((game: Game) => {
    setItems((current) => {
      const alreadyExists = current.some(
        (item) => item.gameId === game.id,
      );

      if (
        alreadyExists ||
        current.length >= MAX_CART_ITEMS
      ) {
        return current;
      }

      const newItem: CartItem = {
        gameId: game.id,
        title: game.title,
        slug: game.slug,
        price: game.price,
        imageUrl: game.imageUrl,
        accentColor: game.accentColor,
      };

      return [...current, newItem];
    });
  }, []);

  const removeItem = useCallback((gameId: string) => {
    setItems((current) =>
      current.filter(
        (item) => item.gameId !== gameId,
      ),
    );
  }, []);

  const hasItem = useCallback(
    (gameId: string) =>
      items.some(
        (item) => item.gameId === gameId,
      ),
    [items],
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) => total + item.price,
        0,
      ),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      itemCount: items.length,
      subtotal,
      addItem,
      removeItem,
      hasItem,
      clearCart,
    }),
    [
      items,
      subtotal,
      addItem,
      removeItem,
      hasItem,
      clearCart,
    ],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}