'use client';

import React from 'react';
import { 
    Calendar, Inbox, Star, Clock,
    Plus, Search, Settings
} from 'lucide-react';
import { useTaskStore } from '@/store/useTaskStore';
import { motion } from 'framer-motion';

export const TaskSidebar: React.FC = () => {
    const { 
        lists, tasks, activeListId, setActiveListId, 
        addList 
    } = useTaskStore();

    // In a real app, these would come from the store or separate handlers
    const smartViews = [
        { id: 'all', label: 'Inbox', icon: <Inbox size={18} />, color: 'text-cyan-400' },
        { id: 'today', label: 'Today', icon: <Calendar size={18} />, color: 'text-cyan-400' },
        { id: 'starred', label: 'Starred', icon: <Star size={18} />, color: 'text-cyan-400' },
    ];

    const getCount = (listId: string) => {
        if (listId === 'today') {
            const today = new Date().toISOString().split('T')[0];
            return tasks.filter(t => t.scheduledDate?.startsWith(today) && t.status !== 'done').length;
        }
        if (listId === 'all') {
            return tasks.filter(t => t.status !== 'done').length;
        }
        if (listId === 'starred') {
            return tasks.filter(t => t.priority === 'high' && t.status !== 'done').length;
        }
        return tasks.filter(t => t.listId === listId && t.status !== 'done').length;
    };

    const handleAddList = () => {
        const name = prompt('Project Name:');
        if (name) addList(name);
    };

    return (
        <div className="w-72 h-full bg-surface-container-low p-8 border-r border-white/5 flex flex-col font-sans">
            {/* Header */}
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Tasks</h1>
                    <p className="text-label-sm text-white/20 uppercase mt-1">Command Center</p>
                </div>
                <button className="p-2.5 bg-white/[0.03] hover:bg-white/[0.08] rounded-xl text-white/40 transition-all border border-white/[0.05]">
                    <Search size={18} />
                </button>
            </div>

            {/* Quick Add Button */}
            <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                    const addBtn = document.getElementById('global-add-task-btn');
                    if (addBtn) addBtn.click();
                }}
                className="w-full bg-primary-container hover:bg-primary-container/90 text-on-primary-container py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 mb-10 shadow-[0_0_24px_rgba(0,245,225,0.15)] transition-all"
            >
                <Plus size={20} strokeWidth={3} />
                New Task
            </motion.button>

            {/* Smart Views */}
            <div className="mb-10">
                <h3 className="text-label-sm text-white/20 uppercase mb-6 px-3">Smart Views</h3>
                <div className="space-y-1.5">
                    {smartViews.map(view => (
                        <NavItem 
                            key={view.id}
                            icon={view.icon}
                            label={view.label}
                            count={getCount(view.id)}
                            isActive={activeListId === view.id}
                            onClick={() => setActiveListId(view.id)}
                            color={view.color}
                        />
                    ))}
                </div>
            </div>

            {/* Projects */}
            <div className="mb-10 flex-grow overflow-y-auto custom-scrollbar pr-2 -mr-2">
                <div className="flex items-center justify-between mb-6 px-3">
                    <h3 className="text-label-sm text-white/20 uppercase">Projects</h3>
                    <button 
                        onClick={handleAddList}
                        className="p-1.5 hover:bg-white/5 rounded-lg text-white/20 hover:text-white/60 transition-colors"
                    >
                        <Plus size={16} />
                    </button>
                </div>
                <div className="space-y-1.5">
                    {lists.map(list => (
                        <NavItem 
                            key={list.id}
                            icon={<div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: list.color || '#00f5e1', color: list.color || '#00f5e1' }} />}
                            label={list.name}
                            count={getCount(list.id)}
                            isActive={activeListId === list.id}
                            onClick={() => setActiveListId(list.id)}
                        />
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="pt-8 border-t border-white/5 flex items-center justify-between mt-auto">
                <button className="flex items-center gap-3 text-white/40 hover:text-white/80 transition-all text-sm font-medium px-2 py-2 rounded-xl hover:bg-white/5">
                    <Settings size={18} />
                    Settings
                </button>
                <div className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-white/60 text-xs font-bold">
                    A
                </div>
            </div>
        </div>
    );
};

interface NavItemProps {
    icon: React.ReactNode;
    label: string;
    count?: number;
    isActive: boolean;
    onClick: () => void;
    color?: string;
    isCompact?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, count, isActive, onClick, isCompact }) => (
    <button 
        onClick={onClick}
        className={`
            w-full flex items-center px-3 py-2.5 rounded-lg transition-all group relative
            ${isActive ? 'bg-white/5 text-white' : 'text-white/40 hover:bg-white/[0.02] hover:text-white/80'}
            ${isCompact ? 'py-1.5' : ''}
        `}
    >
        {isActive && (
            <motion.div 
                layoutId="active-pill"
                className="absolute left-0 w-1 h-5 bg-primary-container rounded-r-full shadow-[0_0_12px_rgba(0,245,225,0.6)]"
            />
        )}
        <div className={`flex-shrink-0 mr-3 transition-colors ${isActive ? 'text-primary-container' : 'text-inherit opacity-60'}`}>
            {icon}
        </div>
        <span className={`flex-grow text-sm font-medium truncate text-left ${isActive ? 'font-semibold' : ''}`}>
            {label}
        </span>
        {count !== undefined && count > 0 && (
            <span className={`
                text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[24px] text-center
                ${isActive ? 'bg-primary-container text-on-primary-container' : 'bg-white/5 text-white/40 group-hover:bg-white/10'}
            `}>
                {count}
            </span>
        )}
    </button>
);
