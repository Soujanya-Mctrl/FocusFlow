'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
    Play, Pause, SkipForward, CheckCircle2, 
    Maximize2
} from 'lucide-react';
import { useTimerStore } from '@/store/useTimerStore';
import { useTaskStore } from '@/store/useTaskStore';

export const FlowModePanel: React.FC = () => {
    const { 
        remainingTime, isRunning, mode, activeTaskId,
        toggleTimer
    } = useTimerStore();
    
    const { tasks, toggleTaskCompletion } = useTaskStore();
    
    const activeTask = tasks.find(t => t.id === activeTaskId);
    const nextTasks = tasks.filter(t => t.id !== activeTaskId && t.status !== 'done').slice(0, 2);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!activeTaskId || mode === 'idle') return null;

    return (
        <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-xl z-[100]"
        >
            <div className="bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[32px] p-6 shadow-2xl overflow-hidden relative group">
                {/* Background Progress Glow */}
                <div 
                    className="absolute inset-0 bg-blue-500/5 transition-all duration-1000" 
                    style={{ clipPath: `inset(0 ${100 - (remainingTime / (25 * 60)) * 100}% 0 0)` }}
                />

                <div className="relative flex items-center justify-between">
                    {/* Task Info */}
                    <div className="flex-grow min-w-0 pr-8">
                        <div className="flex items-center space-x-2 mb-1">
                            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest rounded-md">
                                {mode === 'focus' ? 'Focusing' : 'Break'}
                            </span>
                            {activeTask?.estimatedMinutes && (
                                <span className="text-white/20 text-[10px] font-bold uppercase tracking-widest">
                                    • {activeTask.estimatedMinutes}m est
                                </span>
                            )}
                        </div>
                        <h2 className="text-xl font-bold text-white truncate leading-tight">
                            {activeTask?.title || 'No active task'}
                        </h2>
                        {activeTask?.subtasks.length ? (
                            <p className="text-white/40 text-xs mt-1 font-medium">
                                Next: {activeTask.subtasks.find(s => !s.done)?.title || 'All steps clear'}
                            </p>
                        ) : (
                            <p className="text-white/40 text-xs mt-1 font-medium">
                                Keep the momentum going
                            </p>
                        )}
                    </div>

                    {/* Timer & Controls */}
                    <div className="flex items-center space-x-6">
                        <div className="text-center">
                            <div className="text-4xl font-black text-white tracking-tighter tabular-nums leading-none">
                                {formatTime(remainingTime)}
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <button 
                                onClick={toggleTimer}
                                className="w-14 h-14 flex items-center justify-center bg-white text-black hover:bg-blue-400 hover:text-white rounded-full transition-all active:scale-95 shadow-xl shadow-white/10"
                            >
                                {isRunning ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                            </button>
                            <button 
                                onClick={() => toggleTaskCompletion(activeTaskId)}
                                className="p-3 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all"
                                title="Complete Task"
                            >
                                <CheckCircle2 size={24} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Queue Preview (Expandable) */}
                <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between opacity-40 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center space-x-4">
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Up Next</span>
                        <div className="flex -space-x-2">
                            {nextTasks.map(t => (
                                <div key={t.id} className="w-6 h-6 rounded-full bg-white/10 border border-black/40 flex items-center justify-center text-[10px]" title={t.title}>
                                    {t.title[0]}
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                        <button className="p-2 hover:bg-white/10 rounded-lg text-white/40 transition-all">
                            <SkipForward size={16} />
                        </button>
                        <button className="p-2 hover:bg-white/10 rounded-lg text-white/40 transition-all">
                            <Maximize2 size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
