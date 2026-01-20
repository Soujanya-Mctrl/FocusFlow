'use client';

import { useTimerStore } from "@/store/useTimerStore";
import { Play, Pause } from "lucide-react";
import { motion } from "framer-motion";

export function PrimaryActionButton() {
    const { isRunning, toggleTimer } = useTimerStore();

    return (
        <motion.button
            onClick={toggleTimer}
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.08)" }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-4 px-8 py-3 rounded-full border border-white/5 bg-white/2 backdrop-blur-md shadow-lg shadow-[inset_0_0_12px_rgba(255,255,255,0.05)] text-sm font-bold tracking-widest text-white/90 transition-all hover:border-white/20"
        >
            <span className="ml-1">{isRunning ? 'PAUSE' : 'START'}</span>
            <span className="flex items-center justify-center rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white/30">
                Space
            </span>
        </motion.button>
    );
}
