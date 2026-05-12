'use client';

import React, { useState, useRef, useEffect } from 'react';
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
            scheduledDate: parsed.scheduledDate?.toISOString(),
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
        <div className="relative w-full max-w-2xl mx-auto mb-6">
            <motion.div 
                className={`
                    relative flex items-center bg-white/5 backdrop-blur-xl 
                    border border-white/10 rounded-2xl px-4 py-3 transition-all
                    ${isFocused ? 'ring-2 ring-blue-500/50 border-blue-500/50 bg-white/10 shadow-lg shadow-blue-500/10' : ''}
                `}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex-shrink-0 mr-3 text-white/40">
                    <Plus size={20} />
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
                    className="flex-grow bg-transparent border-none outline-none text-white placeholder:text-white/20 text-lg"
                />

                <div className="flex items-center space-x-2">
                    <AnimatePresence>
                        {title.length > 0 && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                onClick={handleAdd}
                                className="flex items-center space-x-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 rounded-lg text-white text-xs font-medium transition-colors"
                            >
                                <span>Save</span>
                                <CornerDownLeft size={12} />
                            </motion.button>
                        )}
                    </AnimatePresence>

                    <button 
                        onClick={() => onExpand(title)}
                        className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white/80 transition-all"
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
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute -bottom-6 right-4 flex items-center space-x-1 text-[10px] text-white/30 uppercase tracking-widest font-bold"
                    >
                        <Command size={10} />
                        <span>+ Enter to quick save</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
