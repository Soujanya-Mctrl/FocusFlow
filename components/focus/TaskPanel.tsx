'use client';

import { useTaskStore } from "@/store/useTaskStore";
import { useTimerStore } from "@/store/useTimerStore";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Trash2, Plus, Target } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

export function TaskPanel() {
    const { tasks, isPanelOpen, setPanelOpen, addTask, removeTask, toggleTaskCompletion } = useTaskStore();
    const { activeTaskId, setActiveTaskId } = useTimerStore();
    const [newTaskTitle, setNewTaskTitle] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;
        addTask(newTaskTitle);
        setNewTaskTitle("");
    };

    const handleSelectTask = (id: string) => {
        if (activeTaskId === id) {
            setActiveTaskId(undefined);
        } else {
            setActiveTaskId(id);
            setPanelOpen(false); // Close panel on selection for focus
        }
    };

    return (
        <AnimatePresence>
            {isPanelOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setPanelOpen(false)}
                        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 z-50 mx-auto flex h-[80vh] w-full max-w-2xl flex-col rounded-t-3xl bg-[#1C1C1E] p-6 shadow-2xl border-t border-white/10"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-semibold text-white">Tasks</h2>
                            <button
                                onClick={() => setPanelOpen(false)}
                                className="rounded-full p-2 text-gray-400 hover:bg-white/10 hover:text-white"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Add Task */}
                        <form onSubmit={handleSubmit} className="mb-6 relative">
                            <input
                                type="text"
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                placeholder="Add a new task..."
                                className="w-full rounded-xl bg-white/5 py-4 pl-6 pr-12 text-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-focus"
                            />
                            <button
                                type="submit"
                                disabled={!newTaskTitle.trim()}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg text-focus hover:bg-white/10 disabled:opacity-50"
                            >
                                <Plus className="w-6 h-6" />
                            </button>
                        </form>

                        {/* Task List */}
                        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                            {tasks.length === 0 && (
                                <div className="text-center py-12 text-gray-500">
                                    No tasks yet. Add one to get started.
                                </div>
                            )}

                            {tasks.map((task) => (
                                <div
                                    key={task.id}
                                    className={clsx(
                                        "group flex items-center justify-between rounded-xl p-4 transition-all",
                                        activeTaskId === task.id ? "bg-white/10 border border-focus/50" : "bg-white/5 hover:bg-white/10 border border-transparent",
                                        task.completed && "opacity-50"
                                    )}
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <button
                                            onClick={() => toggleTaskCompletion(task.id)}
                                            className={clsx(
                                                "flex h-6 w-6 items-center justify-center rounded-full border transition-all",
                                                task.completed ? "bg-complete border-complete text-black" : "border-gray-500 hover:border-gray-300"
                                            )}
                                        >
                                            {task.completed && <Check className="w-3 h-3" />}
                                        </button>

                                        <span
                                            onClick={() => handleSelectTask(task.id)}
                                            className={clsx(
                                                "flex-1 text-lg cursor-pointer select-none",
                                                task.completed ? "line-through text-gray-500" : "text-gray-200"
                                            )}
                                        >
                                            {task.title}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleSelectTask(task.id)}
                                            title={activeTaskId === task.id ? "Currently Active" : "Set as Active"}
                                            className={clsx(
                                                "p-2 rounded-lg transition-colors",
                                                activeTaskId === task.id ? "text-focus bg-focus/10" : "text-gray-400 hover:text-focus hover:bg-white/5"
                                            )}
                                        >
                                            <Target className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => removeTask(task.id)}
                                            className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-white/5 transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
