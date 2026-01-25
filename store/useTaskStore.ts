import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Task {
    id: string;
    title: string;
    completed: boolean;
    created_at: number;
    section: 'today' | 'week' | 'backlog';
}

interface TaskState {
    tasks: Task[];
    isPanelOpen: boolean;

    addTask: (title: string, section?: Task['section']) => Task;
    removeTask: (id: string) => void;
    toggleTaskCompletion: (id: string) => void;
    setPanelOpen: (isOpen: boolean) => void;
    setTasks: (tasks: Task[]) => void;
    resetTasks: () => void;
    moveTask: (id: string, section: Task['section']) => void;
}

const SEED_TASKS: Task[] = [
    {
        id: '1',
        title: 'Marketing brief',
        completed: false,
        created_at: Date.now(),
        section: 'today',
    },
    {
        id: '2',
        title: 'Insta post',
        completed: false,
        created_at: Date.now() - 1000,
        section: 'week',
    },
    {
        id: '3',
        title: 'Call mum',
        completed: false,
        created_at: Date.now() - 2000,
        section: 'backlog',
    },
    {
        id: '4',
        title: 'Fire Jeffry',
        completed: false,
        created_at: Date.now() - 3000,
        section: 'today',
    }
];

export const useTaskStore = create<TaskState>()(
    persist(
        (set) => ({
            tasks: SEED_TASKS,
            isPanelOpen: false,

            addTask: (title, section = 'today') => {
                const newTask: Task = {
                    id: crypto.randomUUID(),
                    title,
                    completed: false,
                    created_at: Date.now(),
                    section,
                };

                set((state) => ({
                    tasks: [newTask, ...state.tasks],
                }));

                return newTask;
            },

            removeTask: (id) => set((state) => ({
                tasks: state.tasks.filter((t) => t.id !== id),
            })),

            toggleTaskCompletion: (id) => set((state) => ({
                tasks: state.tasks.map((t) =>
                    t.id === id ? { ...t, completed: !t.completed } : t
                ),
            })),

            setPanelOpen: (isOpen: boolean) => set({ isPanelOpen: isOpen }),

            setTasks: (tasks) => set({ tasks }),

            resetTasks: () => set({ tasks: SEED_TASKS }),

            moveTask: (id, section) => set((state) => ({
                tasks: state.tasks.map((t) =>
                    t.id === id ? { ...t, section } : t
                ),
            })),
        }),
        {
            name: 'focus-flow-tasks',
        }
    )
);
