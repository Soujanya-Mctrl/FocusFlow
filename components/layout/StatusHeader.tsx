'use client';

import { useState, useEffect } from 'react';

export function StatusHeader() {
    const [time, setTime] = useState('');

    useEffect(() => {
        // Initial set
        const updateTime = () => {
            const now = new Date();
            setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        };
        updateTime();

        // Update every minute (or second if we want seconds, but mins is cleaner)
        const interval = setInterval(updateTime, 1000 * 60);
        // Sync to minute boundary for cleaner updates?
        // For simplicity, just every second to catch the minute change quickly.
        const secondInterval = setInterval(updateTime, 1000);

        return () => clearInterval(secondInterval);
    }, []);

    return (
        <header className="fixed top-0 inset-x-0 h-7 z-[70] flex items-center justify-center bg-black/20 backdrop-blur-md border-b border-white/5 text-[10px] sm:text-xs font-medium uppercase tracking-widest text-white/50 select-none pointer-events-none shadow-sm">
            {/* Center Clock */}
            <div>
                {time}
            </div>
        </header>
    );
}
