'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ReactFlow,
    Node,
    NodeProps,
    useNodesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Plus, Clock, CheckCircle2, Circle, Play } from 'lucide-react';
import clsx from 'clsx';
import { useTaskStore, Task } from '@/store/useTaskStore';
import { useUser } from '@clerk/nextjs';
import { useSupabase } from '@/hooks/useSupabase';
import { useTimerStore } from '@/store/useTimerStore';
import { TaskFormModal, TaskFormValues } from '@/components/tasks/TaskFormModal';

type Section = Task['section'];

type PanelNodeData = {
    title: string;
    section: Section;
    count: number;
    isHighlighted?: boolean;
    onAddTask: (section: Section) => void;
};

type TaskNodeData = {
    taskId: string;
    title: string;
    createdAt: number;
    completed: boolean;
    section: Section;
    durationMinutes?: number;
    breaks?: number;
    onToggleTask: (taskId: string) => void;
    onPlayTask: (taskId: string) => void;
    onOpenEditTask: (taskId: string) => void;
};

const PANEL_ORDER: Section[] = ['backlog', 'week', 'today'];

const PANEL_META: Record<Section, { title: string; x: number; y: number }> = {
    backlog: { title: 'Backlog', x: 40, y: 40 },
    week: { title: 'This Week', x: 420, y: 40 },
    today: { title: 'Today', x: 800, y: 40 },
};

const PANEL_WIDTH = 340;
const PANEL_HEIGHT = 640;
const TASK_WIDTH = 300;
const TASK_HEIGHT = 86;
const TASK_GAP = 14;

function formatTaskDate(createdAt: number) {
    const date = new Date(createdAt);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function PanelNode({ data }: NodeProps<Node<PanelNodeData>>) {
    return (
        <div
            className={clsx(
                'h-full w-full rounded-3xl border bg-black/55 backdrop-blur-md overflow-hidden pointer-events-auto',
                data.isHighlighted ? 'border-accent/40 shadow-[0_0_24px_-10px_rgba(79,209,197,0.45)]' : 'border-white/10'
            )}
        >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div className="flex items-center gap-2.5">
                    <h3 className="text-[1.05rem] font-bold text-white tracking-tight">{data.title}</h3>
                    <span className="rounded px-2 py-0.5 text-[10px] font-medium bg-white/10 text-white/60">
                        {data.count}
                    </span>
                </div>
                <button
                    type="button"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                        e.stopPropagation();
                        data.onAddTask(data.section);
                    }}
                    className="nodrag nopan flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                    title={`Add to ${data.title}`}
                >
                    <Plus className="h-3.5 w-3.5" />
                    Add
                </button>
            </div>

            <div className="pointer-events-none h-[calc(100%-60px)] w-full" />
        </div>
    );
}

function TaskNode({ data }: NodeProps<Node<TaskNodeData>>) {
    return (
        <div
            onClick={() => data.onOpenEditTask(data.taskId)}
            className={clsx(
                'group w-full rounded-xl border bg-zinc-900/95 px-4 py-3 shadow-lg transition-colors pointer-events-auto',
                data.completed
                    ? 'border-white/10 opacity-65'
                    : 'border-white/15 hover:border-white/30'
            )}
        >
            <div className="flex items-start gap-3">
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        data.onToggleTask(data.taskId);
                    }}
                    className={clsx(
                        'nodrag nopan mt-0.5 transition-colors',
                        data.completed ? 'text-accent' : 'text-white/30 hover:text-white/70'
                    )}
                    title={data.completed ? 'Mark as not done' : 'Mark as done'}
                >
                    {data.completed ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                </button>

                <div className="min-w-0 flex-1">
                    <p
                        className={clsx(
                            'truncate text-sm font-medium',
                            data.completed ? 'text-white/40 line-through' : 'text-white/90'
                        )}
                    >
                        {data.title}
                    </p>
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-white/40">
                        <Clock className="h-3 w-3" />
                        <span>{formatTaskDate(data.createdAt)}</span>
                        <span className="mx-1">•</span>
                        <span>{data.durationMinutes ?? 25}m</span>
                        <span className="mx-1">•</span>
                        <span>{data.breaks ?? 4} breaks</span>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        data.onPlayTask(data.taskId);
                    }}
                    className="nodrag nopan rounded-md p-1.5 text-white/35 hover:bg-emerald-500/20 hover:text-emerald-400 transition-colors"
                    title="Start this task"
                >
                    <Play className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
}

