'use client';

import { motion } from "framer-motion";
import { ListTodo, Settings, BarChart2 } from "lucide-react";
import clsx from "clsx";

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
                "group relative flex items-center justify-center p-3 transition-all rounded-xl",
                isActive ? "text-white bg-white/10" : "text-text-secondary hover:text-white hover:bg-white/5"
            )}
            title={label}
        >
            <Icon className="w-6 h-6" />

            {shortcut && (
                <div className="absolute -bottom-2 translate-y-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
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
    return (
        <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed top-6 left-6 z-50 flex items-center gap-2 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/5 p-2 shadow-2xl"
        >
            <div className="flex items-center gap-2">
                <DockIcon
                    icon={ListTodo}
                    label="Tasks"
                    isActive={activePanel === 'tasks'}
                    onClick={() => onTogglePanel('tasks')}
                    shortcut="Ctrl + Space"
                />
                <DockIcon
                    icon={BarChart2}
                    label="Stats"
                    isActive={activePanel === 'stats'}
                    onClick={() => onTogglePanel('stats')}
                />
                <div className="w-px h-6 bg-white/10 mx-1" />
                <DockIcon
                    icon={Settings}
                    label="Settings"
                    isActive={activePanel === 'settings'}
                    onClick={() => onTogglePanel('settings')}
                />
            </div>
        </motion.div>
    );
}
