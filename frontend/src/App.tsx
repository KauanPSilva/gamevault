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
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;