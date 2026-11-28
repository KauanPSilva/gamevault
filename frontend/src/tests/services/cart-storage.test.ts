import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
} from 'vitest';

import { cartStorage } from '../../services/cart-storage';

import type { CartItem } from '../../types/cart';

const CART_KEY = 'gamevault.cart.v1';

const validItem: CartItem = {
  gameId: '11111111-1111-4111-8111-111111111111',
  title: 'Grand Theft Auto VI',
  slug: 'grand-theft-auto-vi',
  price: 34990,
  imageUrl: '/images/games/gta/cover.webp',
  accentColor: '#F472B6',
};

describe('cartStorage', () => {
  beforeEach(() => {
    cartStorage.clear();
  });

  afterEach(() => {
    cartStorage.clear();
  });

  it('should return an empty cart when nothing is stored', () => {
    expect(cartStorage.get()).toEqual([]);
  });

  it('should store and retrieve valid items', () => {
    cartStorage.set([validItem]);

    expect(cartStorage.get()).toEqual([
      validItem,
    ]);
  });

  it('should clear stored items', () => {
    cartStorage.set([validItem]);
    cartStorage.clear();

    expect(cartStorage.get()).toEqual([]);
    expect(localStorage.getItem(CART_KEY)).toBeNull();
  });

  it('should handle malformed JSON', () => {
    localStorage.setItem(
      CART_KEY,
      '{invalid-json',
    );

    expect(cartStorage.get()).toEqual([]);
  });

  it('should reject invalid data structures', () => {
    localStorage.setItem(
      CART_KEY,
      JSON.stringify({ items: [] }),
    );

    expect(cartStorage.get()).toEqual([]);
  });

  it.each([
    0,
    -100,
    10.5,
    100_000_001,
  ])('should reject an invalid price: %s', (price) => {
    localStorage.setItem(
      CART_KEY,
      JSON.stringify([
        {
          ...validItem,
          price,
        },
      ]),
    );

    expect(cartStorage.get()).toEqual([]);
  });

  it('should reject invalid game identifiers', () => {
    localStorage.setItem(
      CART_KEY,
      JSON.stringify([
        {
          ...validItem,
          gameId: 'invalid-id',
        },
      ]),
    );

    expect(cartStorage.get()).toEqual([]);
  });

  it('should reject invalid accent colors', () => {
    localStorage.setItem(
      CART_KEY,
      JSON.stringify([
        {
          ...validItem,
          accentColor: 'invalid-color',
        },
      ]),
    );

    expect(cartStorage.get()).toEqual([]);
  });

  it('should remove duplicate stored games', () => {
    cartStorage.set([
      validItem,
      validItem,
    ]);

    expect(cartStorage.get()).toHaveLength(1);
  });

  it('should reject carts exceeding the maximum size', () => {
    const items = Array.from(
      { length: 51 },
      (_, index) => ({
        ...validItem,
        gameId: `11111111-1111-4111-8111-${String(
          index,
        ).padStart(12, '0')}`,
      }),
    );

    cartStorage.set(items);

    expect(cartStorage.get()).toEqual([]);
  });

  it('should remove structurally invalid stored data', () => {
    localStorage.setItem(
      CART_KEY,
      JSON.stringify([{ invalid: true }]),
    );

    cartStorage.get();

    expect(localStorage.getItem(CART_KEY)).toBeNull();
  });
});