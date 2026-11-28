import { useState, useEffect, useRef } from 'react';

import {
  Link,
  useNavigate,
  useLocation,
} from 'react-router-dom';

import {
  UserRound,
  ChevronDown,
  LibraryBig,
  ReceiptText,
  ShieldCheck,
  LogOut,
  LoaderCircle,
} from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';

export function UserMenu() {
  const {
    user,
    isAuthenticated,
    isAdmin,
    isLoading,
    logout,
  } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleOutsideClick(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !menuRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener(
      'pointerdown',
      handleOutsideClick,
    );

    document.addEventListener(
      'keydown',
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        'pointerdown',
        handleOutsideClick,
      );

      document.removeEventListener(
        'keydown',
        handleKeyDown,
      );
    };
  }, [isOpen]);

  function handleLogout() {
    setIsOpen(false);

    navigate('/', {
      replace: true,
      state: null,
    });

    logout();
  }

  if (isLoading) {
    return (
      <div
        role="status"
        aria-label="Verificando sessão"
        className="flex items-center px-4"
      >
        <LoaderCircle
          size={22}
          className="accent-text animate-spin"
          aria-hidden="true"
        />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Link
        to="/login"
        state={{
          from:
            location.pathname +
            location.search +
            location.hash,
        }}
        className="accent-button flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
      >
        <UserRound size={18} aria-hidden="true" />
        Entrar
      </Link>
    );
  }

  const firstName = user.name.trim().split(/\s+/)[0];

  return (
    <div ref={menuRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={isOpen}
        aria-label="Minha conta"
        onClick={() => setIsOpen((current) => !current)}
        className="flex items-center gap-3 rounded-xl border border-border bg-surface-elevated px-3 py-2 transition-colors hover:border-primary/50"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <UserRound
            size={19}
            className="accent-text"
            aria-hidden="true"
          />
        </div>

        <div className="hidden text-left sm:block">
          <p className="max-w-28 truncate text-sm font-semibold">
            {firstName}
          </p>

          <p className="text-xs text-text-muted">
            Minha conta
          </p>
        </div>

        <ChevronDown
          size={16}
          aria-hidden="true"
          className={`text-text-muted transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-3 w-64 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
          <div className="border-b border-border p-4">
            <p className="truncate font-semibold">
              {user.name}
            </p>

            <p className="mt-1 truncate text-xs text-text-muted">
              {user.email}
            </p>

            {isAdmin && (
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold accent-text">
                <ShieldCheck
                  size={14}
                  aria-hidden="true"
                />
                Administrador
              </span>
            )}
          </div>

          <nav
            aria-label="Navegação da conta"
            className="space-y-1 p-2"
          >
            <Link
              to="/library"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-text-secondary transition-colors hover:bg-surface-elevated hover:text-text-primary"
            >
              <LibraryBig
                size={18}
                aria-hidden="true"
              />
              Minha biblioteca
            </Link>

            <Link
              to="/orders"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-text-secondary transition-colors hover:bg-surface-elevated hover:text-text-primary"
            >
              <ReceiptText
                size={18}
                aria-hidden="true"
              />
              Meus pedidos
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="accent-text flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors hover:bg-primary/10"
              >
                <ShieldCheck
                  size={18}
                  aria-hidden="true"
                />
                Painel administrativo
              </Link>
            )}
          </nav>

          <div className="border-t border-border p-2">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm text-danger transition-colors hover:bg-danger/10"
            >
              <LogOut
                size={18}
                aria-hidden="true"
              />
              Sair da conta
            </button>
          </div>
        </div>
      )}
    </div>
  );
}