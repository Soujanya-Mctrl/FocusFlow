export const SOUNDS = {
    START: '/sounds/start.mp3',
    PAUSE: '/sounds/pause.mp3',
    COMPLETE: '/sounds/complete.mp3',
};

export function playSound(sound: string) {
    const audio = new Audio(sound);
    audio.volume = 0.5;
    audio.play().catch(e => console.error("Audio play failed", e));
}
