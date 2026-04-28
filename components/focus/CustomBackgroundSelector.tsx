'use client';

import { useState, useRef, useEffect } from 'react';
import { useTimerStore } from '@/store/useTimerStore';
import { saveCustomVideo, getCustomVideo, clearCustomVideo } from '@/lib/storage';
import { Upload, X, Check, Film, Loader2, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function CustomBackgroundSelector() {
    const { backgroundMode, setBackgroundMode, isBackgroundMuted, setIsBackgroundMuted } = useTimerStore();
    const [isUploading, setIsUploading] = useState(false);
    const [hasCustomVideo, setHasCustomVideo] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const checkExisting = async () => {
            const video = await getCustomVideo();
            if (video) {
                setHasCustomVideo(true);
                setFileName(video.name);
            }
        };
        checkExisting();
    }, []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check if it's a video
        if (!file.type.startsWith('video/')) {
            alert('Please select a valid video file.');
            return;
        }

        // Limit size to 250MB for better stability
        if (file.size > 250 * 1024 * 1024) {
            alert('File is too large. Please select a video under 250MB.');
            return;
        }

        console.log(`Starting local upload for ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
        setIsUploading(true);
        try {
            await saveCustomVideo(file);
            console.log('Video saved to IndexedDB successfully');
            setHasCustomVideo(true);
            setFileName(file.name);
            setBackgroundMode('custom');
            alert('Video saved successfully! You are now using your custom background.');
        } catch (err) {
            console.error('Upload failed', err);
            alert('Failed to save video locally. Your browser might be out of storage space.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemove = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to remove your custom background?')) {
            await clearCustomVideo();
            setHasCustomVideo(false);
            setFileName(null);
            if (backgroundMode === 'custom') {
                setBackgroundMode('gradient');
            }
        }
    };

    return (
        <div className="flex flex-col gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Film className="w-4 h-4 text-white/40" />
                    <h3 className="text-sm font-medium text-white/80">Custom Background</h3>
                </div>
                <div className="flex items-center gap-2">
                    {hasCustomVideo && backgroundMode === 'custom' && (
                        <button
                            onClick={() => setIsBackgroundMuted(!isBackgroundMuted)}
                            className={`p-1.5 rounded-full transition-all ${!isBackgroundMuted ? 'bg-accent/20 text-accent' : 'hover:bg-white/10 text-white/40'}`}
                            title={isBackgroundMuted ? "Unmute background" : "Mute background"}
                        >
                            {isBackgroundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                    )}
                    {hasCustomVideo && (
                        <button
                            onClick={handleRemove}
                            className="p-1 hover:bg-white/10 rounded-full transition-colors group"
                            title="Remove custom background"
                        >
                            <X className="w-4 h-4 text-white/20 group-hover:text-red-400" />
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {hasCustomVideo ? (
                    <button
                        onClick={() => setBackgroundMode('custom')}
                        className={`relative flex items-center justify-between p-3 rounded-xl border transition-all ${
                            backgroundMode === 'custom'
                                ? 'bg-accent/10 border-accent/40 ring-1 ring-accent/20'
                                : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                    >
                        <div className="flex flex-col items-start overflow-hidden">
                            <span className="text-xs font-medium text-white/90">Custom Video</span>
                            <span className="text-[10px] text-white/40 truncate w-full max-w-[150px]">
                                {fileName || 'local-video.mp4'}
                            </span>
                        </div>
                        {backgroundMode === 'custom' && (
                            <Check className="w-4 h-4 text-accent" />
                        )}
                    </button>
                ) : null}

                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-white/10 hover:border-white/20 rounded-xl transition-all group"
                >
                    {isUploading ? (
                        <Loader2 className="w-5 h-5 text-white/40 animate-spin" />
                    ) : (
                        <Upload className="w-5 h-5 text-white/40 group-hover:text-white/60 group-hover:scale-110 transition-all" />
                    )}
                    <span className="text-xs font-medium text-white/40 group-hover:text-white/60">
                        {isUploading ? 'Saving locally...' : hasCustomVideo ? 'Change Video' : 'Upload Video'}
                    </span>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </button>
            </div>

            <p className="text-[9px] text-white/20 italic">
                * Video is stored locally in your browser. It never leaves your device.
            </p>
        </div>
    );
}
