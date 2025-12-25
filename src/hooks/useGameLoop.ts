import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { GAME_CONFIG } from '../lib/constants';

export const useGameLoop = () => {
    const tick = useGameStore((state) => state.tick);
    const lastTimeRef = useRef<number>(Date.now());
    const animationFrameRef = useRef<number | null>(null);

    useEffect(() => {
        const loop = () => {
            const now = Date.now();
            const dt = now - lastTimeRef.current; // delta time in ms

            if (dt >= GAME_CONFIG.TICK_RATE) {
                tick(dt);
                lastTimeRef.current = now;
            }

            animationFrameRef.current = requestAnimationFrame(loop);
        };

        animationFrameRef.current = requestAnimationFrame(loop);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [tick]);
};
