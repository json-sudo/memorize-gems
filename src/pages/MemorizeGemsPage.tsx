import { useMemo, useEffect, useState } from 'react';
import { DATASET } from '../data/dataset';
import { MemorizeMode, type Card } from '../types/cards';
import Flashcard from '../components/Flashcard';
import { useFlashcards } from '../hooks/useFlashcards';
import { fetchScripturesPage, fetchDefaultGems, fetchFavoritesDue } from '../services/db';

type Props = {
  mode: MemorizeMode;
  onBack: () => void;
  source: 'all' | 'favoritesDue' | 'default';
};

export default function MemorizeGemsPage({ mode, onBack, source }: Props) {
  const [dataset, setDataset] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);


  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true); setErr(null);
      try {
        const cards = source === 'all'
          ? await fetchDefaultGems(10)     // adjust pagination later
          : await fetchFavoritesDue(60);                         // 60-day blackout default
        if (!cancelled) setDataset(cards);
      } catch (e: unknown) {
        if (!cancelled) {
          if (e instanceof Error) setErr(e.message);
          if (typeof e === 'string') setErr(`Failed to load cards: ${e}`);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [source]);

  const { index, card, prompt, reveal, next, prev, onReveal } =
    useFlashcards(dataset, mode);

  const total = useMemo(() => DATASET.length, []);

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

  if (!loading && total === 0) {
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
