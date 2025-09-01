import { useEffect, useMemo, useState } from 'react';
import { listFavoritesPage, markAsMemorized } from '../services/db';

const PAGE_SIZE = 20;

export default function FavoriteGemsPage() {
    const [page, setPage] = useState(0);
    const [rows, setRows] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [busy, setBusy] = useState(false);
    const [sel, setSel] = useState<Record<string, boolean>>({});

    useEffect(() => {
        (async () => {
            const { rows, total } = await listFavoritesPage(page, PAGE_SIZE);
            setRows(rows);
            setTotal(total);
            setSel({});
        })();
    }, [page]);

    const selectedIds = useMemo(() => Object.keys(sel).filter(k => sel[k]), [sel]);
    const pages = Math.ceil(total / PAGE_SIZE);

    const toggle = (id: string) => setSel(s => ({ ...s, [id]: !s[id] }));
    const toggleAll = () => {
        if (selectedIds.length === rows.length) setSel({});
        else setSel(Object.fromEntries(rows.map(r => [r.id, true])));
    };

    async function handleMarkMemorized() {
        if (!selectedIds.length) return;
        setBusy(true);
        try {
            await markAsMemorized(selectedIds, 60);
            const { rows: r2, total: t2 } = await listFavoritesPage(page, PAGE_SIZE);
            if (r2.length === 0 && page > 0) {
                const prevPage = page - 1;
                const { rows: r3, total: t3 } = await listFavoritesPage(prevPage, PAGE_SIZE);
                setPage(prevPage);
                setRows(r3);
                setTotal(t3);
            } else {
                setRows(r2);
                setTotal(t2);
            }
            setSel({});
        } finally {
            setBusy(false);
        }
    }

    return (
        <section className="py-4">
            <header className="mb-3">
                <h1 className="text-xl font-semibold">Gems I want to memorize</h1>
                <p className="text-slate-400 text-sm">
                    Select scriptures and mark them as memorized. They’ll move to your memorized list.
                </p>
            </header>

            <div className="overflow-x-auto rounded-md border border-slate-800">
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
                        <th className="px-3 py-2 text-left text-slate-400">Added</th>
                    </tr>
                    </thead>
                    <tbody>
                    {rows.map(r => (
                        <tr key={r.id} className="border-t border-slate-800 align-top">
                            <td className="px-3 py-2">
                                <input type="checkbox" checked={!!sel[r.id]} onChange={() => toggle(r.id)} />
                            </td>
                            <td className="px-3 py-2 font-medium">{r.card.scripture}</td>
                            <td className="px-3 py-2 text-slate-300">{r.card.verseContent}</td>
                            <td className="px-3 py-2 text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</td>
                        </tr>
                    ))}
                    {rows.length === 0 && (
                        <tr>
                            <td colSpan={4} className="px-3 py-6 text-slate-400">
                                No favorites yet. Add some from the practice view.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            <div className="mt-8 flex items-center gap-3">
                <button
                    disabled={page === 0}
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    className="rounded-sm bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 disabled:opacity-60"
                >
                    ‹ Prev
                </button>
                <div className="text-sm text-slate-300">
                    Page {page + 1} of {Math.max(pages, 1)}
                </div>
                <button
                    onClick={() => setPage(p => (p + 1 < pages ? p + 1 : p))}
                    disabled={page + 1 >= pages}
                    className="rounded-sm bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 disabled:opacity-60"
                >
                    Next ›
                </button>
                <div className="ml-auto">
                    <button
                        disabled={!selectedIds.length || busy}
                        onClick={handleMarkMemorized}
                        className="rounded-md bg-purple-900/90 hover:bg-slate-700 text-white px-3 py-2 disabled:opacity-60"
                    >
                        Mark selected as memorized
                    </button>
                </div>
            </div>
        </section>
    );
}