function resolveSectionFromX(centerX: number): Section {
    let bestSection: Section = 'backlog';
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const section of PANEL_ORDER) {
        const panelCenter = PANEL_META[section].x + PANEL_WIDTH / 2;
        const distance = Math.abs(centerX - panelCenter);
        if (distance < bestDistance) {
            bestDistance = distance;
            bestSection = section;
        }
    }

    return bestSection;
}

function buildNodes(
    tasks: Task[],
    handlers: {
        onAddTask: (section: Section) => void;
        onToggleTask: (taskId: string) => void;
        onPlayTask: (taskId: string) => void;
        onOpenEditTask: (taskId: string) => void;
    }
): Node[] {
    const panelNodes: Node<PanelNodeData>[] = PANEL_ORDER.map((section) => ({
        id: `panel-${section}`,
        type: 'panel',
        position: { x: PANEL_META[section].x, y: PANEL_META[section].y },
        draggable: false,
        selectable: false,
        data: {
            title: PANEL_META[section].title,
            section,
            count: tasks.filter((t) => t.section === section).length,
            isHighlighted: section === 'today',
            onAddTask: handlers.onAddTask,
        },
        style: {
            width: PANEL_WIDTH,
            height: PANEL_HEIGHT,
            pointerEvents: 'all',
        },
    }));

    const taskNodes: Node<TaskNodeData>[] = [];

    for (const section of PANEL_ORDER) {
        const sectionTasks = tasks.filter((t) => t.section === section);

        sectionTasks.forEach((task, index) => {
            taskNodes.push({
                id: `task-${task.id}`,
                type: 'task',
                position: {
                    x: PANEL_META[section].x + 20,
                    y: PANEL_META[section].y + 84 + index * (TASK_HEIGHT + TASK_GAP),
                },
                data: {
                    taskId: task.id,
                    title: task.title,
                    createdAt: task.created_at,
                    completed: task.completed,
                    section: task.section,
                    durationMinutes: task.durationMinutes,
                    breaks: task.breaks,
                    onToggleTask: handlers.onToggleTask,
                    onPlayTask: handlers.onPlayTask,
                    onOpenEditTask: handlers.onOpenEditTask,
                },
                style: {
                    width: TASK_WIDTH,
                    pointerEvents: 'all',
                },
            });
        });
    }

    return [...panelNodes, ...taskNodes];
}

