import { createClient } from '@supabase/supabase-js';
import { useSession } from '@clerk/nextjs';
import { useMemo, useEffect } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let currentSession: any = null;

async function supabaseFetch(input: RequestInfo | URL, init?: RequestInit) {
    const token = await currentSession?.getToken({ template: 'supabase' });
    const headers = new Headers(init?.headers);
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    return fetch(input, {
        ...init,
        headers,
    });
}

const globalSupabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
        },
        global: {
            fetch: supabaseFetch,
        },
    }
);

export function useSupabase() {
    const { session } = useSession();
    
    // Update the current session reference so the singleton's fetch can use it
    useEffect(() => {
        if (session) {
            currentSession = session;
        }
    }, [session]);

    return useMemo(() => {
        if (!session) return null;
        return globalSupabaseClient;
    }, [session]);
}
