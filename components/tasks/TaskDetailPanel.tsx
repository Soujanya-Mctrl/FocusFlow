'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, CheckCircle2, Circle, Plus, Trash2, 
    Clock, Tag, FileText, ChevronRight, ListTodo 
} from 'lucide-react';
import { useTaskStore, Task, Subtask } from '@/store/useTaskStore';
import clsx from 'clsx';

interface TaskDetailPanelProps {
    taskId: string | null;
    onClose: () => void;
}

export function TaskDetailPanel({ taskId, onClose }: TaskDetailPanelProps) {
    const { tasks, updateTask, removeTask, addSubtask, toggleSubtask, removeSubtask } = useTaskStore();
    const task = tasks.find(t => t.id === taskId);
    
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

    if (!taskId || !task) return null;

    const handleAddSubtask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSubtaskTitle.trim()) return;
        addSubtask(task.id, newSubtaskTitle.trim());
        setNewSubtaskTitle('');
    };

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative h-full w-[400px] bg-zinc-950 border-l border-white/5 z-50 flex flex-col shadow-2xl shadow-black"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
                <div className="flex items-center gap-2 text-accent">
                    <ListTodo className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Task Details</span>
                </div>
                <button 
                    onClick={onClose}
                    className="p-2 hover:bg-white/5 rounded-full transition-all text-white/30 hover:text-white"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                {/* Title Section */}
                <section>
                    <input 
                        value={task.title}
                        onChange={(e) => updateTask(task.id, { title: e.target.value })}
                        className="w-full bg-transparent border-none p-0 text-2xl font-black text-white/90 focus:ring-0 placeholder:text-white/10 leading-tight"
                        placeholder="Task Title"
                    />
                    <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
                            <Clock className="w-3 h-3 text-white/30" />
                            <input 
                                type="number"
                                value={task.estimatedMinutes || ''}
                                onChange={(e) => updateTask(task.id, { estimatedMinutes: parseInt(e.target.value) || 0 })}
                                className="w-8 bg-transparent border-none p-0 text-xs font-bold text-white focus:ring-0"
                            />
                            <span className="text-[10px] font-bold text-white/20 uppercase">min</span>
                        </div>
                        <button 
                            onClick={() => {
                                removeTask(task.id);
                                onClose();
                            }}
                            className="ml-auto p-2 hover:bg-red-500/10 rounded-lg text-white/10 hover:text-red-400 transition-all"
                            title="Delete Task"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </section>

                {/* Subtasks Section */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 flex items-center gap-2">
                            <ChevronRight className="w-3 h-3 text-accent" />
                            Subtasks
                        </h3>
                        <span className="text-[10px] font-black text-accent bg-accent/10 px-2 py-0.5 rounded">
                            {task.subtasks.filter(s => s.done).length}/{task.subtasks.length}
                        </span>
                    </div>
                    
                    <div className="space-y-2">
                        {task.subtasks.map((subtask) => (
                            <div key={subtask.id} className="group flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
                                <button 
                                    onClick={() => toggleSubtask(task.id, subtask.id)}
                                    className={clsx(
                                        "transition-colors",
                                        subtask.done ? "text-accent" : "text-white/20"
                                    )}
                                >
                                    {subtask.done ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                                </button>
                                <input 
                                    value={subtask.title}
                                    onChange={(e) => {
                                        const newSubtasks = task.subtasks.map(s => s.id === subtask.id ? { ...s, title: e.target.value } : s);
                                        updateTask(task.id, { subtasks: newSubtasks });
                                    }}
                                    className={clsx(
                                        "flex-1 bg-transparent border-none p-0 text-sm focus:ring-0",
                                        subtask.done ? "text-white/20 line-through" : "text-white/70"
                                    )}
                                />
                                <button 
                                    onClick={() => removeSubtask(task.id, subtask.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 rounded-lg text-white/10 hover:text-red-400 transition-all"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                        
                        <form onSubmit={handleAddSubtask} className="mt-4">
                            <div className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/5 focus-within:border-accent/40 transition-all">
                                <Plus className="w-4 h-4 text-white/20" />
                                <input 
                                    value={newSubtaskTitle}
                                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                    placeholder="Add subtask..."
                                    className="flex-1 bg-transparent border-none p-0 text-sm text-white focus:ring-0 placeholder:text-white/10"
                                />
                            </div>
                        </form>
                    </div>
                </section>

                {/* Notes Section */}
                <section>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-4 flex items-center gap-2">
                        <FileText className="w-3 h-3 text-accent" />
                        Notes
                    </h3>
                    <textarea 
                        value={task.notes}
                        onChange={(e) => updateTask(task.id, { notes: e.target.value })}
                        className="w-full min-h-[150px] rounded-2xl bg-white/[0.02] border border-white/5 p-4 text-sm text-white/60 focus:ring-accent/20 focus:border-accent/40 transition-all placeholder:text-white/5 resize-none"
                        placeholder="Add some context..."
                    />
                </section>
            </div>
        </motion.div>
    );
}
