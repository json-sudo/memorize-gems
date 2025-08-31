import { useMemo, useState, useCallback } from 'react';
import type { Card } from '../types/cards';
import { MemorizeMode } from '../types/cards';

type Prompt = {
  shown: Partial<Card>;
  hiddenKey: keyof Card;
};

function buildPrompt(card: Card, mode: MemorizeMode): Prompt {
  switch (mode) {
    case MemorizeMode.GuessScriptureFromVerseContent:
      return {
        shown: { verseContent: card.verseContent },
        hiddenKey: 'scripture'
      };
    case MemorizeMode.GuessVerseContentFromScripture: {
      return {
        shown: { scripture: card.scripture },
        hiddenKey: 'verseContent'
      };
    }
    case MemorizeMode.GuessEither: {
      const hide = Math.random() < 0.5 ? 'scripture' : 'verseContent' as const;
      const shown: Partial<Card> = {};
      if (hide === 'scripture') shown.verseContent = card.verseContent;
      else shown.scripture = card.scripture;
      return { shown, hiddenKey: hide };
    }
    default:
      return {
        shown: { verseContent: card.verseContent },
        hiddenKey: 'scripture'
      };
  }
}

export function useFlashcards(dataset: Card[], mode: MemorizeMode) {
  const [index, setIndex] = useState(0);
  const [reveal, setReveal] = useState(false);

  const card = dataset[index];
  const prompt = useMemo(() => buildPrompt(card, mode), [card, mode]);

  const next = useCallback(() => {
    setIndex(i => (i + 1) % dataset.length);
    setReveal(false);
  }, [dataset.length]);

  const prev = useCallback(() => {
    setIndex(i => (i - 1 + dataset.length) % dataset.length);
    setReveal(false);
  }, [dataset.length]);

  const onReveal = useCallback(() => setReveal(true), []);

  return {
    index,
    card,
    prompt,
    reveal,
    next,
    prev,
    onReveal
  };
}
