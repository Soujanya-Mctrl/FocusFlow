'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Task } from '@/store/useTaskStore';

export interface TaskFormValues {
    title: string;
    section: Task['section'];
    durationMinutes: number;
    breaks: number;
}

interface TaskFormModalProps {
    isOpen: boolean;
    mode: 'create' | 'edit';
    initialValues: TaskFormValues;
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
    const [values, setValues] = useState<TaskFormValues>(initialValues);

    if (!isOpen || typeof document === 'undefined') return null;

    return createPortal((
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950/95 p-5 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">
                        {mode === 'create' ? 'Create Task' : 'Edit Task'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="rounded-md p-1.5 text-white/50 hover:bg-white/10 hover:text-white transition-colors"
                        title="Close"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        const nextTitle = values.title.trim();
                        if (!nextTitle) return;

                        onSubmit({
                            ...values,
                            title: nextTitle,
                            durationMinutes: Math.max(1, Math.floor(values.durationMinutes || 25)),
                            breaks: Math.max(0, Math.floor(values.breaks || 0)),
                        });
                    }}
                    className="space-y-4"
                >
                    <div>
                        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
                            Task Name
                        </label>
                        <input
                            autoFocus
                            value={values.title}
                            onChange={(e) => setValues((prev) => ({ ...prev, title: e.target.value }))}
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent/40"
                            placeholder="Task title"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
                                Duration (min)
                            </label>
                            <input
                                type="number"
                                min={1}
                                value={values.durationMinutes}
                                onChange={(e) =>
                                    setValues((prev) => ({
                                        ...prev,
                                        durationMinutes: Number(e.target.value || 25),
                                    }))
                                }
                                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent/40"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
                                Breaks
                            </label>
                            <input
                                type="number"
                                min={0}
                                value={values.breaks}
                                onChange={(e) =>
                                    setValues((prev) => ({
                                        ...prev,
                                        breaks: Number(e.target.value || 0),
                                    }))
                                }
                                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent/40"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
                            Section
                        </label>
                        <select
                            value={values.section}
                            onChange={(e) =>
                                setValues((prev) => ({
                                    ...prev,
                                    section: e.target.value as Task['section'],
                                }))
                            }
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent/40"
                        >
                            <option value="backlog">Backlog</option>
                            <option value="week">This Week</option>
                            <option value="today">Today</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-sm font-medium text-accent hover:bg-accent/20 transition-colors"
                        >
                            {mode === 'create' ? 'Create Task' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    ), document.body);
}
