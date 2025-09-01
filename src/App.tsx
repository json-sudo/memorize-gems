import { BrowserRouter, Routes, Route, Link, Outlet, useNavigate, useSearchParams } from 'react-router-dom';
import MemorizeGemsPage from './pages/MemorizeGemsPage';
import ChangeModeButton from './components/ChangeModeButton';
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
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

function RootLayout() {
  return (
    <div className="min-h-screen">
      <header className="container py-4 flex items-center justify-between">
        <Link to="/" className="text-lg font-semibold">Memorize Gems</Link>
        <nav className="flex gap-4 text-sm items-center">
            <Link to="/favorites/practice" className="text-slate-300 hover:text-white">Favorites (Due)</Link>
            <ChangeModeButton />
        </nav>
      </header>

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
