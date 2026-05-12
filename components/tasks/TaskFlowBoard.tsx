'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ReactFlow,
    Node,
    NodeProps,
    useNodesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Plus, Clock, CheckCircle2, Circle, Play, ListTodo } from 'lucide-react';
import clsx from 'clsx';
import { useTaskStore, Task } from '@/store/useTaskStore';
import { useTimerStore } from '@/store/useTimerStore';

type Bucket = 'today' | 'upcoming' | 'backlog';

type PanelNodeData = {
    title: string;
    bucket: Bucket;
    count: number;
    isHighlighted?: boolean;
    onAddTask: (bucket: Bucket) => void;
};

type TaskNodeData = {
    task: Task;
    isSelected?: boolean;
    onToggleTask: (taskId: string) => void;
    onPlayTask: (taskId: string) => void;
    onSelectTask: (taskId: string) => void;
};

const BUCKET_ORDER: Bucket[] = ['today', 'upcoming', 'backlog'];

const BUCKET_META: Record<Bucket, { title: string; x: number; y: number }> = {
    today: { title: 'Today', x: 40, y: 40 },
    upcoming: { title: 'Upcoming', x: 420, y: 40 },
    backlog: { title: 'Backlog', x: 800, y: 40 },
};

const PANEL_WIDTH = 340;
const PANEL_HEIGHT = 700;
const TASK_WIDTH = 300;
const TASK_GAP = 16;

function PanelNode({ data }: NodeProps<Node<PanelNodeData>>) {
    return (
        <div
            className={clsx(
                'h-full w-full rounded-[2.5rem] border bg-white/[0.03] backdrop-blur-3xl overflow-hidden pointer-events-auto shadow-2xl',
                data.isHighlighted ? 'border-accent/40 shadow-accent/5' : 'border-white/5'
            )}
        >
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-5 bg-white/[0.02]">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-white/80 tracking-tight">{data.title}</h3>
                    <span className="rounded-full px-2.5 py-0.5 text-[10px] font-black bg-white/10 text-white/40">
                        {data.count}
                    </span>
                </div>
                <button
                    type="button"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                        e.stopPropagation();
                        data.onAddTask(data.bucket);
                    }}
                    className="nodrag nopan flex items-center gap-1.5 rounded-full border border-white/5 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white/50 hover:bg-white/10 hover:text-white transition-all active:scale-95"
                >
                    <Plus className="h-3.5 w-3.5" />
                    New
                </button>
            </div>
            <div className="pointer-events-none h-full w-full" />
        </div>
    );
}

function TaskNode({ data }: NodeProps<Node<TaskNodeData>>) {
    const { task } = data;
    const completedSubtasks = task.subtasks.filter(s => s.done).length;
    const totalSubtasks = task.subtasks.length;
    const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

    return (
        <div
            onClick={() => data.onSelectTask(task.id)}
            className={clsx(
                'group w-full rounded-2xl border bg-zinc-950/80 px-5 py-4 shadow-xl transition-all pointer-events-auto hover:translate-y-[-2px] cursor-pointer',
                data.isSelected ? 'border-accent shadow-accent/10' : 'border-white/10 hover:border-white/20',
                task.status === 'done' ? 'opacity-50' : ''
            )}
        >
            <div className="flex items-start gap-4">
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        data.onToggleTask(task.id);
                    }}
                    className={clsx(
                        'nodrag nopan mt-0.5 transition-colors shrink-0',
                        task.status === 'done' ? 'text-accent' : 'text-white/20 hover:text-white/60'
                    )}
                >
                    {task.status === 'done' ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                </button>

                <div className="min-w-0 flex-1">
                    <p className={clsx(
                        'truncate text-[15px] font-bold tracking-tight',
                        task.status === 'done' ? 'text-white/20 line-through' : 'text-white/90'
                    )}>
                        {task.title}
                    </p>
                    
                    {totalSubtasks > 0 && (
                        <div className="mt-3 flex flex-col gap-1.5">
                            <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-white/20">
                                <span>Subtasks</span>
                                <span>{completedSubtasks}/{totalSubtasks}</span>
                            </div>
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-accent transition-all duration-500 ease-out" 
                                    style={{ width: `${progress}%` }} 
                                />
                            </div>
                        </div>
                    )}

                    <div className="mt-3 flex items-center gap-3 text-[10px] font-bold text-white/30">
                        <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{task.estimatedMinutes ?? 25}m</span>
                        </div>
                        {task.tags.length > 0 && (
                            <div className="flex items-center gap-1">
                                <ListTodo className="h-3 w-3" />
                                <span className="truncate max-w-[80px]">{task.tags[0]}</span>
                            </div>
                        )}
                    </div>
                </div>

                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        data.onPlayTask(task.id);
                    }}
                    className="nodrag nopan rounded-full p-2 bg-accent/5 text-accent opacity-0 group-hover:opacity-100 transition-all hover:bg-accent hover:text-black"
                >
                    <Play className="h-4 w-4 fill-current" />
                </button>
            </div>
        </div>
    );
}

function getTaskBucket(task: Task): Bucket {
    const todayStr = new Date().toISOString().split('T')[0];
    if (task.scheduledDate?.startsWith(todayStr)) return 'today';
    if (task.scheduledDate) return 'upcoming';
    return 'backlog';
}

