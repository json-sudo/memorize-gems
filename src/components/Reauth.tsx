// src/components/Reauth.tsx
import { useState } from 'react';
import { signInWithGoogle, signInEmail, signUpEmail, getUser } from '../services/auth';
import { mergeAnonFavoritesIntoAccount } from '../services/anon'
import { useLocation, useNavigate } from 'react-router-dom';

export default function Reauth() {
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const from = (location.state as { from?: { pathname?: string } } | undefined)?.from?.pathname || '/';

  async function afterAuth() {
    try {
      await mergeAnonFavoritesIntoAccount();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('mergeAnonFavoritesIntoAccount failed:', error);
    }
    const { data } = await getUser();
    if (data.user) navigate(from, { replace: true });
  }

  async function handleGoogle() {
    setBusy(true); setErr(null);
    try {
      await signInWithGoogle();
    } catch (e: unknown) {
      if (e instanceof Error) {
        setErr(e.message);
      } else if (typeof e === 'string') {
        setErr(e);
      } else {
        setErr('Google sign-in failed');
      }
    } finally { setBusy(false); }
  }

  async function handleEmailSignUp() {
    setBusy(true); setErr(null);
    try {
      const { error } = await signUpEmail(email, pwd);
      if (error) throw error;
      await afterAuth();
    } catch (e: unknown) {
      if (e instanceof Error) {
        setErr(e.message);
      } else if (typeof e === 'string') {
        setErr(e);
      } else {
        setErr('Sign up failed');
      }
    } finally { setBusy(false); }
  }

  async function handleEmailSignIn() {
    setBusy(true); setErr(null);
    try {
      const { error } = await signInEmail(email, pwd);
      if (error) throw error;
      await afterAuth();
    } catch (e: unknown) {
      if (e instanceof Error) {
        setErr(e.message);
      } else if (typeof e === 'string') {
        setErr(e);
      } else {
        setErr('Sign in failed');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 space-y-4">
        <h2 className="text-xl font-semibold text-slate-100">Sign in to continue</h2>
        <button
          onClick={handleGoogle}
          disabled={busy}
          className="w-full rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 disabled:opacity-60"
        >
          Continue with Google
        </button>

        <div className="grid gap-2">
          <input
            className="rounded-md bg-slate-950/60 border border-slate-800 px-3 py-2"
            placeholder="Email" type="email" value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            className="rounded-md bg-slate-950/60 border border-slate-800 px-3 py-2"
            placeholder="Password" type="password" value={pwd}
            onChange={e => setPwd(e.target.value)}
          />
          <div className="flex gap-2">
            <button onClick={handleEmailSignIn} disabled={busy}
              className="flex-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-100 py-2 disabled:opacity-60">
              Sign in
            </button>
            <button onClick={handleEmailSignUp} disabled={busy}
              className="flex-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-100 py-2 disabled:opacity-60">
              Sign up
            </button>
          </div>
        </div>

        {err && <div className="text-sm text-red-400">{err}</div>}
      </div>
    </div>
  );
}
