'use client';

import { useTaskStore } from "@/store/useTaskStore";
import { useTimerStore } from "@/store/useTimerStore";
import { Check, Trash2, Plus, Target } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

export function TaskPanel() {
    const { tasks, addTask, removeTask, toggleTaskCompletion, resetTasks } = useTaskStore();
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
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Add Task */}
            <form onSubmit={handleSubmit} className="mb-6 relative shrink-0">
                <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Add a new task..."
                    className="w-full rounded-xl bg-white/5 py-3 pl-4 pr-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-focus"
                />
                <button
                    type="submit"
                    disabled={!newTaskTitle.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-focus hover:bg-white/10 disabled:opacity-50"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </form>

            {/* Task List */}
            <div className="flex-1 space-y-2">
                {tasks.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
                        <span className="text-sm text-gray-500">No tasks yet.</span>
                        <button
                            onClick={resetTasks}
                            className="text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors border border-white/5"
                        >
                            Load Demo Tasks
                        </button>
                    </div>
                )}

                {tasks.map((task) => (
                    <div
                        key={task.id}
                        className={clsx(
                            "group flex items-center gap-3 rounded-lg p-3 transition-all",
                            activeTaskId === task.id ? "bg-white/10 border border-focus/30" : "bg-white/5 hover:bg-white/10 border border-transparent",
                            task.completed && "opacity-50"
                        )}
                    >
                        <button
                            onClick={() => toggleTaskCompletion(task.id)}
                            className={clsx(
                                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all",
                                task.completed ? "bg-complete border-complete text-black" : "border-gray-500 hover:border-gray-300"
                            )}
                        >
                            {task.completed && <Check className="w-3 h-3" />}
                        </button>

                        <div className="flex-1 min-w-0">
                            <p
                                onClick={() => handleSelectTask(task.id)}
                                className={clsx(
                                    "text-sm font-medium truncate cursor-pointer select-none",
                                    task.completed ? "line-through text-gray-500" : "text-gray-200"
                                )}
                            >
                                {task.title}
                            </p>
                        </div>

                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => handleSelectTask(task.id)}
                                className={clsx(
                                    "p-1.5 rounded-md transition-colors",
                                    activeTaskId === task.id ? "text-focus" : "text-gray-400 hover:text-focus hover:bg-white/5"
                                )}
                            >
                                <Target className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => removeTask(task.id)}
                                className="p-1.5 rounded-md text-gray-400 hover:text-red-400 hover:bg-white/5 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
