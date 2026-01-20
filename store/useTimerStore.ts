import { create } from 'zustand';

type TimerMode = 'idle' | 'focus' | 'break';
type BackgroundMode = 'black' | 'lofi' | 'gradient';

interface TimerState {
    mode: TimerMode;
    remainingTime: number;
    isRunning: boolean;
    activeTaskId?: string;
    backgroundMode: BackgroundMode;

    setMode: (mode: TimerMode) => void;
    setRemainingTime: (time: number) => void;
    setIsRunning: (isRunning: boolean) => void;
    setActiveTaskId: (id: string | undefined) => void;
    setBackgroundMode: (mode: BackgroundMode) => void;
    toggleTimer: () => void;
    resetTimer: () => void;
}

export const useTimerStore = create<TimerState>((set) => ({
    mode: 'idle',
    remainingTime: 25 * 60,
    isRunning: false,
    activeTaskId: undefined,
    backgroundMode: 'gradient',

    setMode: (mode) => set({ mode }),
    setRemainingTime: (remainingTime) => set({ remainingTime }),
    setIsRunning: (isRunning) => set({ isRunning }),
    setActiveTaskId: (activeTaskId) => set({ activeTaskId }),
    setBackgroundMode: (backgroundMode) => set({ backgroundMode }),
    toggleTimer: () => set((state) => ({ isRunning: !state.isRunning })),
    resetTimer: () => set({ remainingTime: 25 * 60, isRunning: false, mode: 'idle' }),
}));
