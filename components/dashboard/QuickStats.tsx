'use client';

import { Trophy, Calendar } from 'lucide-react';

export function QuickStats() {
    const stats = [
        {
            label: 'Total Focus Time',
            value: '128h',
            icon: ClockIcon,
            desc: 'All time'
        },
        {
            label: 'Most Productive',
            value: 'Tuesday',
            icon: Calendar,
            desc: '24h total'
        },
        {
            label: 'Longest Streak',
            value: '14 Days',
            icon: Trophy,
            desc: 'Dec 10 - Dec 24'
        }
    ];

    return (
        <div className="flex overflow-x-auto pb-4 gap-4 sm:grid sm:grid-cols-3 sm:pb-0 sm:overflow-visible snap-x custom-scrollbar">
            {stats.map((stat, i) => (
                <div key={i} className="min-w-[240px] flex-1 flex flex-col gap-3 p-6 rounded-[2rem] border border-white/5 bg-white/5 backdrop-blur-xl snap-center">
                    <div className="flex items-center gap-3 text-white/40">
                        <stat.icon className="w-5 h-5" />
                        <span className="text-xs font-semibold uppercase tracking-wider">{stat.label}</span>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white shadow-glow">{stat.value}</div>
                        <div className="text-sm text-white/30 mt-1">{stat.desc}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    );
}
