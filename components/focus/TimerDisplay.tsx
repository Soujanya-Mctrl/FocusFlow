'use client';

import { useTimerStore } from "@/store/useTimerStore";
import { motion } from "framer-motion";
import { RotateCcw, Coffee } from "lucide-react";
import clsx from "clsx";

function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function TimerDisplay() {
    const { remainingTime, toggleTimer, mode, restartCurrentSession, breaksLeft } = useTimerStore();

    return (
        <div className="group relative flex items-center justify-center" onDoubleClick={toggleTimer}>
            {/* Mode Labels - Absolute Top */}
            <div className="absolute -top-16 flex gap-8">
                <span className={clsx(
                    "text-sm font-bold tracking-[0.05rem] transition-opacity duration-300",
                    mode === 'focus' ? "text-white opacity-100" : "text-white opacity-20"
                )}>
                    FOCUS
                </span>
                <span className={clsx(
                    "text-sm font-bold tracking-[0.05rem] transition-opacity duration-300",
                    mode === 'break' ? "text-white opacity-100" : "text-white opacity-20"
                )}>
                    BREAK
                </span>
            </div>

            {/* Timer Digits - The Center Anchor */}
            <motion.div
                layout
                className="text-[11rem] font-semibold leading-none tracking-[0.02em] tabular-nums select-none cursor-pointer text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                {formatTime(remainingTime)}
            </motion.div>

            {/* Hover Overlay: Restart & Breaks Left - Absolute Bottom */}
            <div className="absolute inset-x-0 -bottom-14 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out transform translate-y-4 group-hover:translate-y-0">
                {/* Restart Button: Icon Only */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        restartCurrentSession();
                    }}
                    className="group/btn flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-md transition-all hover:bg-white/15 hover:border-white/20 active:scale-95"
                    title="Restart Session"
                >
                    <RotateCcw className="h-4 w-4 text-white/50 transition-colors group-hover/btn:text-white" />
                </button>

                {/* Breaks Left Indicator: Minimal Pill */}
                <div className="flex h-10 items-center gap-2.5 rounded-full border border-white/5 bg-white/5 backdrop-blur-md px-5 py-1.5 transition-all hover:bg-white/10 hover:border-white/10">
                    <Coffee className="h-4 w-4 text-white/30" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                        {breaksLeft} Breaks Left
                    </span>
                </div>
            </div>
        </div>
    );
}
