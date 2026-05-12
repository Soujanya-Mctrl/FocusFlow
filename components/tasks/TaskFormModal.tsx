'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
    X, Timer, Calendar, Plus, 
    ChevronDown, Check, Trash2, ListFilter, Flag 
} from 'lucide-react';
import { useTaskStore } from '@/store/useTaskStore';
import { motion, AnimatePresence } from 'framer-motion';

export interface TaskFormValues {
    title: string;
    listId: string;
    notes: string;
    estimatedMinutes: number;
    scheduledDate: string;
    scheduledTime: string;
    priority: 'low' | 'medium' | 'high';
    subtasks: { id: string; title: string; done: boolean }[];
}

interface TaskFormModalProps {
    isOpen: boolean;
    mode: 'create' | 'edit';
    initialValues: Partial<TaskFormValues>;
    onClose: () => void;
    onSubmit: (values: TaskFormValues) => void;
}

export function TaskFormModal({
    isOpen,
    mode,
    initialValues,
    onClose,
    onSubmit,
}: TaskFormModalProps) {
    const lists = useTaskStore(state => state.lists);
    
    const [values, setValues] = useState<TaskFormValues>({
        title: initialValues.title || '',
        listId: initialValues.listId || (lists.length > 0 ? lists[0].id : ''),
        notes: initialValues.notes || '',
        estimatedMinutes: initialValues.estimatedMinutes || 25,
        scheduledDate: initialValues.scheduledDate || '',
        scheduledTime: initialValues.scheduledTime || '',
        priority: initialValues.priority || 'medium',
        subtasks: initialValues.subtasks || []
    });

    const [newSubtask, setNewSubtask] = useState('');

    // Form values are initialized from initialValues on mount. 
    // To reset the form when initialValues change, the parent component should use a unique key.

    if (typeof document === 'undefined') return null;

    const handleAddSubtask = () => {
        if (!newSubtask.trim()) return;
        setValues(prev => ({
            ...prev,
            subtasks: [...prev.subtasks, { id: crypto.randomUUID(), title: newSubtask.trim(), done: false }]
        }));
        setNewSubtask('');
    };

    const handleRemoveSubtask = (id: string) => {
        setValues(prev => ({
            ...prev,
            subtasks: prev.subtasks.filter(st => st.id !== id)
        }));
    };

    return createPortal((
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-xl"
                    />

                    {/* Modal Content */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: 10 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="w-full max-w-2xl bg-[#1e1e1eb3] backdrop-blur-[20px] border border-white/[0.05] rounded-[16px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col z-10"
                    >
                        {/* Modal Header */}
                        <div className="flex justify-between items-center px-8 py-6 border-b border-white/[0.03]">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-[12px] bg-primary-container/10 flex items-center justify-center">
                                    <Plus className="w-5 h-5 text-primary-container" />
                                </div>
                                <div>
                                    <h2 className="text-label-sm text-white/90 uppercase">
                                        {mode === 'create' ? 'Create New Task' : 'Edit Task'}
                                    </h2>
                                    <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-bold mt-0.5">
                                        FocusFlow Workspace
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={onClose}
                                className="text-white/20 hover:text-white p-2 rounded-[12px] hover:bg-white/[0.05] transition-all active:scale-90" 
                                type="button"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form 
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (!values.title.trim()) return;
                                onSubmit(values);
                            }}
                            className="flex flex-col max-h-[75vh]"
                        >
                            <div className="p-8 overflow-y-auto custom-scrollbar space-y-10">
                                {/* Task Name Input */}
                                <div className="space-y-4">
                                    <input 
                                        autoFocus
                                        value={values.title}
                                        onChange={(e) => setValues(prev => ({ ...prev, title: e.target.value }))}
                                        className="w-full bg-transparent text-display-lg text-white placeholder:text-white/5 border-none focus:ring-0 p-0 focus:outline-none selection:bg-primary-container/30" 
                                        placeholder="What are you working on?" 
                                        type="text"
                                    />
                                    <div className="h-px w-full bg-white/[0.03]" />
                                </div>

                                {/* Notes Input */}
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-label-sm text-white/30 uppercase">
                                        <Plus size={14} className="text-primary-container/60" />
                                        Notes
                                    </label>
                                    <textarea 
                                        value={values.notes}
                                        onChange={(e) => setValues(prev => ({ ...prev, notes: e.target.value }))}
                                        className="w-full bg-[#121212] border border-white/[0.05] text-white/80 rounded-[12px] p-5 focus:border-primary-container/50 focus:ring-4 focus:ring-primary-container/10 transition-all outline-none text-sm min-h-[100px] resize-none placeholder:text-white/5"
                                        placeholder="Add more details about this task..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Project Selector */}
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-2 text-label-sm text-white/30 uppercase">
                                            <ListFilter size={14} className="text-primary-container/60" />
                                            Project
                                        </label>
                                        <div className="relative group">
                                            <select 
                                                value={values.listId}
                                                onChange={(e) => setValues(prev => ({ ...prev, listId: e.target.value }))}
                                                className="w-full appearance-none bg-[#121212] border border-white/[0.05] text-white/90 rounded-[12px] pl-5 pr-12 py-3.5 focus:border-primary-container/50 focus:ring-4 focus:ring-primary-container/10 transition-all cursor-pointer font-medium text-sm outline-none"
                                            >
                                                {lists.map(list => (
                                                    <option key={list.id} value={list.id} className="bg-[#1a1a1a]">{list.name}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={16} className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-primary-container transition-colors" />
                                        </div>
                                    </div>
 
                                     {/* Time Estimate */}
                                     <div className="space-y-3">
                                         <label className="flex items-center gap-2 text-label-sm text-white/30 uppercase">
                                             <Timer size={14} className="text-primary-container/60" />
                                             Estimate
                                         </label>
                                         <div className="flex items-center bg-[#121212] border border-white/[0.05] rounded-[12px] focus-within:border-primary-container/50 focus-within:ring-4 focus-within:ring-primary-container/10 transition-all px-4">
                                             <Timer size={16} className="text-white/20" />
                                             <input 
                                                 className="w-full bg-transparent border-none focus:ring-0 text-white/90 py-3.5 px-3 outline-none font-medium text-sm" 
                                                 min="5" 
                                                 step="5" 
                                                 type="number"
                                                 value={values.estimatedMinutes}
                                                 onChange={(e) => setValues(prev => ({ ...prev, estimatedMinutes: Number(e.target.value) }))}
                                             />
                                             <span className="text-white/20 font-bold text-[10px] uppercase">min</span>
                                         </div>
                                     </div>
                                 </div>
 
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                     {/* Schedule Date */}
                                     <div className="space-y-3">
                                         <label className="flex items-center gap-2 text-label-sm text-white/30 uppercase">
                                             <Calendar size={14} className="text-primary-container/60" />
                                             Date
                                         </label>
                                         <div className="flex items-center bg-[#121212] border border-white/[0.05] rounded-[12px] focus-within:border-primary-container/50 focus-within:ring-4 focus-within:ring-primary-container/10 transition-all px-4">
                                             <Calendar size={16} className="text-white/20" />
                                             <input 
                                                 className="w-full bg-transparent border-none focus:ring-0 text-white/90 py-3.5 px-3 outline-none font-medium text-sm [color-scheme:dark]" 
                                                 type="date"
                                                 value={values.scheduledDate}
                                                 onChange={(e) => setValues(prev => ({ ...prev, scheduledDate: e.target.value }))}
                                             />
                                         </div>
                                     </div>

                                    {/* Priority Segmented Control */}
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-2 text-label-sm text-white/30 uppercase">
                                            <Flag size={14} className="text-primary-container/60" />
                                            Priority
                                        </label>
                                        <div className="relative flex p-1 bg-[#121212] border border-white/[0.05] rounded-[12px] overflow-hidden">
                                            {/* Sliding Highlight */}
                                            <motion.div 
                                                layoutId="priority-bg"
                                                className={`absolute inset-y-1 rounded-[8px] shadow-[0_4px_12px_rgba(0,0,0,0.5)] ${
                                                    values.priority === 'high' ? 'bg-error/20 border border-error/30' : 
                                                    values.priority === 'medium' ? 'bg-primary-container/20 border border-primary-container/30' : 
                                                    'bg-white/10 border border-white/20'
                                                }`}
                                                animate={{ 
                                                    x: values.priority === 'low' ? '0%' : 
                                                       values.priority === 'medium' ? '100%' : '200%',
                                                    width: 'calc(100% / 3 - 8px)'
                                                }}
                                                transition={{ type: 'spring', bounce: 0.1, duration: 0.5 }}
                                            />
                                            
                                            {(['low', 'medium', 'high'] as const).map((p) => (
                                                <button 
                                                    key={p}
                                                    type="button"
                                                    onClick={() => setValues(prev => ({ ...prev, priority: p }))}
                                                    className={`relative flex-1 py-2.5 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] transition-all z-10 ${
                                                        values.priority === p 
                                                        ? p === 'high' ? 'text-error' : p === 'medium' ? 'text-primary-container' : 'text-white'
                                                        : 'text-white/20 hover:text-white/40'
                                                    }`}
                                                >
                                                    <div className={`w-1.5 h-1.5 rounded-full ${
                                                        p === 'high' ? 'bg-error' : p === 'medium' ? 'bg-primary-container' : 'bg-white/40'
                                                    } ${values.priority === p ? 'shadow-[0_0_8px_currentColor]' : 'opacity-40'}`} />
                                                    {p}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Subtasks */}
                                <div className="space-y-6">
                                    <label className="flex items-center gap-2 text-label-sm text-white/30 uppercase">
                                        <div className="w-1 h-3 bg-primary-container/40 rounded-full" />
                                        Subtasks
                                    </label>
                                    <div className="space-y-3">
                                        <AnimatePresence mode="popLayout">
                                            {values.subtasks.map((st, index) => (
                                                <motion.div 
                                                    layout
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.98 }}
                                                    key={st.id} 
                                                    className="flex items-center gap-4 bg-white/[0.02] px-5 py-3 rounded-xl border border-white/[0.03] group hover:border-white/[0.08] transition-all"
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newSubtasks = [...values.subtasks];
                                                            newSubtasks[index].done = !newSubtasks[index].done;
                                                            setValues(prev => ({ ...prev, subtasks: newSubtasks }));
                                                        }}
                                                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                                            st.done 
                                                            ? 'bg-primary-container border-primary-container shadow-[0_0_10px_rgba(0,245,225,0.4)]' 
                                                            : 'border-white/10 hover:border-primary-container/50'
                                                        }`}
                                                    >
                                                        {st.done && <Check className="w-3 h-3 text-on-primary-container stroke-[4]" />}
                                                    </button>
                                                    <input 
                                                        className={`flex-1 bg-transparent border-none outline-none focus:ring-0 font-medium p-0 text-sm transition-all ${
                                                            st.done ? 'text-white/20 line-through' : 'text-white/80'
                                                        }`} 
                                                        type="text" 
                                                        value={st.title}
                                                        onChange={(e) => {
                                                            const newSubtasks = [...values.subtasks];
                                                            newSubtasks[index].title = e.target.value;
                                                            setValues(prev => ({ ...prev, subtasks: newSubtasks }));
                                                        }}
                                                    />
                                                    <button 
                                                        onClick={() => handleRemoveSubtask(st.id)}
                                                        className="text-white/5 hover:text-error/60 transition-colors p-1.5 rounded-lg hover:bg-error/5" 
                                                        type="button"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>

                                        <div className="flex items-center gap-4 bg-transparent px-5 py-3.5 rounded-[12px] border border-white/[0.05] border-dashed group hover:border-primary-container/30 transition-all focus-within:border-primary-container/50 focus-within:bg-primary-container/[0.01]">
                                            <Plus className="w-4 h-4 text-white/10 group-focus-within:text-primary-container transition-colors" />
                                            <input 
                                                className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-white/90 font-medium p-0 placeholder:text-white/5 text-sm" 
                                                placeholder="Add subtask..." 
                                                type="text"
                                                value={newSubtask}
                                                onChange={(e) => setNewSubtask(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleAddSubtask();
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer (Actions) */}
                            <div className="px-8 py-6 border-t border-white/[0.03] flex justify-end gap-3 shrink-0">
                                <button 
                                    onClick={onClose}
                                    className="px-6 py-2.5 text-sm font-semibold text-white/30 hover:text-white rounded-full hover:bg-white/[0.05] transition-all" 
                                    type="button"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="px-8 py-2.5 bg-primary-container text-on-primary-container hover:brightness-110 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-primary-container/20 active:scale-95 transition-all text-sm"
                                >
                                    <Check className="w-4 h-4 stroke-[3]" />
                                    {mode === 'create' ? 'Create Task' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    ), document.body);
}
