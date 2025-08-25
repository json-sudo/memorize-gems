import type { Card } from '../types/cards';

type Props = {
  shown: Partial<Card>;
  hiddenKey: keyof Card;
  reveal: boolean;
  onReveal: () => void;
  onNext: () => void;
  onPrev: () => void;
  index: number;
  total: number;
};

export default function Flashcard({
  shown,
  hiddenKey,
  reveal,
  onReveal,
  onNext,
  onPrev,
  index,
  total
}: Props) {
  return (
    <section className="flashcard" aria-label="Flashcard">
      <div className="card-body">
        <dl>
          {'scripture' in shown && (
            <>
              <dt>Scripture</dt>
              <dd>{shown.scripture}</dd>
            </>
          )}
          {'verseContent' in shown && (
            <>
              <dt>What the Scripture says</dt>
              <dd>{shown.verseContent}</dd>
            </>
          )}
          {/* Hidden piece */}
          <dt>{hiddenKey === 'verseContent' ? 'Other detail' : hiddenKey[0].toUpperCase() + hiddenKey.slice(1)}</dt>
          <dd className={!reveal ? 'masked' : ''}>
            {reveal ? '<revealed>' : '••••• tap Reveal'}
          </dd>
        </dl>

        <div className="controls">
          <button onClick={onPrev} aria-label="Previous card">‹ Prev</button>
          {!reveal && (
            <button onClick={onReveal} aria-label="Reveal answer">Reveal</button>
          )}
          <button onClick={onNext} aria-label="Next card">Next ›</button>
        </div>

        <div className="meta">
          {index + 1} / {total}
        </div>
      </div>
    </section>
  );
}
