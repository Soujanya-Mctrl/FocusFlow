'use client';

import { useTimerStore } from '@/store/useTimerStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState, memo } from 'react';

function BackgroundRendererImpl() {
    const backgroundMode = useTimerStore((state) => state.backgroundMode) || 'gradient';
    const videoRef = useRef<HTMLVideoElement>(null);
    const [shouldPan, setShouldPan] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const checkRatio = () => {
            const ratio = window.innerWidth / window.innerHeight;
            const target = 16 / 9;
            setShouldPan(Math.abs(ratio - target) > 0.05);
        };

        checkRatio();
        window.addEventListener('resize', checkRatio);
        return () => window.removeEventListener('resize', checkRatio);
    }, []);

    useEffect(() => {
        if (mounted && videoRef.current) {
            videoRef.current.volume = 0.2;
            const playVideo = () => {
                if (videoRef.current && videoRef.current.paused) {
                    videoRef.current.play().catch(e => console.log("Still waiting for interaction to play audio..."));
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
    }, [backgroundMode, mounted]);

    if (!mounted) return null;

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
                            className={`h-full w-full object-cover opacity-70 filter brightness-[0.6] blur-[1px] transition-transform duration-500 ${shouldPan ? 'scale-110' : 'scale-100'}`}
                        >
                            <source src="/lofi_videos/rain.webm" type="video/webm" />
                        </motion.video>
                        <div className="absolute inset-0 bg-black/5" />
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
                        <img
                            src="/wallpaper/photo-1485470733090-0aae1788d5af.avif"
                            alt="Background"
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
