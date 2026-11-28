import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  render,
  screen,
} from '@testing-library/react';

import userEvent from '@testing-library/user-event';

import {
  MemoryRouter,
  Route,
  Routes,
} from 'react-router-dom';

import { AdminRoute } from '../../components/auth/AdminRoute';

const authState = vi.hoisted(() => ({
  isAdmin: false,
  isAuthenticated: true,
  isLoading: false,
}));

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => authState,
}));

function renderAdminRoute() {
  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route
          path="/"
          element={<h1>GameVault Store</h1>}
        />

        <Route element={<AdminRoute />}>
          <Route
            path="/admin"
            element={<h1>Protected Admin Content</h1>}
          />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('AdminRoute', () => {
  beforeEach(() => {
    authState.isAdmin = false;
    authState.isAuthenticated = true;
    authState.isLoading = false;
  });

  it('should allow administrators to access protected content', () => {
    authState.isAdmin = true;

    renderAdminRoute();

    expect(
      screen.getByRole('heading', {
        name: 'Protected Admin Content',
      }),
    ).toBeInTheDocument();
  });

  it('should deny access to customers', () => {
    renderAdminRoute();

    expect(
      screen.getByRole('heading', {
        name: /acesso restrito/i,
      }),
    ).toBeInTheDocument();
  });

  it('should not render administrative content for customers', () => {
    renderAdminRoute();

    expect(
      screen.queryByRole('heading', {
        name: 'Protected Admin Content',
      }),
    ).not.toBeInTheDocument();
  });

  it('should provide a link back to the store', () => {
    renderAdminRoute();

    expect(
      screen.getByRole('link', {
        name: /voltar para a loja/i,
      }),
    ).toHaveAttribute('href', '/');
  });

  it('should allow customers to return to the store', async () => {
    const user = userEvent.setup();

    renderAdminRoute();

    await user.click(
      screen.getByRole('link', {
        name: /voltar para a loja/i,
      }),
    );

    expect(
      screen.getByRole('heading', {
        name: 'GameVault Store',
      }),
    ).toBeInTheDocument();
  });
});