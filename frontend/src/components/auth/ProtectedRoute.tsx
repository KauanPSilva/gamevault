import {
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom';

import { LoaderCircle } from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  const location = useLocation();

  if (isLoading) {
    return (
      <div
        role="status"
        aria-label="Verificando sessão"
        className="flex min-h-[50vh] flex-col items-center justify-center gap-4"
      >
        <LoaderCircle
          size={36}
          className="accent-text animate-spin"
          aria-hidden="true"
        />

        <p className="text-text-muted">
          Verificando sua sessão...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from:
            location.pathname +
            location.search +
            location.hash,
        }}
      />
    );
  }

  return <Outlet />;
}