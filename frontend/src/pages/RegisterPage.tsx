import { useState } from 'react';

import {
  Link,
  Navigate,
  useLocation,
} from 'react-router-dom';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Gamepad2,
  UserRound,
  Mail,
  LockKeyhole,
  ArrowRight,
  LoaderCircle,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

import { useAuth } from '../hooks/useAuth';
import { AuthInput } from '../components/auth/AuthInput';

import {
  registerSchema,
  type RegisterFormData,
} from '../features/auth/auth.schemas';

import { getApiErrorMessage } from '../utils/api-error';
import { getAuthRedirect } from '../utils/auth-redirect';

export function RegisterPage() {
  const {
    register: registerAccount,
    isAuthenticated,
    isLoading,
    isAdmin,
  } = useAuth();

  const location = useLocation();

  const destination = getAuthRedirect(
    location.state,
    isAuthenticated ? isAdmin : undefined,
  );

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
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),

    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(data: RegisterFormData) {
    setServerError(null);

    try {
      await registerAccount({
        name: data.name,
        email: data.email,
        password: data.password,
      });
    } catch (error) {
      setServerError(
        getApiErrorMessage(
          error,
          'Não foi possível criar sua conta.',
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
            Sua próxima aventura.
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-text-muted">
            Crie sua conta e comece a construir
            sua biblioteca de jogos.
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

          <AuthInput
            id="name"
            label="Nome completo"
            icon={UserRound}
            autoComplete="name"
            placeholder="Seu nome"
            maxLength={100}
            disabled={isSubmitting}
            error={errors.name?.message}
            {...register('name')}
          />

          <AuthInput
            id="email"
            label="E-mail"
            icon={Mail}
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            maxLength={254}
            disabled={isSubmitting}
            error={errors.email?.message}
            {...register('email')}
          />

          <div>
            <AuthInput
              id="password"
              label="Senha"
              icon={LockKeyhole}
              type="password"
              autoComplete="new-password"
              placeholder="Crie uma senha"
              maxLength={128}
              disabled={isSubmitting}
              error={errors.password?.message}
              {...register('password')}
            />

            <p className="mt-2 text-xs leading-relaxed text-text-muted">
              Utilize pelo menos 8 caracteres,
              incluindo letras maiúsculas, minúsculas
              e números.
            </p>
          </div>

          <AuthInput
            id="confirmPassword"
            label="Confirmação de senha"
            icon={LockKeyhole}
            type="password"
            autoComplete="new-password"
            placeholder="Repita sua senha"
            maxLength={128}
            disabled={isSubmitting}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

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

                Criando conta...
              </>
            ) : (
              <>
                Criar minha conta

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
            Já possui uma conta?{' '}

            <Link
              to="/login"
              state={{ from: destination }}
              className="accent-text font-semibold hover:underline"
            >
              Entrar
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