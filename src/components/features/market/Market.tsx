import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../../store/useGameStore';
import { formatMoney } from '../../../lib/utils';
import { ShoppingBag, Package, Plus, RefreshCw, Sparkles, Clock, Ship, Check, Timer } from 'lucide-react';
import { generateLoot } from '../../../lib/generators';
import { Rarity, GearSlot, ITEM_PRICES, RARITY_LABELS, GEAR_SLOT_LABELS, GEAR_SLOT_ICONS, RARITY_COLORS } from '../../../lib/constants';

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
                                            <span>{RARITY_LABELS[item.rarity]}</span>
                                            <span className="text-white/20">•</span>
                                            <span>{GEAR_SLOT_LABELS[item.slot]}</span>
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

            {/* Smuggling Network */}
            <div className="space-y-3">
                <h3 className="text-sm font-bold text-orange-500 uppercase tracking-wider border-b border-white/5 pb-1 flex items-center gap-2">
                    <Ship size={14} /> เครือข่ายลักลอบขนของ (Smuggling)
                </h3>

                <SmugglingInterface />
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

const SmugglingInterface = () => {
    const { money, startSmuggling, claimSmuggling, smuggling } = useGameStore();
    // Store has `smuggling`, `startSmuggling`, `claimSmuggling`.

    const [selectedSlot, setSelectedSlot] = useState<GearSlot>(GearSlot.WEAPON);
    const [selectedRarity, setSelectedRarity] = useState<Rarity>(Rarity.COMMON);

    // Config for Costs (Make sure this matches Implementation Plan)
    const SMUGGLING_CONFIG = {
        [Rarity.COMMON]: { price: 2000, timeMin: 1 },
        [Rarity.UNCOMMON]: { price: 5000, timeMin: 5 },
        [Rarity.RARE]: { price: 20000, timeMin: 15 },
        [Rarity.EPIC]: { price: 100000, timeMin: 60 },
        [Rarity.LEGENDARY]: { price: 1000000, timeMin: 240 },
    };

    const config = SMUGGLING_CONFIG[selectedRarity];
    const canAfford = money >= config.price;

    if (smuggling.active) {
        const timeLeft = Math.max(0, smuggling.endTime - Date.now());
        const minutes = Math.floor(timeLeft / 60000);
        const seconds = Math.floor((timeLeft % 60000) / 1000);

        return (
            <div className="bg-surface/30 border border-orange-500/30 rounded-xl p-6 text-center animate-pulse-slow">
                <div className="flex flex-col items-center gap-3">
                    <Ship size={32} className={`text-orange-500 ${timeLeft > 0 ? 'animate-bounce' : ''}`} />

                    {smuggling.claimed ? ( // logic in store sets claimed=true when time is up? No, store sets claimed=true when time is up.
                        // Wait, my tick logic sets `claimed: true` when time is up.
                        // So if claimed is true, it means "Ready to Claim".
                        <>
                            <div className="text-lg font-bold text-white">สินค้ามาถึงแล้ว!</div>
                            <button
                                onClick={claimSmuggling}
                                className="px-6 py-2 bg-green-500 text-black font-bold rounded-lg hover:scale-105 transition-transform flex items-center gap-2"
                            >
                                <Check size={18} /> รับสินค้า
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="text-orange-400 font-mono text-xl font-bold">
                                {minutes}:{seconds.toString().padStart(2, '0')}
                            </div>
                            <div className="text-xs text-gray-400">กำลังลักลอบขนส่ง...</div>
                            <div className="text-[10px] text-gray-500 mt-2">
                                {GEAR_SLOT_LABELS[smuggling.slot!]} ({RARITY_LABELS[smuggling.rarity!]})
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-surface border border-white/5 rounded-xl p-4 space-y-4">
            {/* Slot Selection */}
            <div className="space-y-1">
                <label className="text-xs text-gray-400">เลือกประเภท</label>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {Object.values(GearSlot).map(slot => (
                        <button
                            key={slot}
                            onClick={() => setSelectedSlot(slot)}
                            className={`p-2 rounded-lg border transition-all min-w-[60px] flex flex-col items-center gap-1
                                ${selectedSlot === slot ? 'bg-orange-500/20 border-orange-500 text-orange-500' : 'bg-black/20 border-white/5 text-gray-500 hover:border-white/20'}
                            `}
                        >
                            <span className="text-lg">{GEAR_SLOT_ICONS[slot]}</span>
                            <span className="text-[9px] whitespace-nowrap">{GEAR_SLOT_LABELS[slot]}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Rarity Selection */}
            <div className="space-y-1">
                <label className="text-xs text-gray-400">เลือกระดับความหายาก</label>
                <div className="grid grid-cols-5 gap-1">
                    {Object.values(Rarity).map(rarity => (
                        <button
                            key={rarity}
                            onClick={() => setSelectedRarity(rarity)}
                            className={`h-8 rounded flex items-center justify-center text-[10px] font-bold border transition-all
                               ${selectedRarity === rarity ? 'border-white scale-105' : 'border-transparent opacity-50 hover:opacity-100'}
                               ${RARITY_COLORS[rarity].replace('text-', 'bg-')} text-black
                           `}
                        >
                            {RARITY_LABELS[rarity]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Order Button */}
            <div className="pt-2">
                <button
                    onClick={() => startSmuggling(selectedSlot, selectedRarity, config.price, config.timeMin)}
                    disabled={!canAfford}
                    className={`w-full py-3 rounded-xl border-dashed border-2 flex items-center justify-between px-4 transition-all
                        ${canAfford
                            ? 'bg-orange-500/10 border-orange-500 text-orange-500 hover:bg-orange-500/20 hover:scale-[1.02]'
                            : 'bg-gray-800/10 border-gray-700 text-gray-600 cursor-not-allowed'}
                    `}
                >
                    <div className="flex flex-col items-start">
                        <span className="text-xs font-bold flex items-center gap-1">
                            <Clock size={12} /> {config.timeMin} นาที (Min)
                        </span>
                        <span className="text-[10px] opacity-70">ระยะเวลาขนส่ง</span>
                    </div>
                    <div className="text-right">
                        <span className="text-sm font-black">{formatMoney(config.price)}</span>
                        <span className="text-[10px] block opacity-70">ค่าจ้าง</span>
                    </div>
                </button>
            </div>
        </div>
    );
};
