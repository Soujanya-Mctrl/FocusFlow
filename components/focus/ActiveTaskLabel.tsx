'use client';

import { useTimerStore } from "@/store/useTimerStore";
import { useTaskStore } from "@/store/useTaskStore";
import { motion, AnimatePresence } from "framer-motion";

export function ActiveTaskLabel() {
    const { activeTaskId } = useTimerStore();
    const { tasks } = useTaskStore();

    const activeTask = tasks.find(t => t.id === activeTaskId);

    return (
        <AnimatePresence mode="wait">
            {activeTask ? (
                <motion.div
                    key={activeTask.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-4xl font-bold text-white tracking-tight"
                >
                    {activeTask.title}
                </motion.div>
            ) : (
                <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-2xl font-medium text-white/40 italic"
                >
                    No active task
                </motion.div>
            )}
        </AnimatePresence>
    );
}
