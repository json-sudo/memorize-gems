import { supabase } from '../lib/supabase';

// Get favorites that are due for practice (honors blackout/review window)
export async function fetchFavoritesDue(blackoutDays = 60) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');
  const { data, error } = await supabase.rpc('favorites_due', {
    uid: user.user.id,
    blackout_days: blackoutDays
  });
  if (error) throw error;
  return data as { scripture_id: string }[];
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
