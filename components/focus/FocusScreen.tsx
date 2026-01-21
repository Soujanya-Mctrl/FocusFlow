'use client';

import { BackgroundRenderer } from './BackgroundRenderer';
import { TimerDisplay } from './TimerDisplay';
import { ActiveTaskLabel } from './ActiveTaskLabel';
import { PrimaryActionButton } from './PrimaryActionButton';
import { ProgressRing } from './ProgressRing';
import { QuoteDisplay } from './QuoteDisplay';
import { SidebarDock } from '../layout/SidebarDock';
import { StatusHeader } from '../layout/StatusHeader';
import { SidePanel } from '../layout/SidePanel';
import { TaskPanel } from './TaskPanel';
import { useTimerStore } from '@/store/useTimerStore';
import { useTaskStore } from '@/store/useTaskStore';
import { useEffect, useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { playSound, SOUNDS } from '@/utils/sound';
import { Coffee, UserCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function FocusScreen() {
    const router = useRouter();
    const { isRunning, remainingTime, setRemainingTime, setIsRunning, mode, setMode, toggleTimer, breaksLeft } = useTimerStore();

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
        window.addEventListener('touchstart', resetIdleTimer); // Add touchstart for mobile responsiveness

        resetIdleTimer();

        return () => {
            window.removeEventListener('mousemove', resetIdleTimer);
            window.removeEventListener('click', resetIdleTimer);
            window.removeEventListener('touchstart', resetIdleTimer);
            if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
        };
    }, []);

    return (
        <main className={`relative flex h-[100svh] w-full items-center justify-center overflow-y-auto overflow-x-hidden sm:overflow-hidden text-text-primary ${isUserIdle ? 'cursor-none' : ''}`}>
            <BackgroundRenderer />

            {/* Status Header */}
            <div className={`transition-opacity duration-1000 ${isUserIdle ? 'opacity-0 pointer-events-none sm:opacity-100 sm:pointer-events-auto' : 'opacity-100'}`}>
                <StatusHeader />
            </div>

            {/* Top Right Profile Button */}
            <div className={`absolute top-8 right-4 sm:top-8 sm:right-6 z-[60] transition-opacity duration-1000 ${isUserIdle ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <button
                    onClick={() => router.push('/dashboard')}
                    className="p-2 text-white/40 hover:text-white transition-colors"
                    title="Profile"
                >
                    <UserCircle className="w-5 h-5" strokeWidth={2} />
                </button>
            </div>

            <div className={`transition-opacity duration-1000 ${isUserIdle ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <SidebarDock
                    activePanel={activePanel}
                    onTogglePanel={(panel) => setActivePanel(prev => prev === panel ? null : panel)}
                />
            </div>

            {/* Panels - Responsive Width */}
            <div className="z-[60]">
                <SidePanel
                    isOpen={activePanel === 'tasks'}
                    onClose={() => setActivePanel(null)}
                    title="Tasks"
                >
                    <TaskPanel />
                </SidePanel>
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
            </div>

            {/* Main Content Area */}
            {/* Scalable Main Composition */}
            <div className="z-10 flex flex-col items-center justify-center w-full min-h-[115svh] sm:min-h-0 sm:h-full pb-safe">
                <div className="relative w-full max-w-[min(85vw,500px)] sm:max-w-[min(80vw,600px)] aspect-square flex items-center justify-center -translate-y-6 sm:-translate-y-6">

                    {/* Layer 1: Progress Ring */}
                    {mode !== 'idle' && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                            <ProgressRing />
                        </div>
                    )}

                    {/* Layer 2: Timer Display (Centered) */}
                    <div className={`absolute inset-0 flex items-center justify-center z-20 transition-all duration-1000 ${isUserIdle ? 'scale-100 translate-y-0' : 'scale-95 -translate-y-4'}`}>
                        <TimerDisplay />
                    </div>

                    {/* Layer 3: Task Info (Bottom Half) */}
                    <div className={`absolute top-[68%] w-full flex flex-col items-center gap-4 z-30 transition-opacity duration-1000 ${isUserIdle ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                        <ActiveTaskLabel />

                        <div className="flex items-center gap-2.5 rounded-full border border-white/5 bg-white/5 backdrop-blur-md px-5 py-1.5 transition-all hover:bg-white/10 hover:border-white/10">
                            <Coffee className="h-4 w-4 text-white/30" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                                {breaksLeft} Breaks Left
                            </span>
                        </div>

                        <div className="mt-2">
                            <PrimaryActionButton />
                        </div>
                    </div>
                </div>

                {/* Layer 4: Quotes (Anchored Bottom) */}
                {mode !== 'idle' && (
                    <div className="absolute bottom-20 sm:bottom-12 w-full max-w-4xl px-4 pointer-events-none flex justify-center z-10">
                        <div className="pointer-events-auto w-full">
                            <QuoteDisplay />
                        </div>
                    </div>
                )}
            </div>

        </main>
    );
}
