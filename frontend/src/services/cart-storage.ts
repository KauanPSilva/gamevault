import { z } from 'zod';

import type { CartItem } from '../types/cart';

const CART_KEY = 'gamevault.cart.v1';

const cartItemSchema = z.object({
  gameId: z.uuid(),
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(150),
  price: z.number().int().positive().max(100_000_000),
  imageUrl: z.string().min(1).max(2048),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});

const cartSchema = z.array(cartItemSchema).max(50);

export const cartStorage = {
  get(): CartItem[] {
    try {
      const stored = localStorage.getItem(CART_KEY);

      if (!stored) {
        return [];
      }

      const parsed = cartSchema.safeParse(
        JSON.parse(stored),
      );

      if (!parsed.success) {
        localStorage.removeItem(CART_KEY);

        return [];
      }

      const uniqueItems = new Map<string, CartItem>();

      for (const item of parsed.data) {
        uniqueItems.set(item.gameId, item);
      }

      return Array.from(uniqueItems.values());
    } catch {
      return [];
    }
  },

  set(items: CartItem[]): void {
    try {
      localStorage.setItem(
        CART_KEY,
        JSON.stringify(items),
      );
    } catch {
      // The cart remains available in memory.
    }
  },

  clear(): void {
    try {
      localStorage.removeItem(CART_KEY);
    } catch {
      // Storage may be unavailable.
    }
  },
};