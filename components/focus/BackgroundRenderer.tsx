'use client';

import { useTimerStore } from '@/store/useTimerStore';
import { motion, AnimatePresence } from 'framer-motion';
import { getCustomVideo } from '@/lib/storage';
import { useEffect, useRef, useState, memo } from 'react';
import Image from 'next/image';

function BackgroundRendererImpl() {
    const backgroundMode = useTimerStore((state) => state.backgroundMode) || 'gradient';
    const isBackgroundMuted = useTimerStore((state) => state.isBackgroundMuted);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [shouldPan, setShouldPan] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [customVideoUrl, setCustomVideoUrl] = useState<string | null>(null);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMounted(true);
        console.log('[BackgroundRenderer] Mounted. Initial Mode:', backgroundMode);
        
        const checkRatio = () => {
            const ratio = window.innerWidth / window.innerHeight;
            const target = 16 / 9;
            setShouldPan(Math.abs(ratio - target) > 0.05);
        };
        
        checkRatio();
        window.addEventListener('resize', checkRatio);
        return () => window.removeEventListener('resize', checkRatio);
    }, [backgroundMode]);

    // Load custom video if mode is 'custom'
    useEffect(() => {
        let currentUrl: string | null = null;
        
        if (backgroundMode === 'custom') {
            const loadCustomVideo = async () => {
                const file = await getCustomVideo();
                if (file) {
                    currentUrl = URL.createObjectURL(file);
                    setCustomVideoUrl(currentUrl);
                    console.log('[BackgroundRenderer] Custom video blob created');
                    if (videoRef.current) {
                        videoRef.current.load();
                    }
                } else {
                    console.log('[BackgroundRenderer] No custom video found in storage');
                    setCustomVideoUrl(null);
                }
            };
            loadCustomVideo();
        }

        return () => {
            if (currentUrl) {
                console.log('[BackgroundRenderer] Revoking custom video blob');
                URL.revokeObjectURL(currentUrl);
            }
        };
    }, [backgroundMode]);

    useEffect(() => {
        if (videoRef.current && isMounted) {
            videoRef.current.volume = 0.2;
            const playVideo = () => {
                if (videoRef.current && videoRef.current.paused) {
                    videoRef.current.play().catch(e => console.log("[BackgroundRenderer] Play failed:", e));
                }
            };

            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    window.addEventListener('click', playVideo, { once: true });
                    window.addEventListener('keydown', playVideo, { once: true });
                });
            }
        }
    }, [backgroundMode, customVideoUrl, isBackgroundMuted, isMounted]);

    if (!isMounted) return <div className="fixed inset-0 bg-[#0B0F14]" />;

    return (
        <div className="fixed inset-0 z-0 w-full h-full overflow-hidden bg-black transition-colors duration-1000">
            <AnimatePresence>
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
                        <motion.video
                            ref={videoRef}
                            autoPlay
                            loop
                            muted={isBackgroundMuted}
                            playsInline
                            animate={shouldPan ? { x: ["-2%", "2%", "-2%"] } : {}}
                            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                            className={`h-full w-full object-cover opacity-70 filter brightness-[0.92] blur-[1px] transition-transform duration-500 ${shouldPan ? 'scale-110' : 'scale-100'}`}
                            onLoadedData={() => console.log('[BackgroundRenderer] Lofi video loaded')}
                            onError={(e) => console.error('[BackgroundRenderer] Lofi video error:', e)}
                        >
                            <source src="/lofi_videos/rain.webm" type="video/webm" />
                        </motion.video>
                    </motion.div>
                )}

                {backgroundMode === 'custom' && (
                    <motion.div
                        key={customVideoUrl ? `custom-${customVideoUrl}` : 'custom-empty'}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0 bg-black"
                    >
                        {customVideoUrl ? (
                            <motion.video
                                ref={videoRef}
                                autoPlay
                                loop
                                muted={isBackgroundMuted}
                                playsInline
                                animate={shouldPan ? { x: ["-2%", "2%", "-2%"] } : {}}
                                transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                                className={`h-full w-full object-cover opacity-70 filter brightness-[0.92] blur-[1px] transition-transform duration-500 ${shouldPan ? 'scale-110' : 'scale-100'}`}
                                onLoadedData={() => console.log('[BackgroundRenderer] Custom video loaded')}
                            >
                                <source src={customVideoUrl} />
                            </motion.video>
                        ) : (
                            <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center">
                                <div className="flex flex-col items-center gap-2">
                                    <p className="text-white/20 text-sm">No custom video uploaded</p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {backgroundMode === 'wallpaper' && (
                    <motion.div
                        key="wallpaper"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0 bg-black"
                    >
                        <Image
                            src="/wallpaper/photo-1485470733090-0aae1788d5af.avif"
                            alt="Background"
                            fill
                            sizes="100vw"
                            priority
                            unoptimized
                            className="h-full w-full object-cover opacity-80 filter brightness-[0.7]"
                            onLoad={() => console.log('[BackgroundRenderer] Wallpaper loaded')}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Global Overlay */}
            <div className="absolute inset-0 bg-black/10 pointer-events-none z-10" />
        </div>
    );
}

export const BackgroundRenderer = memo(BackgroundRendererImpl);
