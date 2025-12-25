import React from 'react';
import { Skull, AlertTriangle } from 'lucide-react';

interface HeatGaugeProps {
    heat: number;
}

export const HeatGauge: React.FC<HeatGaugeProps> = ({ heat }) => {
    // Cap visual heat at 100 for the bar, but show real number
    const percentage = Math.min(100, Math.max(0, heat));

    // Color transition based on heat
    const getColor = () => {
        if (percentage < 30) return 'bg-blue-500';
        if (percentage < 60) return 'bg-yellow-500';
        if (percentage < 85) return 'bg-orange-500';
        return 'bg-risk animate-pulse';
    };

    const getTextColor = () => {
        if (percentage < 30) return 'text-blue-400';
        if (percentage < 60) return 'text-yellow-400';
        if (percentage < 85) return 'text-orange-400';
        return 'text-risk';
    };

    return (
        <div className="flex flex-col w-full max-w-[100px]">
            <div className="flex justify-between items-end mb-1">
                <div className={`flex items-center gap-1 ${getTextColor()}`}>
                    {percentage > 80 ? <AlertTriangle size={12} /> : <Skull size={12} />}
                    <span className="text-[10px] font-bold tracking-wider">HEAT</span>
                </div>
                <span className={`text-xs font-black ${getTextColor()}`}>{heat.toFixed(1)}%</span>
            </div>

            {/* Bar Container */}
            <div className="h-2 w-full bg-surface-light rounded-full overflow-hidden border border-white/5 relative">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:10px_10px]" />

                {/* Fill Bar */}
                <div
                    className={`h-full transition-all duration-500 ease-out ${getColor()}`}
                    style={{ width: `${percentage}%` }}
                >
                    {/* Shine effect on bar */}
                    <div className="absolute top-0 right-0 bottom-0 w-[5px] bg-white/30 blur-[2px]" />
                </div>
            </div>

            {/* Risk Status Text */}
            {percentage > 50 && (
                <div className="text-[8px] text-center mt-1 text-risk font-bold animate-pulse">
                    {percentage > 85 ? 'POLICE RAID IMMINENT' : 'HIGH SURVEILLANCE'}
                </div>
            )}
        </div>
    );
};
