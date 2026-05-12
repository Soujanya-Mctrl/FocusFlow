'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
    CheckCircle2, Circle, Clock, MoreVertical, 
    Hash, Play, GripVertical 
} from 'lucide-react';
import { Task, useTaskStore } from '@/store/useTaskStore';

interface TaskCardProps {
    task: Task;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
    const { toggleTaskCompletion, lists } = useTaskStore();
    
    const list = lists.find(l => l.id === task.listId);
    const subtasksDone = task.subtasks.filter(s => s.done).length;
    const totalSubtasks = task.subtasks.length;
    const progress = totalSubtasks > 0 ? (subtasksDone / totalSubtasks) * 100 : 0;

    return (
    return (
        <motion.div 
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01, borderColor: 'rgba(0, 245, 225, 0.2)' }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`
                group relative flex items-start p-5 bg-surface-container-low hover:bg-surface-container hover:shadow-[0_0_20px_rgba(0,245,225,0.05)]
                backdrop-blur-md border border-white/[0.03] rounded-2xl transition-all
                ${task.status === 'done' ? 'opacity-50' : ''}
            `}
        >
            {/* Drag Handle */}
            <div className="mr-3 pt-1 opacity-0 group-hover:opacity-40 cursor-grab active:cursor-grabbing text-white transition-opacity">
                <GripVertical size={16} />
            </div>

            {/* Checkbox (Circular Pill) */}
            <button 
                onClick={() => toggleTaskCompletion(task.id)}
                className="mt-0.5 mr-5 flex-shrink-0 transition-all active:scale-90"
            >
                {task.status === 'done' ? (
                    <div className="w-6 h-6 rounded-full bg-primary-container flex items-center justify-center shadow-[0_0_12px_rgba(0,245,225,0.4)]">
                        <CheckCircle2 size={16} className="text-on-primary-container stroke-[3]" />
                    </div>
                ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-white/10 group-hover:border-primary-container/40 transition-colors" />
                )}
            </button>

            {/* Content */}
            <div className="flex-grow min-w-0 pr-4">
                <div className="flex items-center space-x-3 mb-2">
                    <h3 className={`text-[17px] font-medium tracking-tight truncate ${task.status === 'done' ? 'line-through text-white/20' : 'text-white/90'}`}>
                        {task.title}
                    </h3>
                    {list && (
                        <span 
                            className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.1em] border border-white/[0.05]"
                            style={{ backgroundColor: `${list.color}10`, color: list.color }}
                        >
                            {list.name}
                        </span>
                    )}
                </div>

                {/* Subtask Progress */}
                {totalSubtasks > 0 && (
                    <div className="mt-4 mb-4">
                        <div className="flex items-center justify-between text-label-sm text-white/20 mb-2 uppercase">
                            <span>Focus Progress</span>
                            <span>{subtasksDone}/{totalSubtasks}</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                className="h-full bg-primary-container rounded-full shadow-[0_0_8px_rgba(0,245,225,0.4)]"
                            />
                        </div>
                    </div>
                )}

                {/* Metadata Row */}
                <div className="flex items-center flex-wrap gap-3 mt-1">
                    {task.estimatedMinutes && (
                        <div className="flex items-center text-label-sm text-white/40 uppercase bg-white/[0.02] border border-white/[0.05] px-2.5 py-1 rounded-lg">
                            <Clock size={12} className="mr-2 text-primary-container/60" />
                            {task.estimatedMinutes}m
                        </div>
                    )}
                    
                    {task.tags.map(tag => (
                        <div key={tag} className="flex items-center text-label-sm text-white/30 uppercase bg-white/[0.02] border border-white/[0.05] px-2.5 py-1 rounded-lg hover:border-primary-container/20 transition-colors">
                            <Hash size={12} className="mr-1.5" />
                            {tag}
                        </div>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                    className="p-2.5 bg-primary-container/10 hover:bg-primary-container rounded-xl text-primary-container hover:text-on-primary-container transition-all active:scale-95 shadow-lg hover:shadow-primary-container/20"
                    title="Focus Now"
                >
                    <Play size={18} fill="currentColor" />
                </button>
                <button 
                    className="p-2.5 hover:bg-white/5 rounded-xl text-white/20 hover:text-white transition-all"
                    title="More options"
                >
                    <MoreVertical size={18} />
                </button>
            </div>
        </motion.div>
    );
};
