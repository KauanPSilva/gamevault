import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
} from 'vitest';

import {
  renderHook,
  act,
} from '@testing-library/react';

import { CartProvider } from '../../contexts/CartProvider';
import { useCart } from '../../hooks/useCart';
import { cartStorage } from '../../services/cart-storage';

import {
  gtaGame,
  cyberpunkGame,
} from '../fixtures/games.fixture';

const gta = {
  ...gtaGame,
  id: '11111111-1111-4111-8111-111111111111',
};

const cyberpunk = {
  ...cyberpunkGame,
  id: '22222222-2222-4222-8222-222222222222',
};

function renderCart() {
  return renderHook(() => useCart(), {
    wrapper: CartProvider,
  });
}

describe('CartProvider', () => {
  beforeEach(() => {
    cartStorage.clear();
  });

  afterEach(() => {
    cartStorage.clear();
  });

  it('should start with an empty cart', () => {
    const { result } = renderCart();

    expect(result.current.items).toEqual([]);
    expect(result.current.itemCount).toBe(0);
    expect(result.current.subtotal).toBe(0);
  });

  it('should add a game to the cart', () => {
    const { result } = renderCart();

    act(() => {
      result.current.addItem(gta);
    });

    expect(result.current.itemCount).toBe(1);

    expect(result.current.items[0]).toEqual({
      gameId: gta.id,
      title: gta.title,
      slug: gta.slug,
      price: gta.price,
      imageUrl: gta.imageUrl,
      accentColor: gta.accentColor,
    });
  });

  it('should prevent duplicate games', () => {
    const { result } = renderCart();

    act(() => {
      result.current.addItem(gta);
      result.current.addItem(gta);
    });

    expect(result.current.itemCount).toBe(1);
    expect(result.current.subtotal).toBe(gta.price);
  });

  it('should add different games', () => {
    const { result } = renderCart();

    act(() => {
      result.current.addItem(gta);
      result.current.addItem(cyberpunk);
    });

    expect(result.current.itemCount).toBe(2);
  });

  it('should calculate the subtotal correctly', () => {
    const { result } = renderCart();

    act(() => {
      result.current.addItem(gta);
      result.current.addItem(cyberpunk);
    });

    expect(result.current.subtotal).toBe(
      gta.price + cyberpunk.price,
    );
  });

  it('should identify games already in the cart', () => {
    const { result } = renderCart();

    act(() => {
      result.current.addItem(gta);
    });

    expect(
      result.current.hasItem(gta.id),
    ).toBe(true);

    expect(
      result.current.hasItem(cyberpunk.id),
    ).toBe(false);
  });

  it('should remove a game from the cart', () => {
    const { result } = renderCart();

    act(() => {
      result.current.addItem(gta);
      result.current.addItem(cyberpunk);
    });

    act(() => {
      result.current.removeItem(gta.id);
    });

    expect(result.current.itemCount).toBe(1);

    expect(
      result.current.hasItem(gta.id),
    ).toBe(false);

    expect(
      result.current.hasItem(cyberpunk.id),
    ).toBe(true);

    expect(result.current.subtotal).toBe(
      cyberpunk.price,
    );
  });

  it('should ignore removal of a nonexistent game', () => {
    const { result } = renderCart();

    act(() => {
      result.current.addItem(gta);
    });

    act(() => {
      result.current.removeItem(cyberpunk.id);
    });

    expect(result.current.itemCount).toBe(1);
    expect(result.current.subtotal).toBe(gta.price);
  });

  it('should clear the entire cart', () => {
    const { result } = renderCart();

    act(() => {
      result.current.addItem(gta);
      result.current.addItem(cyberpunk);
    });

    act(() => {
      result.current.clearCart();
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.itemCount).toBe(0);
    expect(result.current.subtotal).toBe(0);
  });

  it('should persist the cart in local storage', () => {
    const { result } = renderCart();

    act(() => {
      result.current.addItem(gta);
    });

    expect(cartStorage.get()).toHaveLength(1);

    expect(cartStorage.get()[0]?.gameId).toBe(
      gta.id,
    );
  });

  it('should restore the cart after remounting', () => {
    const firstRender = renderCart();

    act(() => {
      firstRender.result.current.addItem(gta);
      firstRender.result.current.addItem(cyberpunk);
    });

    firstRender.unmount();

    const secondRender = renderCart();

    expect(
      secondRender.result.current.itemCount,
    ).toBe(2);

    expect(
      secondRender.result.current.subtotal,
    ).toBe(gta.price + cyberpunk.price);
  });

  it('should remove persisted data when clearing the cart', () => {
    const { result } = renderCart();

    act(() => {
      result.current.addItem(gta);
    });

    act(() => {
      result.current.clearCart();
    });

    expect(cartStorage.get()).toEqual([]);
  });

  it('should limit the cart to 50 games', () => {
    const { result } = renderCart();

    act(() => {
      for (let index = 0; index < 51; index++) {
        result.current.addItem({
          ...gta,
          id: `11111111-1111-4111-8111-${String(
            index,
          ).padStart(12, '0')}`,
        });
      }
    });

    expect(result.current.itemCount).toBe(50);

    expect(result.current.subtotal).toBe(
      gta.price * 50,
    );
  });
});