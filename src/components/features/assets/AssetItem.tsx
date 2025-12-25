import React from 'react';
import { useGameStore } from '../../../store/useGameStore';
import { ASSETS, FORMULAS } from '../../../lib/constants';
import { formatMoney, formatNumber } from '../../../lib/utils';
import { ArrowUp, Lock } from 'lucide-react';

interface AssetItemProps {
    assetId: string;
}

export const AssetItem: React.FC<AssetItemProps> = ({ assetId }) => {
    const { assets, money, buyAsset } = useGameStore();
    const assetDef = ASSETS.find(a => a.id === assetId);
    const assetState = assets[assetId];

    if (!assetDef || !assetState) return null;

    const currentCost = FORMULAS.calculateAssetCost(assetDef.baseCost, assetState.level);
    const currentIncome = FORMULAS.calculateAssetIncome(assetDef.baseIncome, assetState.level);
    const nextIncome = FORMULAS.calculateAssetIncome(assetDef.baseIncome, assetState.level + 1);
    const incomeDiff = nextIncome - currentIncome;

    const canAfford = money >= currentCost;
    const isLocked = assetDef.tier > 1 && !assets[ASSETS[assetDef.tier - 2].id]?.owned && !assetState.owned; // Simple lock rule: must own previous tier? Or just cost? Spec doesn't strictly say, but standard idle usually locks by cost or previous. Let's stick to visibility for now, or minimal locking.
    // User spec: "Asset Tiers". Usually implies unlocking. Let's simplified unlock: Show all but greyed out if too expensive, or just show cost.

    return (
        <div className="bg-surface/50 border border-white/5 rounded-xl p-4 flex items-center justify-between group hover:border-white/10 transition-all">
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-200">{assetDef.name}</h3>
                    <span className="text-xs bg-void px-2 py-0.5 rounded text-gray-500">Lv {assetState.level}</span>
                </div>
                <div className="text-sm text-money/80">
                    +{formatMoney(currentIncome)}/วินาที
                    {assetState.level > 0 && <span className="text-xs text-money/50 ml-1">(+{formatMoney(incomeDiff)})</span>}
                </div>
            </div>

            <button
                onClick={() => buyAsset(assetId)}
                disabled={!canAfford}
                className={`
          relative overflow-hidden px-4 py-2 rounded-lg font-bold text-sm flex flex-col items-end min-w-[100px] transition-all
          ${canAfford
                        ? 'bg-money text-void hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(30,215,96,0.3)]'
                        : 'bg-white/5 text-gray-500 cursor-not-allowed'
                    }
        `}
            >
                <div className="flex items-center gap-1">
                    <span>ซื้อ</span>
                    <ArrowUp size={14} />
                </div>
                <span className="text-xs opacity-90">{formatNumber(currentCost)}</span>
            </button>
        </div>
    );
};
