export type Card = {
  scripture: string;
  verseContent: string;
};

export enum MemorizeMode {
  GuessScriptureFromVerseContent = 'GuessScriptureFromVerseContent',
  GuessVerseContentFromScripture = 'GuessVerseContentFromScripture',
  GuessEither = 'GuessEither'
}