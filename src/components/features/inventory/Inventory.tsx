import React, { useState } from 'react';
import { useGameStore } from '../../../store/useGameStore';
import { GearSlot, Item, RARITY_COLORS, GEAR_SLOT_LABELS, RARITY_LABELS, GEAR_SLOT_ICONS, FORMULAS, Rarity } from '../../../lib/constants';
import { Sword, Shield, PenTool, Gem, Trash2, ArrowUpCircle, Shirt, Hammer, Zap, ArrowUp } from 'lucide-react';
import { formatMoney } from '../../../lib/utils';

export const Inventory = () => {
    const inventory = useGameStore(state => state.inventory);
    const equipped = useGameStore(state => state.equipped);
    const equipItem = useGameStore(state => state.equipItem);
    const unequipItem = useGameStore(state => state.unequipItem);
    const salvageItem = useGameStore(state => state.salvageItem);
    const salvageFilteredItems = useGameStore(state => state.salvageFilteredItems);
    // const sellItem = useGameStore(state => state.sellItem); // Deprecated in UI
    const maxInventorySize = useGameStore(state => state.maxInventorySize);
    const scrap = useGameStore(state => state.scrap);
    const slotLevels = useGameStore(state => state.slotLevels);
    const upgradeSlot = useGameStore(state => state.upgradeSlot);

    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [filter, setFilter] = useState<GearSlot | 'ALL'>('ALL');
    const [rarityFilter, setRarityFilter] = useState<Rarity | 'ALL'>('ALL');

    const slotIcons = {
        [GearSlot.WEAPON]: Sword,
        [GearSlot.ARMOR]: Shield,
        [GearSlot.TOOL]: PenTool,
        [GearSlot.ACCESSORY]: Gem,
        [GearSlot.OUTFIT]: Shirt,
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
                <h2 className="text-xl font-bold">กระเป๋าและอุปกรณ์</h2>
                <div className="bg-black/40 px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                    <Hammer size={14} className="text-gray-400" />
                    <span className="font-mono font-bold text-white">{scrap}</span>
                    <span className="text-[10px] text-gray-500">SCRAP</span>
                </div>
            </div>

            {/* Equipped Section */}
            <div className="grid grid-cols-4 gap-2 px-2">
                {(Object.keys(slotIcons) as GearSlot[]).map((slot) => {
                    const item = equipped[slot];
                    const Icon = slotIcons[slot];
                    const level = slotLevels[slot] || 0;
                    const upgradeCost = FORMULAS.calculateSlotUpgradeCost(level);
                    const canUpgrade = scrap >= upgradeCost;

                    return (
                        <div key={slot} className="relative group">
                            {/* Slot Card */}
                            <div
                                onClick={() => item && unequipItem(slot)}
                                className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center relative cursor-pointer active:scale-95 transition-all
                                    ${item ? 'bg-surface border-money/50' : 'bg-surface/30 border-dashed border-white/10'}
                                `}
                            >
                                {item ? (
                                    <>
                                        <Icon size={24} className={RARITY_COLORS[item.rarity as Rarity].split(' ')[0]} />
                                        <span className="text-[10px] absolute bottom-1 truncate w-11/12 text-center text-gray-300 font-medium">
                                            {item.name}
                                        </span>
                                    </>
                                ) : (
                                    <Icon size={24} className="text-gray-600" />
                                )}
                                <span className="absolute top-1 right-1 text-[8px] text-gray-500 uppercase font-bold tracking-wider">{GEAR_SLOT_LABELS[slot]}</span>

                                {/* Level Badge */}
                                {level > 0 && (
                                    <div className="absolute top-1 left-1 bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded text-[9px] font-bold border border-blue-500/30">
                                        +{level}
                                    </div>
                                )}
                            </div>

                            {/* Upgrade Button (Outside the card to prevent misclick, or Overlay) */}
                            {/* Let's put it below for clarity? Or overlay small button? */}
                            <button
                                onClick={(e) => { e.stopPropagation(); upgradeSlot(slot); }}
                                className={`absolute -bottom-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center border-2 shadow-lg z-20 transition-all ${canUpgrade
                                    ? 'bg-blue-600 border-blue-400 text-white hover:scale-110 cursor-pointer'
                                    : 'bg-gray-800 border-gray-600 text-gray-500 cursor-not-allowed opacity-0 group-hover:opacity-100'
                                    }`}
                                disabled={!canUpgrade}
                                title={`Upgrade cost: ${upgradeCost} Scrap`}
                            >
                                <ArrowUp size={14} strokeWidth={3} />
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Inventory Grid */}
            <div className="bg-surface/50 min-h-[300px] rounded-t-3xl border-t border-white/10 p-4">
                <div className="flex flex-col gap-3 mb-4">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">กระเป๋า ({inventory.length}/{maxInventorySize})</span>
                        {selectedItem && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { salvageItem(selectedItem.id); setSelectedItem(null); }}
                                    className="px-3 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 flex items-center gap-1"
                                >
                                    <Hammer size={16} />
                                    <span className="text-xs font-bold">บดทิ้ง</span>
                                </button>
                                <button
                                    onClick={() => { equipItem(selectedItem); setSelectedItem(null); }}
                                    className="px-4 py-2 bg-money text-black font-bold text-xs rounded-lg hover:brightness-110 flex items-center gap-2"
                                >
                                    <ArrowUpCircle size={16} />
                                    สวมใส่
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Filter Bar (Slots) */}
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar masking-gradient-right">
                        <button
                            onClick={() => setFilter('ALL')}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${filter === 'ALL' ? 'bg-white text-black border-white' : 'bg-surface border-white/10 text-gray-400 hover:border-white/30'}`}
                        >
                            🔍 ทั้งหมด
                        </button>
                        {(Object.values(GearSlot) as GearSlot[]).map(slot => (
                            <button
                                key={slot}
                                onClick={() => setFilter(slot)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 ${filter === slot ? 'bg-white text-black border-white' : 'bg-surface border-white/10 text-gray-400 hover:border-white/30'}`}
                            >
                                <span>{GEAR_SLOT_ICONS[slot]}</span>
                                <span>{GEAR_SLOT_LABELS[slot]}</span>
                            </button>
                        ))}
                    </div>

                    {/* Rarity Filter & Bulk Salvage */}
                    <div className="flex justify-between items-center gap-2 overflow-x-auto pb-2">
                        <div className="flex gap-1.5">
                            {([Rarity.COMMON, Rarity.UNCOMMON, Rarity.RARE, Rarity.EPIC, Rarity.LEGENDARY]).map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setRarityFilter(prev => prev === r ? 'ALL' : r)}
                                    className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all
                                        ${rarityFilter === r ? 'scale-110 shadow-lg brightness-110' : 'opacity-40 hover:opacity-100'}
                                        ${(RARITY_COLORS[r] || '').split(' ')[0].replace('text-', 'bg-').replace('border-', 'border-')}
                                    `}
                                    title={`Filter ${RARITY_LABELS[r]}`}
                                >
                                </button>
                            ))}
                        </div>

                        {/* Bulk Salvage Button */}
                        {rarityFilter !== 'ALL' && (
                            <button
                                onClick={() => {
                                    if (window.confirm(`ยืนยันที่จะบดทำลายไอเทมระดับ ${RARITY_LABELS[rarityFilter as Rarity]} ทั้งหมดในกระเป๋า?`)) {
                                        salvageFilteredItems(rarityFilter as Rarity);
                                        setRarityFilter('ALL');
                                    }
                                }}
                                className="px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/50 rounded text-[10px] font-bold flex items-center gap-1 hover:bg-red-500/30 whitespace-nowrap"
                            >
                                <Trash2 size={12} />
                                บดทั้งหมด ({inventory.filter(i => i.rarity === rarityFilter).length})
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-2 content-start min-h-[200px]">
                    {inventory.filter(item => filter === 'ALL' || item.slot === filter).map((item) => (
                        <div
                            key={item.id}
                            onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
                            className={`
                                aspect-square rounded-lg border flex flex-col items-center justify-center p-1 text-center cursor-pointer transition-all relative group
                                ${selectedItem?.id === item.id ? 'bg-white/10 border-white scale-95' : 'bg-black/20 border-white/5 hover:border-white/20 hover:scale-105 active:scale-95'}
                                ${RARITY_COLORS[item.rarity].split(' ')[0]}
                            `}
                        >
                            <div className="absolute top-1 right-1 text-[10px] opacity-50">{GEAR_SLOT_ICONS[item.slot]}</div>
                            <div className={`w-2 h-2 rounded-full mb-0.5 ${RARITY_COLORS[item.rarity].split(' ')[0].replace('text-', 'bg-')}`} />
                            <span className="text-[10px] leading-tight line-clamp-1 w-full px-0.5 tracking-tight font-bold">{item.name}</span>

                            {/* Quick Equip Button */}
                            <button
                                onClick={(e) => { e.stopPropagation(); equipItem(item); }}
                                className="mt-1 w-full py-0.5 bg-money/20 text-money text-[8px] font-black rounded uppercase hover:bg-money/40 transition-colors border border-money/30"
                            >
                                ใส่ทันที
                            </button>
                        </div>
                    ))}
                    {inventory.filter(item => filter === 'ALL' || item.slot === filter).length === 0 && (
                        <div className="col-span-4 flex flex-col items-center justify-center py-10 text-gray-600 gap-2">
                            <div className="text-2xl opacity-20">📦</div>
                            <div className="text-xs">
                                {filter === 'ALL' ? 'กระเป๋าว่างเปล่า' : `ไม่พบไอเทมประเภท ${GEAR_SLOT_LABELS[filter as GearSlot]}`}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Selected Item Details */}
            {selectedItem && (
                <div className="fixed bottom-[90px] left-4 right-4 bg-void border border-white/20 p-4 rounded-xl shadow-2xl animate-in slide-in-from-bottom-5 z-[100]">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className={`font-bold text-lg ${RARITY_COLORS[selectedItem.rarity].split(' ')[0]}`}>
                                {selectedItem.name}
                            </h3>
                            <span className="text-xs text-gray-500 uppercase">{RARITY_LABELS[selectedItem.rarity]} {GEAR_SLOT_LABELS[selectedItem.slot]}</span>
                        </div>
                        <button onClick={() => setSelectedItem(null)} className="p-2 -mr-2 text-gray-400 hover:text-white">
                            <ArrowUpCircle className="rotate-45" size={24} />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Selected Stats */}
                        <div className="space-y-2">
                            <div className="text-[10px] uppercase text-gray-500 font-bold">สถิติไอเทม</div>
                            <div className="space-y-1 text-sm text-gray-300">
                                {Object.entries(selectedItem.effects).map(([key, value]) => (
                                    <div key={key} className="flex justify-between">
                                        <span className="capitalize text-gray-400">{key === 'incomeBonus' ? 'รายได้' : key === 'crimeSuccess' ? 'โอกาสสำเร็จ' : key === 'luckBonus' ? 'โชค' : key}</span>
                                        <span className="font-mono">{key === 'incomeBonus' || key === 'crimeSuccess' ? `+${(value * 100).toFixed(1)}%` : `+${value}`}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Comparison */}
                        {equipped[selectedItem.slot] && equipped[selectedItem.slot]?.id !== selectedItem.id && (
                            <div className="space-y-2 border-l border-white/10 pl-4">
                                <div className="text-[10px] uppercase text-gray-500 font-bold">เทียบกับที่ใส่อยู่</div>
                                <div className="space-y-1 text-sm">
                                    {Object.entries(selectedItem.effects).map(([key, value]) => {
                                        const equippedVal = equipped[selectedItem.slot]?.effects[key as keyof typeof selectedItem.effects] || 0;
                                        const diff = value - equippedVal;
                                        const isBetter = diff > 0;

                                        if (diff === 0) return null;

                                        return (
                                            <div key={key} className="flex justify-between">
                                                <span className="capitalize text-gray-500 text-xs truncate mr-1">{key === 'incomeBonus' ? 'รายได้' : key === 'crimeSuccess' ? 'โอกาส' : key === 'luckBonus' ? 'โชค' : key}</span>
                                                <span className={`font-mono font-bold ${isBetter ? 'text-green-400' : 'text-red-400'}`}>
                                                    {diff > 0 ? '+' : ''}
                                                    {key === 'incomeBonus' || key === 'crimeSuccess' ? `${(diff * 100).toFixed(1)}%` : diff}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
