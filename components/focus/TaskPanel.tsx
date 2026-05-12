'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    List as ListIcon, 
    Filter, LayoutGrid, Search,
    ChevronRight, ChevronLeft
} from 'lucide-react';
import { useTaskStore } from '@/store/useTaskStore';
import { QuickAddBar } from '../tasks/QuickAddBar';
import { ExpandedTaskPanel } from '../tasks/ExpandedTaskPanel';
import { TaskCard } from '../tasks/TaskCard';
import { TaskSidebar } from '../tasks/TaskSidebar';

export default function TaskPanel() {
    const [isExpanding, setIsExpanding] = useState(false);
    const [initialExpandTitle, setInitialExpandTitle] = useState('');
    const [searchQuery] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    
    const { 
        tasks, lists, activeListId,
        isPanelOpen, setPanelOpen 
    } = useTaskStore();

    const activeList = lists.find(l => l.id === activeListId);

    const filteredTasks = useMemo(() => {
        let result = tasks;

        if (activeListId === 'today') {
            const today = new Date().toISOString().split('T')[0];
            result = tasks.filter(t => t.scheduledDate?.startsWith(today));
        } else if (activeListId !== 'all') {
            result = tasks.filter(t => t.listId === activeListId);
        }

        if (searchQuery) {
            result = result.filter(t => 
                t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.notes?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return result;
    }, [tasks, activeListId, searchQuery]);

    const handleExpand = (title: string) => {
        setInitialExpandTitle(title);
        setIsExpanding(true);
    };

    if (!isPanelOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed inset-y-0 right-0 w-[800px] flex z-50 overflow-hidden"
        >
            {/* Sidebar Pane */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 256, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        className="h-full border-l border-white/5"
                    >
                        <TaskSidebar />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Task Pane */}
            <div className="flex-grow bg-black/40 backdrop-blur-3xl border-l border-white/10 flex flex-col relative">
                {/* Header */}
                <div className="p-8 pb-4">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-4">
                            <button 
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="p-2 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-colors"
                            >
                                {isSidebarOpen ? <ChevronLeft size={20} /> : <ListIcon size={20} />}
                            </button>
                            <div>
                                <h2 className="text-2xl font-bold text-white tracking-tight">
                                    {activeListId === 'today' ? 'Today' : 
                                     activeListId === 'all' ? 'Inbox' : 
                                     activeList?.name || 'Tasks'}
                                </h2>
                                <p className="text-xs text-white/30 font-bold uppercase tracking-widest mt-1">
                                    {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button className="p-2.5 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-colors">
                                <Search size={20} />
                            </button>
                            <button className="p-2.5 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-colors">
                                <Filter size={20} />
                            </button>
                            <button 
                                onClick={() => setPanelOpen(false)}
                                className="p-2.5 hover:bg-red-500/10 rounded-xl text-white/40 hover:text-red-400 transition-all ml-2"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-grow overflow-y-auto px-8 pb-8 custom-scrollbar">
                    <AnimatePresence mode="wait">
                        {!isExpanding ? (
                            <QuickAddBar key="quick-add" onExpand={handleExpand} />
                        ) : (
                            <ExpandedTaskPanel 
                                key="expanded-add"
                                initialTitle={initialExpandTitle} 
                                onClose={() => setIsExpanding(false)} 
                            />
                        )}
                    </AnimatePresence>

                    {/* Task List */}
                    <div className="space-y-3 mt-4">
                        <AnimatePresence initial={false}>
                            {filteredTasks.length > 0 ? (
                                filteredTasks.map(task => (
                                    <TaskCard key={task.id} task={task} />
                                ))
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="py-32 text-center"
                                >
                                    <div className="inline-flex p-6 bg-white/5 rounded-3xl mb-4 text-white/10">
                                        <LayoutGrid size={48} />
                                    </div>
                                    <h3 className="text-white/60 font-semibold text-lg mb-1">Clear Horizon</h3>
                                    <p className="text-white/20 text-sm">Nothing to do here yet.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
