import React, { useState } from 'react';
import { useGameStore } from '../../../../store/useGameStore';
import { FORMULAS } from '../../../../lib/constants';
import { formatMoney, formatNumber } from '../../../../lib/utils';
import { Trophy, Share2, Crown, Zap, Clock, Dna, AlertOctagon, RotateCcw } from 'lucide-react';
import { Inventory } from '../inventory/Inventory';

export const Profile = () => {
    const {
        netWorth,
        prestigeMultiplier,
        power,
        speed,
        luck,
        prestige,
        resetGame,
        startTime
    } = useGameStore();

    const [showResetConfirm, setShowResetConfirm] = useState(false);

    // Calculate Potential Prestige
    const potentialMultiplier = FORMULAS.calculatePrestigeMultiplier(netWorth);
    const multiplierGain = potentialMultiplier - prestigeMultiplier;
    const canPrestige = netWorth >= 1000 && multiplierGain > 0.01;

    // Stat Effects (For display)
    const powerEffect = (Math.pow(power, 1.2) - 1) * 100; // Rough display
    const crimeSuccessBonus = (power * 0.4);
    const luckDropBonus = (luck * 0.5);

    return (
        <div className="space-y-6 pb-24 px-1">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                    BOSS PROFILE
                </h2>
                <span className="text-xs text-gray-600 font-mono">ID: X9-001</span>
            </div>

            {/* Net Worth Card */}
            <div className="bg-gradient-to-br from-surface to-[#1a1f2e] border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Crown size={80} />
                </div>
                <div className="relative z-10">
                    <span className="text-gray-400 text-sm font-medium tracking-wider uppercase">Legacy Net Worth</span>
                    <div className="text-3xl font-black text-white mt-1 mb-2 tracking-tight">
                        {formatMoney(netWorth)}
                    </div>
                    <div className="inline-flex items-center gap-2 bg-black/30 px-3 py-1 rounded-full border border-white/5">
                        <Trophy size={12} className="text-gold" />
                        <span className="text-xs text-gold font-bold">Multiplier: x{prestigeMultiplier.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-surface/50 border border-white/5 rounded-xl p-3 flex flex-col items-center gap-2 text-center">
                    <div className="p-2 bg-red-500/10 text-red-500 rounded-lg">
                        <Zap size={20} />
                    </div>
                    <div>
                        <div className="text-xl font-bold">{power}</div>
                        <div className="text-[10px] text-gray-500 uppercase font-bold">Power</div>
                    </div>
                </div>
                <div className="bg-surface/50 border border-white/5 rounded-xl p-3 flex flex-col items-center gap-2 text-center">
                    <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                        <Clock size={20} />
                    </div>
                    <div>
                        <div className="text-xl font-bold">{speed}</div>
                        <div className="text-[10px] text-gray-500 uppercase font-bold">Speed</div>
                    </div>
                </div>
                <div className="bg-surface/50 border border-white/5 rounded-xl p-3 flex flex-col items-center gap-2 text-center">
                    <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg">
                        <Dna size={20} />
                    </div>
                    <div>
                        <div className="text-xl font-bold">{luck}</div>
                        <div className="text-[10px] text-gray-500 uppercase font-bold">Luck</div>
                    </div>
                </div>
            </div>

            {/* Stat Details */}
            <div className="bg-surface/30 rounded-xl p-4 space-y-2 text-xs text-gray-400">
                <div className="flex justify-between">
                    <span>Crime Success Rate</span>
                    <span className="text-gray-200">+{crimeSuccessBonus.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                    <span>Loot Rarity Chance</span>
                    <span className="text-gray-200">+{luckDropBonus.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                    <span>Active Time</span>
                    <span className="text-gray-200">{((Date.now() - startTime) / 3600000).toFixed(1)}h</span>
                </div>
            </div>

            {/* Prestige Section */}
            <div className="border-t border-white/10 pt-6">
                <h3 className="text-lg font-bold text-gold mb-2 flex items-center gap-2">
                    <RotateCcw size={18} />
                    Prestige Reset
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                    Reset your empire to gain permanent multiplier based on your Net Worth.
                    You will lose Money and Assets. You keep Stats.
                </p>

                <div className="bg-black/40 rounded-xl p-4 border border-gold/10 mb-4">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-400 text-sm">Current Multiplier</span>
                        <span className="text-white font-bold">x{prestigeMultiplier.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-gold">
                        <span className="text-sm font-bold">After Reset</span>
                        <span className="font-black text-lg">x{potentialMultiplier.toFixed(3)}</span>
                    </div>
                    <div className="text-right text-xs text-green-400 mt-1">
                        (+{(multiplierGain).toFixed(3)})
                    </div>
                </div>

                {!showResetConfirm ? (
                    <button
                        onClick={() => setShowResetConfirm(true)}
                        disabled={!canPrestige}
                        className={`w-full py-3 rounded-lg font-bold text-sm tracking-wide transition-all
                            ${canPrestige
                                ? 'bg-gold text-black hover:brightness-110 shadow-lg shadow-yellow-900/20'
                                : 'bg-white/5 text-gray-600 cursor-not-allowed'
                            }
                        `}
                    >
                        {canPrestige ? 'PRESTIGE RESET' : 'NET WORTH TOO LOW'}
                    </button>
                ) : (
                    <div className="space-y-2 animate-in fade-in duration-200">
                        <div className="text-center text-risk text-sm font-bold mb-2">ARE YOU SURE?</div>
                        <button
                            onClick={() => { prestige(); setShowResetConfirm(false); }}
                            className="w-full py-3 rounded-lg font-bold text-sm bg-risk text-white hover:bg-red-600"
                        >
                            CONFIRM RESET
                        </button>
                        <button
                            onClick={() => setShowResetConfirm(false)}
                            className="w-full py-3 rounded-lg font-bold text-sm bg-white/5 text-gray-400 hover:bg-white/10"
                        >
                            CANCEL
                        </button>
                    </div>
                )}
            </div>

            <div className="mt-8 border-t border-white/10 pt-6">
                <Inventory />
            </div>

            <div className="text-center pt-8 opacity-20 hover:opacity-100 transition-opacity">
                <button onClick={resetGame} className="text-[10px] text-red-500 underline">
                    Hard Reset Save Data
                </button>
            </div>
        </div>
    );
};
