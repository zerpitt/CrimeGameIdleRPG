import { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { formatMoney } from '../../lib/utils';
import { Zap, Volume2, VolumeX, Plane } from 'lucide-react';
import { HeatGauge } from '../ui/HeatGauge';
import { useSound } from '../../hooks/useSound';
import { PrestigeModal } from '../features/prestige/PrestigeModal';

export const TopBar = () => {
    const { money, heat, actionPoints, incomePerSecond, soundEnabled, toggleSound } = useGameStore();
    const { playClick } = useSound();
    const [showPrestige, setShowPrestige] = useState(false);

    const handleToggleSound = () => {
        playClick(); // Play one last click if turning off, or first click if turning on
        toggleSound();
    };

    return (
        <>
            <div className="fixed top-0 left-0 right-0 bg-surface/95 backdrop-blur-xl border-b border-white/10 z-50 px-4 py-3 shadow-lg">
                <div className="max-w-md mx-auto flex items-center justify-between">

                    {/* Money Section */}
                    <div className="flex flex-col">
                        <span className="text-money font-black text-xl tracking-tight drop-shadow-sm">{formatMoney(money)}</span>
                        <span className="text-[10px] text-gray-400 font-medium">+{formatMoney(incomePerSecond)}/sec</span>
                    </div>

                    {/* Right Side Group */}
                    <div className="flex items-center gap-4">
                        {/* Prestige Button */}
                        <button
                            onClick={() => setShowPrestige(true)}
                            className="p-2 rounded-full text-gray-400 hover:text-risk transition-colors hover:bg-white/5"
                            title="Prestige / Reset"
                        >
                            <Plane size={16} />
                        </button>

                        {/* Sound Toggle */}
                        <button
                            onClick={handleToggleSound}
                            className={`p-2 rounded-full transition-colors ${soundEnabled ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-400'}`}
                        >
                            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                        </button>

                        {/* Energy */}
                        <div className="flex flex-col items-end">
                            <div className="flex items-center gap-1 text-gold">
                                <Zap size={14} fill="currentColor" />
                                <span className="font-bold text-sm">{Math.floor(actionPoints)}</span>
                            </div>
                            <span className="text-[8px] text-gray-500 font-bold tracking-widest">พลังงาน</span>
                        </div>

                        {/* Heat Custom Gauge */}
                        <HeatGauge heat={heat} />
                    </div>
                </div>
            </div>

            <PrestigeModal isOpen={showPrestige} onClose={() => setShowPrestige(false)} />
        </>
    );
};

