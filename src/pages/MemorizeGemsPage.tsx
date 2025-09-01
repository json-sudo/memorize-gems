import { useMemo, useEffect, useState } from 'react';
import { MemorizeMode, type Card } from '../types/cards';
import Flashcard from '../components/Flashcard';
import { useFlashcards } from '../hooks/useFlashcards';
import { fetchDefaultGems, fetchFavoritesDueCards, fetchPracticeSet } from '../services/db';

type Props = {
  mode: MemorizeMode;
  onBack: () => void;
  source: 'default' | 'favoritesDue' | 'auto';
};

export default function MemorizeGemsPage({ mode, onBack, source }: Props) {
  const [dataset, setDataset] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);


  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        let cards: Card[] = [];
        if (source === 'default') {
          cards = await fetchDefaultGems(10);
        } else if (source === 'favoritesDue') {
          cards = await fetchFavoritesDueCards(60);
        } else {
          cards = await fetchPracticeSet(10, 60);
        }
        if (!cancelled) setDataset(cards);
      } catch (e: unknown) {
        if (!cancelled) {
          if (e instanceof Error) setErr(e.message);
          else setErr('Failed to load cards');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [source]);

  const total = useMemo(() => dataset.length, [dataset.length]);

  const { index, card, prompt, reveal, next, prev, onReveal } =
    useFlashcards(dataset, mode);

  if (loading) {
    return (
      <main className="container">
        <header className="row between">
          <button onClick={onBack} aria-label="Back to home">← Back</button>
          <h1>Memorize</h1>
          <div style={{ width: 80 }} />
        </header>
        <div className="text-slate-400">Loading…</div>
      </main>
    );
  }

  if (err) {
    return (
      <main className="container">
        <header className="row between">
          <button onClick={onBack} aria-label="Back to home">← Back</button>
          <h1>Memorize</h1>
          <div style={{ width: 80 }} />
        </header>
        <div className="text-red-400 text-sm">{err}</div>
      </main>
    );
  }

  if (total === 0) {
    return (
      <main className="container">
        <header className="row between">
          <button onClick={onBack} aria-label="Back to home">← Back</button>
          <h1>Memorize</h1>
          <div style={{ width: 80 }} />
        </header>
        <div className="text-slate-400">
          {source === 'favoritesDue'
            ? 'No favorites are currently due. Try again later or add more favorites.'
            : 'No scriptures found.'}
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <header className="row between">
        <button onClick={onBack} aria-label="Back to home">← Back</button>
        <h1>Memorize</h1>
        <div style={{ width: 80 }} />
      </header>

      <Flashcard
        card={card}
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
