import React, { useEffect, useState } from 'react';

interface FloatingTextProps {
    x: number;
    y: number;
    text: string;
    onComplete: () => void;
}

export const FloatingText: React.FC<FloatingTextProps> = ({ x, y, text, onComplete }) => {
    useEffect(() => {
        const timer = setTimeout(onComplete, 1000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div
            className="pointer-events-none fixed z-[100] text-money font-black text-xl animate-[float_1s_ease-out_forwards] drop-shadow-md"
            style={{ left: x, top: y }}
        >
            {text}
        </div>
    );
};

export const FloatingTextManager = () => {
    // This is a simplified manager. ideally use context or store.
    // For MVP, we might just handle click logic in App.tsx
    return null;
};
