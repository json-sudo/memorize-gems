export type Scripture = {
  id: string;
  book: string;
  chapter: number;
  verse_from: number;
  verse_to: number | null;
  verse_content: string;
};

export type FavoriteScriptures = Scripture & {
  scripture_id: string;
  created_at: string;
}

export type Card = {
  scripture: string;
  verseContent: string;
};

export function buildScriptureRef(s: Scripture): string {
  const ref = `${s.book} ${s.chapter}:${s.verse_from}`;
  return s.verse_to ? `${ref}-${s.verse_to}` : ref;
}

export enum MemorizeMode {
  GuessScriptureFromVerseContent = 'GuessScriptureFromVerseContent',
  GuessVerseContentFromScripture = 'GuessVerseContentFromScripture',
  GuessEither = 'GuessEither'
}
