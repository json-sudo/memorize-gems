// src/services/anon.ts
import { supabase } from '../lib/supabase';

const KEY = 'anonFavorites';

export function getAnonFavorites(): string[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
}

export function setAnonFavorites(ids: string[]) {
  localStorage.setItem(KEY, JSON.stringify([...new Set(ids)]));
}

export function addAnonFavorite(id: string) {
  const s = new Set(getAnonFavorites());
  s.add(id);
  setAnonFavorites([...s]);
}

export function removeAnonFavorite(id: string) {
  const s = new Set(getAnonFavorites());
  s.delete(id);
  setAnonFavorites([...s]);
}

/** Merge local anonymous favorites into the authenticated user's favorites table. */
export async function mergeAnonFavoritesIntoAccount() {
  const ids = getAnonFavorites();
  if (!ids.length) return;

  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return;

  // bulk insert (duplicates ignored thanks to unique(user_id, scripture_id))
  const rows = ids.map(scripture_id => ({ user_id: user.user!.id, scripture_id }));
  const { error } = await supabase.from('favorite_gems').insert(rows);
  if (!error) localStorage.removeItem(KEY);
}
