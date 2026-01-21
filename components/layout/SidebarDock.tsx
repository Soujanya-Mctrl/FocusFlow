'use client';

import { motion } from "framer-motion";
import { CheckSquare, TrendingUp, Sliders, UserCircle } from "lucide-react";
import clsx from "clsx";
import { useRouter } from "next/navigation";

interface DockIconProps {
    icon: React.ElementType;
    label: string;
    isActive: boolean;
    onClick: () => void;
    shortcut?: string;
}

function DockIcon({ icon: Icon, label, isActive, onClick, shortcut }: DockIconProps) {
    return (
        <button
            onClick={onClick}
            className={clsx(
                "group relative flex items-center justify-center p-2 transition-all rounded-lg",
                isActive ? "text-white" : "text-white/40 hover:text-white"
            )}
            title={label}
        >
            <Icon className="w-5 h-5" strokeWidth={2} />

            {shortcut && (
                <div className="hidden sm:block absolute -bottom-2 translate-y-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    <div className="flex items-center justify-center rounded border border-white/20 bg-black/80 px-1.5 py-0.5 text-[9px] uppercase tracking-normal text-white shadow-xl">
                        {shortcut}
                    </div>
                </div>
            )}

            {isActive && (
                <motion.div
                    layoutId="active-pill"
                    className="absolute bottom-0 w-full h-1 bg-accent rounded-t-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                />
            )}
        </button>
    );
}

interface SidebarDockProps {
    activePanel: string | null;
    onTogglePanel: (panel: string) => void;
}

export function SidebarDock({ activePanel, onTogglePanel }: SidebarDockProps) {
    const router = useRouter();

    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 md:top-16 md:bottom-auto md:left-6 md:translate-x-0 z-50 flex items-center gap-1 p-1.5 rounded-full bg-transparent"
        >
            <div className="flex items-center gap-1 sm:gap-2">
                <DockIcon
                    icon={CheckSquare}
                    label="Tasks"
                    isActive={activePanel === 'tasks'}
                    onClick={() => onTogglePanel('tasks')}
                    shortcut="Ctrl + Space"
                />
                <DockIcon
                    icon={TrendingUp}
                    label="Stats"
                    isActive={activePanel === 'stats'}
                    onClick={() => onTogglePanel('stats')}
                />
                {/* <div className="w-px h-6 bg-white/10 mx-1" /> */}
                <DockIcon
                    icon={Sliders}
                    label="Settings"
                    isActive={activePanel === 'settings'}
                    onClick={() => onTogglePanel('settings')}
                />

            </div>
        </motion.div>
    );
}
