'use client';

import { useTimerStore } from "@/store/useTimerStore";
import { useTaskStore } from "@/store/useTaskStore";
import { motion } from "framer-motion";
import { RotateCcw, PictureInPicture2, CheckCircle, SkipForward } from "lucide-react";
import clsx from "clsx";
import { usePiPWindow } from "@/hooks/usePiPWindow";
import { createPortal } from "react-dom";
import { PiPDisplay } from "./PiPDisplay";

function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function TimerDisplay() {
    const {
        remainingTime,
        toggleTimer,
        mode,
        restartCurrentSession,
        activeTaskId,
        setActiveTaskId
    } = useTimerStore();

    const { tasks, toggleTaskCompletion } = useTaskStore();
    const { pipWindow, requestPiP, closePiP } = usePiPWindow();

    const activeTask = tasks.find(t => t.id === activeTaskId);
    const isTaskDone = activeTask?.completed ?? false;

    return (
        <>
            <div className="group relative flex items-center justify-center" onDoubleClick={toggleTimer}>
                {/* Mode Labels - Absolute Top */}
                <div className="absolute -top-16 flex gap-8">
                    <span className={clsx(
                        "text-sm font-bold tracking-[0.05rem] transition-opacity duration-300",
                        mode === 'focus' ? "text-white opacity-100" : "text-white opacity-20"
                    )}>
                        FOCUS
                    </span>
                    <span className={clsx(
                        "text-sm font-bold tracking-[0.05rem] transition-opacity duration-300",
                        mode === 'break' ? "text-white opacity-100" : "text-white opacity-20"
                    )}>
                        BREAK
                    </span>
                </div>

                {/* Timer Digits - The Center Anchor */}
                <motion.div
                    layout
                    className="text-[clamp(3.5rem,22vw,11rem)] sm:text-[18vmin] font-semibold leading-none tracking-[0.02em] tabular-nums select-none cursor-pointer text-white"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                >
                    {formatTime(remainingTime)}
                </motion.div>

                {/* Hover Overlay: Controls - Absolute Bottom */}
                <div className="absolute inset-x-0 -bottom-8 sm:-bottom-10 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out transform translate-y-4 group-hover:translate-y-0">

                    {/* Done Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (activeTaskId) toggleTaskCompletion(activeTaskId);
                        }}
                        className={clsx(
                            "group/btn flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border transition-all active:scale-95 backdrop-blur-md",
                            isTaskDone
                                ? "border-green-500/50 bg-green-500/10"
                                : "border-white/10 bg-white/5 hover:bg-white/15 hover:border-white/20"
                        )}
                        title={isTaskDone ? "Undo Done" : "Mark as Done"}
                    >
                        <CheckCircle className={clsx(
                            "h-4 w-4 transition-colors",
                            isTaskDone ? "text-green-500" : "text-white/50 group-hover/btn:text-white"
                        )} />
                    </button>

                    {/* Next Task Button (Only when done) */}
                    {isTaskDone && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                const currentIndex = tasks.findIndex(t => t.id === activeTaskId);
                                const nextTask = tasks.find((t, i) => i > currentIndex && !t.completed);
                                if (nextTask) setActiveTaskId(nextTask.id);
                            }}
                            className="group/btn flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 backdrop-blur-md transition-all hover:bg-emerald-500/20 hover:border-emerald-500/30 active:scale-95"
                            title="Next Task"
                        >
                            <SkipForward className="h-4 w-4 text-emerald-500 transition-colors" />
                        </button>
                    )}

                    {/* PiP Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (pipWindow) closePiP();
                            else requestPiP(450, 60);
                        }}
                        className="group/btn flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-md transition-all hover:bg-white/15 hover:border-white/20 active:scale-95"
                        title="Pop Out Timer"
                    >
                        <PictureInPicture2 className="h-4 w-4 text-white/50 transition-colors group-hover/btn:text-white" />
                    </button>

                    {/* Restart Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            restartCurrentSession();
                        }}
                        className="group/btn flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-md transition-all hover:bg-white/15 hover:border-white/20 active:scale-95"
                        title="Restart Session"
                    >
                        <RotateCcw className="h-4 w-4 text-white/50 transition-colors group-hover/btn:text-white" />
                    </button>


                </div>
            </div>

            {/* Render PiP content into the portal if window exists */}
            {pipWindow && createPortal(
                <PiPDisplay onClose={closePiP} pipWindow={pipWindow} />,
                pipWindow.document.body
            )}
        </>
    );
}
