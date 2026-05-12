'use client';

import { useTimerStore } from "@/store/useTimerStore";
import { useTaskStore } from "@/store/useTaskStore";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

export function ActiveTaskLabel() {
    const { activeTaskId } = useTimerStore();
    const { tasks } = useTaskStore();

    const activeTask = tasks.find(t => t.id === activeTaskId);
    const isTaskDone = activeTask?.status === 'done';

    return (
        <AnimatePresence mode="wait">
            {activeTask ? (
                <motion.div
                    key={activeTask.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={clsx(
                        "text-xl sm:text-2xl font-bold text-white tracking-tight transition-all duration-500",
                        isTaskDone && "line-through opacity-40"
                    )}
                >
                    {activeTask.title}
                </motion.div>
            ) : (
                <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xl font-medium text-white/40 italic"
                >
                    No active task
                </motion.div>
            )}
        </AnimatePresence>
    );
}
