'use client';

import { BackgroundRenderer } from './BackgroundRenderer';
import { TimerDisplay } from './TimerDisplay';
import { ActiveTaskLabel } from './ActiveTaskLabel';
import { PrimaryActionButton } from './PrimaryActionButton';
import { ProgressRing } from './ProgressRing';
import { TaskPanel } from './TaskPanel';
import { useTimerStore } from '@/store/useTimerStore';
import { useTaskStore } from '@/store/useTaskStore';
import { useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { playSound, SOUNDS } from '@/utils/sound';

export function FocusScreen() {
    const { isRunning, remainingTime, setRemainingTime, setIsRunning, mode, setMode, toggleTimer } = useTimerStore();
    const { isPanelOpen, setPanelOpen } = useTaskStore();

    // Ref to track previous running state to trigger sounds correctly
    const prevIsRunning = useRef(isRunning);

    useEffect(() => {
        if (prevIsRunning.current !== isRunning) {
            if (isRunning) {
                playSound(SOUNDS.START);
            } else if (remainingTime > 0 && mode === 'focus') {
                playSound(SOUNDS.PAUSE);
            }
            prevIsRunning.current = isRunning;
        }
    }, [isRunning, remainingTime, mode]);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isRunning && remainingTime > 0) {
            interval = setInterval(() => {
                setRemainingTime(remainingTime - 1);
            }, 1000);
        } else if (remainingTime === 0 && isRunning) { // logic check needed here
            // It's tricky because remainingTime update triggers this effect.
        }

        // Better to handle completion inside the interval or separate effect
        if (remainingTime === 0 && prevIsRunning.current) {
            setIsRunning(false);
            playSound(SOUNDS.COMPLETE);
            // setMode('break'); 
        }

        return () => clearInterval(interval);
    }, [isRunning, remainingTime, setRemainingTime, setIsRunning, setMode]);

    // Update mode based on running state if needed, or handle in button
    useEffect(() => {
        if (isRunning && mode === 'idle') {
            setMode('focus');
        }
    }, [isRunning, mode, setMode]);

    // Keyboard Shortcuts
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        // Disable shortcuts if typing in an input
        if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;

        if (e.code === 'Space' && !e.ctrlKey) {
            e.preventDefault();
            toggleTimer();
        }

        // Ctrl + Space -> Toggle task panel
        if (e.ctrlKey && e.code === 'Space') {
            e.preventDefault();
            setPanelOpen(!isPanelOpen);
        }
    }, [toggleTimer, isPanelOpen, setPanelOpen]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden text-text-primary">
            <BackgroundRenderer />

            {/* Main Focus Area */}
            <div className="z-10 flex flex-col items-center gap-12 text-center">

                {/* Header / Mode */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm font-medium tracking-widest text-text-muted uppercase"
                >
                    [ Focus Mode ]
                </motion.div>

                <TimerDisplay />

                <ActiveTaskLabel />

                <PrimaryActionButton />
            </div>

            <ProgressRing />

            <TaskPanel />
        </main>
    );
}
