import { supabase } from '../lib/supabase';
import type { Card } from '../types/cards';

type ScriptureRow = {
  scripture: string;
  verse_content: string;
};

type ScriptureRowWithId = ScriptureRow & { scripture_id: string };

function rowToCard(row: ScriptureRow): Card {
  return {
    scripture: row.scripture,
    verseContent: row.verse_content,
  };
}

export async function fetchScripturesPage(opts?: {limit?: number; offset?: number }) {
  const limit = opts?.limit ?? 100;
  const from = opts?.offset ?? 0;
  const to = from + limit - 1;

  const { data, error } = await supabase
    .from('scriptures')
    .select('*')
    .order('book', { ascending: true })
    .order('chapter', { ascending: true })
    .order('verse_from', { ascending: true })
    .range(from, to);

  if (error) throw error;
  return (data ?? []).map(rowToCard);
}

export async function fetchScripturesByIds(ids: string[]) {
  if (!ids.length) return [];
  const { data, error } = await supabase
    .from('scriptures')
    .select('*')
    .in('id', ids);
  if (error) throw error;
  const map = new Map(data.map(d => [d.id, d]));
  return ids.map(id => map.get(id)).filter(Boolean).map(rowToCard);
}

// Get favorites that are due for practice (honors blackout/review window)
export async function fetchFavoritesDue(blackoutDays = 60) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');
  const { data, error } = await supabase.rpc('favorites_due', {
    uid: user.user.id,
    blackout_days: blackoutDays
  });
  if (error) throw error;
  const ids = (data ?? []).map((r: ScriptureRowWithId) => r.scripture_id as string);
  if (!ids.length) return [];
  return fetchScripturesByIds(ids);
}

export async function addFavorite(scriptureId: string) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');
  const { error } = await supabase.from('favorite_gems').insert({
    user_id: user.user.id, scripture_id: scriptureId
  });
  if (error) throw error;
}

export async function removeFavorite(scriptureId: string) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');
  const { error } = await supabase
    .from('favorite_gems')
    .delete()
    .match({ user_id: user.user.id, scripture_id: scriptureId });
  if (error) throw error;
}

export async function markMemorized(scriptureId: string, days = 60) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');
  const { error } = await supabase.from('memorized_gems').insert({
    user_id: user.user.id, scripture_id: scriptureId, review_after: `${days} days`
  });
  if (error) throw error;
}
