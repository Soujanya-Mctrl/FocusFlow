'use client';

import { useCallback, useEffect, useMemo } from 'react';
import {
    ReactFlow,
    Node,
    NodeProps,
    useNodesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Plus, Clock, Check, Play } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
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

function PanelNode({ data }: NodeProps<Node<PanelNodeData>>) {
    return (
        <div
            className={clsx(
                'flex flex-col h-full w-full rounded-2xl border overflow-hidden p-3 pointer-events-auto transition-all duration-700 glass',
                data.isHighlighted 
                    ? 'border-primary-container/20 shadow-[0_0_80px_-20px_rgba(0,245,225,0.15)] bg-white/[0.04]' 
                    : 'border-white/[0.03] opacity-90 hover:opacity-100 bg-white/[0.01]'
            )}
        >
            <div className="flex items-center justify-between p-4 pb-4">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-white tracking-tight">{data.title}</h2>
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary-container/20 blur-md rounded-full" />
                        <span className="relative bg-white/5 px-2.5 py-1 rounded-full text-[10px] text-primary-container/80 font-black uppercase tracking-widest border border-primary-container/20 backdrop-blur-md">
                            {data.count}
                        </span>
                    </div>
                </div>
                <button
                    type="button"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                        e.stopPropagation();
                        data.onAddTask(data.bucket);
                    }}
                    className="nodrag nopan flex items-center gap-2 px-5 py-2 bg-primary-container text-on-primary-container hover:bg-primary-container/90 transition-all rounded-full text-[10px] active:scale-95 font-black uppercase tracking-[0.15em] shadow-[0_0_20px_rgba(0,245,225,0.2)] hover:shadow-[0_0_30px_rgba(0,245,225,0.4)]"
                >
                    <Plus className="h-4 w-4 stroke-[3]" />
                    New
                </button>
            </div>
            <div className="pointer-events-none flex-1 h-full w-full" />
        </div>
    );
}

function TaskNode({ data, dragging }: NodeProps<Node<TaskNodeData>>) {
    const { task } = data;
    const completedSubtasks = task.subtasks.filter(s => s.done).length;
    const totalSubtasks = task.subtasks.length;
    const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

    return (
        <div
            onClick={() => data.onSelectTask(task.id)}
            className={clsx(
                'group w-full border rounded-2xl p-5 transition-all duration-300 cursor-pointer pointer-events-auto relative overflow-hidden',
                dragging 
                    ? 'bg-surface-container-highest/90 border-primary-container/50 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] rotate-2 scale-105 z-[100]' 
                    : data.isSelected 
                        ? 'bg-surface-container-high border-primary-container/50 shadow-[0_0_40px_-10px_rgba(0,245,225,0.3)] scale-[1.02] z-20' 
                        : 'bg-surface-container-low border-white/[0.04] hover:border-primary-container/20 hover:bg-surface-container-high hover:scale-[1.01] shadow-xl',
                task.status === 'done' && !dragging ? 'opacity-40' : ''
            )}
        >
            {/* Ambient Background Gradient */}
            <div className={clsx(
                'absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none',
                task.priority === 'high' ? 'bg-gradient-to-br from-error/40 to-transparent' : 
                'bg-gradient-to-br from-primary-container/40 to-transparent'
            )} />

            {/* Selection/Focus Glow */}
            {data.isSelected && (
                <div className="absolute inset-0 rounded-2xl bg-primary-container/[0.03] blur-2xl pointer-events-none" />
            )}

            <div className="flex items-start gap-5 relative">
                {/* Circular Pill-style Checkbox */}
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        data.onToggleTask(task.id);
                    }}
                    className={clsx(
                        'nodrag nopan mt-0.5 flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center',
                        task.status === 'done' 
                            ? 'bg-primary-container border-primary-container text-on-primary-container shadow-[0_0_15px_rgba(0,245,225,0.4)]' 
                            : 'border-white/10 bg-white/[0.02] group-hover:border-primary-container/40'
                    )}
                >
                    {task.status === 'done' && <Check className="h-3.5 w-3.5 stroke-[4]" />}
                </button>

                <div className="flex-1 min-w-0">
                    <h3 className={clsx(
                        'text-lg font-bold mb-4 truncate transition-colors leading-tight tracking-tight',
                        task.status === 'done' ? 'text-white/20 line-through' : 'text-white/90 group-hover:text-white'
                    )}>
                        {task.title}
                    </h3>
                    
                    {totalSubtasks > 0 && (
                        <div className="space-y-2.5 mb-5">
                            <div className="flex justify-between items-center text-[10px] font-black tracking-[0.2em] text-white/20 uppercase">
                                <span>Subtasks</span>
                                <span className={clsx(
                                    'transition-colors font-black',
                                    progress === 100 ? 'text-primary-container' : 'text-white/40'
                                )}>{completedSubtasks}/{totalSubtasks}</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ type: "spring", bounce: 0, duration: 1 }}
                                    className={clsx(
                                        'h-full rounded-full transition-all duration-500',
                                        progress === 100 ? 'bg-primary-container shadow-[0_0_12px_rgba(0,245,225,0.5)]' : 'bg-primary-container/60'
                                    )} 
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-white/[0.03] px-3 py-1 rounded-full border border-white/[0.03]">
                            <Clock className="h-3.5 w-3.5 text-primary-container/40" />
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{task.estimatedMinutes ?? 25}m</span>
                        </div>
                        {task.priority === 'high' && (
                            <div className="flex items-center gap-2 bg-error/5 px-3 py-1 rounded-full border border-error/10">
                                <div className="w-1.5 h-1.5 rounded-full bg-error shadow-[0_0_8px_rgba(255,82,82,0.4)]" />
                                <span className="text-[10px] font-black text-error/80 uppercase tracking-widest">High</span>
                            </div>
                        )}
                        {task.tags && task.tags.length > 0 && (
                            <div className="flex items-center gap-2 bg-white/[0.03] px-3 py-1 rounded-full border border-white/[0.03]">
                                <span className="text-[10px] font-black text-white/30 uppercase tracking-widest truncate max-w-[80px]">#{task.tags[0]}</span>
                            </div>
                        )}
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        data.onPlayTask(task.id);
                    }}
                    className="nodrag nopan flex-shrink-0 w-10 h-10 rounded-full bg-primary-container text-on-primary-container items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-[0_8px_20px_rgba(0,245,225,0.3)] hover:shadow-[0_12px_30px_rgba(0,245,225,0.5)] flex"
                >
                    <Play className="h-4 w-4 fill-current ml-0.5" />
                </motion.button>
            </div>
        </div>
    );
}

