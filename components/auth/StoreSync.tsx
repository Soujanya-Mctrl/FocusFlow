'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { Task, useTaskStore } from '@/store/useTaskStore';
import { useTimerStore } from '@/store/useTimerStore';

export function StoreSync() {
    const { user, isLoaded } = useUser();
    const supabase = useSupabase();
    const setTasks = useTaskStore((state) => state.setTasks);

    // Timer State
    const mode = useTimerStore((state) => state.mode);
    const remainingTime = useTimerStore((state) => state.remainingTime);
    const isRunning = useTimerStore((state) => state.isRunning);
    const breaksLeft = useTimerStore((state) => state.breaksLeft);
    const setSettings = useTimerStore((state) => state.setSettings);

    // 1. Pull on Login (Once per user session)
    useEffect(() => {
        if (!isLoaded || !user) return;

        const pull = async () => {
            await pullData(user.id);
        };

        pull();
    }, [isLoaded, user?.id, supabase]);

    // 2. Push Settings ONLY
    useEffect(() => {
        if (!isLoaded || !user || !supabase) return;

        const timer = setTimeout(() => {
            pushSettings(user.id);
        }, 1000); // Debounce settings updates

        return () => clearTimeout(timer);
    }, [breaksLeft, mode, isRunning, user, supabase]);


    async function pullData(userId: string) {
        if (!supabase) return;
        console.log('🔄 Checking for remote data sync...');

        // Pull Tasks
        const { data: remoteTasks, error: taskError } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (!taskError && remoteTasks && remoteTasks.length > 0) {
            console.log('✅ Tasks pulled successfully');

            const formattedTasks: Task[] = remoteTasks.map(t => ({
                id: t.id,
                title: t.title,
                completed: t.completed,
                created_at: t.created_at,
                section: t.section || 'today'
            }));

            setTasks(formattedTasks);
        }

        // Pull Settings
        const { data: remoteSettings, error: settingsError } = await supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

        if (!settingsError && remoteSettings) {
            console.log('✅ Settings & Timer pulled successfully');

            let finalRemainingTime = remoteSettings.remaining_time;

            // If the timer was running on the other device, calculate the elapsed time
            if (remoteSettings.is_running && remoteSettings.updated_at) {
                const elapsedSinceSync = Math.floor((Date.now() - new Date(remoteSettings.updated_at).getTime()) / 1000);
                finalRemainingTime = Math.max(0, remoteSettings.remaining_time - elapsedSinceSync);
            }

            setSettings({
                breaksLeft: remoteSettings.breaks_left,
                mode: remoteSettings.mode,
                remainingTime: finalRemainingTime,
                isRunning: remoteSettings.is_running
            });
        }
    }

    async function pushSettings(userId: string) {
        if (!supabase) return;

        console.log('⚙️ Syncing settings to remote...');

        const settingsPayload = {
            user_id: userId,
            breaks_left: breaksLeft ?? 4,
            mode: mode || "idle",
            remaining_time: remainingTime ?? 1500,
            is_running: isRunning || false,
            updated_at: new Date().toISOString()
        };

        const { error: settingsError } = await supabase
            .from('user_settings')
            .upsert(settingsPayload, { onConflict: 'user_id' });

        if (settingsError) console.error('Error syncing settings:', settingsError);
    }

    return null;
}
