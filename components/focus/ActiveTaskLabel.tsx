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
                    className="flex items-center gap-3 text-xl font-medium text-text-primary"
                >
                    <span>🎯</span>
                    <span>{activeTask.title}</span>
                </motion.div>
            ) : (
                <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-lg text-text-muted italic"
                >
                    Select a task...
                </motion.div>
            )}
        </AnimatePresence>
    );
}
