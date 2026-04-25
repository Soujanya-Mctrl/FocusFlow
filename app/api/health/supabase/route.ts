import { NextResponse } from 'next/server';

interface ProbeResult {
    ok: boolean;
    status: number | null;
    latencyMs: number | null;
    error: string | null;
}

async function probe(url: string, init?: RequestInit): Promise<ProbeResult> {
    const startedAt = Date.now();

    try {
        const response = await fetch(url, {
            cache: 'no-store',
            ...init,
        });

        return {
            ok: response.status >= 200 && response.status < 500,
            status: response.status,
            latencyMs: Date.now() - startedAt,
            error: null,
        };
    } catch (error) {
        return {
            ok: false,
            status: null,
            latencyMs: Date.now() - startedAt,
            error: error instanceof Error ? error.message : 'Unknown network error',
        };
    }
}

export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey =
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

    if (!supabaseUrl || !anonKey) {
        return NextResponse.json(
            {
                ok: false,
                error: 'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY',
            },
            { status: 500 }
        );
    }

    const commonHeaders = {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
    };

    const [auth, postgrest] = await Promise.all([
        probe(`${supabaseUrl}/auth/v1/health`, {
            method: 'GET',
            headers: commonHeaders,
        }),
        probe(`${supabaseUrl}/rest/v1/`, {
            method: 'GET',
            headers: commonHeaders,
        }),
    ]);

    return NextResponse.json(
        {
            ok: auth.ok && postgrest.ok,
            checkedAt: new Date().toISOString(),
            services: {
                auth,
                postgrest,
            },
        },
        {
            status: auth.ok && postgrest.ok ? 200 : 503,
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate',
            },
        }
    );
}
