import { Link } from 'react-router-dom';
import { Gamepad2 } from 'lucide-react';

export function NotFoundPage() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center">
      <Gamepad2
        size={64}
        className="accent-text mb-6"
      />

      <span className="accent-text text-7xl font-bold">
        404
      </span>

      <h1 className="mt-4 text-2xl font-bold">
        Página não encontrada
      </h1>

      <p className="mt-3 text-text-muted">
        Parece que você explorou uma área desconhecida.
      </p>

      <Link
        to="/"
        className="accent-button mt-8 rounded-lg px-6 py-3 font-semibold"
      >
        Voltar para a loja
      </Link>
    </section>
  );
}