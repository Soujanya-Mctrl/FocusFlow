'use client';

import { useUser } from '@clerk/nextjs';
import { useCallback, useEffect } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { Task, useTaskStore } from '@/store/useTaskStore';
import { useTimerStore } from '@/store/useTimerStore';

type RemoteTaskRow = {
    id: string;
    title: string;
    completed: boolean;
    created_at: number | string;
    section?: string;
};

type RemoteSettingsRow = {
    user_id: string;
    breaks_left: number;
    mode: 'idle' | 'focus' | 'break';
    remaining_time: number;
    is_running: boolean;
    updated_at?: string;
};

export function StoreSync() {
    const { user, isLoaded } = useUser();
    const supabase = useSupabase();
    const setTasks = useTaskStore((state) => state.setTasks);

    // Timer State
    const mode = useTimerStore((state) => state.mode);
    const isRunning = useTimerStore((state) => state.isRunning);
    const breaksLeft = useTimerStore((state) => state.breaksLeft);
    const setSettings = useTimerStore((state) => state.setSettings);

    const pullTasks = useCallback(async (userId: string) => {
        if (!supabase) return;

        const { data: remoteTasks, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error || !remoteTasks) return;

        const formattedTasks: Task[] = (remoteTasks as RemoteTaskRow[]).map((task) => ({
            id: task.id,
            title: task.title,
            listId: task.section || 'personal',
            status: task.completed ? 'done' : 'todo',
            notes: '',
            loggedMinutes: 0,
            subtasks: [],
            tags: [],
            createdAt: typeof task.created_at === 'number'
                ? task.created_at
                : new Date(task.created_at).getTime(),
            completedAt: task.completed ? Date.now() : undefined,
        }));

        setTasks(formattedTasks);
    }, [setTasks, supabase]);

    const applyRemoteSettings = useCallback((remoteSettings: RemoteSettingsRow) => {
        let finalRemainingTime = remoteSettings.remaining_time;

        if (remoteSettings.is_running && remoteSettings.updated_at) {
            const elapsedSinceSync = Math.floor((Date.now() - new Date(remoteSettings.updated_at).getTime()) / 1000);
            finalRemainingTime = Math.max(0, remoteSettings.remaining_time - elapsedSinceSync);
        }

        const currentTimer = useTimerStore.getState();
        const hasChanges =
            currentTimer.breaksLeft !== remoteSettings.breaks_left ||
            currentTimer.mode !== remoteSettings.mode ||
            currentTimer.remainingTime !== finalRemainingTime ||
            currentTimer.isRunning !== remoteSettings.is_running;

        if (!hasChanges) return;

        setSettings({
            breaksLeft: remoteSettings.breaks_left,
            mode: remoteSettings.mode,
            remainingTime: finalRemainingTime,
            isRunning: remoteSettings.is_running,
        });
    }, [setSettings]);

    const pullSettings = useCallback(async (userId: string) => {
        if (!supabase) return;

        const { data: remoteSettings, error } = await supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

        if (error || !remoteSettings) return;

        applyRemoteSettings(remoteSettings as RemoteSettingsRow);
    }, [applyRemoteSettings, supabase]);

    const pullData = useCallback(async (userId: string) => {
        await Promise.all([
            pullTasks(userId),
            pullSettings(userId),
        ]);
    }, [pullSettings, pullTasks]);

    const pushSettings = useCallback(async (userId: string) => {
        if (!supabase) return;

        const timerState = useTimerStore.getState();
        const settingsPayload = {
            user_id: userId,
            breaks_left: timerState.breaksLeft ?? 4,
            mode: timerState.mode ?? 'idle',
            remaining_time: timerState.remainingTime ?? 1500,
            is_running: timerState.isRunning ?? false,
            updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
            .from('user_settings')
            .upsert(settingsPayload, { onConflict: 'user_id' });

        if (error) {
            console.error('Error syncing settings:', error);
        }
    }, [supabase]);

    // 1. Pull on Login (Once per user session)
    useEffect(() => {
        if (!isLoaded || !user || !supabase) return;
        void pullData(user.id);
    }, [isLoaded, pullData, supabase, user]);

    // 2. Push timer controls/settings changes quickly.
    useEffect(() => {
        if (!isLoaded || !user || !supabase) return;

        const timer = setTimeout(() => {
            void pushSettings(user.id);
        }, 250);

        return () => clearTimeout(timer);
    }, [breaksLeft, isLoaded, isRunning, mode, pushSettings, supabase, user]);

    // 2b. While running, publish a light heartbeat so late-joining devices stay in sync.
    useEffect(() => {
        if (!isLoaded || !user || !supabase || !isRunning) return;

        const interval = window.setInterval(() => {
            void pushSettings(user.id);
        }, 5000);

        return () => {
            window.clearInterval(interval);
        };
    }, [isLoaded, isRunning, pushSettings, supabase, user]);

    // 3. Subscribe to realtime updates so other devices reflect timer/tasks immediately.
    useEffect(() => {
        if (!isLoaded || !user || !supabase) return;

        const channel = supabase
            .channel(`focus-flow-sync-${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'tasks',
                    filter: `user_id=eq.${user.id}`,
                },
                () => {
                    void pullTasks(user.id);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'user_settings',
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    const next = payload.new as Partial<RemoteSettingsRow>;
                    if (!next || !next.user_id) return;
                    applyRemoteSettings(next as RemoteSettingsRow);
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    void pullData(user.id);
                }
            });

        return () => {
            void supabase.removeChannel(channel);
        };
    }, [applyRemoteSettings, isLoaded, pullData, pullTasks, supabase, user]);

    // 4. Fallback periodic reconciliation for environments where realtime is unavailable.
    useEffect(() => {
        if (!isLoaded || !user || !supabase) return;

        const interval = window.setInterval(() => {
            void pullData(user.id);
        }, 15000);

        return () => {
            window.clearInterval(interval);
        };
    }, [isLoaded, pullData, supabase, user]);

    return null;
}
