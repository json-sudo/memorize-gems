import { useState, useEffect } from 'react';
import { isFavorite } from '../services/db';
import { addFavorite, removeFavorite } from '../services/db';

type Props = {
    scriptureId?: string;
}

export default function FavoriteToggle({ scriptureId }: Props) {
    const [busy, setBusy] = useState(false);
    const [fav, setFav] = useState<boolean>(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            if (!scriptureId) return;
            try {
                const v = await isFavorite(scriptureId);
                if (!cancelled) setFav(v);
            } catch {
                console.log('Failed to check favorite status');
            }
        })();
        return () => { cancelled = true; };
    }, [scriptureId]);

    async function toggle() {
        if (!scriptureId || busy) return;
        setBusy(true);
        try {
            if (fav) await removeFavorite(scriptureId);
            else await addFavorite(scriptureId);
            setFav(!fav);
        } finally {
            setBusy(false);
        }
    }

    if (!scriptureId) {
        return null;
    }

    return (
        <button
            onClick={toggle}
            disabled={busy}
            className={[
                'rounded-md px-3 py-1.5 text-sm',
                fav ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-100',
                busy ? 'opacity-60' : '',
            ].join(' ')}
            aria-pressed={fav}
            aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
        >
            {fav ? '★ Favorited (remove)' : '☆ Add to favorites'}
        </button>
    );
}
