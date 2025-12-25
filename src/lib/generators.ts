import { GearSlot, Item, Rarity, RARITY_MULTIPLIERS } from './constants';

const NAMES = {
    [GearSlot.WEAPON]: ['ปืนพก', 'ชะแลง', 'มีดพับ', 'สนับมือ', 'ปืนกลเบา'],
    [GearSlot.ARMOR]: ['เสื้อเกราะ', 'แจ็คเก็ตหนัง', 'แว่นดำ', 'เสื้อฮู้ด'],
    [GearSlot.TOOL]: ['ชุดสะเดาะกุญแจ', 'สว่าน', 'อุปกรณ์แฮ็ก', 'มือถือใช้แล้วทิ้ง'],
    [GearSlot.ACCESSORY]: ['สร้อยทอง', 'เหรียญนำโชค', 'นาฬิกาหรู', 'แหวนเพชร'],
    [GearSlot.OUTFIT]: ['สูททางการ', 'เสื้อคลุม', 'ชุดปลอมตัว', 'เครื่องแบบ'],
};

const PREFIXES = {
    [Rarity.COMMON]: ['สนิมเขรอะ', 'มือสอง', 'ทั่วไป', 'ราคาถูก'],
    [Rarity.UNCOMMON]: ['พอใช้', 'เชื่อใจได้', 'สภาพดี', 'ปรับปรุงแล้ว'],
    [Rarity.RARE]: ['ขัดเงา', 'สั่งทำพิเศษ', 'Heavy', 'เชิงยุทธวิธี'],
    [Rarity.EPIC]: ['ระดับสูง', 'ใต้ดิน', 'ไร้ร่องรอย', 'เงา'],
    [Rarity.LEGENDARY]: ['ของเจ้าพ่อ', 'ทองคำ', 'ตำนาน', 'ในตำนาน'],
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
    const slots = Object.values(GearSlot) as GearSlot[];
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

export const generateSpecificLoot = (slot: GearSlot, rarity: Rarity): Item => {
    // Deterministic stats based on Rarity (roughly Tier 1-2 equivalent but guaranteed)
    const multiplier = RARITY_MULTIPLIERS[rarity] * 1.2; // 20% bonus for custom order

    const effects: Item['effects'] = {};

    if (slot === GearSlot.WEAPON) {
        effects.crimeSuccess = Number((0.01 * multiplier).toFixed(3));
    } else if (slot === GearSlot.ARMOR) {
        effects.heatReduction = Number((1 * multiplier).toFixed(0));
    } else if (slot === GearSlot.TOOL) {
        effects.incomeBonus = Number((0.05 * multiplier).toFixed(3));
    } else {
        effects.luckBonus = Number((1 * multiplier).toFixed(0));
    }

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
