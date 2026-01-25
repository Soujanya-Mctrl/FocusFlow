'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useSupabase } from '@/hooks/useSupabase';
import { Task, useTaskStore } from '@/store/useTaskStore';
import { TaskCard } from '@/components/tasks/TaskCard';
import { motion } from 'framer-motion';

interface TaskColumnProps {
    title: string;
    tasks: Task[];
    section: Task['section'];
    isHighlighted?: boolean;
}

export function TaskColumn({ title, tasks, section, isHighlighted }: TaskColumnProps) {
    const { user } = useUser();
    const supabase = useSupabase();
    const addTask = useTaskStore(state => state.addTask);
    const [isAdding, setIsAdding] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newTaskTitle.trim()) {
            const newTask = addTask(newTaskTitle, section);
            setNewTaskTitle('');
            setIsAdding(false);

            if (user && supabase) {
                const { error } = await supabase.from('tasks').insert({
                    id: newTask.id,
                    user_id: user.id,
                    title: newTask.title,
                    completed: newTask.completed,
                    created_at: newTask.created_at,
                    section: newTask.section
                });
                if (error) {
                    console.error('Failed to create task:', error);
                }
            }
        }
    };

    return (
        <div className={`
            flex flex-col h-full min-w-[300px] w-full sm:w-auto rounded-3xl overflow-hidden
            ${isHighlighted
                ? 'bg-white/[0.03] border border-accent/20 shadow-[0_0_30px_-10px_rgba(var(--accent-rgb),0.1)]'
                : 'bg-white/[0.02] border border-white/5'}
            backdrop-blur-md transition-all
        `}>
            {/* Header */}
            <div className="p-5 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                    <h3 className={`text-lg font-bold tracking-tight ${isHighlighted ? 'text-white' : 'text-white/80'}`}>
                        {title}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/10 text-white/50">
                        {tasks.length}
                    </span>
                </div>
            </div>

            {/* Task List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                {tasks.length === 0 && !isAdding ? (
                    <div className="h-24 flex items-center justify-center text-white/20 text-sm italic border border-dashed border-white/10 rounded-xl">
                        No tasks
                    </div>
                ) : (
                    tasks.map(task => (
                        <TaskCard key={task.id} task={task} />
                    ))
                )}

                {/* Add Task Input form inside the list for better flow */}
                {isAdding && (
                    <motion.form
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onSubmit={handleAdd}
                        className="p-3 bg-black/20 rounded-xl border border-white/10"
                    >
                        <input
                            autoFocus
                            type="text"
                            placeholder="Type a task..."
                            className="w-full bg-transparent text-sm text-white placeholder-white/40 focus:outline-none"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            onBlur={() => !newTaskTitle && setIsAdding(false)}
                        />
                    </motion.form>
                )}
            </div>

            {/* Footer Action */}
            <div className="p-4 pt-0">
                <button
                    onClick={() => setIsAdding(true)}
                    className={`
                        w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all
                        ${isHighlighted
                            ? 'bg-accent/10 hover:bg-accent/20 text-accent border border-accent/20'
                            : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/5'}
                    `}
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Task</span>
                </button>
            </div>
        </div>
    );
}
