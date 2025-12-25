import { GearSlot, Item, Rarity, RARITY_MULTIPLIERS } from '../constants';

const NAMES = {
    [GearSlot.WEAPON]: ['Pistol', 'Crowbar', 'Knife', 'Brass Knuckles', 'Uzi'],
    [GearSlot.ARMOR]: ['Kevlar Vest', 'Leather Jacket', 'Sunglasses', 'Hoodie'],
    [GearSlot.TOOL]: ['Lockpick', 'Drill', 'Hacking Device', 'Burner Phone'],
    [GearSlot.ACCESSORY]: ['Gold Chain', 'Lucky Coin', 'Rolex', 'Diamond Ring'],
};

const PREFIXES = {
    [Rarity.COMMON]: ['Rusty', 'Used', 'Standard', 'Cheap'],
    [Rarity.RARE]: ['Polished', 'Custom', 'Heavy', 'Tactical'],
    [Rarity.EPIC]: ['Elite', 'Underworld', 'Ghost', 'Shadow'],
    [Rarity.LEGENDARY]: ['Godfather\'s', 'Golden', 'Mythic', 'Legendary'],
};

export const generateLoot = (tier: number, luck: number): Item | null => {
    // Base Drop Chance increased by Luck
    const dropChance = 0.3 + (luck * 0.005);
    if (Math.random() > dropChance) return null;

    // Rarity Roll
    const roll = Math.random() + (luck * 0.002);
    let rarity = Rarity.COMMON;
    if (roll > 0.98) rarity = Rarity.LEGENDARY;
    else if (roll > 0.85) rarity = Rarity.EPIC;
    else if (roll > 0.60) rarity = Rarity.RARE;

    // Slot Roll
    const slots = Object.values(GearSlot);
    const slot = slots[Math.floor(Math.random() * slots.length)];

    // Stats Generation based on Tier and Rarity
    const multiplier = RARITY_MULTIPLIERS[rarity] * (1 + (tier * 0.2));

    const effects: Item['effects'] = {};

    if (slot === GearSlot.WEAPON) {
        effects.crimeSuccess = Number((0.01 * multiplier).toFixed(3));
    } else if (slot === GearSlot.ARMOR) {
        effects.heatReduction = Number((1 * multiplier).toFixed(0));
    } else if (slot === GearSlot.TOOL) {
        effects.incomeBonus = Number((0.05 * multiplier).toFixed(3));
    } else {
        // Accessory - Random effect
        effects.luckBonus = Number((1 * multiplier).toFixed(0));
    }

    // Name Generation
    const baseName = NAMES[slot][Math.floor(Math.random() * NAMES[slot].length)];
    const prefix = PREFIXES[rarity][Math.floor(Math.random() * PREFIXES[rarity].length)];

    return {
        id: crypto.randomUUID(),
        name: `${prefix} ${baseName}`,
        rarity,
        slot,
        effects
    };
};
