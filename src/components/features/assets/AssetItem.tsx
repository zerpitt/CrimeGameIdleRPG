import React, { useMemo } from 'react';
import { useGameStore } from '../../../store/useGameStore';
import { ASSETS, FORMULAS } from '../../../lib/constants';
import { formatMoney, formatNumber } from '../../../lib/utils';
import { ArrowUp, Building2, Car, Users, Box, Landmark, Lock } from 'lucide-react';
import { useSound } from '../../../hooks/useSound';

interface AssetItemProps {
    assetId: string;
}

const ASSET_ICONS: Record<string, React.FC<any>> = {
    'street_crew': Users,
    'front_business': Building2,
    'supply_route': Car,
    'safehouse_network': Box,
    'money_laundering': Landmark,
};

export const AssetItem: React.FC<AssetItemProps> = ({ assetId }) => {
    const { assets, money, buyAsset } = useGameStore();
    const assetDef = ASSETS.find(a => a.id === assetId);
    const assetState = assets[assetId];
    const { playSuccess, playError } = useSound();

    if (!assetDef || !assetState) return null;

    const currentCost = FORMULAS.calculateAssetCost(assetDef.baseCost, assetState.level);
    const currentIncome = FORMULAS.calculateAssetIncome(assetDef.baseIncome, assetState.level);
    const nextIncome = FORMULAS.calculateAssetIncome(assetDef.baseIncome, assetState.level + 1);
    const incomeDiff = nextIncome - currentIncome;

    const canAfford = money >= currentCost;

    // Determine lock state: Previous tier must be owned or at least unlocked (level > 0).
    // Tier 1 is always unlocked.
    const prevTierId = assetDef.tier > 1 ? ASSETS.find(a => a.tier === assetDef.tier - 1)?.id : null;
    const isLocked = prevTierId ? (!assets[prevTierId]?.owned && assets[prevTierId]?.level === 0) : false;

    const handleBuy = () => {
        if (money >= currentCost && !isLocked) {
            buyAsset(assetDef.id);
            playSuccess();
        } else {
            playError();
        }
    };

    const Icon = ASSET_ICONS[assetId] || Building2;

    // Visual Progress Bar (Simulated based on level milestones like 25, 50, 100)
    // Just for visuals: "Efficiency"
    const progress = (assetState.level % 25) / 25 * 100;

    if (isLocked) {
        return (
            <div className="bg-surface/30 border border-white/5 rounded-xl p-4 flex items-center justify-between opacity-60 grayscale cursor-not-allowed">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-black/40 flex items-center justify-center">
                        <Lock className="text-gray-600" size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-500">???</h3>
                        <div className="text-xs text-gray-600">ต้องปลดล็อคธุรกิจก่อนหน้า</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-surface border border-white/5 rounded-xl p-4 transition-all hover:border-white/20 relative overflow-hidden group">
            {/* Background Glow for high levels */}
            {assetState.level >= 50 && (
                <div className="absolute top-0 right-0 p-10 bg-money/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            )}

            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg
                        ${assetState.level > 0 ? 'bg-gradient-to-br from-gray-700 to-black text-money border border-white/10' : 'bg-black/40 text-gray-600'}
                    `}>
                        <Icon size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-base text-gray-100 flex items-center gap-2">
                            {assetDef.name}
                            <span className="text-[10px] bg-white/10 px-1.5 rounded text-gray-400 font-mono">
                                Lv.{assetState.level}
                            </span>
                        </h3>
                        <div className="text-xs text-gray-400">{assetDef.description}</div>
                    </div>
                </div>
            </div>

            <div className="flex items-end justify-between gap-4">
                <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1">รายได้ต่อวินาที</div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-lg font-black text-money tracking-tight">
                            ${formatNumber(currentIncome)}
                        </span>
                        {canAfford && (
                            <span className="text-[10px] text-green-400 animate-pulse">
                                +${formatNumber(incomeDiff)}
                            </span>
                        )}
                    </div>
                    {/* Progress Bar Visual (Level progress) */}
                    <div className="w-full h-1 bg-black/40 rounded-full mt-2 overflow-hidden">
                        <div
                            className="h-full bg-money/50 transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <button
                    onClick={handleBuy}
                    disabled={!canAfford}
                    className={`
                        relative px-4 py-2 rounded-xl font-bold text-xs flex flex-col items-center min-w-[100px] transition-all
                        ${canAfford
                            ? 'bg-money text-black hover:brightness-110 active:scale-95 shadow-lg shadow-green-900/20'
                            : 'bg-white/5 text-gray-500 cursor-not-allowed shadow-none'}
                    `}
                >
                    <span className="uppercase tracking-wider text-[9px] opacity-80 mb-0.5">
                        {assetState.level === 0 ? 'ซื้อธุรกิจ' : 'อัปเกรด'}
                    </span>
                    <span className="font-black text-sm">
                        ${formatNumber(currentCost)}
                    </span>
                </button>
            </div>
        </div>
    );
};
