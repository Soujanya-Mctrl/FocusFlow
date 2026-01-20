'use client';

import { useTimerStore } from "@/store/useTimerStore";
import { motion } from "framer-motion";

export function ProgressRing() {
    // Determine progress based on total time (assuming 25min for simplicity for now, 
    // ideally store should track total duration vs remaining)
    const { remainingTime, mode } = useTimerStore();
    const totalTime = 25 * 60;
    const progress = 1 - (remainingTime / totalTime);

    // Don't show progress if idle
    if (mode === 'idle' && remainingTime === totalTime) return null;

    return (
        <div className="absolute bottom-12 w-full max-w-sm px-6">
            <div className="h-1 w-full overflow-hidden rounded-full bg-bg-panel">
                <motion.div
                    className="h-full bg-focus rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress * 100}%` }}
                    transition={{ duration: 1, ease: "linear" }}
                    style={{ opacity: 0.5 }}
                />
            </div>
        </div>
    );
}
