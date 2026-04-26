'use client';

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { useState } from 'react';
import clsx from 'clsx';

export function ActivityChart() {
    const [view, setView] = useState<'weekly' | 'monthly'>('weekly');

    // MOCK DATA for Weekly (Last 7 Days) - Minutes focused
    const weeklyData = [
        { name: 'Mon', minutes: 45 },
        { name: 'Tue', minutes: 120 },
        { name: 'Wed', minutes: 85 },
        { name: 'Thu', minutes: 160 },
        { name: 'Fri', minutes: 90 },
        { name: 'Sat', minutes: 30 },
        { name: 'Sun', minutes: 0 },
    ];

    // MOCK DATA for Monthly (Last 30 Days aggregated by week or just last 12 months)
    const monthlyData = [
        { name: 'Week 1', minutes: 450 },
        { name: 'Week 2', minutes: 620 },
        { name: 'Week 3', minutes: 510 },
        { name: 'Week 4', minutes: 780 },
    ];

    const data = view === 'weekly' ? weeklyData : monthlyData;

    return (
        <div className="flex flex-col gap-6 p-6 md:p-8 rounded-[2rem] border border-white/5 bg-white/5 backdrop-blur-xl">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Activity Trends</h3>

                {/* Toggle */}
                <div className="flex items-center p-1 rounded-xl bg-black/40 border border-white/5">
                    <button
                        onClick={() => setView('weekly')}
                        className={clsx(
                            "px-4 py-1.5 rounded-lg text-xs font-medium transition-all",
                            view === 'weekly' ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
                        )}
                    >
                        Weekly
                    </button>
                    <button
                        onClick={() => setView('monthly')}
                        className={clsx(
                            "px-4 py-1.5 rounded-lg text-xs font-medium transition-all",
                            view === 'monthly' ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
                        )}
                    >
                        Monthly
                    </button>
                </div>
            </div>

            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{
                            top: 10,
                            right: 0,
                            left: -20,
                            bottom: 0,
                        }}
                    >
                        <defs>
                            <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#fff" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#fff" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(0,0,0,0.8)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                            }}
                            itemStyle={{ color: '#fff' }}
                            labelStyle={{ color: 'rgba(255,255,255,0.5)', marginBottom: '0.25rem' }}
                            cursor={{ stroke: 'rgba(255,255,255,0.2)' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="minutes"
                            stroke="#fff"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorFocus)"
                            activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
