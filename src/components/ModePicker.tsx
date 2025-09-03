import { MemorizeMode } from '../types/cards';
import { PREVIEW_MAP } from '../data/preview';
import ModeCardPreview from './ModeCardPreview';

type Props = {
  onPick: (mode: MemorizeMode) => void;
  activeMode?: MemorizeMode;
  variant?: 'full' | 'compact';
  onClose?: () => void;
};

const MODE_COPY: Record<MemorizeMode, { title: string; desc: string; cta: string }> = {
  [MemorizeMode.GuessScriptureFromVerseContent]: {
    title: 'Guess Scripture from Verse',
    desc: 'See the verse text; recall the scripture reference.',
    cta: 'Start',
  },
  [MemorizeMode.GuessVerseContentFromScripture]: {
    title: 'Guess Verse from Scripture',

    desc: 'See the scripture; recall the verse text.',
    cta: 'Start',
  },
  [MemorizeMode.GuessEither]: {
    title: 'Guess Either at Random',
    desc: 'Sometimes the scripture, sometimes the verse is hidden.',
    cta: 'Start',
  },
};

export default function ModePicker({ onPick, activeMode, variant = 'full', onClose }: Props) {
  const modes: MemorizeMode[] = [
    MemorizeMode.GuessScriptureFromVerseContent,
    MemorizeMode.GuessVerseContentFromScripture,
    MemorizeMode.GuessEither,
  ];

  const isCompact = variant === 'compact';

  return (
    <section aria-label="Choose practice mode" className={isCompact ? '' : 'mt-6'}>
      {!isCompact && (
          <>
            <h2 className="text-xl font-semibold text-slate-100 mb-2">Choose a mode</h2>
            <p className="text-xl font-semibold text-slate-100 mb-2">Preview how each mode looks, then pick one to begin.</p>
          </>
      )}

      <div className={`grid gap-4 ${isCompact ? 'md:grid-cols-3' : 'md-grid-cols-3'}`}>
        {modes.map((mode) => {
          const info = MODE_COPY[mode];
          const p = PREVIEW_MAP[mode];
          const active = mode === activeMode;

          return (
              <article
                  key={mode}
                  className={[
                      'rounded-md border border-slate-800/80 bg-gradient-to-b p-3 shadow-xl transition-all grid gap-3',
                      'from-slate-900/60 to-slate-950/80',
                      active ? 'border-emerald-500/60 shadow-emerald-500/10' : 'border-slate-800/80 hover:shadow-2xl hover:border-slate-700',
                  ].join(' ')}
              >
                <header className={isCompact ? 'px-3 pt-2' : 'p-5'}>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base md:text-md font-semibold text-slate-100">{info.title}</h3>
                    {active && (
                        <span className="rounded-full bg-emerald-500/20 text-emerald-300 text-xs px-2 py-0.5">
                          Current
                        </span>
                    )}
                  </div>
                  <p className={`text-slate-400 ${isCompact ? 'text-(13px) mt-4' : 'text-sm mt-1'}`}>
                    {info.desc}
                  </p>
                </header>

                <div className={isCompact ? 'px-3 mt-4' : 'px-5'}>
                  <ModeCardPreview
                      scripture={p.scripture}
                      verseContent={p.verseContent}
                      hidden={p.hidden}
                  />
                </div>

                <div className={isCompact ? 'p-3 py-4 mt-4' : 'p-4 py-8'}>
                  <button
                      onClick={() => {
                        onPick(mode);
                        onClose?.();
                      }}
                      className={[
                        'w-full inline-flex items-center justify-center gap-2 rounded-sm font-medium py-2 transition-colors',
                        active
                            ? 'bg-emerald-600 text-white cursor-not-allowed opacity-40'
                            : 'bg-purple-900/90 hover:bg-emerald-500 text-white',
                      ].join(' ')}
                      disabled={active}
                  >
                    {info.cta}
                  </button>
                </div>
              </article>
          )
        })}
      </div>
    </section>
  );
}
