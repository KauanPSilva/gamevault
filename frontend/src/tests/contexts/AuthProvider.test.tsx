import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from 'vitest';

import {
  renderHook,
  act,
  waitFor,
} from '@testing-library/react';

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

import type { ReactNode } from 'react';

import { AuthProvider } from '../../contexts/AuthProvider';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../features/auth/auth.service';
import { tokenStorage } from '../../services/token-storage';

import type {
  User,
  AuthResponse,
} from '../../types/auth';

vi.mock('../../features/auth/auth.service', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    getProfile: vi.fn(),
  },
}));

const customer: User = {
  id: 'customer-id',
  name: 'GameVault Player',
  email: 'player@example.com',
  role: 'CUSTOMER',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const admin: User = {
  ...customer,
  id: 'admin-id',
  role: 'ADMIN',
};

const authResponse: AuthResponse = {
  user: customer,
  accessToken: 'mock-access-token',
  tokenType: 'Bearer',
};

function renderAuth() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
      },
    },
  });

  function Wrapper({
    children,
  }: {
    children: ReactNode;
  }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </QueryClientProvider>
    );
  }

  return {
    ...renderHook(() => useAuth(), {
      wrapper: Wrapper,
    }),
    queryClient,
  };
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    tokenStorage.clear();
  });

  it('should start as an unauthenticated visitor', () => {
    const { result } = renderAuth();

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('should authenticate a customer', async () => {
    vi.mocked(authService.login)
      .mockResolvedValue(authResponse);

    const { result } = renderAuth();

    await act(async () => {
      await result.current.login({
        email: customer.email,
        password: 'GameVault123',
      });
    });

    expect(result.current.user).toEqual(customer);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isAdmin).toBe(false);

    expect(tokenStorage.get()).toBe(
      authResponse.accessToken,
    );
  });

  it('should identify an administrator', async () => {
    vi.mocked(authService.login).mockResolvedValue({
      ...authResponse,
      user: admin,
    });

    const { result } = renderAuth();

    await act(async () => {
      await result.current.login({
        email: admin.email,
        password: 'GameVault123',
      });
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isAdmin).toBe(true);
  });

  it('should authenticate after registration', async () => {
    vi.mocked(authService.register)
      .mockResolvedValue(authResponse);

    const { result } = renderAuth();

    await act(async () => {
      await result.current.register({
        name: customer.name,
        email: customer.email,
        password: 'GameVault123',
      });
    });

    expect(result.current.user).toEqual(customer);
    expect(result.current.isAuthenticated).toBe(true);

    expect(tokenStorage.get()).toBe(
      authResponse.accessToken,
    );
  });

  it('should restore an existing session', async () => {
    tokenStorage.set('existing-token');

    vi.mocked(authService.getProfile)
      .mockResolvedValue({
        user: customer,
      });

    const { result } = renderAuth();

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toEqual(customer);
    expect(authService.getProfile).toHaveBeenCalled();
  });

  it('should clear an invalid session', async () => {
    tokenStorage.set('invalid-token');

    vi.mocked(authService.getProfile)
      .mockRejectedValue(new Error('Invalid token'));

    const { result } = renderAuth();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(tokenStorage.get()).toBeNull();
  });

  it('should remain unauthenticated after failed login', async () => {
    vi.mocked(authService.login)
      .mockRejectedValue(
        new Error('Invalid credentials'),
      );

    const { result } = renderAuth();

    await act(async () => {
      await expect(
        result.current.login({
          email: customer.email,
          password: 'WrongPassword123',
        }),
      ).rejects.toThrow('Invalid credentials');
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(tokenStorage.get()).toBeNull();
  });

  it('should clear the session and cached data on logout', async () => {
    vi.mocked(authService.login)
      .mockResolvedValue(authResponse);

    const { result, queryClient } = renderAuth();

    await act(async () => {
      await result.current.login({
        email: customer.email,
        password: 'GameVault123',
      });
    });

    queryClient.setQueryData(
      ['orders'],
      [{ id: 'private-order' }],
    );

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(tokenStorage.get()).toBeNull();

    expect(
      queryClient.getQueryData(['orders']),
    ).toBeUndefined();
  });

  it('should not restore a session after logout', async () => {
    let resolveLogin!: (response: AuthResponse) => void;

    vi.mocked(authService.login).mockImplementation(
      () =>
        new Promise<AuthResponse>((resolve) => {
          resolveLogin = resolve;
        }),
    );

    const { result } = renderAuth();

    let loginPromise!: Promise<void>;

    act(() => {
      loginPromise = result.current.login({
        email: customer.email,
        password: 'GameVault123',
      });
    });

    act(() => {
      result.current.logout();
    });

    await act(async () => {
      resolveLogin(authResponse);
      await loginPromise;
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(tokenStorage.get()).toBeNull();
  });
});