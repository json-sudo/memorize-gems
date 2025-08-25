import ModePicker from '../components/ModePicker';
import { MemorizeMode } from '../types/cards';

type Props = {
  onPickMode: (mode: MemorizeMode) => void;
};

export default function HomePage({ onPickMode }: Props) {
  return (
    <main className="container">
      <header>
        <h1>Flashcards</h1>
        <p>Memorize your favorite scriptures in three modes. Pick one to start.</p>
      </header>

      <ModePicker onPick={onPickMode} />
    </main>
  );
}
