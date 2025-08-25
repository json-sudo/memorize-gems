import { MemorizeMode } from '../types/cards';

type Props = {
  onPick: (mode: MemorizeMode) => void;
};

export default function ModePicker({ onPick }: Props) {
  return (
    <section aria-label="Choose practice mode" className="mode-picker">
      <h2>Choose a mode</h2>
      <div className="mode-grid">
        <button onClick={() => onPick(MemorizeMode.GuessScriptureFromVerseContent)}>
          Remember Scripture (from Verse)
        </button>
        <button onClick={() => onPick(MemorizeMode.GuessVerseContentFromScripture)}>
          Remember Verse (from Scripture)
        </button>
        <button onClick={() => onPick(MemorizeMode.GuessEither)}>
          Remember Either (at Random)
        </button>
      </div>
    </section>
  );
}
