'use client';

import { BackgroundRenderer } from './BackgroundRenderer';
import { TimerDisplay } from './TimerDisplay';
import { ActiveTaskLabel } from './ActiveTaskLabel';
import { PrimaryActionButton } from './PrimaryActionButton';
import { ProgressRing } from './ProgressRing';
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
    // note: We use local state for panel interaction now instead of global isPanelOpen, 
    // or we sync them. For now let's use local state for the Dock system to be self-contained
    // BUT we need to support Ctrl+Space opening Tasks.

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

    return (
        <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden text-text-primary">
            <BackgroundRenderer />

            <SidebarDock
                activePanel={activePanel}
                onTogglePanel={(panel) => setActivePanel(prev => prev === panel ? null : panel)}
            />

            {/* Panels */}
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

            {/* Main Content Area */}
            <div className="z-10 flex flex-col items-center justify-center gap-12 w-full max-w-4xl px-4">
                <div className="relative flex items-center justify-center w-[600px] h-[600px]">
                    <ProgressRing />
                    <div className="flex flex-col items-center gap-8">
                        <TimerDisplay />
                        <ActiveTaskLabel />
                        <PrimaryActionButton />
                    </div>
                </div>
            </div>

        </main>
    );
}
