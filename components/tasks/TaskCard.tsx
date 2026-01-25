'use client';

import { motion } from 'framer-motion';
import { Copy, Trash2, Clock, CheckCircle2, Circle } from 'lucide-react';
import { Task, useTaskStore } from '@/store/useTaskStore';
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSupabase } from '@/hooks/useSupabase';

export function TaskCard({ task }: { task: Task }) {
    const { user } = useUser();
    const supabase = useSupabase();

    const toggleTaskCompletion = useTaskStore(state => state.toggleTaskCompletion);
    const removeTask = useTaskStore(state => state.removeTask);
    const [isHovered, setIsHovered] = useState(false);

    // Format date roughly
    const date = new Date(task.created_at);
    const dateString = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className={`
                group relative p-4 rounded-xl border transition-all cursor-pointer
                ${task.completed
                    ? 'bg-white/[0.02] border-white/5 opacity-60'
                    : 'bg-white/5 border-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-black/20'}
            `}
        >
            <div className="flex items-start gap-3">
                <button
                    onClick={async () => {
                        toggleTaskCompletion(task.id);
                        if (user && supabase) {
                            const { error } = await supabase.from('tasks').update({
                                completed: !task.completed
                            }).eq('id', task.id).eq('user_id', user.id);

                            if (error) console.error('Failed to update task:', error);
                        }
                    }}
                    className={`mt-0.5 transition-colors ${task.completed ? 'text-accent' : 'text-white/20 hover:text-white/60'}`}
                >
                    {task.completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                </button>

                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium leading-relaxed ${task.completed ? 'text-white/40 line-through' : 'text-white/90'}`}>
                        {task.title}
                    </p>

                    <div className="mt-2 flex items-center gap-3 text-[10px] text-white/40">
                        <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{dateString}</span>
                        </div>
                        {/* Example Badge */}
                        {/* <div className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5">
                            Marketing
                        </div> */}
                    </div>
                </div>

                <div className={`absolute top-2 right-2 flex gap-1 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                    <button
                        onClick={async () => {
                            removeTask(task.id);
                            if (user && supabase) {
                                const { error } = await supabase.from('tasks').delete().eq('id', task.id).eq('user_id', user.id);
                                if (error) console.error('Failed to delete task:', error);
                            }
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-500/20 hover:text-red-400 text-white/40 transition-colors"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
