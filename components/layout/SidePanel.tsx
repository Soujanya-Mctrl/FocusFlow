'use client';

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface SidePanelProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export function SidePanel({ isOpen, onClose, title, children }: SidePanelProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -50, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed left-24 top-4 bottom-4 z-40 w-80 flex flex-col rounded-2xl bg-black/80 backdrop-blur-xl border border-white/5 shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/5">
                        <h2 className="text-lg font-semibold text-white">{title}</h2>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-lg text-text-secondary hover:text-white hover:bg-white/10"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {children}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
