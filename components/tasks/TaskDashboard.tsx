'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useTaskStore, Task } from '@/store/useTaskStore';
import { TaskColumn } from '@/components/tasks/TaskColumn';

interface TaskDashboardProps {
    isOpen: boolean;
    onClose: () => void;
}

export function TaskDashboard({ isOpen, onClose }: TaskDashboardProps) {
    const tasks = useTaskStore((state) => state.tasks);

    // Categorize tasks
    const backlogTasks = tasks.filter(t => t.section === 'backlog');
    const weekTasks = tasks.filter(t => t.section === 'week');
    const todayTasks = tasks.filter(t => t.section === 'today');

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-6 border-b border-white/5">
                        <h2 className="text-2xl font-bold tracking-tight text-white">Task Board</h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Columns Container */}
                    <div className="flex-1 overflow-x-auto overflow-y-hidden">
                        <div className="h-full flex gap-6 px-6 py-8 min-w-full sm:min-w-0 sm:grid sm:grid-cols-3 sm:gap-8 max-w-7xl mx-auto">

                            {/* Backlog Column */}
                            <TaskColumn
                                title="Backlog"
                                tasks={backlogTasks}
                                section="backlog"
                            />

                            {/* This Week Column */}
                            <TaskColumn
                                title="This Week"
                                tasks={weekTasks}
                                section="week"
                            />

                            {/* Today Column (Highlighted) */}
                            <TaskColumn
                                title="Today"
                                tasks={todayTasks}
                                section="today"
                                isHighlighted
                            />

                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
