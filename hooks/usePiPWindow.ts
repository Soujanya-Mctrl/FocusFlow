import { useCallback, useState } from 'react';

type DocumentPictureInPictureAPI = {
    requestWindow: (options: { width: number; height: number }) => Promise<Window>;
};

export function usePiPWindow() {
    const [pipWindow, setPipWindow] = useState<Window | null>(null);

    const closePiP = useCallback(() => {
        if (pipWindow) {
            pipWindow.close();
            setPipWindow(null);
        }
    }, [pipWindow]);

    const requestPiP = useCallback(async (width = 400, height = 300) => {
        // Double-check availability logic here too, though UI should handle hiding button
        if (!('documentPictureInPicture' in window)) {
            console.warn("Document Picture-in-Picture API not supported.");
            return;
        }

        try {
            // Check if one is already open
            if (pipWindow) {
                // Option: Focus it? Or close and reopen?
                // Let's focus it.
                // NOTE: window.focus() might vary in effectiveness
                return;
            }

            const pipApi = (window as Window & { documentPictureInPicture?: DocumentPictureInPictureAPI }).documentPictureInPicture;
            if (!pipApi) return;

            const win = await pipApi.requestWindow({
                width,
                height,
            });

            // Isolate the state setter
            setPipWindow(win);

            // Copy styles!
            // This is CRITICAL for Tailwind and Font styles to work in the new window.
            [...document.styleSheets].forEach((styleSheet) => {
                try {
                    const cssRules = [...styleSheet.cssRules]
                        .map((rule) => rule.cssText)
                        .join('');
                    const style = document.createElement('style');
                    style.textContent = cssRules;
                    win.document.head.appendChild(style);
                } catch {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.type = styleSheet.type;
                    link.media = styleSheet.media.mediaText;
                    link.href = styleSheet.href!;
                    win.document.head.appendChild(link);
                }
            });

            // Listen for close event
            win.addEventListener('pagehide', () => {
                setPipWindow(null);
            });

        } catch (err) {
            console.error("Failed to open PiP window:", err);
        }
    }, [pipWindow]);

    return {
        pipWindow,
        requestPiP,
        closePiP
    };
}
