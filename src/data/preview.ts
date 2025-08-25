import { DATASET } from './dataset';
import { MemorizeMode } from '../types/cards';

type PreviewItem = {
  scripture: string;
  verseContent: string;
  hidden: 'scripture' | 'verseContent';
};

const A = DATASET[0];
const B = DATASET[1] ?? DATASET[0];
const C = DATASET[2] ?? DATASET[0];

export const PREVIEW_MAP: Record<MemorizeMode, PreviewItem> = {
  [MemorizeMode.GuessScriptureFromVerseContent]: {
    scripture: A.scripture,
    verseContent: A.verseContent,
    hidden: 'scripture',
  },
  [MemorizeMode.GuessVerseContentFromScripture]: {
    scripture: B.scripture,
    verseContent: B.verseContent,
    hidden: 'verseContent',
  },
  [MemorizeMode.GuessEither]: {
    scripture: C.scripture,
    verseContent: C.verseContent,
    hidden: 'scripture',
  },
};
