import { BrowserRouter, Routes, Route, Outlet, useNavigate, useSearchParams } from 'react-router-dom';
import AddFavouriteGemsPage from './pages/AddFavouriteGemsPage';
import MemorizeGemsPage from './pages/MemorizeGemsPage';
import FavoriteGemsPage from './pages/FavoriteGemsPage';
import MemorizedGemsPage from './pages/MemorizedGemsPage';
import ModePage from './pages/ModePage';
import AuthPanel from './components/AuthPanel';
import Header from './components/Header';
import Reauth from './components/Reauth';
import ProtectedRoute from './components/ProtectedRoute';
import { MemorizeMode } from './types/cards';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<RootLayout />}>
                    <Route path="/" element={<HomeMemorizeRoute />} />
                    <Route
                        path="/favourites/practice"
                        element={
                            <ProtectedRoute>
                                <FavoritesPracticeRoute />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/reauth" element={<ReauthRoute />} />
                    <Route path="/account" element={<main className="container"><AuthPanel /></main>} />
                    <Route path="/mode" element={<ModePage />} />
                    <Route
                        path="/favorites"
                        element={
                            <ProtectedRoute>
                                <main className="container"><FavoriteGemsPage /></main>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/memorized"
                        element={
                            <ProtectedRoute>
                                <main className="container"><MemorizedGemsPage /></main>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/favorites/add"
                        element={
                            <ProtectedRoute>
                                <main className="container"><AddFavouriteGemsPage /></main>
                            </ProtectedRoute>
                        }
                    />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

function RootLayout() {
  return (
    <div className="min-h-screen">
      <Header />
      <Outlet />
    </div>
  );
}

function useModeFromQuery(defaultMode: MemorizeMode = MemorizeMode.GuessEither): MemorizeMode {
  const [params] = useSearchParams();
  const q = params.get('mode') as MemorizeMode | null;
  const valid = new Set(Object.values(MemorizeMode));
  return (q && valid.has(q)) ? q : defaultMode;
}

function HomeMemorizeRoute() {
  const navigate = useNavigate();
  const mode = useModeFromQuery(MemorizeMode.GuessEither);
  return (
    <main className="container">
      <MemorizeGemsPage
        mode={mode}
        source="auto"
        onBack={() => navigate(-1)}
      />
    </main>
  );
}

function FavoritesPracticeRoute() {
  const navigate = useNavigate();
  const mode = useModeFromQuery(MemorizeMode.GuessEither);
  return (
    <main className="container">
      <MemorizeGemsPage
        mode={mode}
        source="favoritesDue"
        onBack={() => navigate(-1)}
      />
    </main>
  );
}

function ReauthRoute() {
  return (
    <main className="container">
      <Reauth />
    </main>
  );
}
