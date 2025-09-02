import { supabase } from '../lib/supabase';
import type { Scripture, Card } from '../types/cards';
import { buildScriptureRef } from '../types/cards';
import type { FavoriteScriptures } from '../types/cards';

function toCard(s: Scripture): Card {
  return {
    id: s.id,
    scripture: buildScriptureRef(s),
    verseContent: s.verse_content,
  };
}

export async function isFavorite(scriptureId: string): Promise<boolean> {
  const { data, error } = await supabase
      .from('favorite_gems')
      .select('scripture_id')
      .eq('scripture_id', scriptureId)
      .maybeSingle();
  if (error && error.code !== 'PGRST116') throw error; // ignore no rows
  return !!data;
}

export async function fetchDefaultGems(n = 10): Promise<Card[]> {
  const { data, error } = await supabase
      .rpc('get_default_gems', { n })
  if (error) throw error;
  return (data ?? []).map(toCard);
}

export async function fetchFavoritesDueCards(blackoutDays = 60): Promise<Card[]> {
  const { data: ids, error } = await supabase
      .rpc('get_favorites_due', { blackout_days: blackoutDays })
  if (error) throw error;

  const scriptureIds = (ids ?? []).map((r: FavoriteScriptures) => r.scripture_id);
  if (!scriptureIds.length) return [];

  const { data, error: e2 } = await supabase
      .from('scriptures')
      .select('id, book, chapter, verse_from, verse_to, verse_content')
      .in('id', scriptureIds)
      .returns<Scripture[]>();
  if (e2) throw e2;

  const byId = new Map((data ?? []).map(s => [s.id, s]));
  return scriptureIds.map((id: string) => byId.get(id)).filter(Boolean).map(toCard);
}

export async function fetchPracticeSet(n = 10, blackoutDays = 60): Promise<Card[]> {
  const { data: session } = await supabase.auth.getSession();
  if (session.session) {
    const { data, error } = await supabase
        .rpc('get_practice_set', { n, blackout_days: blackoutDays })
    if (error) throw error;
    return (data ?? []).map(toCard);
  }
  return fetchDefaultGems(n);
}

export async function listFavoritesPage(page: number, pageSize: number) {
  const from = page * pageSize;
  const to = from + pageSize - 1;
  const query = supabase
    .from('favorite_gems')
      .select(
        `
        scripture_id,
        created_at,
        scripture:scripture_id (
          id,
          book,
          chapter,
          verse_from,
          verse_to,
          verse_content
        )
      `,
          { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;
  const rows = (data ?? []).map((r: any) => ({
    id: r.scripture.id as string,
    createdAt: r.created_at as string,
    card: toCard(r.scripture),
  }));
  return { rows, total: count ?? 0 };
}

export async function listMemorizedPage(page: number, pageSize: number) {
  const from = page * pageSize;
  const to = from + pageSize - 1;
  const query = supabase
      .from('memorized_gems')
      .select('scripture_id, memorized_at, review_after, scripture:scripture_id (id, book, chapter, verse_from, verse_to, verse_content)', { count: 'exact' })
      .order('memorized_at', { ascending: false })
      .range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;
  const rows = (data ?? []).map((r: any) => ({
    id: r.scripture.id as string,
    memorizedAt: r.memorized_at as string,
    reviewAfter: r.review_after as string,
    card: toCard(r.scripture),
  }));
  return { rows, total: count ?? 0 };
}

export async function markAsMemorized(ids: string[], reviewDays = 60): Promise<void> {
  if (!ids.length) return;
  const {error} = await supabase.rpc('mark_as_memorized', {
    scripture_ids: ids,
    review_days: reviewDays,
  });
  if (error) throw error;
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

export async function unmemorize(ids: string[]): Promise<void> {
  if (!ids.length) return;
  const { error } = await supabase.rpc('unmemorize', {
    scripture_ids: ids,
  });
  if (error) throw error;
}

export async function searchScripturesPage(
    q: string,
    page: number,
    pageSize: number
): Promise<{ rows: Scripture[]; total:number }> {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('scriptures')
    .select('id, book, chapter, verse_from, verse_to, verse_content', { count: 'exact' })
    .order('book', { ascending: true })
    .order('chapter', { ascending: true })
    .order('verse_from', { ascending: true })
    .range(from, to);

  if (q && q.trim()) {
    const term = `%${q.trim()}%`;
    query = query.or(`book.ilike.${term},verse_content.ilike.${term}`);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { rows: (data ?? []) as Scripture[], total: count ?? 0 };
}
