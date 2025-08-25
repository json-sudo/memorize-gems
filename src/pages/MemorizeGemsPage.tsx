import React, { useMemo } from 'react';
import { DATASET } from '../data/dataset';
import { MemorizeMode } from '../types/cards';
import Flashcard from '../components/Flashcard';
import { useFlashcards } from '../hooks/useFlashcards';

type Props = {
  mode: MemorizeMode;
  onBack: () => void;
};

export default function PracticePage({ mode, onBack }: Props) {
  const {
    index, prompt, reveal, next, prev, onReveal
  } = useFlashcards(DATASET, mode);

  const total = useMemo(() => DATASET.length, []);

  return (
    <main className="container">
      <header className="row between">
        <button onClick={onBack} aria-label="Back to home">← Back</button>
        <h1>Memorize</h1>
        <div style={{ width: 80 }} />
      </header>

      <Flashcard
        shown={prompt.shown}
        hiddenKey={prompt.hiddenKey}
        reveal={reveal}
        onReveal={onReveal}
        onNext={next}
        onPrev={prev}
        index={index}
        total={total}
      />
    </main>
  );
}
