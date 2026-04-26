// Simple synthesized sounds to avoid external asset dependencies
const getContext = () => {
    const AudioContextCtor =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextCtor) return null;
    return new AudioContextCtor();
};

let audioCtx: AudioContext | null = null;

const createOscillator = (ctx: AudioContext, type: OscillatorType, freq: number, startTime: number, duration: number, gainVal = 0.1) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(gainVal, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
};

export const SOUNDS = {
    START: 'start',
    PAUSE: 'pause',
    COMPLETE: 'complete',
    TICK: 'tick'
};

export function playSound(type: string) {
    if (typeof window === 'undefined') return;

    if (!audioCtx) {
        audioCtx = getContext();
        if (!audioCtx) return;
    }

    // Resume context if suspended (browser requirement)
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    switch (type) {
        case SOUNDS.START:
            // Ascending major third (C5 -> E5) - "Active/Positive"
            createOscillator(audioCtx, 'sine', 523.25, now, 0.4, 0.15); // C5
            createOscillator(audioCtx, 'sine', 659.25, now + 0.1, 0.6, 0.15); // E5
            createOscillator(audioCtx, 'triangle', 523.25, now, 0.4, 0.05); // Texture
            break;

        case SOUNDS.PAUSE:
            // Descending minor interval - "Relax/Hold"
            createOscillator(audioCtx, 'sine', 659.25, now, 0.3, 0.1);
            createOscillator(audioCtx, 'sine', 523.25, now + 0.15, 0.4, 0.1);
            break;

        case SOUNDS.COMPLETE:
            // Success Chord (C Major: C5 - E5 - G5 - C6) with sparkle
            const spacing = 0.08;
            createOscillator(audioCtx, 'sine', 523.25, now, 1.2, 0.1); // C5
            createOscillator(audioCtx, 'sine', 659.25, now + spacing, 1.2, 0.1); // E5
            createOscillator(audioCtx, 'sine', 783.99, now + spacing * 2, 1.2, 0.1); // G5
            createOscillator(audioCtx, 'sine', 1046.50, now + spacing * 3, 1.5, 0.08); // C6

            // Subtle high shimmering
            createOscillator(audioCtx, 'triangle', 2000, now + spacing * 2, 0.5, 0.02);
            break;

        case SOUNDS.TICK:
            // Extremely short click
            createOscillator(audioCtx, 'square', 800, now, 0.03, 0.02);
            break;
    }
}
