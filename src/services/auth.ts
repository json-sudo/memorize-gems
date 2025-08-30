import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

export const signInEmail = (email: string, password: string) =>
  supabase.auth.signInWithPassword({ email, password });

export const signUpEmail = (email: string, password: string) =>
  supabase.auth.signUp({ email, password });

export const signInWithGoogle = () =>
  supabase.auth.signInWithOAuth({ provider: 'google' });

export const signOut = () => supabase.auth.signOut();

export const onAuthChange = (cb: (session: Session | null) => void) =>
  supabase.auth.onAuthStateChange((_e, s) => cb(s));

export const getUser = () => supabase.auth.getUser();
