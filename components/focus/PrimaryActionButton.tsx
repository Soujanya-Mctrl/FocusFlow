'use client';

import { useTimerStore } from "@/store/useTimerStore";
import { Play, Pause } from "lucide-react";
import { motion } from "framer-motion";

export function PrimaryActionButton() {
    const { isRunning, toggleTimer } = useTimerStore();

    return (
        <motion.button
            onClick={toggleTimer}
            layout
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative flex items-center gap-3 rounded-full bg-bg-panel px-8 py-4 text-lg font-medium text-text-primary transition-colors hover:bg-white/10"
        >
            {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 pl-1" />}
            {isRunning ? 'Pause Focus' : 'Start Focus'}
        </motion.button>
    );
}
