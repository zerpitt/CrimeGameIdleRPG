import React from 'react';
import { useGameStore } from '../../../store/useGameStore';
import { UPGRADES, FORMULAS } from '../../../lib/constants';
import { formatMoney } from '../../../lib/utils';
import { Dna, Zap, Briefcase, Clover } from 'lucide-react';

const ICONS: Record<string, React.ElementType> = {
    smooth_talker: Dna,
    connections: Briefcase,
    deep_pockets: Zap,
    lucky_charm: Clover
};

export const TechTree = () => {
    const { upgrades, money, buyUpgrade } = useGameStore();

    return (
        <div className="space-y-4 pb-20">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">วิจัยและพัฒนา</h2>
                <p className="text-gray-400 text-xs">ยกระดับอาณาจักรอาชญากรรม</p>
            </div>

            <div className="grid gap-3">
                {UPGRADES.map((upgrade) => {
                    const level = upgrades[upgrade.id] || 0;
                    const cost = FORMULAS.calculateTechCost(upgrade.baseCost, level);
                    const canAfford = money >= cost;
                    const Icon = ICONS[upgrade.id] || Dna;

                    return (
                        <div key={upgrade.id} className="bg-surface border border-white/5 p-4 rounded-2xl relative overflow-hidden group">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex gap-3 items-center">
                                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                                        <Icon size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-sm">{upgrade.name}</h3>
                                        <p className="text-[10px] text-gray-500">ระดับ {level}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => buyUpgrade(upgrade.id)}
                                    disabled={!canAfford}
                                    className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${canAfford
                                            ? 'bg-money text-black hover:brightness-110 active:scale-95'
                                            : 'bg-white/5 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    ${formatMoney(cost)}
                                </button>
                            </div>

                            <div className="pl-[52px]">
                                <p className="text-xs text-gray-400 mb-1">{upgrade.description}</p>
                                <p className="text-[10px] text-money font-mono">
                                    {upgrade.effectDescription(level + 1)} (ถัดไป)
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
