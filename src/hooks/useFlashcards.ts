import { useMemo, useState, useCallback } from 'react';
import type { Card } from '../types/cards';
import { MemorizeMode } from '../types/cards';

type Prompt = {
  shown: Partial<Card>;
  hiddenKey: keyof Card; // what the user should guess
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
      const keys: (keyof Card)[] = ['scripture', 'verseContent'];
      const hiddenKey = keys[Math.floor(Math.random() * keys.length)];
      const shown: Partial<Card> = {};
      keys.forEach(k => {
        if (k !== hiddenKey) shown[k] = card[k];
      });
      return { shown, hiddenKey };
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
