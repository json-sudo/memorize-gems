import { useEffect, useMemo, useState } from 'react';
import { addFavorite } from '../services/db';
import { searchScripturesPage } from '../services/db';
import type { Scripture } from '../types/cards';
import { buildScriptureRef } from '../types/cards';

const PAGE_SIZE = 10;

export default function AddFavouriteGemsPage() {
    const [q, setQ] = useState('');
    const [page, setPage] = useState(0);
    const [rows, setRows] = useState<Scripture[]>([]);
    const [total, setTotal] = useState(0);
    const [busy, setBusy] = useState(false);
    const [sel, setSel] = useState<Record<string, boolean>>({});

    async function runSearch(p = 0) {
        setBusy(true);
        try {
            const { rows, total } = await searchScripturesPage(q, p, PAGE_SIZE);
            setRows(rows);
            setTotal(total);
            setSel({});
            setPage(p);
        } finally {
            setBusy(false);
        }
    }

    useEffect(() => {
        runSearch(0);
        /* eslint-disable-next-line */
    }, []);

    const selectedIds = useMemo(() => Object.keys(sel).filter(k => sel[k]), [sel]);
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    const toggle = (id: string) => setSel(s => ({ ...s, [id]: !s[id] }));
    const toggleAll = () => {
        if (rows.length && selectedIds.length === rows.length) setSel({});
        else setSel(Object.fromEntries(rows.map(r => [r.id, true])));
    };

    async function handleAddSelected() {
        if (!selectedIds.length) return;
        setBusy(true);
        try {
            for (const id of selectedIds) {
                try { await addFavorite(id); } catch { /* ignore dup errors via unique(user_id, scripture_id) */ }
            }
            setSel({});
        } finally {
            setBusy(false);
        }
    }

    function nextPage() {
        const next = page + 1;
        if (next < pages) runSearch(next);
    }
    function prevPage() {
        const prev = Math.max(0, page - 1);
        if (prev !== page) runSearch(prev);
    }

    return (
        <section className="py-4">
            <header className="mb-3">
                <h1 className="text-xl font-semibold">Add favorite gems</h1>
                <p className="text-slate-400 text-sm">Search scriptures and add them to your favorites.</p>
            </header>

            <div className="flex gap-2 mb-3">
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && runSearch(0)}
                    placeholder="Search by book or verse text (e.g., 'Psalm', 'gracious')"
                    className="w-full rounded-sm bg-slate-900 border border-slate-800 px-3 py-2 text-sm outline-none focus:border-slate-600"
                />
                <button
                    onClick={() => runSearch(0)}
                    disabled={busy}
                    className="rounded-sm bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 disabled:opacity-60"
                >
                    Search
                </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-sm">
                    <thead className="bg-slate-900/60">
                    <tr>
                        <th className="px-3 py-2 w-10">
                            <input
                                aria-label="Select all"
                                type="checkbox"
                                checked={rows.length > 0 && selectedIds.length === rows.length}
                                onChange={toggleAll}
                            />
                        </th>
                        <th className="px-3 py-2 text-left">Scripture</th>
                        <th className="px-3 py-2 text-left">Verse</th>
                    </tr>
                    </thead>
                    <tbody>
                    {rows.map((r) => (
                        <tr key={r.id} className="border-t border-slate-800 align-top">
                            <td className="px-3 py-2">
                                <input type="checkbox" checked={!!sel[r.id]} onChange={() => toggle(r.id)} />
                            </td>
                            <td className="px-3 py-2 font-medium">{buildScriptureRef(r)}</td>
                            <td className="px-3 py-2 text-slate-300">{r.verse_content}</td>
                        </tr>
                    ))}
                    {rows.length === 0 && (
                        <tr>
                            <td colSpan={3} className="px-3 py-6 text-slate-400">
                                No results. Try another search.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 flex items-center gap-3">
                <button
                    disabled={page === 0 || busy}
                    onClick={prevPage}
                    className="rounded-sm bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 disabled:opacity-60"
                >
                    ‹ Prev
                </button>
                <div className="text-sm text-slate-300">
                    Page {page + 1} of {pages}
                </div>
                <button
                    disabled={page + 1 >= pages || busy}
                    onClick={nextPage}
                    className="rounded-sm bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 disabled:opacity-60"
                >
                    Next ›
                </button>

                <div className="ml-auto">
                    <button
                        disabled={!selectedIds.length || busy}
                        onClick={handleAddSelected}
                        className="rounded-sm bg-purple-900/90 hover:bg-slate-700 text-white px-3 py-2 disabled:opacity-60"
                    >
                        Add selected to favorites
                    </button>
                </div>
            </div>
        </section>
    );
}
