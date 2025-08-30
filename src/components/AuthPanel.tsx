import { useEffect, useState } from 'react';
import { onAuthChange, signInWithGoogle, signOut, signInEmail, signUpEmail, getUser } from '../services/auth';

export default function AuthPanel() {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    getUser().then((res) => setUserEmail(res.data.user?.email ?? null));
    const sub = onAuthChange((session) => setUserEmail(session?.user?.email ?? null));
    return () => sub.data.subscription.unsubscribe();
  }, []);

  return (
    <div className="flex items-center gap-2">
      {userEmail ? (
        <>
          <span className="text-sm text-slate-400">Signed in as {userEmail}</span>
          <button className="btn" onClick={() => signOut()}>Sign out</button>
        </>
      ) : (
        <>
          <button className="btn" onClick={() => signInWithGoogle()}>Sign in with Google</button>
          {/* quick email demo; replace with real form later */}
          <button className="btn" onClick={() => signUpEmail('demo@example.com','password-123')}>Demo Sign up</button>
          <button className="btn" onClick={() => signInEmail('demo@example.com','password-123')}>Demo Sign in</button>
        </>
      )}
    </div>
  );
}
