'use client';

import { motion } from 'framer-motion';

export function TaskBreakdown() {
    // Mock Data
    const tasks = [
        { id: 1, title: 'Design System Update', time: 180, percentage: 100 },
        { id: 2, title: 'API Integration', time: 120, percentage: 66 },
        { id: 3, title: 'Client Meeting', time: 60, percentage: 33 },
        { id: 4, title: 'Code Review', time: 45, percentage: 25 },
        { id: 5, title: 'Documentation', time: 30, percentage: 16 },
    ];

    return (
        <div className="flex flex-col gap-6 p-6 md:p-8 rounded-[2rem] border border-white/5 bg-white/5 backdrop-blur-xl">
            <h3 className="text-xl font-bold text-white">Top Focused Tasks</h3>

            <div className="flex flex-col gap-4">
                {tasks.map((task, i) => (
                    <div key={task.id} className="group relative flex flex-col gap-2">
                        <div className="flex items-end justify-between text-sm">
                            <span className="font-medium text-white/90">{task.title}</span>
                            <span className="font-mono text-white/50">{task.time}m</span>
                        </div>

                        {/* Progress Bar Container */}
                        <div className="h-2 w-full rounded-full bg-black/20 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${task.percentage}%` }}
                                transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                                className="h-full rounded-full bg-accent/60 group-hover:bg-accent transition-colors"
                            />
                        </div>
                    </div>
                ))}
            </div>

            <button className="mt-2 text-sm text-center text-white/40 hover:text-white transition-colors">
                View All Tasks
            </button>
        </div>
    );
}
