import ModePicker from '../components/ModePicker';
import { MemorizeMode } from '../types/cards';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function ModePage() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const current = (params.get('mode') as MemorizeMode) ?? MemorizeMode.GuessEither;

    return (
        <main className="container py-4">
            <h1 className="text-2xl font-semibold mb-2">Choose practice mode</h1>
            <p className="text-slate-400 mb-6">Pick how you want to practice. You can change this any time.</p>
            <ModePicker
                activeMode={current}
                onPick={(mode) => navigate(`/?mode=${encodeURIComponent(mode)}`)}
                variant="full"
            />
        </main>
    );
}
