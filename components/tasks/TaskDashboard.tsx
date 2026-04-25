'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { TaskFlowBoard } from '@/components/tasks/TaskFlowBoard';

interface TaskDashboardProps {
    isOpen: boolean;
    onClose: () => void;
}

export function TaskDashboard({ isOpen, onClose }: TaskDashboardProps) {
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

                    {/* Flow Container */}
                    <div className="flex-1 px-4 py-5 sm:px-6 sm:py-6">
                        <TaskFlowBoard />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
