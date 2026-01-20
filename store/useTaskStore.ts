import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Task {
    id: string;
    title: string;
    completed: boolean;
    createdAt: number;
}

interface TaskState {
    tasks: Task[];
    isPanelOpen: boolean;

    addTask: (title: string) => void;
    removeTask: (id: string) => void;
    toggleTaskCompletion: (id: string) => void;
    setPanelOpen: (isOpen: boolean) => void;
}

export const useTaskStore = create<TaskState>()(
    persist(
        (set) => ({
            tasks: [],
            isPanelOpen: false,

            addTask: (title) => set((state) => ({
                tasks: [
                    {
                        id: crypto.randomUUID(),
                        title,
                        completed: false,
                        createdAt: Date.now(),
                    },
                    ...state.tasks,
                ],
            })),

            removeTask: (id) => set((state) => ({
                tasks: state.tasks.filter((t) => t.id !== id),
            })),

            toggleTaskCompletion: (id) => set((state) => ({
                tasks: state.tasks.map((t) =>
                    t.id === id ? { ...t, completed: !t.completed } : t
                ),
            })),

            setPanelOpen: (isOpen) => set({ isPanelOpen: isOpen }),
        }),
        {
            name: 'focus-flow-tasks',
        }
    )
);
