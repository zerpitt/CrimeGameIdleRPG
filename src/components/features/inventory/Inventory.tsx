import React, { useState } from 'react';
import { useGameStore } from '../../../store/useGameStore';
import { GearSlot, Item, RARITY_COLORS } from '../../../lib/constants';
import { Sword, Shield, PenTool, Gem, Trash2, ArrowUpCircle, Shirt } from 'lucide-react';
import { formatMoney } from '../../../lib/utils';

export const Inventory = () => {
    const { inventory, equipped, equipItem, unequipItem, sellItem } = useGameStore();
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);

    const slotIcons = {
        [GearSlot.WEAPON]: Sword,
        [GearSlot.ARMOR]: Shield,
        [GearSlot.TOOL]: PenTool,
        [GearSlot.ACCESSORY]: Gem,
        [GearSlot.OUTFIT]: Shirt,
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold px-2">Gear & Equipment</h2>

            {/* Equipped Section */}
            <div className="grid grid-cols-4 gap-2 px-2">
                {(Object.keys(slotIcons) as GearSlot[]).map((slot) => {
                    const item = equipped[slot];
                    const Icon = slotIcons[slot];
                    return (
                        <div
                            key={slot}
                            onClick={() => item && unequipItem(slot)}
                            className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center relative cursor-pointer active:scale-95 transition-all
                                ${item ? 'bg-surface border-money/50' : 'bg-surface/30 border-dashed border-white/10'}
                            `}
                        >
                            {item ? (
                                <>
                                    <Icon size={20} className={RARITY_COLORS[item.rarity].split(' ')[0]} />
                                    <span className="text-[8px] absolute bottom-1 truncate w-10/12 text-center text-gray-400">
                                        {item.name}
                                    </span>
                                </>
                            ) : (
                                <Icon size={20} className="text-gray-600" />
                            )}
                            <span className="absolute top-1 right-1 text-[8px] text-gray-600 uppercase">{slot}</span>
                        </div>
                    );
                })}
            </div>

            {/* Inventory Grid */}
            <div className="bg-surface/50 min-h-[300px] rounded-t-3xl border-t border-white/10 p-4">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-400">Bag ({inventory.length})</span>
                    {selectedItem && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => { sellItem(selectedItem.id); setSelectedItem(null); }}
                                className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20"
                            >
                                <Trash2 size={16} />
                            </button>
                            <button
                                onClick={() => { equipItem(selectedItem); setSelectedItem(null); }}
                                className="px-4 py-2 bg-money text-black font-bold text-xs rounded-lg hover:brightness-110 flex items-center gap-2"
                            >
                                <ArrowUpCircle size={16} />
                                EQUIP
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-4 gap-2">
                    {inventory.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
                            className={`
                                aspect-square rounded-lg border flex flex-col items-center justify-center p-1 text-center cursor-pointer transition-colors
                                ${selectedItem?.id === item.id ? 'bg-white/10 border-white' : 'bg-black/20 border-white/5 hover:border-white/20'}
                                ${RARITY_COLORS[item.rarity].split(' ')[0]}
                            `}
                        >
                            <div className={`w-2 h-2 rounded-full mb-1 ${RARITY_COLORS[item.rarity].split(' ')[0].replace('text-', 'bg-')}`} />
                            <span className="text-[9px] leading-tight line-clamp-2">{item.name}</span>
                        </div>
                    ))}
                    {inventory.length === 0 && (
                        <div className="col-span-4 text-center py-10 text-gray-600 text-xs">
                            No items. Do crimes to find loot.
                        </div>
                    )}
                </div>
            </div>

            {/* Selected Item Details */}
            {selectedItem && (
                <div className="fixed bottom-[90px] left-4 right-4 bg-void border border-white/20 p-4 rounded-xl shadow-2xl animate-in slide-in-from-bottom-5 z-40">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className={`font-bold ${RARITY_COLORS[selectedItem.rarity].split(' ')[0]}`}>
                                {selectedItem.name}
                            </h3>
                            <span className="text-xs text-gray-500 uppercase">{selectedItem.rarity} {selectedItem.slot}</span>
                        </div>
                        <button onClick={() => setSelectedItem(null)} className="text-gray-500">x</button>
                    </div>
                    <div className="mt-3 space-y-1 text-sm text-gray-300">
                        {selectedItem.effects.incomeBonus && <div>• Income: +{(selectedItem.effects.incomeBonus * 100).toFixed(1)}%</div>}
                        {selectedItem.effects.crimeSuccess && <div>• Crime Chance: +{(selectedItem.effects.crimeSuccess * 100).toFixed(1)}%</div>}
                        {selectedItem.effects.heatReduction && <div>• Heat Reduction: -{selectedItem.effects.heatReduction}</div>}
                        {selectedItem.effects.luckBonus && <div>• Luck: +{selectedItem.effects.luckBonus}</div>}
                    </div>
                </div>
            )}
        </div>
    );
};
