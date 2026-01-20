'use client';

import { useTimerStore } from '@/store/useTimerStore';
import { motion, AnimatePresence } from 'framer-motion';

export function BackgroundRenderer() {
    const { backgroundMode } = useTimerStore();

    return (
        <div className="fixed inset-0 -z-10 w-full h-full overflow-hidden transition-colors duration-1000 ease-in-out">
            <AnimatePresence mode="wait">
                {backgroundMode === 'black' && (
                    <motion.div
                        key="black"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0 bg-bg-black"
                    />
                )}

                {backgroundMode === 'gradient' && (
                    <motion.div
                        key="gradient"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0"
                        style={{
                            background: 'radial-gradient(circle at top, #111827 0%, #0B0F14 40%, #000000 100%)'
                        }}
                    />
                )}

                {backgroundMode === 'lofi' && (
                    <motion.div
                        key="lofi"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0 bg-black"
                    >
                        {/* Video Background */}
                        <video
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="h-full w-full object-cover opacity-60 filter brightness-[0.35] blur-[2px]"
                        >
                            <source src="/lofi-background.mp4" type="video/mp4" />
                        </video>

                        {/* Overlay to ensure readability */}
                        <div className="absolute inset-0 bg-black/40" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
