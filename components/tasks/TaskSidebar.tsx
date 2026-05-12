'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
    Calendar, Inbox, List as ListIcon, 
    Plus, Archive, Settings2, Star 
} from 'lucide-react';
import { useTaskStore } from '@/store/useTaskStore';

export const TaskSidebar: React.FC = () => {
    const { 
        lists, tasks, activeListId, setActiveListId, 
        addList 
    } = useTaskStore();

    const getCount = (listId: string) => {
        if (listId === 'today') {
            const today = new Date().toISOString().split('T')[0];
            return tasks.filter(t => t.scheduledDate?.startsWith(today) && t.status !== 'done').length;
        }
        if (listId === 'all') {
            return tasks.filter(t => t.status !== 'done').length;
        }
        return tasks.filter(t => t.listId === listId && t.status !== 'done').length;
    };

    const handleAddList = () => {
        const name = prompt('List Name:');
        if (name) addList(name);
    };

    return (
        <div className="w-64 h-full bg-black/20 backdrop-blur-md p-6 border-r border-white/5 flex flex-col">
            <h1 className="text-xl font-bold text-white mb-8 tracking-tight">FocusFlow</h1>

            <div className="space-y-1 mb-8">
                <NavItem 
                    icon={<Calendar size={18} className="text-blue-400" />}
                    label="Today"
                    count={getCount('today')}
                    isActive={activeListId === 'today'}
                    onClick={() => setActiveListId('today')}
                />
                <NavItem 
                    icon={<Inbox size={18} className="text-purple-400" />}
                    label="Inbox"
                    count={getCount('all')}
                    isActive={activeListId === 'all'}
                    onClick={() => setActiveListId('all')}
                />
            </div>

            <div className="flex-grow">
                <div className="flex items-center justify-between mb-4 px-2">
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">My Lists</span>
                    <button 
                        onClick={handleAddList}
                        className="p-1 hover:bg-white/10 rounded text-white/40 hover:text-white transition-colors"
                    >
                        <Plus size={14} />
                    </button>
                </div>

                <div className="space-y-1">
                    {lists.map(list => (
                        <NavItem 
                            key={list.id}
                            icon={<span className="text-sm">{list.icon || '📄'}</span>}
                            label={list.name}
                            count={getCount(list.id)}
                            isActive={activeListId === list.id}
                            onClick={() => setActiveListId(list.id)}
                            color={list.color}
                        />
                    ))}
                </div>
            </div>

            <div className="pt-6 border-t border-white/5 space-y-1">
                <NavItem 
                    icon={<Archive size={18} className="text-white/30" />}
                    label="Archived"
                    isActive={activeListId === 'archived'}
                    onClick={() => setActiveListId('archived')}
                />
                <NavItem 
                    icon={<Settings2 size={18} className="text-white/30" />}
                    label="Store Settings"
                    isActive={false}
                    onClick={() => {}}
                />
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
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, count, isActive, onClick, color }) => (
    <button 
        onClick={onClick}
        className={`
            w-full flex items-center px-3 py-2 rounded-xl transition-all group
            ${isActive ? 'bg-white/10 text-white shadow-lg' : 'text-white/50 hover:bg-white/5 hover:text-white'}
        `}
    >
        <div className="flex-shrink-0 mr-3">
            {icon}
        </div>
        <span className="flex-grow text-sm font-medium truncate text-left">{label}</span>
        {count !== undefined && count > 0 && (
            <span className={`
                text-[10px] font-bold px-1.5 py-0.5 rounded-md min-w-[20px] text-center
                ${isActive ? 'bg-blue-500 text-white' : 'bg-white/5 text-white/30 group-hover:bg-white/10 group-hover:text-white/50'}
            `}>
                {count}
            </span>
        )}
    </button>
);
