import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../../store/useGameStore';
import { formatMoney } from '../../../lib/utils';
import { ShoppingBag, Package, Plus, RefreshCw, Sparkles, Clock } from 'lucide-react';
import { generateLoot } from '../../../lib/generators';
import { Rarity, GearSlot, ITEM_PRICES } from '../../../lib/constants';

export const Market = () => {
    const { money, buyItem, expandInventory, maxInventorySize, subtractMoney, addToInventory, marketItems, marketRefreshTime, buyMarketItem, refreshMarket } = useGameStore();

    // Timer Logic
    const [timeLeft, setTimeLeft] = useState<string>('');

    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            if (marketRefreshTime > now) {
                const diff = marketRefreshTime - now;
                const minutes = Math.floor(diff / 60000);
                const seconds = Math.floor((diff % 60000) / 1000);
                setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
            } else {
                setTimeLeft('กำลังเติมของ...');
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [marketRefreshTime]);

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
                    <ShoppingBag className="text-purple-500" /> ตลาดมืด
                </h2>
                <p className="text-gray-400 text-xs">สินค้าเถื่อนและของผิดกฎหมาย</p>
            </div>

            {/* Special Offers (Black Market) */}
            <div className="space-y-3">
                <div className="flex justify-between items-end border-b border-white/5 pb-1">
                    <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">สินค้าพิเศษ</h3>
                    <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1 text-gray-400">
                            <Clock size={12} />
                            <span>{timeLeft}</span>
                        </div>
                        <button
                            onClick={() => refreshMarket(true)}
                            disabled={money < 5000}
                            className={`flex items-center gap-1 font-bold ${money >= 5000 ? 'text-money hover:text-white' : 'text-gray-600'}`}
                        >
                            <RefreshCw size={12} />
                            รีเฟรช ($5k)
                        </button>
                    </div>
                </div>

                <div className="grid gap-3">
                    {marketItems.length === 0 && (
                        <div className="text-center py-8 text-gray-500 text-xs bg-surface/50 rounded-xl border border-white/5 border-dashed">
                            รอสินค้าล็อตใหม่...
                        </div>
                    )}
                    {marketItems.map((item) => {
                        const cost = ITEM_PRICES[item.rarity] || 500;
                        return (
                            <div key={item.id} className="bg-surface border border-white/5 p-3 rounded-xl flex items-center justify-between group hover:border-white/20 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-white/5 to-transparent flex items-center justify-center border border-white/10
                                    ${item.rarity === Rarity.RARE ? 'border-blue-500/30' : ''}
                                    ${item.rarity === Rarity.EPIC ? 'border-purple-500/30' : ''}
                                `}>
                                        <ShoppingBag size={18} className="text-gray-400" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-gray-200">{item.name}</div>
                                        <div className="text-[10px] text-gray-500 flex gap-2">
                                            <span>{item.rarity}</span>
                                            <span className="text-white/20">•</span>
                                            <span>{item.slot}</span>
                                        </div>
                                        {/* Show Effect summary if possible */}
                                        <div className="text-[9px] text-money/70 mt-0.5">
                                            {item.effects.crimeSuccess && `+${(item.effects.crimeSuccess * 100).toFixed(1)}% สำเร็จ `}
                                            {item.effects.heatReduction && `-${item.effects.heatReduction} Heat `}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => buyMarketItem(item)}
                                    disabled={money < cost}
                                    className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-bold flex flex-col items-end min-w-[80px]"
                                >
                                    <span className={money >= cost ? 'text-money' : 'text-risk'}>{formatMoney(cost)}</span>
                                    <span className="text-[9px] text-gray-500 font-normal">ซื้อเลย</span>
                                </button>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Loot Boxes (Monetization MVP) */}
            <div className="space-y-3">
                <h3 className="text-sm font-bold text-gold uppercase tracking-wider border-b border-white/5 pb-1 flex items-center gap-2">
                    <Sparkles size={14} /> กล่องสุ่มสินค้า
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
                            <div className="font-bold text-sm">กล่องพื้นฐาน</div>
                            <div className="text-[10px] text-gray-500">ของใช้ทั่วไป</div>
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
                            <div className="font-bold text-sm text-gold">กล่องระดับสูง</div>
                            <div className="text-[10px] text-gold/60">โอกาสได้ของหายาก</div>
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
                        <div className="font-bold text-sm">ขยายช่องเก็บของ</div>
                        <div className="text-[10px] text-gray-500">
                            ขนาดปัจจุบัน: {maxInventorySize} <span className="text-money font-bold">+{5}</span>
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
