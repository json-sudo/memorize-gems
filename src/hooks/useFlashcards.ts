import { useEffect, useMemo, useState, useCallback } from 'react';
import type { Card } from '../types/cards';
import { MemorizeMode } from '../types/cards';

type Prompt = {
  shown: Partial<Card>;
  hiddenKey: keyof Card;
};

function buildPrompt(card: Card, mode: MemorizeMode): Prompt {
  if (!card) {
    return {
      shown: {} as Partial<Card>,
      hiddenKey: 'scripture'
    }
  }

  switch (mode) {
    case MemorizeMode.GuessScriptureFromVerseContent:
      return {
        shown: { verseContent: card.verseContent },
        hiddenKey: 'scripture',
      };

    case MemorizeMode.GuessVerseContentFromScripture:
      return {
        shown: { scripture: card.scripture },
        hiddenKey: 'verseContent',
      };

    case MemorizeMode.GuessEither: {
      const hide = (Math.random() < 0.5 ? 'scripture' : 'verseContent');
      const shown: Partial<Card> =
          hide === 'scripture'
              ? { verseContent: card.verseContent }
              : { scripture: card.scripture };
      return { shown, hiddenKey: hide };
    }

    default:
      return {
        shown: { verseContent: card.verseContent },
        hiddenKey: 'scripture',
      };
  }
}

export function useFlashcards(dataset: Card[], mode: MemorizeMode) {
  const [index, setIndex] = useState(0);
  const [reveal, setReveal] = useState(false);

  const total = dataset.length;

  useEffect(() => {
    if (total === 0) {
      if (index !== 0) setIndex(0);
      if (reveal) setReveal(false);
      return;
    }
    if (index >= total) {
      setIndex(0);
      setReveal(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  useEffect(() => {
    setReveal(false);
  }, [index, mode]);

  const card = total ? dataset[index] : undefined;
  const prompt = useMemo(() => buildPrompt(card, mode), [card, mode]);

  const next = useCallback(() => {
    if (total === 0) return;
    setIndex((i) => (i + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    if (total === 0) return;
    setIndex((i) => (i - 1 + total) % total);
  }, [total]);

  const onReveal = useCallback(() => setReveal(true), []);

  return {
    index,
    total,
    card,
    prompt,
    reveal,
    next,
    prev,
    onReveal
  };
}
