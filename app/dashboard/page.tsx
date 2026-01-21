'use client';
import { BackgroundRenderer } from '@/components/focus/BackgroundRenderer';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ProfileSummary } from '@/components/dashboard/ProfileSummary';
import { FocusHeatmap } from '@/components/dashboard/FocusHeatmap';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { TaskBreakdown } from '@/components/dashboard/TaskBreakdown';
import { ActivityChart } from '@/components/dashboard/ActivityChart';

export default function DashboardPage() {
    return (
        <main className="relative min-h-screen w-full text-text-primary bg-black overflow-x-hidden">
            <BackgroundRenderer />

            {/* Content Container */}
            <div className="relative z-10 w-full max-w-4xl mx-auto px-6 py-12 md:py-20 flex flex-col gap-8 md:gap-12">

                {/* Header / Nav */}
                <header className="flex items-center justify-between">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        Back to Timer
                    </Link>
                </header>

                {/* Dashboard Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="flex flex-col gap-6"
                >
                    {/* Profile Section */}
                    <div className="rounded-[2rem] border border-white/5 bg-white/5 backdrop-blur-xl p-6 md:p-8">
                        <ProfileSummary />
                    </div>

                    {/* Activity Chart */}
                    <ActivityChart />

                    {/* Stats Grid */}
                    <QuickStats />

                    {/* Heatmap Section */}
                    <FocusHeatmap />

                    {/* Task Breakdown */}
                    <TaskBreakdown />

                </motion.div>
            </div>
        </main>
    );
}
