'use client';

import { useState, useEffect } from 'react';

export function StatusHeader() {
    const [time, setTime] = useState('');

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <header className="fixed top-0 inset-x-0 h-7 z-[70] flex items-center justify-center bg-black/20 backdrop-blur-md border-b border-white/5 text-[10px] sm:text-xs font-medium uppercase tracking-widest text-white/50 select-none pointer-events-none shadow-sm">
            <div>{time}</div>
        </header>
    );
}
