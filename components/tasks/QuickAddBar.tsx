'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ChevronDown, Command, CornerDownLeft } from 'lucide-react';
import { useTaskStore } from '@/store/useTaskStore';
import { parseNaturalLanguageTask } from '@/lib/ai-utils';

interface QuickAddBarProps {
    onExpand: (title: string) => void;
}

export const QuickAddBar: React.FC<QuickAddBarProps> = ({ onExpand }) => {
    const [title, setTitle] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const addTask = useTaskStore((state) => state.addTask);
    const activeListId = useTaskStore((state) => state.activeListId);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleAdd = () => {
        if (!title.trim()) return;
        
        const parsed = parseNaturalLanguageTask(title);

        addTask({
            title: parsed.title,
            listId: activeListId === 'today' || activeListId === 'all' ? 'personal' : activeListId,
            estimatedMinutes: parsed.estimatedMinutes,
            scheduledDate: parsed.scheduledDate?.toISOString() || (activeListId === 'today' ? new Date().toISOString().split('T')[0] : undefined),
            scheduledTime: parsed.scheduledTime,
            tags: parsed.tags,
        });
        
        setTitle('');
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            handleAdd();
        }
    };

    return (
        <div className="relative w-full max-w-2xl mx-auto mb-10">
            <motion.div 
                className={`
                    relative flex items-center bg-[#1e1e1e]
                    border border-white/[0.08] rounded-2xl px-5 py-4 transition-all duration-300
                    ${isFocused ? 'bg-[#252525] border-primary-container/30 shadow-[0_0_40px_-10px_rgba(0,245,225,0.15)] scale-[1.01]' : 'hover:border-white/[0.12] shadow-xl'}
                `}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* Glow effect on focus */}
                <AnimatePresence>
                    {isFocused && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-container/5 to-transparent pointer-events-none"
                        />
                    )}
                </AnimatePresence>

                <div className="flex-shrink-0 mr-4 text-on-surface-variant/40">
                    <Plus size={22} className={isFocused ? 'text-primary-container' : 'transition-colors'} />
                </div>
                
                <input
                    ref={inputRef}
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onKeyDown={onKeyDown}
                    placeholder="Capture a thought or task..."
                    className="flex-grow bg-transparent border-none outline-none text-on-surface placeholder:text-on-surface-variant/20 text-lg font-medium selection:bg-primary-container/30"
                />

                <div className="flex items-center space-x-3">
                    <AnimatePresence>
                        {title.length > 0 && (
                            <motion.button
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                onClick={handleAdd}
                                className="flex items-center space-x-2 px-4 py-2 bg-primary-container text-on-primary-container hover:bg-primary rounded-xl text-sm font-bold shadow-lg shadow-primary-container/20 active:scale-95 transition-all"
                            >
                                <span>Save</span>
                                <CornerDownLeft size={14} />
                            </motion.button>
                        )}
                    </AnimatePresence>

                    <button 
                        onClick={() => onExpand(title)}
                        className={`p-2 rounded-xl transition-all ${
                            isFocused ? 'bg-surface-container-highest text-on-surface' : 'text-on-surface-variant/40 hover:text-on-surface hover:bg-white/[0.05]'
                        }`}
                        title="More details"
                    >
                        <ChevronDown size={20} />
                    </button>
                </div>
            </motion.div>

            {/* Keyboard Hint */}
            <AnimatePresence>
                {isFocused && (
                    <motion.div 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="absolute -bottom-8 right-6 flex items-center space-x-2 text-[10px] text-on-surface-variant/40 uppercase tracking-[0.2em] font-bold"
                    >
                        <div className="flex items-center gap-1 bg-surface-container-highest/50 px-1.5 py-0.5 rounded border border-outline-variant/10">
                            <Command size={10} />
                            <span>Return</span>
                        </div>
                        <span>to quick save</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
