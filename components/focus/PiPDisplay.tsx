import { useState, useRef, useEffect } from 'react';
import { useTimerStore } from '@/store/useTimerStore';
import { useTaskStore } from '@/store/useTaskStore';
import { Play, Pause, ChevronDown, CheckCircle, X, Settings, Home, Plus, FileText, ArrowRight, CornerDownLeft, Circle, SkipForward } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

export function PiPDisplay({ onClose, pipWindow }: { onClose: () => void, pipWindow: Window }) {
    const { remainingTime, isRunning, toggleTimer, activeTaskId, setActiveTaskId } = useTimerStore();
    const { tasks, toggleTaskCompletion } = useTaskStore();
    const [isExpanded, setIsExpanded] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Format time mm:ss
    const hours = Math.floor(remainingTime / 3600);
    const mins = Math.floor((remainingTime % 3600) / 60);
    const secs = remainingTime % 60;

    // Format: HH:MM:SS or MM:SS depending on duration
    const timeString = hours > 0
        ? `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
        : `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    // Real Task Data
    const activeTask = tasks.find(t => t.id === activeTaskId);
    const upcomingTasks = tasks.filter(t => t.id !== activeTaskId && !t.completed);
    const completedTasks = tasks.filter(t => t.completed);

    const totalTasks = tasks.length;
    const completedCount = completedTasks.length;
    const progressPercent = totalTasks === 0 ? 0 : (completedCount / totalTasks) * 100;

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const markActiveDone = () => {
        if (activeTaskId) toggleTaskCompletion(activeTaskId);
    };

    // Auto-resize PiP window based on content height
    useEffect(() => {
        if (!pipWindow || !containerRef.current) return;

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const height = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
                const targetHeight = Math.ceil(height);
                if (targetHeight > 0) {
                    pipWindow.resizeTo(450, targetHeight);
                }
            }
        });

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [pipWindow]);

    return (
        <div
            ref={containerRef}
            className="group flex flex-col w-full min-h-full h-auto bg-[#0a0a0a] text-white overflow-hidden select-none font-sans"
        >
            {!isExpanded ? (
                /* === COLLAPSED PILL VIEW === */
                <div className="flex items-center justify-between px-4 py-3 w-full min-h-[60px] bg-[#1c1c1e]">
                    {/* Left: Task Name */}
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className={clsx(
                            "w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-300",
                            activeTask?.completed ? "bg-green-500" : "bg-accent animate-pulse"
                        )} />
                        <span className={clsx(
                            "text-base font-medium truncate opacity-90 leading-none pb-0.5 transition-all duration-300",
                            activeTask?.completed && "line-through opacity-40"
                        )}>
                            {activeTask ? activeTask.title : "No Active Task"}
                        </span>
                    </div>

                    {/* Right: Timer & Controls */}
                    <div className="flex items-center gap-4 shrink-0 pl-4">
                        <span className="text-xl font-bold tabular-nums tracking-wide opacity-100 font-mono">
                            {timeString}
                        </span>

                        {/* Hover Controls */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button onClick={markActiveDone} className={clsx("p-1.5 rounded-full hover:bg-white/10 active:scale-95 transition-all", activeTask?.completed ? "text-green-500" : "text-white/50 hover:text-green-500")} title="Done">
                                <CheckCircle className="w-4 h-4" />
                            </button>
                            {activeTask?.completed ? (
                                <button
                                    onClick={() => {
                                        const currentIndex = tasks.findIndex(t => t.id === activeTaskId);
                                        const nextTask = tasks.find((t, i) => i > currentIndex && !t.completed);
                                        if (nextTask) setActiveTaskId(nextTask.id);
                                    }}
                                    className="p-1.5 rounded-full hover:bg-white/10 active:scale-95 transition-all text-emerald-500 hover:text-emerald-400"
                                    title="Next Task"
                                >
                                    <SkipForward className="w-4 h-4 fill-current" />
                                </button>
                            ) : (
                                <button onClick={toggleTimer} className="p-1.5 rounded-full hover:bg-white/10 active:scale-95 transition-all text-white/50 hover:text-white">
                                    {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                                </button>
                            )}
                            <button onClick={toggleExpand} className="p-1.5 rounded-full hover:bg-white/10 active:scale-95 transition-all text-white/50 hover:text-white">
                                <ChevronDown className="w-4 h-4" />
                            </button>
                            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 active:scale-95 transition-all text-white/50 hover:text-white" title="Close">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                /* === EXPANDED DASHBOARD VIEW === */
                <div className="flex flex-col w-full p-4 gap-4 bg-[#09090b]">
                    {/* Header */}
                    <div className="flex items-center justify-between text-white/60">
                        <div className="flex items-center gap-2 text-sm font-medium text-white hover:bg-white/5 px-2 py-1 -ml-2 rounded-md cursor-pointer transition-colors">
                            <span>Today</span>
                            <ChevronDown className="w-3 h-3 text-white/40" />
                        </div>
                        <div className="flex items-center gap-3">
                            <Settings className="w-4 h-4 hover:text-white cursor-pointer transition-colors" />
                            <Home className="w-4 h-4 hover:text-white cursor-pointer transition-colors" />
                            <div className="w-px h-3 bg-white/10" />
                            <button onClick={toggleExpand} className="hover:text-white hover:bg-white/10 p-1 rounded transition-all">
                                <CornerDownLeft className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-[10px] uppercase tracking-wider font-bold text-white/40">
                            <span>Est: --h --m</span>
                            <span>{completedCount}/{totalTasks} Done</span>
                        </div>
                        <div className="relative h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-teal-400 to-emerald-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                    </div>

                    {/* Active Task Card */}
                    {activeTask ? (
                        <div className="relative group/active rounded-xl bg-[#121214] border border-white/10 p-4 flex items-center justify-between overflow-hidden">
                            {/* Gradient Border Effect */}
                            <div className="absolute inset-0 rounded-xl border border-transparent pointer-events-none [background:linear-gradient(to_right,rgba(45,212,191,0.3),rgba(16,185,129,0.3))_border-box] [mask:linear-gradient(#fff_0_0)_padding-box,linear-gradient(#fff_0_0)]" />

                            <div className="flex flex-col gap-1 z-10">
                                <span className="text-lg font-medium text-white/90 leading-tight">{activeTask.title}</span>
                                <span className="text-xs text-emerald-400 font-medium tracking-wide">In Progress</span>
                            </div>

                            <div className="flex items-center gap-4 z-10">
                                <span className="text-2xl font-bold font-mono tracking-tight text-white">{timeString}</span>
                                {activeTask.completed ? (
                                    <button
                                        onClick={() => {
                                            const currentIndex = tasks.findIndex(t => t.id === activeTaskId);
                                            const nextTask = tasks.find((t, i) => i > currentIndex && !t.completed);
                                            if (nextTask) {
                                                setActiveTaskId(nextTask.id);
                                            }
                                        }}
                                        className="h-10 w-10 flex items-center justify-center rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-500 transition-all active:scale-95"
                                        title="Next Task"
                                    >
                                        <SkipForward className="w-4 h-4 fill-current" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={toggleTimer}
                                        className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all active:scale-95"
                                    >
                                        {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="p-8 border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-white/30 gap-2">
                            <span className="text-sm">No Active Task</span>
                            <button className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full text-white/70 transition-colors">Select a task below</button>
                        </div>
                    )}

                    {/* Upcoming List */}
                    <div className="flex flex-col gap-2">
                        {upcomingTasks.map((task, i) => (
                            <div key={task.id} className="group flex items-center justify-between p-3 rounded-lg bg-[#18181b] border border-white/5 hover:border-white/10 transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-mono text-white/20 w-4">{i + 1}</span>
                                    <button onClick={() => toggleTaskCompletion(task.id)} className="text-white/20 hover:text-white/50 transition-colors">
                                        <Circle className="w-4 h-4" />
                                    </button>
                                    <span className="text-sm text-white/80">{task.title}</span>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-1 hover:bg-white/10 rounded"><FileText className="w-3 h-3 text-white/40" /></button>
                                    <button className="p-1 hover:bg-white/10 rounded"><ArrowRight className="w-3 h-3 text-white/40" /></button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add Task Button */}
                    <button className="flex items-center gap-2 text-xs font-bold text-white/40 hover:text-white/80 uppercase tracking-widest px-2 py-2 transition-colors">
                        <Plus className="w-3 h-3" />
                        <span>Add Task</span>
                    </button>

                    {/* Done List */}
                    {completedTasks.length > 0 && (
                        <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                            <div className="flex justify-between text-white/30 text-xs px-2">
                                <span>{completedTasks.length} Done</span>
                                <span>--h --m</span>
                            </div>
                            {completedTasks.map((task) => (
                                <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-[#121214]/50 border border-white/5 opacity-60 hover:opacity-100 transition-opacity">
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => toggleTaskCompletion(task.id)} className="text-emerald-500">
                                            <CheckCircle className="w-4 h-4" />
                                        </button>
                                        <span className="text-sm text-white/50 line-through decoration-white/20">{task.title}</span>
                                    </div>
                                    <span className="text-xs text-emerald-500/50 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">DONE</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
