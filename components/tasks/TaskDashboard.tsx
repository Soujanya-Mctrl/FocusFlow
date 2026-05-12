'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { TaskFlowBoard } from '@/components/tasks/TaskFlowBoard';

import { QuickAddBar } from '@/components/tasks/QuickAddBar';
import { useTaskStore } from '@/store/useTaskStore';
import { useState } from 'react';
import { TaskDetailPanel } from './TaskDetailPanel';

interface TaskDashboardProps {
    isOpen: boolean;
    onClose: () => void;
}

export function TaskDashboard({ isOpen, onClose }: TaskDashboardProps) {
    const addTask = useTaskStore(state => state.addTask);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

    const handleAddTask = (title: string) => {
        const newTask = addTask({ title, listId: 'today', scheduledDate: new Date().toISOString() });
        setSelectedTaskId(newTask.id); // Open details for newly created task
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 0.8 }}
                    className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-3xl flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex flex-col border-b border-white/5 relative z-10">
                        <div className="flex items-center justify-between px-8 py-6">
                            <div className="flex flex-col">
                                <h2 className="text-3xl font-black tracking-tight text-white/90">Tasks</h2>
                                <p className="text-xs font-bold text-white/30 uppercase tracking-[0.2em] mt-1">Workspace & Flow</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-all text-white/40 hover:text-white border border-white/5"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Quick Add Integration */}
                        <div className="px-8 pb-6">
                            <div className="max-w-3xl">
                                <QuickAddBar onExpand={handleAddTask} />
                            </div>
                        </div>
                    </div>

                    {/* Flow Canvas Container */}
                    <div className="flex-1 relative overflow-hidden flex">
                        <div className="flex-1">
                            <TaskFlowBoard 
                                selectedTaskId={selectedTaskId}
                                onSelectTask={setSelectedTaskId}
                            />
                        </div>
                        
                        <AnimatePresence mode="wait">
                            {selectedTaskId && (
                                <TaskDetailPanel 
                                    taskId={selectedTaskId}
                                    onClose={() => setSelectedTaskId(null)}
                                />
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
