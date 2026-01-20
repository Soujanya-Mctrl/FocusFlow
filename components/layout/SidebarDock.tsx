'use client';

import { motion } from "framer-motion";
import { ListTodo, Settings, BarChart2 } from "lucide-react";
import clsx from "clsx";

interface DockIconProps {
    icon: React.ElementType;
    label: string;
    isActive: boolean;
    onClick: () => void;
}

function DockIcon({ icon: Icon, label, isActive, onClick }: DockIconProps) {
    return (
        <button
            onClick={onClick}
            className={clsx(
                "group relative flex items-center justify-center p-3 transition-all rounded-xl",
                isActive ? "text-white bg-white/10" : "text-text-secondary hover:text-white hover:bg-white/5"
            )}
            title={label}
        >
            <Icon className="w-6 h-6" />
            {isActive && (
                <motion.div
                    layoutId="active-pill"
                    className="absolute left-0 h-full w-1 bg-accent rounded-r-full"
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
    return (
        <motion.aside
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="fixed left-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/5 p-2 shadow-2xl"
        >
            <div className="flex flex-col gap-2">
                <DockIcon
                    icon={ListTodo}
                    label="Tasks"
                    isActive={activePanel === 'tasks'}
                    onClick={() => onTogglePanel('tasks')}
                />
                <DockIcon
                    icon={BarChart2}
                    label="Stats"
                    isActive={activePanel === 'stats'}
                    onClick={() => onTogglePanel('stats')}
                />
                <div className="h-px w-full bg-white/10 my-1" />
                <DockIcon
                    icon={Settings}
                    label="Settings"
                    isActive={activePanel === 'settings'}
                    onClick={() => onTogglePanel('settings')}
                />
            </div>
        </motion.aside>
    );
}