function resolveBucketFromX(centerX: number): Bucket {
    let bestBucket: Bucket = 'backlog';
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const bucket of BUCKET_ORDER) {
        const panelCenter = BUCKET_META[bucket].x + PANEL_WIDTH / 2;
        const distance = Math.abs(centerX - panelCenter);
        if (distance < bestDistance) {
            bestDistance = distance;
            bestBucket = bucket;
        }
    }

    return bestBucket;
}

export function TaskFlowBoard({ 
    selectedTaskId, 
    onSelectTask 
}: { 
    selectedTaskId: string | null, 
    onSelectTask: (id: string | null) => void 
}) {
    const tasks = useTaskStore((state) => state.tasks);
    const addTask = useTaskStore((state) => state.addTask);
    const updateTask = useTaskStore((state) => state.updateTask);
    const toggleTaskCompletion = useTaskStore((state) => state.toggleTaskCompletion);
    const setActiveTaskId = useTimerStore((state) => state.setActiveTaskId);
    const setRemainingTime = useTimerStore((state) => state.setRemainingTime);
    const setBreaksLeft = useTimerStore((state) => state.setBreaksLeft);

    const onAddTask = useCallback((bucket: Bucket) => {
        const scheduledDate = bucket === 'today' ? new Date().toISOString() : undefined;
        const newTask = addTask({ title: 'New Task', listId: 'personal', scheduledDate });
        onSelectTask(newTask.id);
    }, [addTask, onSelectTask]);

    const onToggleTask = useCallback((taskId: string) => {
        toggleTaskCompletion(taskId);
    }, [toggleTaskCompletion]);

    const onPlayTask = useCallback((taskId: string) => {
        const task = useTaskStore.getState().tasks.find((t) => t.id === taskId);
        if (!task) return;
        setActiveTaskId(taskId);
        setRemainingTime((task.estimatedMinutes ?? 25) * 60);
        setBreaksLeft(4);
    }, [setActiveTaskId, setBreaksLeft, setRemainingTime]);

    const handleSelectTask = useCallback((taskId: string) => {
        onSelectTask(taskId === selectedTaskId ? null : taskId);
    }, [onSelectTask, selectedTaskId]);

    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);

    const nodeTypes = useMemo(() => ({
        panel: PanelNode,
        task: TaskNode,
    }), []);

    useEffect(() => {
        const buildNodes = (): Node[] => {
            const panelNodes: Node<PanelNodeData>[] = BUCKET_ORDER.map((bucket) => ({
                id: `panel-${bucket}`,
                type: 'panel',
                position: { x: BUCKET_META[bucket].x, y: BUCKET_META[bucket].y },
                draggable: false,
                selectable: false,
                data: {
                    title: BUCKET_META[bucket].title,
                    bucket,
                    count: tasks.filter((t) => getTaskBucket(t) === bucket).length,
                    isHighlighted: bucket === 'today',
                    onAddTask,
                },
                style: { width: PANEL_WIDTH, height: PANEL_HEIGHT, zIndex: 0 },
            }));

            const taskNodes: Node<TaskNodeData>[] = [];
            for (const bucket of BUCKET_ORDER) {
                const bucketTasks = tasks.filter((t) => getTaskBucket(t) === bucket);
                bucketTasks.forEach((task, index) => {
                    taskNodes.push({
                        id: `task-${task.id}`,
                        type: 'task',
                        position: {
                            x: BUCKET_META[bucket].x + 20,
                            y: BUCKET_META[bucket].y + 84 + index * 105, // Approximation for TASK_HEIGHT + TASK_GAP
                        },
                        data: {
                            task,
                            isSelected: task.id === selectedTaskId,
                            onToggleTask,
                            onPlayTask,
                            onSelectTask: handleSelectTask,
                        },
                        style: { width: TASK_WIDTH, zIndex: 10 },
                    });
                });
            }

            return [...panelNodes, ...taskNodes];
        };

        setNodes(buildNodes());
    }, [onAddTask, onPlayTask, onToggleTask, handleSelectTask, setNodes, tasks, selectedTaskId]);

    const onNodeDragStop = useCallback((_: React.MouseEvent, node: Node) => {
        if (!node.id.startsWith('task-')) return;
        const taskId = node.id.replace('task-', '');
        const currentTask = useTaskStore.getState().tasks.find((task) => task.id === taskId);
        if (!currentTask) return;

        const x = node.position.x + TASK_WIDTH / 2;
        const nextBucket = resolveBucketFromX(x);
        const currentBucket = getTaskBucket(currentTask);

        if (nextBucket === currentBucket) return;

        if (nextBucket === 'today') {
            updateTask(taskId, { scheduledDate: new Date().toISOString() });
        } else if (nextBucket === 'upcoming') {
             // Set to tomorrow if moving to upcoming and was today
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            updateTask(taskId, { scheduledDate: tomorrow.toISOString() });
        } else {
            updateTask(taskId, { scheduledDate: undefined });
        }
    }, [updateTask]);

    return (
        <div className="h-full w-full bg-transparent overflow-hidden">
            <ReactFlow
                nodes={nodes}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onNodeDragStop={onNodeDragStop}
                fitView
                fitViewOptions={{ padding: 0.1 }}
                nodesDraggable={true}
                nodesConnectable={false}
                elementsSelectable={true}
                zoomOnScroll={false}
                zoomOnPinch={false}
                panOnScroll={false}
                panOnDrag={false}
                preventScrolling={true}
                proOptions={{ hideAttribution: true }}
                className="bg-transparent"
                style={{ background: 'transparent' }}
            />
        </div>
    );
}
