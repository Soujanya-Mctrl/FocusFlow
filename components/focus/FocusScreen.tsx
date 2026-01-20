'use client';

import { BackgroundRenderer } from './BackgroundRenderer';
import { TimerDisplay } from './TimerDisplay';
import { ActiveTaskLabel } from './ActiveTaskLabel';
import { PrimaryActionButton } from './PrimaryActionButton';
import { ProgressRing } from './ProgressRing';
import { QuoteDisplay } from './QuoteDisplay';
import { SidebarDock } from '../layout/SidebarDock';
import { SidePanel } from '../layout/SidePanel';
import { TaskPanel } from './TaskPanel';
import { useTimerStore } from '@/store/useTimerStore';
import { useTaskStore } from '@/store/useTaskStore';
import { useEffect, useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { playSound, SOUNDS } from '@/utils/sound';

export function FocusScreen() {
    const { isRunning, remainingTime, setRemainingTime, setIsRunning, mode, setMode, toggleTimer } = useTimerStore();

    // We can map 'activePanel' string to the Dock.
    const [activePanel, setActivePanel] = useState<string | null>(null);

    const prevIsRunning = useRef(isRunning);

    // Sync Key shortcut to activePanel
    const toggleTaskPanel = useCallback(() => {
        setActivePanel(prev => prev === 'tasks' ? null : 'tasks');
    }, []);

    // Sound Effects
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

    // Timer Interval
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isRunning && remainingTime > 0) {
            interval = setInterval(() => {
                setRemainingTime(remainingTime - 1);
            }, 1000);
        }

        if (remainingTime === 0 && prevIsRunning.current) {
            setIsRunning(false);
            playSound(SOUNDS.COMPLETE);
        }

        return () => clearInterval(interval);
    }, [isRunning, remainingTime, setRemainingTime, setIsRunning]);

    // Mode Auto-Switch
    useEffect(() => {
        if (isRunning && mode === 'idle') {
            setMode('focus');
        }
    }, [isRunning, mode, setMode]);

    // Keyboard Shortcuts
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;

        if (e.code === 'Space' && !e.ctrlKey) {
            e.preventDefault();
            toggleTimer();
        }

        if (e.ctrlKey && e.code === 'Space') {
            e.preventDefault();
            toggleTaskPanel();
        }
    }, [toggleTimer, toggleTaskPanel]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Idle Detection for "Zen Mode"
    const [isUserIdle, setIsUserIdle] = useState(false);
    const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const resetIdleTimer = () => {
            setIsUserIdle(false);
            if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
            idleTimeoutRef.current = setTimeout(() => setIsUserIdle(true), 3000);
        };

        window.addEventListener('mousemove', resetIdleTimer);
        window.addEventListener('click', resetIdleTimer);

        resetIdleTimer();

        return () => {
            window.removeEventListener('mousemove', resetIdleTimer);
            window.removeEventListener('click', resetIdleTimer);
            if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
        };
    }, []);

    return (
        <main className={`relative flex h-screen w-full items-center justify-center overflow-hidden text-text-primary ${isUserIdle ? 'cursor-none' : ''}`}>
            <BackgroundRenderer />

            <div className={`transition-opacity duration-1000 ${isUserIdle ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <SidebarDock
                    activePanel={activePanel}
                    onTogglePanel={(panel) => setActivePanel(prev => prev === panel ? null : panel)}
                />
            </div>

            {/* Panels */}
            <SidePanel
                isOpen={activePanel === 'tasks'}
                onClose={() => setActivePanel(null)}
                title="Tasks"
            >
                <TaskPanel />
            </SidePanel>
            {/* ... other panels ... */}
            <SidePanel
                isOpen={activePanel === 'settings'}
                onClose={() => setActivePanel(null)}
                title="Settings"
            >
                <div className="p-4 text-center text-text-muted">
                    Settings coming soon...
                </div>
            </SidePanel>
            <SidePanel
                isOpen={activePanel === 'stats'}
                onClose={() => setActivePanel(null)}
                title="Statistics"
            >
                <div className="p-4 text-center text-text-muted">
                    Stats coming soon...
                </div>
            </SidePanel>

            {/* Main Content Area */}
            <div className="z-10 flex flex-col items-center justify-center w-full max-w-5xl px-4 scale-[0.90] mt-10 transform-gpu -translate-y-5">
                <div className="relative flex items-center justify-center w-[700px] h-[700px]">
                    <ProgressRing />

                    {/* The Heart: Perfectly Centered Timer */}
                    <div className={`z-20 transition-transform duration-1000 ${isUserIdle ? 'translate-y-10' : ''}`}>
                        <TimerDisplay />
                    </div>

                    {/* The Context: Task & Action positioned below the center line */}
                    <div className={`absolute top-[75%] flex flex-col items-center gap-10 transition-opacity duration-1000 ${isUserIdle ? 'opacity-0 delay-150' : 'opacity-100'}`}>
                        <ActiveTaskLabel />
                        <div className="mt-2">
                            <PrimaryActionButton />
                        </div>
                    </div>
                </div>

                {/* Quotes Area - Separated from the center hub for breathing room */}
                <div className="mt-8">
                    <QuoteDisplay />
                </div>
            </div>

        </main>
    );
}
