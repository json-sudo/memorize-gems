import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getUser, onAuthChange } from '../services/auth';

type Props = { children: React.ReactNode };

export default function ProtectedRoute({ children }: Props) {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let unsub: { data: { subscription: { unsubscribe: () => void } } } | null = null;
    (async () => {
      const { data } = await getUser();
      setAuthed(!!data.user);
      setLoading(false);
      unsub = onAuthChange((session) => setAuthed(!!session?.user));
    })();
    return () => unsub?.data.subscription.unsubscribe();
  }, []);

  if (loading) return <div className="p-4 text-slate-400">Loading…</div>;
  if (!authed) {
    return <Navigate to="/reauth" replace state={{ from: location }} />;
  }
  return <>{children}</>;
}
