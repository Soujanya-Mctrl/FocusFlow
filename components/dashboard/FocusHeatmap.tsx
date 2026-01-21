'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

type ViewMode = 'daily' | 'monthly' | 'yearly';

export function FocusHeatmap() {
    const [viewMode, setViewMode] = useState<ViewMode>('daily');

    // MOCK DATA GENERATOR
    // Generate simplified heatmap data for visual purpose
    const generateHeatmapData = () => {
        // Create 12 weeks of data (approx 84 days)
        return Array.from({ length: 12 * 7 }).map((_, i) => {
            const intensity = Math.random() > 0.3 ? Math.floor(Math.random() * 4) : 0;
            return {
                date: new Date(Date.now() - (84 - i) * 24 * 60 * 60 * 1000),
                intensity, // 0-4 scale
            };
        });
    };

    const data = generateHeatmapData();

    // Helper to get color based on intensity
    const getColor = (intensity: number) => {
        switch (intensity) {
            case 1: return 'bg-accent/20 border-accent/20';
            case 2: return 'bg-accent/40 border-accent/30';
            case 3: return 'bg-accent/70 border-accent/50';
            case 4: return 'bg-accent border-accent';
            default: return 'bg-white/5 border-white/5'; // Level 0
        }
    };

    return (
        <div className="flex flex-col gap-6 p-6 md:p-8 rounded-[2rem] border border-white/5 bg-white/5 backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h3 className="text-xl font-bold text-white">Focus History</h3>

                {/* View Toggles */}
                <div className="flex flex-wrap items-center p-1 rounded-xl bg-black/40 border border-white/5">
                    {(['daily', 'monthly', 'yearly'] as ViewMode[]).map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            className={clsx(
                                "px-4 py-1.5 rounded-lg text-xs font-medium transition-all capitalize",
                                viewMode === mode ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
                            )}
                        >
                            {mode}
                        </button>
                    ))}
                </div>
            </div>

            {/* Heatmap Grid */}
            <div className="relative w-full max-w-[85vw] sm:max-w-full overflow-x-auto custom-scrollbar pb-2">
                <div className="min-w-max flex gap-1">
                    {/* Render simplistic column-based grid for "Daily" view */}
                    {Array.from({ length: 12 }).map((_, weekIndex) => (
                        <div key={weekIndex} className="flex flex-col gap-1">
                            {Array.from({ length: 7 }).map((_, dayIndex) => {
                                const index = weekIndex * 7 + dayIndex;
                                const dayData = data[index] || { intensity: 0 };

                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: index * 0.005 }}
                                        className={clsx(
                                            "w-3 h-3 md:w-4 md:h-4 rounded-[2px] border transition-colors hover:scale-125 cursor-pointer hover:z-10",
                                            getColor(dayData.intensity)
                                        )}
                                        title={`Focus Level: ${dayData.intensity}`}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-end gap-2 text-xs text-white/30">
                <span>Less</span>
                <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-[2px] bg-white/5 border border-white/5"></div>
                    <div className="w-3 h-3 rounded-[2px] bg-accent/20 border border-accent/20"></div>
                    <div className="w-3 h-3 rounded-[2px] bg-accent/40 border border-accent/30"></div>
                    <div className="w-3 h-3 rounded-[2px] bg-accent/70 border border-accent/50"></div>
                    <div className="w-3 h-3 rounded-[2px] bg-accent border border-accent"></div>
                </div>
                <span>More</span>
            </div>
        </div>
    );
}
