'use client';

import { useTimerStore } from "@/store/useTimerStore";
import { motion } from "framer-motion";

export function ProgressRing() {
    const { remainingTime, mode } = useTimerStore();
    const totalTime = mode === 'focus' ? 25 * 60 : 5 * 60;
    const progress = (remainingTime / totalTime);

    // Circle Config
    const radius = 300;
    const stroke = 4;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;

    // Arc Config (300 degree arc, 60 degree gap at bottom)
    const arcAngle = 300;
    const arcLength = (arcAngle / 360) * circumference;
    const gapLength = circumference - arcLength;

    // Progress Calculation within the arc
    // When progress is 1 (start), offset should be 0
    // When progress is 0 (end), offset should be arcLength
    const strokeDashoffset = (1 - progress) * arcLength;

    return (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none">
            <svg
                height={radius * 2}
                width={radius * 2}
                style={{ transform: 'rotate(120deg)' }} // Rotated so the 60deg gap is at the bottom
            >
                {/* Track Arc */}
                <circle
                    stroke="rgba(255, 255, 255, 0.15)"
                    strokeWidth={stroke}
                    fill="transparent"
                    strokeDasharray={`${arcLength} ${gapLength}`}
                    strokeLinecap="round"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                {/* Progress Arc */}
                <motion.circle
                    stroke="white"
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={`${arcLength} ${gapLength}`}
                    style={{ strokeDashoffset }}
                    strokeLinecap="round"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    initial={{ strokeDashoffset: arcLength }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                />
            </svg>
        </div>
    );
}
