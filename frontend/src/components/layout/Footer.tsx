import { Gamepad2, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-background">
      <div className="mx-auto max-w-[1600px] px-5 py-10 lg:px-10">

        <div className="flex flex-col justify-between gap-8 md:flex-row">

          <div className="max-w-sm">
            <Link
              to="/"
              className="flex items-center gap-2 text-xl font-bold"
            >
              <Gamepad2
                size={26}
                className="accent-text"
              />

              <span>
                Game<span className="accent-text">Vault</span>
              </span>
            </Link>

            <p className="mt-4 text-sm leading-relaxed text-text-muted">
              Sua próxima aventura começa aqui.
              Descubra novos mundos e construa sua
              biblioteca de jogos.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <ShieldCheck
              size={24}
              className="shrink-0 text-success"
            />

            <div>
              <p className="text-sm font-semibold">
                Ambiente demonstrativo
              </p>

              <p className="mt-1 max-w-xs text-xs leading-relaxed text-text-muted">
                Pagamentos simulados em sandbox.
                Nenhuma transação financeira real
                é realizada nesta plataforma.
              </p>
            </div>
          </div>

        </div>

        <div className="mt-8 flex flex-col justify-between gap-3 border-t border-white/5 pt-6 text-xs text-text-muted md:flex-row">
          <p>
            © {new Date().getFullYear()} GameVault.
            Projeto demonstrativo.
          </p>

          <p>
            Desenvolvido para fins de avaliação técnica.
          </p>
        </div>

      </div>
    </footer>
  );
}