import React, { useMemo } from 'react';

interface StockGraphProps {
    data: number[];
    width?: number;
    height?: number;
    basePrice?: number;
    color?: string;
    className?: string;
}

export const StockGraph: React.FC<StockGraphProps> = ({
    data,
    width = 200,
    height = 50,
    basePrice,
    color = '#1ED760',
    className = ''
}) => {
    // 1. Calculate Min/Max for Scaling
    const points = useMemo(() => {
        if (!data || data.length < 2) return '';

        const min = Math.min(...data, basePrice || Infinity);
        const max = Math.max(...data, basePrice || -Infinity);

        // Add some padding to avoid clipping
        const padding = (max - min) * 0.1;
        const effectiveMin = min - padding;
        const effectiveMax = max + padding;
        const range = effectiveMax - effectiveMin;

        if (range === 0) return `0,${height / 2} ${width},${height / 2}`;

        return data.map((val, index) => {
            const x = (index / (data.length - 1)) * width;
            // Invert Y because SVG 0 is top
            const y = height - ((val - effectiveMin) / range) * height;
            return `${x},${y}`;
        }).join(' ');
    }, [data, width, height, basePrice]);

    // Calculate Base Price Line Y position
    const baseLineY = useMemo(() => {
        if (!basePrice || !data.length) return null;
        const min = Math.min(...data, basePrice);
        const max = Math.max(...data, basePrice);
        const padding = (max - min) * 0.1;
        const effectiveMin = min - padding;
        const effectiveMax = max + padding;
        const range = effectiveMax - effectiveMin;

        if (range === 0) return height / 2;

        return height - ((basePrice - effectiveMin) / range) * height;
    }, [basePrice, data, height]);

    return (
        <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            className={`overflow-visible ${className}`}
        >
            {/* Filter for Glow Effect */}
            <defs>
                <filter id={`glow-${color}`} x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Base Price Reference Line (Dashed) */}
            {baseLineY !== null && (
                <line
                    x1="0"
                    y1={baseLineY}
                    x2={width}
                    y2={baseLineY}
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                />
            )}

            {/* The Graph Line */}
            <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="2"
                filter={`url(#glow-${color})`}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};
