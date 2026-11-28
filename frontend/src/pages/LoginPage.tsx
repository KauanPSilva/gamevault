import { useState } from 'react';

import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Gamepad2,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  LoaderCircle,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

import { useAuth } from '../hooks/useAuth';

import {
  loginSchema,
  type LoginFormData,
} from '../features/auth/auth.schemas';

import { getApiErrorMessage } from '../utils/api-error';
import { getAuthRedirect } from '../utils/auth-redirect';

export function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const destination = getAuthRedirect(location.state);

  const [showPassword, setShowPassword] = useState(false);

  const [serverError, setServerError] = useState<
    string | null
  >(null);

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),

    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: LoginFormData) {
    setServerError(null);

    try {
      await login(data);

      navigate(destination, {
        replace: true,
      });
    } catch (error) {
      setServerError(
        getApiErrorMessage(
          error,
          'Não foi possível entrar na sua conta.',
        ),
      );
    }
  }

  if (isLoading) {
    return (
      <div
        role="status"
        aria-label="Verificando sessão"
        className="flex min-h-[60vh] items-center justify-center"
      >
        <LoaderCircle
          size={36}
          className="accent-text animate-spin"
          aria-hidden="true"
        />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={destination} replace />;
  }

  return (
    <section className="relative isolate flex min-h-[75vh] items-center justify-center overflow-hidden px-5 py-16">

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -z-10 h-96 w-96 rounded-full bg-primary/10 blur-[120px]"
      />

      <div className="accent-glow w-full max-w-md rounded-3xl border border-border bg-surface/95 p-6 sm:p-10">

        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
            <Gamepad2
              size={34}
              className="accent-text"
              aria-hidden="true"
            />
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            Bem-vindo de volta.
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-text-muted">
            Entre na sua conta e continue sua próxima aventura.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
          noValidate
        >

          {serverError && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-red-300"
            >
              <AlertCircle
                size={20}
                className="shrink-0"
                aria-hidden="true"
              />

              <p>{serverError}</p>
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium"
            >
              E-mail
            </label>

            <div className="relative">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
                aria-hidden="true"
              />

              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                maxLength={254}
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={
                  errors.email ? 'email-error' : undefined
                }
                {...register('email')}
                className={`w-full rounded-xl border bg-background py-3.5 pl-12 pr-4 text-sm outline-none transition-colors placeholder:text-text-muted/60 focus:border-primary ${
                  errors.email
                    ? 'border-danger'
                    : 'border-border'
                }`}
              />
            </div>

            {errors.email && (
              <p
                id="email-error"
                className="mt-2 text-xs text-danger"
              >
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium"
            >
              Senha
            </label>

            <div className="relative">
              <LockKeyhole
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
                aria-hidden="true"
              />

              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Digite sua senha"
                maxLength={128}
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password
                    ? 'password-error'
                    : undefined
                }
                {...register('password')}
                className={`w-full rounded-xl border bg-background py-3.5 pl-12 pr-12 text-sm outline-none transition-colors placeholder:text-text-muted/60 focus:border-primary ${
                  errors.password
                    ? 'border-danger'
                    : 'border-border'
                }`}
              />

              <button
                type="button"
                aria-label={
                  showPassword
                    ? 'Ocultar senha'
                    : 'Mostrar senha'
                }
                onClick={() =>
                  setShowPassword((current) => !current)
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-text-primary"
              >
                {showPassword ? (
                  <EyeOff size={18} aria-hidden="true" />
                ) : (
                  <Eye size={18} aria-hidden="true" />
                )}
              </button>
            </div>

            {errors.password && (
              <p
                id="password-error"
                className="mt-2 text-xs text-danger"
              >
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="accent-button flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-bold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <LoaderCircle
                  size={20}
                  className="animate-spin"
                  aria-hidden="true"
                />
                Entrando...
              </>
            ) : (
              <>
                Entrar na GameVault
                <ArrowRight
                  size={20}
                  aria-hidden="true"
                />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 border-t border-border pt-6 text-center">
          <p className="text-sm text-text-muted">
            Ainda não possui uma conta?{' '}

            <Link
              to="/register"
              state={{ from: destination }}
              className="accent-text font-semibold hover:underline"
            >
              Criar conta
            </Link>
          </p>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-text-muted">
          <ShieldCheck
            size={15}
            className="text-success"
            aria-hidden="true"
          />

          Ambiente demonstrativo
        </div>

      </div>
    </section>
  );
}