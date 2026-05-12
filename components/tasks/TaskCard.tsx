'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
    CheckCircle2, Circle, Clock, MoreVertical, 
    ChevronRight, Hash, Play, GripVertical 
} from 'lucide-react';
import { Task, useTaskStore } from '@/store/useTaskStore';

interface TaskCardProps {
    task: Task;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
    const { toggleTaskCompletion, lists, removeTask } = useTaskStore();
    
    const list = lists.find(l => l.id === task.listId);
    const subtasksDone = task.subtasks.filter(s => s.done).length;
    const totalSubtasks = task.subtasks.length;
    const progress = totalSubtasks > 0 ? (subtasksDone / totalSubtasks) * 100 : 0;

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`
                group relative flex items-start p-4 bg-white/5 hover:bg-white/10 
                backdrop-blur-md border border-white/5 rounded-2xl transition-all
                ${task.status === 'done' ? 'opacity-60' : ''}
            `}
        >
            {/* Drag Handle */}
            <div className="mr-2 pt-1 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing text-white/20 transition-opacity">
                <GripVertical size={16} />
            </div>

            {/* Checkbox */}
            <button 
                onClick={() => toggleTaskCompletion(task.id)}
                className="mt-1 mr-4 flex-shrink-0 transition-transform active:scale-90"
            >
                {task.status === 'done' ? (
                    <CheckCircle2 size={22} className="text-blue-500" />
                ) : (
                    <Circle size={22} className="text-white/20 group-hover:text-white/40" />
                )}
            </button>

            {/* Content */}
            <div className="flex-grow min-w-0 pr-4">
                <div className="flex items-center space-x-2 mb-1">
                    <h3 className={`text-base font-medium truncate ${task.status === 'done' ? 'line-through text-white/40' : 'text-white'}`}>
                        {task.title}
                    </h3>
                    {list && (
                        <span 
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                            style={{ backgroundColor: `${list.color}20`, color: list.color }}
                        >
                            {list.name}
                        </span>
                    )}
                </div>

                {/* Subtask Progress Bar */}
                {totalSubtasks > 0 && (
                    <div className="mt-2 mb-3">
                        <div className="flex items-center justify-between text-[10px] text-white/30 mb-1 font-bold uppercase tracking-tight">
                            <span>Progress</span>
                            <span>{subtasksDone}/{totalSubtasks}</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                className="h-full bg-blue-500 rounded-full"
                            />
                        </div>
                    </div>
                )}

                {/* Metadata Row */}
                <div className="flex items-center flex-wrap gap-y-2 gap-x-4 mt-2">
                    {task.estimatedMinutes && (
                        <div className="flex items-center text-[11px] text-white/40 font-medium bg-white/5 px-2 py-1 rounded-lg">
                            <Clock size={12} className="mr-1.5" />
                            {task.estimatedMinutes}m
                        </div>
                    )}
                    
                    {task.tags.map(tag => (
                        <div key={tag} className="flex items-center text-[11px] text-white/40 font-medium bg-white/5 px-2 py-1 rounded-lg">
                            <Hash size={12} className="mr-1" />
                            {tag}
                        </div>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                    className="p-2 hover:bg-blue-500 rounded-xl text-white/40 hover:text-white transition-all active:scale-95 shadow-lg hover:shadow-blue-500/20"
                    title="Focus Now"
                >
                    <Play size={18} fill="currentColor" />
                </button>
                <button 
                    className="p-2 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-all"
                    title="More options"
                >
                    <MoreVertical size={18} />
                </button>
            </div>
        </motion.div>
    );
};
