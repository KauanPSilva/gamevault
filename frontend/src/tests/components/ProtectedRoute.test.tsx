import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from 'vitest';

import {
  render,
  screen,
} from '@testing-library/react';

import {
  MemoryRouter,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';

import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { AdminRoute } from '../../components/auth/AdminRoute';

import { useAuth } from '../../hooks/useAuth';

import type {
  AuthContextValue,
} from '../../contexts/auth.context';

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

const defaultAuth: AuthContextValue = {
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: false,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
};

function mockAuth(
  overrides: Partial<AuthContextValue> = {},
) {
  vi.mocked(useAuth).mockReturnValue({
    ...defaultAuth,
    ...overrides,
  });
}

function LoginDestination() {
  const location = useLocation();

  return (
    <div>
      <h1>Login</h1>

      <span data-testid="redirect-destination">
        {location.state?.from}
      </span>
    </div>
  );
}

function renderRoutes(path = '/checkout') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/"
          element={<h1>Store</h1>}
        />

        <Route
          path="/login"
          element={<LoginDestination />}
        />

        <Route element={<ProtectedRoute />}>
          <Route
            path="/checkout"
            element={<h1>Checkout</h1>}
          />

          <Route
            path="/library"
            element={<h1>Library</h1>}
          />

          <Route element={<AdminRoute />}>
            <Route
              path="/admin"
              element={<h1>Admin Dashboard</h1>}
            />
          </Route>
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth();
  });

  it('should redirect unauthenticated visitors to login', () => {
    renderRoutes();

    expect(
      screen.getByRole('heading', {
        name: 'Login',
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole('heading', {
        name: 'Checkout',
      }),
    ).not.toBeInTheDocument();
  });

  it('should preserve the original destination', () => {
    renderRoutes('/checkout?method=pix#payment');

    expect(
      screen.getByTestId('redirect-destination'),
    ).toHaveTextContent(
      '/checkout?method=pix#payment',
    );
  });

  it('should display a loading state while restoring the session', () => {
    mockAuth({
      isLoading: true,
    });

    renderRoutes();

    expect(
      screen.getByRole('status', {
        name: 'Verificando sessão',
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole('heading', {
        name: 'Checkout',
      }),
    ).not.toBeInTheDocument();
  });

  it('should allow authenticated customers to access checkout', () => {
    mockAuth({
      isAuthenticated: true,
    });

    renderRoutes();

    expect(
      screen.getByRole('heading', {
        name: 'Checkout',
      }),
    ).toBeInTheDocument();
  });

  it('should allow authenticated customers to access their library', () => {
    mockAuth({
      isAuthenticated: true,
    });

    renderRoutes('/library');

    expect(
      screen.getByRole('heading', {
        name: 'Library',
      }),
    ).toBeInTheDocument();
  });
});

describe('AdminRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth();
  });

  it('should redirect unauthenticated visitors to login', () => {
    renderRoutes('/admin');

    expect(
      screen.getByRole('heading', {
        name: 'Login',
      }),
    ).toBeInTheDocument();
  });

  it('should deny access to regular customers', () => {
    mockAuth({
      isAuthenticated: true,
      isAdmin: false,
    });

    renderRoutes('/admin');

    expect(
      screen.getByRole('heading', {
        name: 'Acesso restrito',
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole('heading', {
        name: 'Admin Dashboard',
      }),
    ).not.toBeInTheDocument();
  });

  it('should allow administrators to access the dashboard', () => {
    mockAuth({
      isAuthenticated: true,
      isAdmin: true,
    });

    renderRoutes('/admin');

    expect(
      screen.getByRole('heading', {
        name: 'Admin Dashboard',
      }),
    ).toBeInTheDocument();
  });
});