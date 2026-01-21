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
    resetTasks: () => void;
}

const SEED_TASKS: Task[] = [
    {
        id: '1',
        title: 'Marketing brief',
        completed: false,
        createdAt: Date.now(),
    },
    {
        id: '2',
        title: 'Insta post',
        completed: false,
        createdAt: Date.now() - 1000,
    },
    {
        id: '3',
        title: 'Call mum',
        completed: false,
        createdAt: Date.now() - 2000,
    },
    {
        id: '4',
        title: 'Fire Jeffry',
        completed: false,
        createdAt: Date.now() - 3000,
    }
];

export const useTaskStore = create<TaskState>()(
    persist(
        (set) => ({
            tasks: SEED_TASKS,
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

            resetTasks: () => set({ tasks: SEED_TASKS }),
        }),
        {
            name: 'focus-flow-tasks',
        }
    )
);
