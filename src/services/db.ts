import { supabase } from '../lib/supabase';
import type { Scripture, Card } from '../types/cards';
import { buildScriptureRef } from '../types/cards';
import type { FavoriteScriptures } from '../types/cards';

function toCard(s: Scripture): Card {
  return {
    scripture: buildScriptureRef(s),
    verseContent: s.verse_content,
  };
}

export async function fetchDefaultGems(n = 10): Promise<Card[]> {
  const { data, error } = await supabase
      .rpc('get_default_gems', { n })
      .returns<Scripture[]>();
  if (error) throw error;
  return (data ?? []).map(toCard);
}

export async function fetchFavoritesDueCards(blackoutDays = 60): Promise<Card[]> {
  const { data: ids, error } = await supabase
      .rpc('get_favorites_due', { blackout_days: blackoutDays })
      .returns<{ scripture_id: string }[]>();
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
        .returns<Scripture[]>();
    if (error) throw error;
    return (data ?? []).map(toCard);
  }
  return fetchDefaultGems(n);
}

export async function listFavorites(): Promise<
    { id: string; createdAt: string; card: Card }[]
> {
  const { data, error } = await supabase
      .from('favorite_gems')
      .select(
          'scripture_id, created_at, scripture:scripture_id (id, book, chapter, verse_from, verse_to, verse_content)'
      )
      .order('created_at', { ascending: false });
  if (error) throw error;

  return (data ?? []).map((r: any) => {
    const s = r.scripture as Scripture;
    return {
      id: s.id,
      createdAt: r.created_at as string,
      card: toCard(s),
    };
  });
}

export async function listMemorized(): Promise<
    { id: string; memorizedAt: string; reviewAfter: string; card: Card }[]
> {
  const { data, error } = await supabase
      .from('memorized_gems')
      .select(
          'scripture_id, memorized_at, review_after, scripture:scripture_id (id, book, chapter, verse_from, verse_to, verse_content)'
      )
      .order('memorized_at', { ascending: false });
  if (error) throw error;

  return (data ?? []).map((r: any) => {
    const s = r.scripture as Scripture;
    return {
      id: s.id,
      memorizedAt: r.memorized_at as string,
      reviewAfter: r.review_after as string, // interval comes back as string
      card: toCard(s),
    };
  });
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

export async function markMemorized(scriptureId: string, days = 60) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');
  const { error } = await supabase.from('memorized_gems').insert({
    user_id: user.user.id, scripture_id: scriptureId, review_after: `${days} days`
  });
  if (error) throw error;
}
