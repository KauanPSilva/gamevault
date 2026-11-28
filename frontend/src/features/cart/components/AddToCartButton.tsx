import { Link } from 'react-router-dom';

import {
  ShoppingCart,
  Check,
  ArrowRight,
} from 'lucide-react';

import { useCart } from '../../../hooks/useCart';

import type { Game } from '../../../types/game';

interface AddToCartButtonProps {
  game: Game;
}

export function AddToCartButton({
  game,
}: AddToCartButtonProps) {
  const { addItem, hasItem, itemCount } = useCart();

  const isInCart = hasItem(game.id);
  const isCartFull = itemCount >= 50;

  if (isInCart) {
    return (
      <div className="space-y-3">
        <div
          role="status"
          className="flex items-center justify-center gap-2 rounded-xl border border-success/30 bg-success/10 px-4 py-3.5 font-semibold text-success"
        >
          <Check size={20} aria-hidden="true" />
          Adicionado ao carrinho
        </div>

        <Link
          to="/cart"
          className="accent-button flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 font-bold"
        >
          Ir para o carrinho
          <ArrowRight size={20} aria-hidden="true" />
        </Link>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={isCartFull}
      onClick={() => addItem(game)}
      className="accent-button flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 font-bold disabled:cursor-not-allowed disabled:opacity-50"
    >
      <ShoppingCart size={20} aria-hidden="true" />

      {isCartFull
        ? 'Carrinho cheio'
        : 'Adicionar ao carrinho'}
    </button>
  );
}