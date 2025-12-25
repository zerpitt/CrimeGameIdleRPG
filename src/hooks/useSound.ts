import { useCallback, useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';

export const useSound = () => {
    const { soundEnabled } = useGameStore();
    const audioContextRef = useRef<AudioContext | null>(null);

    // Initialize AudioContext lazily
    const initAudio = useCallback(() => {
        if (!audioContextRef.current) {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            audioContextRef.current = new AudioContext();
        }
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
    }, []);

    const playTone = useCallback((freq: number, type: OscillatorType, duration: number, startTime = 0, vol = 0.1) => {
        if (!soundEnabled) return;
        initAudio();
        const ctx = audioContextRef.current;
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

        gain.gain.setValueAtTime(vol, ctx.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + startTime);
        osc.stop(ctx.currentTime + startTime + duration);
    }, [soundEnabled, initAudio]);

    const playClick = useCallback(() => {
        // High blip
        playTone(1200, 'sine', 0.05, 0, 0.05);
    }, [playTone]);

    const playError = useCallback(() => {
        // Low buzz
        playTone(150, 'sawtooth', 0.2, 0, 0.1);
        playTone(100, 'sawtooth', 0.2, 0.05, 0.1);
    }, [playTone]);

    const playSuccess = useCallback(() => {
        // Major rising arp
        playTone(440, 'square', 0.1, 0, 0.05); // A4
        playTone(554, 'square', 0.1, 0.08, 0.05); // C#5
        playTone(659, 'square', 0.2, 0.16, 0.05); // E5
    }, [playTone]);

    const playMoney = useCallback(() => {
        // Coin sparkle
        playTone(1200, 'sine', 0.1, 0, 0.05);
        playTone(1600, 'sine', 0.2, 0.05, 0.05);
    }, [playTone]);

    const playCyber = useCallback(() => {
        // Tech noise
        playTone(800, 'triangle', 0.05, 0, 0.05);
        playTone(2000, 'sine', 0.1, 0.02, 0.02);
    }, [playTone]);

    return { playClick, playError, playSuccess, playMoney, playCyber };
};
