'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useTaskStore } from '@/store/useTaskStore';
import { useTimerStore } from '@/store/useTimerStore';
import { useUser } from '@clerk/nextjs';

declare global {
    interface Window {
        supabase?: ReturnType<typeof useSupabase>;
        taskStore?: typeof useTaskStore;
        timerStore?: typeof useTimerStore;
    }
}

export function DevTools() {
    const supabase = useSupabase();
    const tasks = useTaskStore(s => s.tasks);
    const timer = useTimerStore(s => s);
    const { user } = useUser();
    const [isVisible, setIsVisible] = useState(false);
    const [dbStatus, setDbStatus] = useState<{
        latency: number | null;
        ok: boolean;
        message: string;
        lastChecked: Date | null;
    }>({ latency: null, ok: false, message: 'Idle', lastChecked: null });
    const [serviceStatus, setServiceStatus] = useState<{
        loading: boolean;
        ok: boolean;
        message: string;
        auth: { ok: boolean; status: number | null; latencyMs: number | null };
        postgrest: { ok: boolean; status: number | null; latencyMs: number | null };
        lastChecked: Date | null;
    }>({
        loading: false,
        ok: false,
        message: 'Idle',
        auth: { ok: false, status: null, latencyMs: null },
        postgrest: { ok: false, status: null, latencyMs: null },
        lastChecked: null
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.supabase = supabase;
            window.taskStore = useTaskStore;
            window.timerStore = useTimerStore;

            console.log('🛠️ DevTools: globals exposed as window.supabase, window.taskStore, window.timerStore');
        }
    }, [supabase]);

    const checkBackend = async () => {
        if (!supabase || !user) {
            setDbStatus({ latency: null, ok: false, message: 'No Auth', lastChecked: new Date() });
            return;
        }

        setDbStatus(prev => ({ ...prev, message: 'Checking...' }));
        const start = performance.now();

        try {
            // Run a lightweight query to test Auth + RLS + DB
            const { count, error } = await supabase
                .from('tasks')
                .select('*', { count: 'exact', head: true });

            const end = performance.now();
            const latency = Math.round(end - start);

            if (error) throw error;

            setDbStatus({
                latency,
                ok: true,
                message: `OK (${count} Tasks)`,
                lastChecked: new Date()
            });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Unknown';
            setDbStatus({
                latency: null,
                ok: false,
                message: `Error: ${message}`,
                lastChecked: new Date()
            });
        }
    };

    const checkServiceHealth = async () => {
        setServiceStatus((prev) => ({ ...prev, loading: true, message: 'Checking...' }));

        try {
            const response = await fetch('/api/health/supabase', { cache: 'no-store' });
            const data = await response.json();

            setServiceStatus({
                loading: false,
                ok: Boolean(data?.ok),
                message: data?.ok ? 'All Healthy' : 'One or more services unhealthy',
                auth: {
                    ok: Boolean(data?.services?.auth?.ok),
                    status: data?.services?.auth?.status ?? null,
                    latencyMs: data?.services?.auth?.latencyMs ?? null,
                },
                postgrest: {
                    ok: Boolean(data?.services?.postgrest?.ok),
                    status: data?.services?.postgrest?.status ?? null,
                    latencyMs: data?.services?.postgrest?.latencyMs ?? null,
                },
                lastChecked: new Date(),
            });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            setServiceStatus({
                loading: false,
                ok: false,
                message: `Probe failed: ${message}`,
                auth: { ok: false, status: null, latencyMs: null },
                postgrest: { ok: false, status: null, latencyMs: null },
                lastChecked: new Date(),
            });
        }
    };

    if (process.env.NODE_ENV === 'production') return null;

    return (
        <div className="fixed bottom-4 right-4 z-[9999] font-mono text-[10px]">
            <button
                onClick={() => setIsVisible(!isVisible)}
                className="bg-black/50 hover:bg-black/80 text-white/50 hover:text-white px-2 py-1 rounded border border-white/10 backdrop-blur"
            >
                {isVisible ? 'Hide DevTools' : '🛠️'}
            </button>

            {isVisible && (
                <div className="mt-2 p-3 bg-black/90 border border-white/10 rounded-lg text-white/80 shadow-xl backdrop-blur-md w-64 space-y-2">
                    <div className="flex justify-between border-b border-white/10 pb-1 items-center">
                        <span className="font-bold text-white">Debug Console</span>
                        <div className="flex gap-2">
                            <button
                                onClick={checkBackend}
                                className="px-1.5 py-0.5 bg-white/10 hover:bg-white/20 rounded text-[9px] text-white transition-colors"
                            >
                                Test DB
                            </button>
                            <button
                                onClick={checkServiceHealth}
                                className="px-1.5 py-0.5 bg-white/10 hover:bg-white/20 rounded text-[9px] text-white transition-colors"
                            >
                                Probe API
                            </button>
                            <span className="text-green-400">● Live</span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between">
                            <span>User:</span>
                            <span className="text-white">{user ? 'Signed In' : 'Guest'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>UID:</span>
                            <span className="text-white/50" title={user?.id}>{user?.id?.slice(0, 8)}...</span>
                        </div>

                        {/* Backend Stats */}
                        <div className="py-1 border-t border-white/5 mt-1">
                            <div className="flex justify-between">
                                <span>DB Connection:</span>
                                <span className={dbStatus.ok ? "text-green-400" : "text-yellow-400"}>
                                    {dbStatus.message}
                                </span>
                            </div>
                            {dbStatus.latency !== null && (
                                <div className="flex justify-between">
                                    <span>Latency:</span>
                                    <span className={dbStatus.latency < 200 ? "text-green-400" : "text-red-400"}>
                                        {dbStatus.latency}ms
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between border-t border-white/5 pt-1 mt-1">
                            <span>Local Tasks:</span>
                            <span className="text-blue-400">{tasks.length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Mode:</span>
                            <span className="text-yellow-400">{timer.mode}</span>
                        </div>

                        <div className="py-1 border-t border-white/5 mt-1">
                            <div className="flex justify-between">
                                <span>Probe:</span>
                                <span className={serviceStatus.ok ? "text-green-400" : "text-yellow-400"}>
                                    {serviceStatus.loading ? 'Checking...' : serviceStatus.message}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Auth:</span>
                                <span className={serviceStatus.auth.ok ? "text-green-400" : "text-red-400"}>
                                    {serviceStatus.auth.status ?? '-'} {serviceStatus.auth.latencyMs !== null ? `(${serviceStatus.auth.latencyMs}ms)` : ''}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>PostgREST:</span>
                                <span className={serviceStatus.postgrest.ok ? "text-green-400" : "text-red-400"}>
                                    {serviceStatus.postgrest.status ?? '-'} {serviceStatus.postgrest.latencyMs !== null ? `(${serviceStatus.postgrest.latencyMs}ms)` : ''}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2 border-t border-white/10 text-white/40 text-[9px]">
                        Accessible via console:<br />
                        window.supabase<br />
                        window.taskStore.getState()
                    </div>
                </div>
            )}
        </div>
    );
}
