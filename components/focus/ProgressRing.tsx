'use client';

import { useTimerStore } from "@/store/useTimerStore";
import { motion, AnimatePresence } from "framer-motion";

export function ProgressRing() {
    const { remainingTime, mode } = useTimerStore();
    const totalTime = mode === 'focus' ? 25 * 60 : (mode === 'break' ? 5 * 60 : 25 * 60);
    const progress = (remainingTime / totalTime);

    // Circle Config
    const radius = 380;
    const stroke = 8;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;

    // Arc Config (270 degree arc, 90 degree gap centered at bottom)
    const arcAngle = 270;
    const arcLength = (arcAngle / 360) * circumference;
    const gapLength = circumference - arcLength;

    // Progress Calculation within the arc (Elapsed Progress)
    const elapsedProgress = 1 - progress;

    return (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[calc(50%-40px)] z-0 pointer-events-none w-full h-full flex items-center justify-center">
            <AnimatePresence>
                {mode !== 'idle' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="w-full h-full flex items-center justify-center"
                    >
                        <svg
                            viewBox={`0 0 ${radius * 2} ${radius * 2}`}
                            className="w-full h-full max-w-[760px] max-h-[760px]"
                            style={{ transform: 'rotate(135deg)' }} // Rotated so the 90deg gap is at the bottom
                        >
                            {/* Track Arc (Subtle low-opacity) */}
                            <circle
                                stroke="rgba(255, 255, 255, 0.1)"
                                strokeWidth={stroke}
                                fill="transparent"
                                strokeDasharray={`${arcLength} ${gapLength}`}
                                strokeLinecap="round"
                                r={normalizedRadius}
                                cx={radius}
                                cy={radius}
                            />
                            {/* Progress Arc (White active portion) */}
                            <motion.circle
                                stroke="rgba(255, 255, 255, 0.8)"
                                fill="transparent"
                                strokeWidth={stroke}
                                strokeDasharray={`${elapsedProgress * arcLength} ${circumference - (elapsedProgress * arcLength)}`}
                                strokeLinecap="round"
                                r={normalizedRadius}
                                cx={radius}
                                cy={radius}
                                initial={{ strokeDasharray: `0 ${circumference}` }}
                                animate={{ strokeDasharray: `${elapsedProgress * arcLength} ${circumference - (elapsedProgress * arcLength)}` }}
                                transition={{ duration: 1, ease: "linear" }}
                            />
                        </svg>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
