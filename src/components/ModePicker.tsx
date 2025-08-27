import { MemorizeMode } from '../types/cards';
import { PREVIEW_MAP } from '../data/preview';
import ModeCardPreview from './ModeCardPreview';

type Props = {
  onPick: (mode: MemorizeMode) => void;
};

const MODE_COPY: Record<MemorizeMode, { title: string; desc: string; cta: string }> = {
  [MemorizeMode.GuessScriptureFromVerseContent]: {
    title: 'Guess Scripture from Verse',
    desc: 'See the verse text; recall the scripture reference.',
    cta: 'Start (Scripture from Verse)',
  },
  [MemorizeMode.GuessVerseContentFromScripture]: {
    title: 'Guess Verse from Scripture',
    desc: 'See the scripture; recall the verse text.',
    cta: 'Start (Verse from Scripture)',
  },
  [MemorizeMode.GuessEither]: {
    title: 'Guess Either at Random',
    desc: 'Sometimes the scripture, sometimes the verse is hidden.',
    cta: 'Start (Random)',
  },
};

export default function ModePicker({ onPick }: Props) {
  const modes: MemorizeMode[] = [
    MemorizeMode.GuessScriptureFromVerseContent,
    MemorizeMode.GuessVerseContentFromScripture,
    MemorizeMode.GuessEither,
  ];

  return (
    <section aria-label="Choose practice mode" className="mt-6">
      <h2 className="text-xl font-semibold text-slate-100 mb-2">Choose a mode</h2>
      <p className="text-slate-400 mb-4">Preview how each mode looks, then pick one to begin.</p>

      <div className="grid gap-5 md:grid-cols-3">
        {modes.map((mode) => {
          const info = MODE_COPY[mode];
          const p = PREVIEW_MAP[mode];

          return (
            <article
              key={mode}
              className="rounded-md border border-slate-800/80 bg-gradient-to-b from-slate-900/60 to-slate-950/80 p-3 shadow-xl hover:shadow-2xl hover:border-slate-700 transition-all grid"
            >
              <header className="p-5">
                <h3 className="text-lg font-semibold text-slate-100">{info.title}</h3>
                <p className="text-slate-400 text-sm mt-1">{info.desc}</p>
              </header>

              <div className="px-5">
                <ModeCardPreview
                  scripture={p.scripture}
                  verseContent={p.verseContent}
                  hidden={p.hidden}
                />
              </div>

              <div className="p-4 py-8">
                <button
                  onClick={() => onPick(mode)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-purple-900/90 hover:bg-emerald-500 text-white font-medium py-2.5 transition-colors"
                >
                  {info.cta}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}