export function TaskFlowBoard() {
    const { user } = useUser();
    const supabase = useSupabase();
    const tasks = useTaskStore((state) => state.tasks);
    const addTask = useTaskStore((state) => state.addTask);
    const moveTask = useTaskStore((state) => state.moveTask);
    const toggleTaskCompletion = useTaskStore((state) => state.toggleTaskCompletion);
    const updateTask = useTaskStore((state) => state.updateTask);
    const setActiveTaskId = useTimerStore((state) => state.setActiveTaskId);
    const setRemainingTime = useTimerStore((state) => state.setRemainingTime);
    const setBreaksLeft = useTimerStore((state) => state.setBreaksLeft);
    const [modalState, setModalState] = useState<
        | { mode: 'create'; section: Section }
        | { mode: 'edit'; taskId: string }
        | null
    >(null);

    const onAddTask = useCallback(
        (section: Section) => {
            setModalState({ mode: 'create', section });
        },
        []
    );

    const onToggleTask = useCallback(
        async (taskId: string) => {
            const task = useTaskStore.getState().tasks.find((t) => t.id === taskId);
            if (!task) return;

            toggleTaskCompletion(taskId);

            if (user && supabase) {
                const { error } = await supabase
                    .from('tasks')
                    .update({ completed: !task.completed })
                    .eq('id', taskId)
                    .eq('user_id', user.id);

                if (error) {
                    console.error('Failed to update task completion:', error);
                }
            }
        },
        [supabase, toggleTaskCompletion, user]
    );

    const onPlayTask = useCallback((taskId: string) => {
        const task = useTaskStore.getState().tasks.find((t) => t.id === taskId);
        if (!task) return;

        setActiveTaskId(taskId);
        setRemainingTime((task.durationMinutes ?? 25) * 60);
        setBreaksLeft(task.breaks ?? 4);
    }, [setActiveTaskId, setBreaksLeft, setRemainingTime]);

    const onOpenEditTask = useCallback((taskId: string) => {
        setModalState({ mode: 'edit', taskId });
    }, []);

    const onSubmitTaskForm = useCallback(
        async (values: TaskFormValues) => {
            if (!modalState) return;

            if (modalState.mode === 'create') {
                const newTask = addTask(values.title, values.section, {
                    durationMinutes: values.durationMinutes,
                    breaks: values.breaks,
                });

                if (user && supabase) {
                    const { error } = await supabase.from('tasks').insert({
                        id: newTask.id,
                        user_id: user.id,
                        title: newTask.title,
                        completed: newTask.completed,
                        created_at: newTask.created_at,
                        section: newTask.section,
                    });

                    if (error) {
                        console.error('Failed to create task:', error);
                    }
                }

                setModalState(null);
                return;
            }

            const taskId = modalState.taskId;
            updateTask(taskId, {
                title: values.title,
                section: values.section,
                durationMinutes: values.durationMinutes,
                breaks: values.breaks,
            });

            if (user && supabase) {
                const { error } = await supabase
                    .from('tasks')
                    .update({ title: values.title, section: values.section })
                    .eq('id', taskId)
                    .eq('user_id', user.id);

                if (error) {
                    console.error('Failed to update task:', error);
                }
            }

            setModalState(null);
        },
        [addTask, modalState, supabase, updateTask, user]
    );

    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);

    const nodeTypes = useMemo(
        () => ({
            panel: PanelNode,
            task: TaskNode,
        }),
        []
    );

    useEffect(() => {
        setNodes(
            buildNodes(tasks, {
                onAddTask,
                onToggleTask,
                onPlayTask,
                onOpenEditTask,
            })
        );
    }, [onAddTask, onOpenEditTask, onPlayTask, onToggleTask, setNodes, tasks]);

    const onNodeDragStop = useCallback(
        async (_: React.MouseEvent, node: Node) => {
            if (!node.id.startsWith('task-')) return;

            const taskId = node.id.replace('task-', '');
            const currentTask = useTaskStore.getState().tasks.find((task) => task.id === taskId);
            if (!currentTask) return;

            const x = node.position.x + TASK_WIDTH / 2;
            const nextSection = resolveSectionFromX(x);

            if (nextSection === currentTask.section) return;

            moveTask(taskId, nextSection);

            if (user && supabase) {
                const { error } = await supabase
                    .from('tasks')
                    .update({ section: nextSection })
                    .eq('id', taskId)
                    .eq('user_id', user.id);

                if (error) {
                    console.error('Failed to move task:', error);
                }
            }
        },
        [moveTask, supabase, user]
    );

    const editingTask =
        modalState?.mode === 'edit'
            ? tasks.find((task) => task.id === modalState.taskId) ?? null
            : null;

    const initialTaskFormValues: TaskFormValues =
        modalState?.mode === 'edit' && editingTask
            ? {
                title: editingTask.title,
                section: editingTask.section,
                durationMinutes: editingTask.durationMinutes ?? 25,
                breaks: editingTask.breaks ?? 4,
            }
            : {
                title: '',
                section: modalState?.mode === 'create' ? modalState.section : 'today',
                durationMinutes: 25,
                breaks: 4,
            };

    return (
        <div className="h-full w-full rounded-3xl bg-transparent overflow-hidden">
            <ReactFlow
                nodes={nodes}
                edges={[]}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onNodeDragStop={onNodeDragStop}
                fitView
                fitViewOptions={{ padding: 0.06 }}
                nodesConnectable={false}
                elementsSelectable={false}
                zoomOnScroll={false}
                zoomOnPinch={false}
                zoomOnDoubleClick={false}
                panOnDrag={false}
                panOnScroll={false}
                proOptions={{ hideAttribution: true }}
                minZoom={1}
                maxZoom={1}
                className="bg-transparent [&_.react-flow__pane]:bg-transparent [&_.react-flow__viewport]:bg-transparent [&_.react-flow__renderer]:bg-transparent [&_.react-flow__node]:pointer-events-auto"
                style={{ background: 'transparent' }}
            />

            <TaskFormModal
                isOpen={Boolean(modalState && (modalState.mode === 'create' || editingTask))}
                mode={modalState?.mode ?? 'create'}
                initialValues={initialTaskFormValues}
                onClose={() => setModalState(null)}
                onSubmit={(values) => {
                    void onSubmitTaskForm(values);
                }}
            />
        </div>
    );
}
