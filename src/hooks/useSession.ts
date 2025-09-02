import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useSession() {
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<import('@supabase/supabase-js').Session | null>(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            const { data } = await supabase.auth.getSession();
            if (mounted) {
                setSession(data.session ?? null);
                setLoading(false);
            }
        })();

        const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
            setSession(sess ?? null);
        });

        return () => {
            mounted = false;
            sub.subscription.unsubscribe();
        };
    }, []);

    return { loading, session, user: session?.user ?? null };
}
