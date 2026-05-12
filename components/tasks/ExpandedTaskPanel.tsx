'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    X, Clock, Calendar, Hash, List as ListIcon, 
    Plus, ChevronRight, CheckCircle2, Circle
} from 'lucide-react';
import { useTaskStore, Subtask } from '@/store/useTaskStore';

interface ExpandedTaskPanelProps {
    initialTitle?: string;
    onClose: () => void;
}

export const ExpandedTaskPanel: React.FC<ExpandedTaskPanelProps> = ({ initialTitle = '', onClose }) => {
    const [title, setTitle] = useState(initialTitle);
    const [notes, setNotes] = useState('');
    const [estimatedMinutes, setEstimatedMinutes] = useState<number | undefined>(undefined);
    const [subtasks, setSubtasks] = useState<Omit<Subtask, 'id'>[]>([]);
    const [newSubtask, setNewSubtask] = useState('');
    const [selectedListId, setSelectedListId] = useState('');
    
    const { lists, addTask, activeListId } = useTaskStore();

    useEffect(() => {
        const defaultListId = activeListId === 'today' || activeListId === 'all' 
            ? lists[0]?.id 
            : activeListId;
        setSelectedListId(defaultListId);
    }, [activeListId, lists]);

    const handleSave = () => {
        if (!title.trim()) return;

        addTask({
            title,
            notes,
            estimatedMinutes,
            listId: selectedListId,
            subtasks: subtasks.map(s => ({ ...s, id: crypto.randomUUID() })),
            status: 'todo',
        });

        onClose();
    };

    const addSubtask = () => {
        if (!newSubtask.trim()) return;
        setSubtasks([...subtasks, { title: newSubtask, done: false }]);
        setNewSubtask('');
    };

    const toggleSubtask = (index: number) => {
        const updated = [...subtasks];
        updated[index].done = !updated[index].done;
        setSubtasks(updated);
    };

    return (
        <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="w-full max-w-2xl mx-auto mb-8 bg-white/10 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
        >
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <input 
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Task Title"
                        className="flex-grow bg-transparent border-none outline-none text-2xl font-semibold text-white placeholder:text-white/20"
                        autoFocus
                    />
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white/40 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column: Details */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="flex items-center text-xs font-bold text-white/30 uppercase tracking-widest">
                                <ListIcon size={12} className="mr-2" />
                                List
                            </label>
                            <select 
                                value={selectedListId}
                                onChange={(e) => setSelectedListId(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white outline-none focus:ring-1 focus:ring-blue-500/50 transition-all appearance-none"
                            >
                                {lists.map(list => (
                                    <option key={list.id} value={list.id} className="bg-zinc-900">{list.icon} {list.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center text-xs font-bold text-white/30 uppercase tracking-widest">
                                <Clock size={12} className="mr-2" />
                                Time Estimate
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {[15, 25, 45, 60, 90].map(min => (
                                    <button
                                        key={min}
                                        onClick={() => setEstimatedMinutes(min)}
                                        className={`
                                            px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                                            ${estimatedMinutes === min 
                                                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                                                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'}
                                        `}
                                    >
                                        {min}m
                                    </button>
                                ))}
                                <button
                                    onClick={() => setEstimatedMinutes(undefined)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-white/40 hover:bg-white/10`}
                                >
                                    Clear
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center text-xs font-bold text-white/30 uppercase tracking-widest">
                                <Hash size={12} className="mr-2" />
                                Notes
                            </label>
                            <textarea 
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add some context..."
                                className="w-full h-32 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder:text-white/20 outline-none focus:ring-1 focus:ring-blue-500/50 transition-all resize-none"
                            />
                        </div>
                    </div>

                    {/* Right Column: Subtasks */}
                    <div className="space-y-4">
                        <label className="flex items-center text-xs font-bold text-white/30 uppercase tracking-widest">
                            <CheckCircle2 size={12} className="mr-2" />
                            Subtasks ({subtasks.filter(s => s.done).length}/{subtasks.length})
                        </label>
                        
                        <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                            {subtasks.map((s, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center group"
                                >
                                    <button onClick={() => toggleSubtask(i)} className="mr-3 text-white/20 hover:text-blue-400 transition-colors">
                                        {s.done ? <CheckCircle2 size={18} className="text-blue-500" /> : <Circle size={18} />}
                                    </button>
                                    <span className={`text-sm ${s.done ? 'text-white/30 line-through' : 'text-white/80'}`}>{s.title}</span>
                                    <button 
                                        onClick={() => setSubtasks(subtasks.filter((_, idx) => idx !== i))}
                                        className="ml-auto opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all"
                                    >
                                        <X size={14} />
                                    </button>
                                </motion.div>
                            ))}
                        </div>

                        <div className="relative">
                            <input 
                                type="text"
                                value={newSubtask}
                                onChange={(e) => setNewSubtask(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addSubtask()}
                                placeholder="Add a step..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-3 pr-10 py-2 text-sm text-white placeholder:text-white/20 outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                            />
                            <button 
                                onClick={addSubtask}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white transition-colors"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-xs text-white/40">
                        <span className="flex items-center"><Calendar size={12} className="mr-1" /> No date set</span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <button 
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSave}
                            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-xl text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                        >
                            Create Task
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
