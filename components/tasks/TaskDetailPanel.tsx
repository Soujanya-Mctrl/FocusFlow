'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, Check, Plus, Trash2, 
    Clock, FileText, ChevronRight, ListTodo,
    Calendar, AlertCircle, Pencil
} from 'lucide-react';
import { useTaskStore, Task } from '@/store/useTaskStore';
import clsx from 'clsx';

interface TaskDetailPanelProps {
    taskId: string | null;
    onClose: () => void;
    onEditTask: (task: Task) => void;
}

export function TaskDetailPanel({ taskId, onClose, onEditTask }: TaskDetailPanelProps) {
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

    const completedSubtasks = task.subtasks.filter(s => s.done).length;
    const totalSubtasks = task.subtasks.length;
    const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute right-0 top-0 h-full w-[440px] bg-[#0c0c0c]/90 backdrop-blur-3xl border-l border-white/[0.05] z-50 flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.5)]"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/[0.05]">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary-container/10 flex items-center justify-center border border-primary-container/20">
                        <ListTodo className="w-4 h-4 text-primary-container" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">Task Detail</span>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => onEditTask(task)}
                        className="p-2.5 hover:bg-white/5 rounded-2xl transition-all text-white/30 hover:text-primary-container active:scale-90"
                        title="Edit in Modal"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={onClose}
                        className="p-2.5 hover:bg-white/5 rounded-2xl transition-all text-white/30 hover:text-white active:scale-90"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-12 custom-scrollbar">
                {/* Title & Stats */}
                <section className="space-y-6">
                    <div className="space-y-4">
                        <textarea 
                            value={task.title}
                            onChange={(e) => updateTask(task.id, { title: e.target.value })}
                            rows={2}
                            className="w-full bg-transparent border-none p-0 text-3xl font-black text-white/90 focus:ring-0 placeholder:text-white/10 leading-[1.1] resize-none overflow-hidden"
                            placeholder="Task Title"
                        />
                        
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/[0.03] border border-white/[0.05] transition-colors hover:border-white/[0.1]">
                                <Clock className="w-4 h-4 text-primary-container/60" />
                                <div className="flex items-baseline gap-1">
                                    <input 
                                        type="number"
                                        value={task.estimatedMinutes || ''}
                                        onChange={(e) => updateTask(task.id, { estimatedMinutes: parseInt(e.target.value) || 0 })}
                                        className="w-8 bg-transparent border-none p-0 text-sm font-black text-white/80 focus:ring-0"
                                    />
                                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">min</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/[0.03] border border-white/[0.05] transition-colors hover:border-white/[0.1]">
                                <Calendar className="w-4 h-4 text-primary-container/60" />
                                <span className="text-sm font-bold text-white/60">
                                    {task.scheduledDate ? new Date(task.scheduledDate).toLocaleDateString() : 'Unscheduled'}
                                </span>
                            </div>

                            <button 
                                onClick={() => {
                                    removeTask(task.id);
                                    onClose();
                                }}
                                className="ml-auto p-2.5 hover:bg-red-500/10 rounded-2xl text-white/10 hover:text-red-400 transition-all active:scale-90"
                                title="Delete Task"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-3 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                         <div className="flex justify-between items-center text-[10px] font-black tracking-widest text-white/30 uppercase">
                            <span className="flex items-center gap-2">
                                <Check className="w-3.5 h-3.5 text-primary-container/60" />
                                Completion
                            </span>
                            <span className="text-primary-container">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                className="h-full bg-primary-container shadow-[0_0_15px_rgba(0,245,225,0.4)] rounded-full" 
                            />
                        </div>
                    </div>
                </section>

                {/* Subtasks Section */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30 flex items-center gap-2">
                            <ChevronRight className="w-3 h-3 text-primary-container" />
                            Subtasks
                        </h3>
                        <div className="px-2.5 py-1 rounded-lg bg-primary-container/10 border border-primary-container/20">
                            <span className="text-[10px] font-black text-primary-container">
                                {completedSubtasks} / {totalSubtasks}
                            </span>
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        <AnimatePresence mode="popLayout">
                            {task.subtasks.map((subtask) => (
                                <motion.div 
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    key={subtask.id} 
                                    className="group flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] hover:bg-white/[0.04] transition-all"
                                >
                                    <button 
                                        onClick={() => toggleSubtask(task.id, subtask.id)}
                                        className={clsx(
                                            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all active:scale-90",
                                            subtask.done 
                                                ? "bg-primary-container border-primary-container text-on-primary-container shadow-[0_0_15px_rgba(0,245,225,0.4)]" 
                                                : "border-white/10 hover:border-primary-container/40 bg-white/[0.02]"
                                        )}
                                    >
                                        {subtask.done && <Check className="h-3.5 w-3.5 stroke-[4]" />}
                                    </button>
                                    <input 
                                        value={subtask.title}
                                        onChange={(e) => {
                                            const newSubtasks = task.subtasks.map(s => s.id === subtask.id ? { ...s, title: e.target.value } : s);
                                            updateTask(task.id, { subtasks: newSubtasks });
                                        }}
                                        className={clsx(
                                            "flex-1 bg-transparent border-none p-0 text-sm font-bold focus:ring-0 transition-all",
                                            subtask.done ? "text-white/20 line-through" : "text-white/80 group-hover:text-white"
                                        )}
                                    />
                                    <button 
                                        onClick={() => removeSubtask(task.id, subtask.id)}
                                        className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/10 rounded-xl text-white/10 hover:text-red-400 transition-all active:scale-90"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        
                        <form onSubmit={handleAddSubtask} className="mt-6">
                            <div className="flex items-center gap-4 p-4 rounded-xl border border-dashed border-white/10 bg-white/[0.01] hover:border-primary-container/30 focus-within:border-primary-container/50 focus-within:bg-white/[0.03] transition-all group">
                                <Plus className="w-5 h-5 text-white/20 group-focus-within:text-primary-container" />
                                <input 
                                    value={newSubtaskTitle}
                                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                    placeholder="Add new subtask..."
                                    className="flex-1 bg-transparent border-none p-0 text-sm font-bold text-white focus:ring-0 placeholder:text-white/10"
                                />
                            </div>
                        </form>
                    </div>
                </section>

                {/* Notes Section */}
                <section className="space-y-6">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30 flex items-center gap-2">
                        <FileText className="w-3 h-3 text-primary-container" />
                        Notes & Context
                    </h3>
                    <div className="relative group">
                        <textarea 
                            value={task.notes}
                            onChange={(e) => updateTask(task.id, { notes: e.target.value })}
                            className="w-full min-h-[200px] rounded-2xl bg-white/[0.02] border border-white/[0.05] p-6 text-sm font-medium text-white/60 focus:text-white/90 focus:ring-0 focus:border-primary-container/30 transition-all placeholder:text-white/5 resize-none leading-relaxed"
                            placeholder="Type any thoughts, links or detailed instructions here..."
                        />
                        <div className="absolute top-4 right-4 opacity-20 group-focus-within:opacity-100 transition-opacity">
                            <AlertCircle className="w-4 h-4 text-primary-container" />
                        </div>
                    </div>
                </section>
            </div>
        </motion.div>
    );
}
