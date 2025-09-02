import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSession } from '../hooks/useSession';
import { supabase } from '../lib/supabase';

function NavItem({ to, children, onClick }: { to: string; children: ReactNode; onClick?: () => void }) {
    const base = 'block px-3 py-2 rounded-md text-sm';
    return (
        <NavLink
            to={to}
            onClick={onClick}
            className={({ isActive }) =>
                `${base} ${isActive ? 'bg-slate-800 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'}`
            }
        >
            {children}
        </NavLink>
    );
}

export default function Header() {
    const { user } = useSession();
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    const close = () => setOpen(false);

    async function handleSignOut() {
        await supabase.auth.signOut();
        setOpen(false);
        navigate('/');
    }

    // Public links (visible to everyone)
    const publicLinks = (
        <>
            <NavItem to="/memorize" onClick={close}>Memorize</NavItem>
        </>
    );

    // Protected links (only when authed)
    const authedLinks = (
        <>
            <NavItem to="/favorites/practice" onClick={close}>Favorites (Due)</NavItem>
            <NavItem to="/favorites" onClick={close}>Gems I want to memorize</NavItem>
            <NavItem to="/memorized" onClick={close}>Memorized Gems</NavItem>
            <NavItem to="/favorites/add" onClick={close}>Add Favorites</NavItem>
        </>
    );

    return (
        <header className="sticky top-0 z-40 bg-slate-800 backdrop-blur">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <Link to="/" className="text-lg font-semibold tracking-tight text-white">
                    Memorize Gems
                </Link>

                {/* Desktop nav */}
                <nav className="hidden md:flex items-center gap-2">
                    {publicLinks}
                    {user && authedLinks}
                    <div className="w-px h-5 bg-slate-800 mx-2" />
                    {!user ? (
                        <Link
                            to="/reauth"
                            className="px-3 py-1.5 rounded-md text-sm bg-purple-900/90 hover:bg-emerald-500 text-white"
                        >
                            Sign in
                        </Link>
                    ) : (
                        <button
                            onClick={handleSignOut}
                            className="px-3 py-1.5 rounded-md text-sm bg-slate-800 hover:bg-slate-700 text-white"
                        >
                            Sign out
                        </button>
                    )}
                </nav>

                {/* Mobile hamburger */}
                <button
                    className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-slate-300 hover:bg-slate-800/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    aria-label="Open menu"
                    aria-expanded={open}
                    onClick={() => setOpen((v) => !v)}
                >
                    {/* icon */}
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                        {open ? (
                            <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        ) : (
                            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile drawer */}
            {open && (
                <div className="md:hidden border-t border-slate-800/60 bg-slate-950">
                    <nav className="container mx-auto px-4 py-3 grid gap-1">
                        {publicLinks}
                        {user && authedLinks}
                        <div className="h-px bg-slate-800 my-2" />
                        {!user ? (
                            <Link
                                to="/reauth"
                                onClick={close}
                                className="block text-center px-3 py-2 rounded-md text-sm bg-purple-900/90 hover:bg-emerald-500 text-white"
                            >
                                Sign in
                            </Link>
                        ) : (
                            <button
                                onClick={handleSignOut}
                                className="w-full text-center px-3 py-2 rounded-md text-sm bg-slate-800 hover:bg-slate-700 text-white"
                            >
                                Sign out
                            </button>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
}
