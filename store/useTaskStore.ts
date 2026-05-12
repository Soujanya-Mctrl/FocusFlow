import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Subtask {
    id: string;
    title: string;
    done: boolean;
}

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'paused';

export interface Task {
    id: string;
    listId: string;
    title: string;
    notes?: string;
    estimatedMinutes?: number;
    loggedMinutes: number;
    scheduledDate?: string; // ISO string for persistence
    scheduledTime?: string; // e.g. "12:00 PM"
    subtasks: Subtask[];
    tags: string[];
    status: TaskStatus;
    createdAt: number;
    completedAt?: number;
}

export interface List {
    id: string;
    name: string;
    icon?: string;
    color?: string;
    isArchived: boolean;
    createdAt: number;
}

interface TaskState {
    tasks: Task[];
    lists: List[];
    activeListId: string; // 'all' | 'today' | listId
    isPanelOpen: boolean;

    // List Actions
    addList: (name: string, icon?: string, color?: string) => void;
    updateList: (id: string, updates: Partial<List>) => void;
    deleteList: (id: string) => void;
    setActiveListId: (id: string) => void;

    // Task Actions
    addTask: (task: Partial<Task> & { title: string; listId: string }) => Task;
    updateTask: (id: string, updates: Partial<Task>) => void;
    removeTask: (id: string) => void;
    toggleTaskCompletion: (id: string) => void;
    
    // Subtask Actions
    addSubtask: (taskId: string, title: string) => void;
    toggleSubtask: (taskId: string, subtaskId: string) => void;
    removeSubtask: (taskId: string, subtaskId: string) => void;

    // UI Actions
    setPanelOpen: (isOpen: boolean) => void;
    resetStore: () => void;
    
    // Sync Actions
    setTasks: (tasks: Task[]) => void;
}

const DEFAULT_LISTS: List[] = [
    { id: 'work', name: 'Work', icon: '💼', color: '#3B82F6', isArchived: false, createdAt: Date.now() },
    { id: 'personal', name: 'Personal', icon: '🏠', color: '#10B981', isArchived: false, createdAt: Date.now() },
    { id: 'design', name: 'Design', icon: '🎨', color: '#8B5CF6', isArchived: false, createdAt: Date.now() },
];

const SEED_TASKS: Task[] = [
    {
        id: '1',
        listId: 'work',
        title: 'Draft quarterly review',
        notes: 'Include Q1 metrics and Q2 goals.',
        estimatedMinutes: 60,
        loggedMinutes: 0,
        status: 'todo',
        scheduledDate: new Date().toISOString(),
        subtasks: [
            { id: 's1', title: 'Gather Q1 data', done: true },
            { id: 's2', title: 'Write outline', done: false }
        ],
        tags: ['💻 Webinar'],
        createdAt: Date.now(),
    }
];

export const useTaskStore = create<TaskState>()(
    persist(
        (set) => ({
            tasks: SEED_TASKS,
            lists: DEFAULT_LISTS,
            activeListId: 'today',
            isPanelOpen: false,

            addList: (name, icon, color) => set((state) => ({
                lists: [...state.lists, {
                    id: crypto.randomUUID(),
                    name,
                    icon,
                    color,
                    isArchived: false,
                    createdAt: Date.now()
                }]
            })),

            updateList: (id, updates) => set((state) => ({
                lists: state.lists.map(l => l.id === id ? { ...l, ...updates } : l)
            })),

            deleteList: (id) => set((state) => ({
                lists: state.lists.filter(l => l.id !== id),
                tasks: state.tasks.filter(t => t.listId !== id)
            })),

            setActiveListId: (id) => set({ activeListId: id }),

            addTask: (data) => {
                const newTask: Task = {
                    id: crypto.randomUUID(),
                    listId: data.listId,
                    title: data.title,
                    notes: data.notes || '',
                    estimatedMinutes: data.estimatedMinutes,
                    loggedMinutes: 0,
                    status: 'todo',
                    scheduledDate: data.scheduledDate,
                    scheduledTime: data.scheduledTime,
                    subtasks: data.subtasks || [],
                    tags: data.tags || [],
                    createdAt: Date.now(),
                };

                set((state) => ({
                    tasks: [newTask, ...state.tasks],
                }));

                return newTask;
            },

            updateTask: (id, updates) => set((state) => ({
                tasks: state.tasks.map((t) =>
                    t.id === id ? { ...t, ...updates } : t
                ),
            })),

            removeTask: (id) => set((state) => ({
                tasks: state.tasks.filter((t) => t.id !== id),
            })),

            toggleTaskCompletion: (id) => set((state) => ({
                tasks: state.tasks.map((t) =>
                    t.id === id ? { 
                        ...t, 
                        status: t.status === 'done' ? 'todo' : 'done',
                        completedAt: t.status !== 'done' ? Date.now() : undefined 
                    } : t
                ),
            })),

            addSubtask: (taskId, title) => set((state) => ({
                tasks: state.tasks.map(t => t.id === taskId ? {
                    ...t,
                    subtasks: [...t.subtasks, { id: crypto.randomUUID(), title, done: false }]
                } : t)
            })),

            toggleSubtask: (taskId, subtaskId) => set((state) => ({
                tasks: state.tasks.map(t => t.id === taskId ? {
                    ...t,
                    subtasks: t.subtasks.map(s => s.id === subtaskId ? { ...s, done: !s.done } : s)
                } : t)
            })),

            removeSubtask: (taskId, subtaskId) => set((state) => ({
                tasks: state.tasks.map(t => t.id === taskId ? {
                    ...t,
                    subtasks: t.subtasks.filter(s => s.id !== subtaskId)
                } : t)
            })),

            setPanelOpen: (isOpen: boolean) => set({ isPanelOpen: isOpen }),

            resetStore: () => set({ tasks: SEED_TASKS, lists: DEFAULT_LISTS, activeListId: 'today' }),
            
            setTasks: (tasks) => set({ tasks }),
        }),
        {
            name: 'focus-flow-tasks-v2', // Bump version for the new model
        }
    )
);

