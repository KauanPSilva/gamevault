import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom';

import { ThemeProvider } from './contexts/ThemeProvider';

import { MainLayout } from './components/layout/MainLayout';
import { StorePage } from './pages/StorePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { GameDetailsPage } from './pages/GameDetailsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';


function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route index element={<StorePage />} />

            <Route
              path="*"
              element={<NotFoundPage />}
            />
            <Route
              path="games/:slug"
              element={<GameDetailsPage />}
            />
            <Route path="login" element={<LoginPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route element={<ProtectedRoute />}>
              <Route
                path="checkout"
                element={<CheckoutPage />}
              />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;