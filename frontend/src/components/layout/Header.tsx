import { useState } from 'react';
import { UserMenu } from './UserMenu';
import { useCart } from '../../hooks/useCart';

import {
  Gamepad2,
  ShoppingCart,
  UserRound,
  LibraryBig,
  Menu,
  X,
  Store,
} from 'lucide-react';

import { Link, NavLink } from 'react-router-dom';

const navigation = [
  {
    label: 'Loja',
    path: '/',
    icon: Store,
  },
  {
    label: 'Biblioteca',
    path: '/library',
    icon: LibraryBig,
  },
];

export function Header() {
  const { itemCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between px-5 lg:px-10">

        {/* Brand */}
        <Link
          to="/"
          className="flex items-center gap-3"
          onClick={() => setIsMenuOpen(false)}
        >
          <div className="accent-text">
            <Gamepad2 size={32} strokeWidth={2} />
          </div>

          <span className="text-2xl font-bold tracking-tight">
            Game<span className="accent-text">Vault</span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav
          aria-label="Navegação principal"
          className="hidden items-center gap-8 md:flex"
        >
          {navigation.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'accent-text'
                    : 'text-text-muted hover:text-text-primary'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-5 md:flex">
          <Link
            to="/cart"
            aria-label={`Carrinho de compras: ${itemCount} itens`}
            className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-border transition-colors hover:border-primary/50 hover:bg-surface-elevated"
          >
            <ShoppingCart
              size={22}
              aria-hidden="true"
            />

            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-background">
                {itemCount}
              </span>
            )}
          </Link>

          <div className="h-7 w-px bg-white/10" />

          <UserMenu />
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          aria-label={
            isMenuOpen ? 'Fechar menu' : 'Abrir menu'
          }
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          className="rounded-lg p-2 text-text-primary md:hidden"
          onClick={() => setIsMenuOpen((current) => !current)}
        >
          {isMenuOpen ? <X size={25} /> : <Menu size={25} />}
        </button>
      </div>

      {/* Mobile navigation */}
      {isMenuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Navegação mobile"
          className="flex flex-col gap-2 border-t border-white/5 bg-surface p-5 md:hidden"
        >
          {[
            ...navigation,
            {
              label: 'Carrinho',
              path: '/cart',
              icon: ShoppingCart,
            },
            {
              label: 'Entrar',
              path: '/login',
              icon: UserRound,
            },
          ].map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              onClick={() => setIsMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 ${
                  isActive
                    ? 'accent-text bg-white/5'
                    : 'text-text-muted hover:bg-white/5'
                }`
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}