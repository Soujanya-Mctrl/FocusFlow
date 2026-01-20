'use client';

import { useTimerStore } from "@/store/useTimerStore";
import { motion } from "framer-motion";

function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function TimerDisplay() {
    const { remainingTime, toggleTimer } = useTimerStore();

    return (
        <div className="relative" onDoubleClick={toggleTimer}>
            <motion.div
                layout
                className="text-[12rem] font-bold leading-none tracking-tight tabular-nums select-none cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                {formatTime(remainingTime)}
            </motion.div>
        </div>
    );
}
