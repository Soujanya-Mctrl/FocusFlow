'use client';

import { UserCircle, Flame, Clock } from 'lucide-react';

export function ProfileSummary() {
    // Mock Data
    const user = {
        name: "Zen Master",
        avatar: null, // Using icon fallback
        streak: 42,
        dailyAverage: 185
    };

    return (
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12 p-2 w-full">

            {/* User Info */}
            <div className="flex items-center gap-6 mr-auto">
                <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <UserCircle className="w-10 h-10 text-white/50" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                    <p className="text-sm text-white/40">Focus Flow Pro</p>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="flex gap-4 sm:gap-8 md:gap-16 w-full md:w-auto justify-between md:justify-end mt-4 md:mt-0 border-t border-white/5 md:border-t-0 pt-4 md:pt-0">
                {/* Streak */}
                <div className="flex flex-col items-center md:items-end gap-1">
                    <div className="flex items-center gap-2 text-accent">
                        <Flame className="w-5 h-5 fill-current" />
                        <span className="text-2xl font-bold">{user.streak}</span>
                    </div>
                    <span className="text-xs uppercase tracking-wider text-white/40">Day Streak</span>
                </div>

                {/* Avg Focus */}
                <div className="flex flex-col items-center md:items-end gap-1">
                    <div className="flex items-center gap-2 text-white/80">
                        <Clock className="w-5 h-5" />
                        <span className="text-2xl font-bold">{user.dailyAverage}m</span>
                    </div>
                    <span className="text-xs uppercase tracking-wider text-white/40">Daily Avg</span>
                </div>
            </div>
        </div>
    );
}
