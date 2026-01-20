'use client';

import { useTimerStore } from "@/store/useTimerStore";
import { Play, Pause } from "lucide-react";
import { motion } from "framer-motion";

export function PrimaryActionButton() {
    const { isRunning, toggleTimer } = useTimerStore();

    return (
        <motion.button
            onClick={toggleTimer}
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-2.5 rounded-full border-2 border-white/80 text-sm font-bold tracking-widest text-white transition-colors"
        >
            {isRunning ? 'PAUSE' : 'START'}
        </motion.button>
    );
}
