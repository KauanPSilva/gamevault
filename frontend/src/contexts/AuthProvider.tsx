import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';

import type { ReactNode } from 'react';

import { isAxiosError } from 'axios';
import { useQueryClient } from '@tanstack/react-query';

import { AuthContext } from './auth.context';

import { authService } from '../features/auth/auth.service';
import { tokenStorage } from '../services/token-storage';
import { api } from '../services/api';

import type {
  User,
  LoginInput,
  RegisterInput,
  AuthResponse,
} from '../types/auth';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const queryClient = useQueryClient();

  const [user, setUser] = useState<User | null>(null);

  const [isLoading, setIsLoading] = useState(
    () => Boolean(tokenStorage.get()),
  );

  const sessionVersion = useRef(0);

  const logout = useCallback(() => {
    sessionVersion.current += 1;

    tokenStorage.clear();

    setUser(null);
    setIsLoading(false);

    queryClient.clear();
  }, [queryClient]);

  const establishSession = useCallback(
    (response: AuthResponse) => {
      sessionVersion.current += 1;

      queryClient.clear();

      tokenStorage.set(response.accessToken);

      setUser(response.user);
      setIsLoading(false);
    },
    [queryClient],
  );

  const login = useCallback(
    async (input: LoginInput) => {
      const version = ++sessionVersion.current;

      const response = await authService.login(input);

      if (version === sessionVersion.current) {
        establishSession(response);
      }
    },
    [establishSession],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const version = ++sessionVersion.current;

      const response = await authService.register(input);

      if (version === sessionVersion.current) {
        establishSession(response);
      }
    },
    [establishSession],
  );

  useEffect(() => {
    const controller = new AbortController();

    const version = sessionVersion.current;

    async function restoreSession() {
      const token = tokenStorage.get();

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await authService.getProfile(
          controller.signal,
        );

        if (
          !controller.signal.aborted &&
          version === sessionVersion.current
        ) {
          setUser(response.user);
        }
      } catch {
        if (
          !controller.signal.aborted &&
          version === sessionVersion.current
        ) {
          logout();
        }
      } finally {
        if (
          !controller.signal.aborted &&
          version === sessionVersion.current
        ) {
          setIsLoading(false);
        }
      }
    }

    void restoreSession();

    return () => {
      controller.abort();
    };
  }, [logout]);

  useEffect(() => {
    const interceptorId =
      api.interceptors.response.use(
        (response) => response,

        (error: unknown) => {
          if (
            isAxiosError(error) &&
            error.response?.status === 401
          ) {
            const authorization =
              error.config?.headers.get('Authorization');

            const currentToken = tokenStorage.get();

            const isAuthEndpoint =
              error.config?.url === '/auth/login' ||
              error.config?.url === '/auth/register';

            if (
              !isAuthEndpoint &&
              currentToken &&
              authorization === `Bearer ${currentToken}`
            ) {
              logout();
            }
          }

          return Promise.reject(error);
        },
      );

    return () => {
      api.interceptors.response.eject(interceptorId);
    };
  }, [logout]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'ADMIN',
      isLoading,
      login,
      register,
      logout,
    }),
    [
      user,
      isLoading,
      login,
      register,
      logout,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}