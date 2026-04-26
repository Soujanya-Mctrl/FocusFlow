'use client';

import { useTimerStore } from '@/store/useTimerStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState, memo } from 'react';
import Image from 'next/image';

function BackgroundRendererImpl() {
    const backgroundMode = useTimerStore((state) => state.backgroundMode) || 'gradient';
    const videoRef = useRef<HTMLVideoElement>(null);
    const [shouldPan, setShouldPan] = useState(() => {
        if (typeof window === 'undefined') return false;
        const ratio = window.innerWidth / window.innerHeight;
        const target = 16 / 9;
        return Math.abs(ratio - target) > 0.05;
    });

    useEffect(() => {
        const checkRatio = () => {
            const ratio = window.innerWidth / window.innerHeight;
            const target = 16 / 9;
            setShouldPan(Math.abs(ratio - target) > 0.05);
        };

        window.addEventListener('resize', checkRatio);
        return () => window.removeEventListener('resize', checkRatio);
    }, []);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.volume = 0.2;
            const playVideo = () => {
                if (videoRef.current && videoRef.current.paused) {
                    videoRef.current.play().catch(() => console.log("Still waiting for interaction to play audio..."));
                }
            };

            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    console.log("Autoplay with sound was prevented. Waiting for user interaction.");
                    window.addEventListener('click', playVideo, { once: true });
                    window.addEventListener('keydown', playVideo, { once: true });
                });
            }
        }
    }, [backgroundMode]);

    return (
        <div className="fixed inset-0 z-0 w-full h-full overflow-hidden transition-colors duration-1000 ease-in-out">
            <AnimatePresence mode="wait">
                {backgroundMode === 'gradient' && (
                    <motion.div
                        key="gradient"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}
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
                        transition={{ duration: 1.5 }}
                        className="absolute inset-0 bg-black"
                    >
                        <motion.video
                            ref={videoRef}
                            autoPlay
                            loop
                            playsInline
                            animate={shouldPan ? {
                                x: ["-2%", "2%", "-2%"],
                            } : {}}
                            transition={{
                                duration: 20,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className={`h-full w-full object-cover opacity-70 filter brightness-[0.92] blur-[1px] transition-transform duration-500 ${shouldPan ? 'scale-110' : 'scale-100'}`}
                        >
                            <source src="/lofi_videos/rain.webm" type="video/webm" />
                        </motion.video>
                        <div className="absolute inset-0 bg-black/1" />
                    </motion.div>
                )}

                {backgroundMode === 'wallpaper' && (
                    <motion.div
                        key="wallpaper"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}
                        className="absolute inset-0 bg-black"
                    >
                        <Image
                            src="/wallpaper/photo-1485470733090-0aae1788d5af.avif"
                            alt="Background"
                            fill
                            sizes="100vw"
                            className="h-full w-full object-cover opacity-80 filter brightness-[0.7]"
                        />
                        <div className="absolute inset-0 bg-black/10" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export const BackgroundRenderer = memo(BackgroundRendererImpl);
