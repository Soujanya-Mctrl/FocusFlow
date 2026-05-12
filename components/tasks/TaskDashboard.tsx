'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Timer } from 'lucide-react';
import { TaskFlowBoard } from '@/components/tasks/TaskFlowBoard';
import { TaskSidebar } from '@/components/tasks/TaskSidebar';
import { QuickAddBar } from '@/components/tasks/QuickAddBar';
import { useTaskStore } from '@/store/useTaskStore';
import { useState } from 'react';
import { TaskDetailPanel } from './TaskDetailPanel';
import { TaskFormModal, TaskFormValues } from './TaskFormModal';
import { Task } from '@/store/useTaskStore';

interface TaskDashboardProps {
    isOpen: boolean;
    onClose: () => void;
}

export function TaskDashboard({ isOpen, onClose }: TaskDashboardProps) {
    const addTask = useTaskStore(state => state.addTask);
    const activeListId = useTaskStore(state => state.activeListId);
    const lists = useTaskStore(state => state.lists);

    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [modalInitialValues, setModalInitialValues] = useState<Partial<TaskFormValues>>({});
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

    const handleAddTask = (title: string) => {
        // If a project list is active, default the new task to that list
        const isProject = lists.some(l => l.id === activeListId);
        const initialValues: Partial<TaskFormValues> = { 
            title, 
            listId: isProject ? activeListId : (lists.length > 0 ? lists[0].id : 'personal') 
        };

        // Contextual defaults for smart views
        if (activeListId === 'today') {
            initialValues.scheduledDate = new Date().toISOString().split('T')[0];
        } else if (activeListId === 'starred') {
            initialValues.priority = 'high';
        }

        setModalInitialValues(initialValues);
        setModalMode('create');
        setIsTaskModalOpen(true);
    };

    const handleEditTask = (task: Task) => {
        setModalInitialValues({
            title: task.title,
            notes: task.notes,
            estimatedMinutes: task.estimatedMinutes,
            priority: task.priority,
            scheduledDate: task.scheduledDate,
            scheduledTime: task.scheduledTime,
            listId: task.listId,
            tags: task.tags,
            subtasks: task.subtasks
        });
        setEditingTaskId(task.id);
        setModalMode('edit');
        setIsTaskModalOpen(true);
    };

    const handleModalSubmit = (values: TaskFormValues) => {
        if (modalMode === 'edit' && editingTaskId) {
            useTaskStore.getState().updateTask(editingTaskId, values);
        } else {
            addTask(values);
        }
        setIsTaskModalOpen(false);
        setEditingTaskId(null);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: '100%', opacity: 0 }}
                    transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 0.8 }}
                    className="fixed inset-0 z-[100] bg-surface text-on-surface font-sans w-full h-full overflow-hidden flex flex-col md:flex-row antialiased selection:bg-primary-container/20 selection:text-primary-container"
                >
                    {/* Sidebar */}
                    <TaskSidebar />

                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col min-w-0 relative z-10 bg-surface-container-lowest">
                        {/* Top Bar - Glassmorphic */}
                        <header className="flex justify-between items-center px-10 w-full h-24 shrink-0 bg-surface/40 backdrop-blur-md border-b border-white/[0.03]">
                            {/* Mobile Logo */}
                            <div className="md:hidden">
                                <h1 className="text-xl font-bold text-white tracking-tight">Tasks</h1>
                            </div>
                            
                            {/* Central Search/Add Bar */}
                            <div className="hidden md:block flex-1 max-w-2xl">
                                <QuickAddBar onExpand={handleAddTask} />
                            </div>
                            
                            {/* Action Group */}
                            <div className="flex items-center gap-6">
                                {/* Timer Pill */}
                                <button className="flex items-center gap-3 px-5 py-2 bg-white/[0.03] border border-white/10 rounded-full hover:bg-white/[0.08] transition-all text-primary-container font-bold text-sm shadow-[0_0_15px_rgba(0,245,225,0.1)]">
                                    <Timer className="w-4 h-4" />
                                    <span>25:00</span>
                                </button>
                                
                                {/* Focus Mode Button */}
                                <button className="hidden sm:block px-6 py-2 bg-white/[0.03] border border-white/10 rounded-full hover:bg-white/[0.08] transition-all text-white/80 font-semibold text-sm">
                                    Focus Mode
                                </button>

                                {/* Notification & Close */}
                                <div className="flex items-center gap-2">
                                    <button className="p-2.5 text-white/20 hover:text-white transition-all">
                                        <Bell className="w-5 h-5" />
                                    </button>
                                    <div className="w-px h-6 bg-white/10 mx-2" />
                                    <button 
                                        onClick={onClose} 
                                        className="p-2.5 rounded-xl text-white/20 hover:text-error/60 transition-all active:scale-90"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                        </header>

                        {/* Task Board Canvas */}
                        <main className="flex-1 relative overflow-hidden flex p-8">
                            <div className="flex-1 bg-surface-container-low/50 rounded-[2.5rem] border border-white/[0.03] overflow-hidden shadow-inner">
                                <TaskFlowBoard 
                                    selectedTaskId={selectedTaskId}
                                    onSelectTask={setSelectedTaskId}
                                />
                            </div>
                            
                            <AnimatePresence mode="popLayout">
                                {selectedTaskId && (
                                    <TaskDetailPanel 
                                        key={selectedTaskId}
                                        taskId={selectedTaskId}
                                        onClose={() => setSelectedTaskId(null)}
                                        onEditTask={handleEditTask}
                                    />
                                )}
                            </AnimatePresence>
                        </main>

                        {/* Hidden button for Sidebar to trigger */}
                        <button 
                            id="global-add-task-btn" 
                            className="hidden" 
                            onClick={() => handleAddTask('')}
                        />

                        <TaskFormModal 
                            key={isTaskModalOpen ? (editingTaskId || 'create') : 'closed'}
                            isOpen={isTaskModalOpen}
                            mode={modalMode}
                            initialValues={modalInitialValues}
                            onClose={() => setIsTaskModalOpen(false)}
                            onSubmit={handleModalSubmit}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
