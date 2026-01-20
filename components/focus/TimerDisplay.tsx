'use client';

import { useTimerStore } from "@/store/useTimerStore";
import { motion } from "framer-motion";
import clsx from "clsx";

function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function TimerDisplay() {
    const { remainingTime, toggleTimer, mode } = useTimerStore();

    return (
        <div className="relative flex flex-col items-center" onDoubleClick={toggleTimer}>
            {/* Mode Labels */}
            <div className="flex gap-8 mb-6">
                <span className={clsx(
                    "text-sm font-bold tracking-widest transition-opacity duration-300",
                    mode === 'focus' ? "text-white opacity-100" : "text-white opacity-40"
                )}>
                    FOCUS
                </span>
                <span className={clsx(
                    "text-sm font-bold tracking-widest transition-opacity duration-300",
                    mode === 'break' ? "text-white opacity-100" : "text-white opacity-40"
                )}>
                    BREAK
                </span>
            </div>

            {/* Timer Digits */}
            <motion.div
                layout
                className="text-[10rem] font-bold leading-none tracking-tight tabular-nums select-none cursor-pointer text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                {formatTime(remainingTime)}
            </motion.div>
        </div>
    );
}