function getTaskBucket(task: Task): Bucket {
    if (!task.scheduledDate) return 'backlog';
    
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const taskDateStr = task.scheduledDate.split('T')[0];
    
    // If scheduled date is today or in the past, it goes to Today bucket
    if (taskDateStr <= todayStr) return 'today';
    return 'upcoming';
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
    const lists = useTaskStore((state) => state.lists);
    const activeListId = useTaskStore((state) => state.activeListId);
    const addTask = useTaskStore((state) => state.addTask);
    const updateTask = useTaskStore((state) => state.updateTask);
    const toggleTaskCompletion = useTaskStore((state) => state.toggleTaskCompletion);
    const setActiveTaskId = useTimerStore((state) => state.setActiveTaskId);
    const setRemainingTime = useTimerStore((state) => state.setRemainingTime);
    const setBreaksLeft = useTimerStore((state) => state.setBreaksLeft);

    const onAddTask = useCallback((bucket: Bucket) => {
        let scheduledDate: string | undefined;
        
        if (bucket === 'today') {
            scheduledDate = new Date().toISOString().split('T')[0];
        } else if (bucket === 'upcoming') {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            scheduledDate = tomorrow.toISOString().split('T')[0];
        } else {
            scheduledDate = undefined;
        }

        const isProject = lists.some(l => l.id === activeListId);
        const listId = isProject ? activeListId : (lists.length > 0 ? lists[0].id : 'personal');
        
        const newTask = addTask({ title: 'New Task', listId, scheduledDate });
        onSelectTask(newTask.id);
    }, [addTask, onSelectTask, activeListId, lists]);

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

    const filteredTasks = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        
        switch (activeListId) {
            case 'all':
                return tasks;
            case 'today':
                // Today filter: Scheduled for today or overdue
                return tasks.filter(t => t.scheduledDate && t.scheduledDate <= todayStr);
            case 'starred':
                return tasks.filter(t => t.priority === 'high');
            default:
                // Assume it's a specific list ID
                return tasks.filter(t => t.listId === activeListId);
        }
    }, [tasks, activeListId]);

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
                    count: filteredTasks.filter((t) => getTaskBucket(t) === bucket).length,
                    isHighlighted: bucket === 'today',
                    onAddTask,
                },
                style: { width: PANEL_WIDTH, height: PANEL_HEIGHT, zIndex: 0 },
            }));

            const taskNodes: Node<TaskNodeData>[] = [];
            for (const bucket of BUCKET_ORDER) {
                const bucketTasks = filteredTasks.filter((t) => getTaskBucket(t) === bucket);
                bucketTasks.forEach((task, index) => {
                    taskNodes.push({
                        id: `task-${task.id}`,
                        type: 'task',
                        position: {
                            x: BUCKET_META[bucket].x + 20,
                            y: BUCKET_META[bucket].y + 84 + index * 125, // Increased vertical gap for better spacing
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
    }, [onAddTask, onPlayTask, onToggleTask, handleSelectTask, setNodes, filteredTasks, selectedTaskId]);

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
            updateTask(taskId, { scheduledDate: new Date().toISOString().split('T')[0] });
        } else if (nextBucket === 'upcoming') {
             // Set to tomorrow if moving to upcoming and was today
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            updateTask(taskId, { scheduledDate: tomorrow.toISOString().split('T')[0] });
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
