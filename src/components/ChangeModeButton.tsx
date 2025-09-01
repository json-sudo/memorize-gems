import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ModePicker from './ModePicker';
import { MemorizeMode } from '../types/cards';

export default function ChangeModeButton() {
    const [open, setOpen] = React.useState(false);
    const [params] = useSearchParams();
    const navigate = useNavigate();

    const current = (params.get('mode') as MemorizeMode) ?? MemorizeMode.GuessEither;

    const handlePick = (mode: MemorizeMode) => {
        setOpen(false);
        navigate(`/?mode=${encodeURIComponent(mode)}`);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(o => !o)}
                className="rounded-md bg-slate-800 hover:bg-slate-700 px-3 py-1.5"
                aria-haspopup="dialog"
                aria-expanded={open}
                aria-label="Change practice mode"
                title={`Current: ${current}`}
            >
                Change mode
            </button>

            {open && (
                <div
                    className="absolute right-0 z-50 mt-2 w-[780px] max-w-[95vw] rounded-xl border border-slate-700 bg-slate-900/95 shadow-2xl backdrop-blur"
                    role="dialog"
                    aria-label="Choose practice mode"
                >
                    <div className="p-4">
                        <ModePicker
                            variant="compact"
                            onPick={handlePick}
                            activeMode={current}
                            onClose={() => setOpen(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
