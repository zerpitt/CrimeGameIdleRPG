import React, { useState } from 'react';
import { useGameStore } from '../../../../store/useGameStore';
import { CRIMES, FORMULAS } from '../../../../lib/constants';
import { formatMoney } from '../../../../lib/utils';
import { Skull, AlertTriangle, Crosshair, CheckCircle2, XCircle } from 'lucide-react';

interface CrimeItemProps {
    crimeId: string;
}

export const CrimeItem: React.FC<CrimeItemProps> = ({ crimeId }) => {
    const { performCrime, actionPoints, power, luck, heat, incomePerSecond } = useGameStore();
    const crime = CRIMES.find(c => c.id === crimeId);
    const [lastResult, setLastResult] = useState<'success' | 'fail' | null>(null);

    if (!crime) return null;

    const successChance = FORMULAS.calculateCrimeSuccess(crime.baseSuccessChance, power, luck, heat);
    const successPercent = (successChance * 100).toFixed(0);

    // Estimate Reward for display
    const baseIncomeRef = Math.max(10, incomePerSecond);
    const estimatedReward = baseIncomeRef * crime.riskMultiplier;

    const handleCrime = () => {
        const success = performCrime(crimeId);
        setLastResult(success ? 'success' : 'fail');

        // Clear status after animation
        setTimeout(() => setLastResult(null), 1000);
    };

    const isAffordable = actionPoints >= crime.actionCost;

    // Color coding for risk
    let riskColor = 'text-green-500';
    if (successChance < 0.5) riskColor = 'text-red-500';
    else if (successChance < 0.8) riskColor = 'text-yellow-500';

    return (
        <div className="relative overflow-hidden bg-surface/50 border border-white/5 rounded-xl p-4 group hover:border-risk/30 transition-all">
            {/* Background Pulse on result */}
            {lastResult === 'success' && <div className="absolute inset-0 bg-money/10 animate-pulse pointer-events-none" />}
            {lastResult === 'fail' && <div className="absolute inset-0 bg-risk/10 animate-pulse pointer-events-none" />}

            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${lastResult === 'fail' ? 'bg-risk/20 text-risk' : 'bg-white/5 text-gray-300'}`}>
                        <Skull size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-200">{crime.name}</h3>
                        <div className="flex items-center gap-2 text-xs">
                            <span className="flex items-center gap-1 text-sky-400">
                                <Crosshair size={12} />
                                Chance: <span className={riskColor}>{successPercent}%</span>
                            </span>
                            <span className="text-gray-600">|</span>
                            <span className="flex items-center gap-1 text-risk">
                                <AlertTriangle size={12} />
                                Heat: +{crime.minHeat}-{crime.maxHeat}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between mt-3">
                <div className="text-sm font-mono text-money">
                    ~{formatMoney(estimatedReward)}
                </div>

                <button
                    onClick={handleCrime}
                    disabled={!isAffordable}
                    className={`
                px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all
                ${isAffordable
                            ? 'bg-gradient-to-r from-red-900 to-red-600 text-white hover:brightness-110 active:scale-95 shadow-lg shadow-red-900/20'
                            : 'bg-white/5 text-gray-600 cursor-not-allowed'
                        }
            `}
                >
                    {lastResult === 'success' ? <CheckCircle2 size={16} /> :
                        lastResult === 'fail' ? <XCircle size={16} /> :
                            <span className="text-xs">COST: {crime.actionCost} AP</span>}

                    <span>{lastResult ? (lastResult === 'success' ? 'SUCCESS' : 'BAILED') : 'EXECUTE'}</span>
                </button>
            </div>
        </div>
    );
};
