import React, { useState } from 'react';
import { useGameStore } from '../../../store/useGameStore';
import { formatMoney } from '../../../lib/utils';
import { ShoppingBag, Package, Plus, AlertCircle, Sparkles } from 'lucide-react';
import { generateLoot } from '../../../lib/generators';
import { Rarity, GearSlot, MAX_HEAT, GAME_CONFIG } from '../../../lib/constants';

// Fixed Market Items (Black Market rotation could be here)
const BLACK_MARKET_ITEMS = [
    {
        id: 'pistol_common',
        name: 'Rusty Pistol',
        rarity: Rarity.COMMON,
        slot: GearSlot.WEAPON,
        effects: { crimeSuccess: 0.05 },
        cost: 500
    },
    {
        id: 'lockpick_set',
        name: 'Advanced Lockpicks',
        rarity: Rarity.UNCOMMON,
        slot: GearSlot.ACCESSORY,
        effects: { heatReduction: 0.1 },
        cost: 2500
    },
    {
        id: 'stealth_suit',
        name: 'Tactical Gear',
        rarity: Rarity.RARE,
        slot: GearSlot.OUTFIT,
        effects: { crimeSuccess: 0.15, heatReduction: 0.05 },
        cost: 15000
    }
];

export const Market = () => {
    const { money, buyItem, expandInventory, maxInventorySize, inventory, subtractMoney, addToInventory } = useGameStore();

    // Loot Box Logic
    const buyLootBox = (tier: 'BASIC' | 'ELITE') => {
        const cost = tier === 'BASIC' ? 1000 : 5000;
        if (money < cost) return;

        subtractMoney(cost);

        // Generate loot based on tier
        // Basic: mostly Common/Uncommon, Elite: Rare/Epic
        const luck = tier === 'BASIC' ? 1 : 5; // Fake luck boost
        const loot = generateLoot(tier === 'BASIC' ? 1 : 2, luck); // Simulate crime tier 1 or 2 loot

        if (loot) {
            addToInventory(loot);
            // In a real app, we'd show a reveal animation here
        }
    };

    const upgradeCost = maxInventorySize * 1000;

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 flex items-center justify-center gap-2">
                    <ShoppingBag className="text-purple-500" /> BLACK MARKET
                </h2>
                <p className="text-gray-400 text-xs">Illegal goods and contraband</p>
            </div>

            {/* Special Offers (Black Market) */}
            <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider border-b border-white/5 pb-1">Special Equipment</h3>
                <div className="grid gap-3">
                    {BLACK_MARKET_ITEMS.map((item) => (
                        <div key={item.id} className="bg-surface border border-white/5 p-3 rounded-xl flex items-center justify-between group hover:border-white/20 transition-all">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-white/5 to-transparent flex items-center justify-center border border-white/10
                                    ${item.rarity === Rarity.RARE ? 'border-blue-500/30' : ''}
                                `}>
                                    <ShoppingBag size={18} className="text-gray-400" />
                                </div>
                                <div>
                                    <div className="font-bold text-sm text-gray-200">{item.name}</div>
                                    <div className="text-[10px] text-gray-500 flex gap-2">
                                        <span>{item.rarity === Rarity.COMMON ? 'Common' : item.rarity === Rarity.RARE ? 'Rare' : 'Uncommon'}</span>
                                        <span className="text-white/20">•</span>
                                        <span>{item.slot}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => buyItem(item as any, item.cost)}
                                disabled={money < item.cost}
                                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-bold flex flex-col items-end min-w-[80px]"
                            >
                                <span className={money >= item.cost ? 'text-money' : 'text-risk'}>{formatMoney(item.cost)}</span>
                                <span className="text-[9px] text-gray-500 font-normal">BUY</span>
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Loot Boxes (Monetization MVP) */}
            <div className="space-y-3">
                <h3 className="text-sm font-bold text-gold uppercase tracking-wider border-b border-white/5 pb-1 flex items-center gap-2">
                    <Sparkles size={14} /> Supply Crates
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    {/* Basic Crate */}
                    <button
                        onClick={() => buyLootBox('BASIC')}
                        disabled={money < 1000}
                        className="relative overflow-hidden bg-surface border border-white/5 rounded-xl p-4 flex flex-col items-center gap-2 hover:border-money/30 transition-all group active:scale-95"
                    >
                        <div className="absolute inset-0 bg-money/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Package size={32} className="text-gray-400 group-hover:text-money transition-colors" />
                        <div className="text-center">
                            <div className="font-bold text-sm">Basic Crate</div>
                            <div className="text-[10px] text-gray-500">Common Goods</div>
                        </div>
                        <div className={`text-xs font-bold ${money >= 1000 ? 'text-money' : 'text-risk'}`}>
                            $1,000
                        </div>
                    </button>

                    {/* Elite Crate */}
                    <button
                        onClick={() => buyLootBox('ELITE')}
                        disabled={money < 5000}
                        className="relative overflow-hidden bg-surface border border-gold/10 rounded-xl p-4 flex flex-col items-center gap-2 hover:border-gold/50 transition-all group active:scale-95"
                    >
                        <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative">
                            <Package size={32} className="text-gold/70 group-hover:text-gold transition-colors" />
                            <Sparkles size={12} className="absolute -top-1 -right-1 text-gold animate-pulse" />
                        </div>
                        <div className="text-center">
                            <div className="font-bold text-sm text-gold">Elite Crate</div>
                            <div className="text-[10px] text-gold/60">Rare Gear High Chance</div>
                        </div>
                        <div className={`text-xs font-bold ${money >= 5000 ? 'text-money' : 'text-risk'}`}>
                            $5,000
                        </div>
                    </button>
                </div>
            </div>

            {/* Inventory Expansion */}
            <div className="bg-surface/50 rounded-xl p-4 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                        <Plus size={20} className="text-gray-400" />
                    </div>
                    <div>
                        <div className="font-bold text-sm">Expand Storage</div>
                        <div className="text-[10px] text-gray-500">
                            Size: {maxInventorySize} <span className="text-money font-bold">+{5}</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={expandInventory}
                    disabled={money < upgradeCost}
                    className="px-4 py-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-600/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs font-bold"
                >
                    {formatMoney(upgradeCost)}
                </button>
            </div>

        </div>
    );
};
