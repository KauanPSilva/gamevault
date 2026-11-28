import {
  Link,
  Outlet,
} from 'react-router-dom';

import { ShieldAlert } from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';

export function AdminRoute() {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <section className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-5 px-5 text-center">
        <div className="rounded-2xl border border-danger/20 bg-danger/10 p-5">
          <ShieldAlert
            size={48}
            className="text-danger"
            aria-hidden="true"
          />
        </div>

        <span className="text-sm font-semibold text-danger">
          ERRO 403
        </span>

        <h1 className="text-3xl font-bold">
          Acesso restrito
        </h1>

        <p className="text-text-muted">
          Você não possui as permissões necessárias
          para acessar esta página.
        </p>

        <Link
          to="/"
          className="accent-button rounded-xl px-6 py-3 font-semibold"
        >
          Voltar para a loja
        </Link>
      </section>
    );
  }

  return <Outlet />;
}