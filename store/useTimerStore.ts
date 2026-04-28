import { create } from 'zustand';

type TimerMode = 'idle' | 'focus' | 'break';
type BackgroundMode = 'gradient' | 'lofi' | 'wallpaper' | 'custom';

interface TimerState {
    mode: TimerMode;
    remainingTime: number;
    isRunning: boolean;
    activeTaskId?: string;
    backgroundMode: BackgroundMode;
    breaksLeft: number;
    isBackgroundMuted: boolean;

    setMode: (mode: TimerMode) => void;
    setRemainingTime: (time: number) => void;
    setIsRunning: (isRunning: boolean) => void;
    setActiveTaskId: (id: string | undefined) => void;
    setBackgroundMode: (mode: BackgroundMode) => void;
    setBreaksLeft: (count: number) => void;
    setIsBackgroundMuted: (isMuted: boolean) => void;
    setSettings: (settings: Partial<TimerState>) => void;
    toggleTimer: () => void;
    resetTimer: () => void;
    restartCurrentSession: () => void;
}

import { persist } from 'zustand/middleware';

export const useTimerStore = create<TimerState>()(
    persist(
        (set) => ({
            mode: 'idle',
            remainingTime: 25 * 60,
            isRunning: false,
            activeTaskId: '1',
            backgroundMode: 'lofi',
            breaksLeft: 4,
            isBackgroundMuted: true,

            setMode: (mode) => set({ mode }),
            setRemainingTime: (remainingTime) => set({ remainingTime }),
            setIsRunning: (isRunning) => set({ isRunning }),
            setActiveTaskId: (activeTaskId) => set({ activeTaskId }),
            setBackgroundMode: (backgroundMode) => set({ backgroundMode }),
            setBreaksLeft: (breaksLeft) => set({ breaksLeft }),
            setIsBackgroundMuted: (isBackgroundMuted) => set({ isBackgroundMuted }),
            setSettings: (settings) => set((state) => ({ ...state, ...settings })),
            toggleTimer: () => set((state) => ({ isRunning: !state.isRunning })),
            resetTimer: () => set({ remainingTime: 25 * 60, isRunning: false, mode: 'idle', breaksLeft: 4 }),
            restartCurrentSession: () => set((state) => ({
                remainingTime: state.mode === 'break' ? 5 * 60 : 25 * 60,
                isRunning: false,
                mode: 'idle'
            })),
        }),
        {
            name: 'focus-flow-timer',
        }
    )
);
