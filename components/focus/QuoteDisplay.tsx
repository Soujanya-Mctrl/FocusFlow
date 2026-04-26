'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTimerStore } from '@/store/useTimerStore';

interface Quote {
    quote: string;
    author: string;
    category: string;
}

export function QuoteDisplay() {
    const { mode } = useTimerStore();
    const [quote, setQuote] = useState<Quote | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchQuote = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/quotes');

            const data = await response.json();
            if (data && data[0]) {
                setQuote({
                    quote: data[0].quote,
                    author: data[0].author,
                    category: data[0].category
                });
            }
        } catch (error) {
            console.error('Failed to fetch quote:', error);
            setQuote({
                quote: "The only way to do great work is to love what you do.",
                author: "Steve Jobs",
                category: "Motivation"
            });
        } finally {
            setLoading(false);
        }
    };

    // Effect to fetch quote when entering a session mode and periodically update
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (mode !== 'idle') {
            fetchQuote();
            // Refresh quote every 60 seconds to keep it dynamic but stay within API limits
            interval = setInterval(fetchQuote, 60000);
        } else {
            setQuote(null); // Clear quote when idle
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [mode]);

    return (
        <div className="relative z-50 max-w-4xl mx-auto text-center px-8">
            <AnimatePresence mode="wait">
                {mode !== 'idle' && quote && !loading ? (
                    <motion.div
                        key={quote.quote}
                        initial={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            filter: "blur(0px)",
                            y: [0, -5, 0] // Subtle floating
                        }}
                        exit={{ opacity: 0, scale: 1.02, filter: "blur(10px)" }}
                        transition={{
                            duration: 1.2,
                            ease: "easeOut",
                            y: {
                                duration: 6,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }
                        }}
                        className="flex flex-col gap-4"
                    >
                        <p className="text-sm sm:text-lg font-light text-white/40 leading-relaxed tracking-tight select-none">
                            &ldquo;{quote.quote}&rdquo;
                        </p>
                        <div className="flex items-center justify-center gap-3">
                            <div className="h-px w-4 bg-white/10" />
                            <p className="text-[10px] font-bold tracking-[0.3em] text-white/20 uppercase">
                                {quote.author}
                            </p>
                            <div className="h-px w-4 bg-white/10" />
                        </div>
                    </motion.div>
                ) : mode !== 'idle' && loading ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.1 }}
                        className="h-24 flex items-center justify-center"
                    >
                        <div className="w-8 h-[1px] bg-white animate-pulse" />
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
}
