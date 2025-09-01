import type { Card } from '../types/cards';
import FavoriteToggle from './FavoriteToggle';

type Props = {
  shown: Partial<Card>;
  hiddenKey: keyof Card;
  reveal: boolean;
  onReveal: () => void;
  onNext: () => void;
  onPrev: () => void;
  index: number;
  total: number;
  card: Card;
};

export default function Flashcard({
  shown,
  hiddenKey,
  reveal,
  onReveal,
  onNext,
  onPrev,
  index,
  total,
  card
}: Props) {
  return (
    <section className="flashcard flex flex-column gap-x-8 mt-12" aria-label="Flashcard">
      <div className="card-body">
        <dl style={{ gap: '36px 124px' }}>
          {'scripture' in shown && (
            <>
              <dt>Scripture</dt>
              <dd>{shown.scripture}</dd>
            </>
          )}
          {'verseContent' in shown && (
            <>
              <dt className='whitespace-nowrap'>What the Scripture says</dt>
              <dd>{shown.verseContent}</dd>
            </>
          )}
          {/* Hidden piece */}
          <dt className="text-slate-400">
            {hiddenKey === 'verseContent'
              ? 'Verse'
              : hiddenKey === 'scripture'
              ? 'Scripture'
              : hiddenKey}
          </dt>
          <dd className={!reveal ? 'masked' : ''}>
            <span
              className={[
                'absolute inset-0',
                'text-slate-400 select-none',
                'transition-all duration-300 ease-out',
                reveal ? 'opacity-0 -translate-y-1 pointer-events-none' : 'opacity-100 translate-y-0'
              ].join(' ')}
            >
              ••••• tap Reveal
            </span>
            <span
              className={[
                'block',
                'transition-all duration-300 ease-out will-change-[filter,opacity,transform]',
                reveal ? 'opacity-100 blur-0 translate-y-0' : 'opacity-0 blur-sm translate-y-1'
              ].join(' ')}
            >
              {reveal ? card[hiddenKey] : '••••• tap Reveal'}
            </span>
          </dd>
        </dl>

        <div className="controls justify-between">
          <button
            onClick={onPrev} aria-label="Previous card" className='control-buttons'>‹ Prev</button>
          {!reveal && (
            <button
              onClick={onReveal}
              aria-label="Reveal answer"
              className='control-buttons reveal'
            >
                Reveal
            </button>
          )}
          <button className='control-buttons' onClick={onNext} aria-label="Next card">Next ›</button>
        </div>

        <div className="meta flex items-center justify-between mt-12">
          {index + 1} / {total}
          <div className="ml-auto">
            <FavoriteToggle scriptureId={card?.id} />
          </div>
        </div>
      </div>
    </section>
  );
}
