import { createClient } from '@supabase/supabase-js';
import { useSession } from '@clerk/nextjs';
import { useMemo } from 'react';

export function useSupabase() {
    const { session } = useSession();

    return useMemo(() => {
        if (!session) return null;

        return createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false,
                    detectSessionInUrl: false,
                },
                global: {
                    fetch: async (url, options = {}) => {
                        const token = await session.getToken({ template: 'supabase' });


                        const headers = new Headers(options.headers);
                        if (token) {
                            headers.set('Authorization', `Bearer ${token}`);
                        }

                        return fetch(url, {
                            ...options,
                            headers,
                        });
                    },
                },
            }
        );
    }, [session]);
}
