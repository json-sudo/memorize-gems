import { supabase } from '../lib/supabase';
import type { Card } from '../types/cards';

type ScriptureRow = {
  scripture: {
    book: string;
    chapter: number;
    verse_from: number;
    verse_to: number | null;
  };
  verse_content: string;
};

type ScriptureRowWithId = ScriptureRow & { scripture_id: string };

const rowToCard = (row: ScriptureRow): Card => {
  return {
    scripture: row.scripture ?? `${row.book} ${row.chapter}:${row.verse_from}${row.verse_to ? '-' + row.verse_to : ''}`,
    verseContent: row.verse_content,
  };
}

const toCard = (r: ScriptureRow): Card => ({
  scripture:
      r.scripture ??
      `${r.scripture?.book} ${r.scripture?.chapter}:${r.scripture?.verse_from}${
          r.scripture?.verse_to ? '-' + r.scripture.verse_to : ''
      }`,
  verseContent: r.scripture?.verse_content ?? '',
});

export async function fetchDefaultGems(n = 10): Promise<Card[]> {
  const { data, error } = await supabase.rpc('get_default_gems', { n });
  if (error) throw error;
  return (data ?? []).map(rowToCard);
}

export async function listFavorites() {
  const { data, error } = await supabase
      .from('favorite_gems')
      .select(
          'scripture_id, created_at, scripture:scripture_id (id, book, chapter, verse_from, verse_to, verse_content, scripture)'
      )
      .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((r: FavoriteQueryResult) => ({
    id: r.scripture!.id,
    createdAt: r.created_at as string,
    ...toCard(r),
  }));
}

export async function fetchMemorizeSet(n = 10, blackoutDays = 60): Promise<Card[]> {
  const { data: session } = await supabase.auth.getSession();

  if (session.session) {
    const { data, error } = await supabase.rpc('get_practice_set', {
      n, blackout_days: blackoutDays
    });
    if (error) throw error;
    return (data ?? []).map(rowToCard);
  } else {
    return fetchDefaultGems(n);
  }
}

export async function listMemorized() {
  const { data, error } = await supabase
    .from('memorized_gems')
    .select('scripture_id, memorized_at, review_after, scriptures:*')
    .order('memorized_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.scriptures.id,
    memorizedAt: r.memorized_at,
    reviewAfter: r.review_after,
    ...rowToCard(r.scriptures)
  }));
}

export async function markAsMemorized(ids: string[], reviewDays = 60) {
  const { error } = await supabase.rpc('mark_as_memorized', {
    scripture_ids: ids, review_days: reviewDays
  });
  if (error) throw error;
}

export async function unmemorize(ids: string[]) {
  const { error } = await supabase.rpc('unmemorize', { scripture_ids: ids });
  if (error) throw error;
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
export async function fetchFavoritesDue(): Promise<Card[]> {
  const idsRes = await supabase.rpc('get_favorites_due');
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
