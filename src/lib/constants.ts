export const GAME_CONFIG = {
  TICK_RATE: 100, // 10 ticks per second (100ms)
  AUTO_SAVE_INTERVAL: 30000, // 30 seconds
  OFFLINE_CAP_HOURS: 12,
  OFFLINE_EFFICIENCY: 0.9,
};

export const RESOURCES = {
  MONEY: 'money',
  HEAT: 'heat',
  ACTION: 'action',
};

// Math Formulas
export const FORMULAS = {
  // BaseIncome/sec = Base × (Power ^ 1.2)
  calculateBaseIncome: (base: number, power: number) => {
    return base * Math.pow(power, 1.2);
  },

  // AssetIncome = Base × (Level ^ 1.35)
  calculateAssetIncome: (base: number, level: number) => {
    if (level === 0) return 0;
    return base * Math.pow(level, 1.35);
  },

  // UpgradeCost = BaseCost × (1.75 ^ Level)
  calculateAssetCost: (baseCost: number, level: number) => {
    return baseCost * Math.pow(1.75, level);
  },

  // Generic Upgrade Cost: Base * (2.5 ^ Level) - Steeper curve for passive bonuses
  calculateTechCost: (baseCost: number, level: number) => {
    return baseCost * Math.pow(2.5, level);
  },

  // CapitalBonus = log10(เงินสด + 1) × 0.25 (User Spec: Capital Leverage)
  calculateCapitalBonus: (money: number) => {
    return Math.log10(money + 1) * 0.25;
  },

  // Success = BaseChance + (Power × 0.4%) + (Luck × 0.2%) - (Heat × 0.5%)
  calculateCrimeSuccess: (baseChance: number, power: number, luck: number, heat: number) => {
    const chance = baseChance + (power * 0.004) + (luck * 0.002) - (heat * 0.005);
    return Math.max(0, Math.min(1, chance)); // Clamp between 0 and 1
  },

  // HeatPenalty = max(0, Heat - Threshold) ^ 1.2
  calculateHeatPenalty: (heat: number, threshold: number = 50) => {
    return Math.pow(Math.max(0, heat - threshold), 1.2);
  },

  // WealthCore = log10(NetWorth) ^ 1.5
  calculatePrestigeMultiplier: (netWorth: number) => {
    if (netWorth < 1000) return 1;
    const wealthCore = Math.pow(Math.log10(netWorth), 1.5);
    return 1 + (wealthCore * 0.3); // Simplified from Sum of WealthCore
  }
};

export interface AssetDefinition {
  id: string;
  name: string;
  baseCost: number;
  baseIncome: number;
  description: string;
  tier: number;
}

export const ASSETS: AssetDefinition[] = [
  {
    id: 'street_crew',
    name: 'แก๊งข้างทาง',
    baseCost: 100,
    baseIncome: 5,
    description: 'นักเลงคุมซอย เก็บค่าคุ้มครอง',
    tier: 1,
  },
  {
    id: 'front_business',
    name: 'ธุรกิจบังหน้า',
    baseCost: 1500,
    baseIncome: 45,
    description: 'ร้านซักรีดที่ฟอกเงินไวกว่าซักผ้า',
    tier: 2,
  },
  {
    id: 'supply_route',
    name: 'เส้นทางขนของเถื่อน',
    baseCost: 12000,
    baseIncome: 250,
    description: 'เส้นทางลับสำหรับขนส่งสินค้าผิดกฎหมาย',
    tier: 3,
  },
  {
    id: 'safehouse_network',
    name: 'เครือข่ายเซฟเฮาส์',
    baseCost: 85000,
    baseIncome: 1200,
    description: 'ที่ซ่อนตัวทั่วเมืองสำหรับหลบหนีและพักของ',
    tier: 4,
  },
  {
    id: 'money_laundering',
    name: 'ธุรกิจฟอกเงินระดับสูง',
    baseCost: 500000,
    baseIncome: 6500,
    description: 'ระบบการเงินมืออาชีพ เงินสะอาด 100%',
    tier: 5,
  },
];

export interface CrimeDefinition {
  id: string;
  name: string;
  actionCost: number;
  baseSuccessChance: number;
  riskMultiplier: number; // Reward multiplier
  baseHeatError: number; // Heat gained on failure (or success sometimes)
  minHeat: number; // Heat gained minimum
  maxHeat: number; // Heat gained maximum
  tier: number;
}

export const CRIMES: CrimeDefinition[] = [
  {
    id: 'petty_theft',
    name: 'วิ่งราว',
    actionCost: 10,
    baseSuccessChance: 0.9,
    riskMultiplier: 2,
    baseHeatError: 5,
    minHeat: 1,
    maxHeat: 3,
    tier: 1,
  },
  {
    id: 'armed_robbery',
    name: 'ปล้นร้านสะดวกซื้อ',
    actionCost: 25,
    baseSuccessChance: 0.65,
    riskMultiplier: 4,
    baseHeatError: 15,
    minHeat: 5,
    maxHeat: 10,
    tier: 2,
  },
  {
    id: 'bank_heist',
    name: 'ปล้นธนาคาร',
    actionCost: 50,
    baseSuccessChance: 0.4,
    riskMultiplier: 8,
    baseHeatError: 30,
    minHeat: 15,
    maxHeat: 25,
    tier: 3,
  },
];

// Export MAX_HEAT
export const MAX_HEAT = 100;

export interface UpgradeDefinition {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  effectDescription: (level: number) => string;
}

export const UPGRADES: UpgradeDefinition[] = [
  {
    id: 'smooth_talker',
    name: 'ปากหวาน',
    description: 'เรียนรู้วิธีเจรจาต่อรองกับตำรวจ',
    baseCost: 500,
    effectDescription: (level) => `ลด Heat ไวขึ้น: +${(level * 10)}%`,
  },
  {
    id: 'connections',
    name: 'เส้นสาย',
    description: 'รู้จักคนใหญ่คนโต งานเงินดีขึ้น',
    baseCost: 1000,
    effectDescription: (level) => `เงินจากการปล้น: +${(level * 5)}%`,
  },
  {
    id: 'deep_pockets',
    name: 'กระเป๋ามิติที่สี่',
    description: 'เสื้อโค้ทตัดพิเศษ ซ่อนของได้เพียบ',
    baseCost: 2500,
    effectDescription: (level) => `ช่องเก็บของ: +${(level * 2)} ช่อง`,
  },
  {
    id: 'lucky_charm',
    name: 'เครื่องรางนำโชค',
    description: 'มูเตลูเสริมดวง',
    baseCost: 5000,
    effectDescription: (level) => `โชค (Luck): +${level}`,
  },
];

export enum Rarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

export const RARITY_COLORS = {
  [Rarity.COMMON]: 'text-gray-400 border-gray-600',
  [Rarity.UNCOMMON]: 'text-green-300 border-green-500', // Added UNCOMMON color
  [Rarity.RARE]: 'text-blue-400 border-blue-600', // Changed RARE to blue to differentiate? Or keep green? Code used green for Rare. Let's keep Rare as Green-400 and Uncommon maybe Green-200 or Gray-200? Or Blue. Convention: Common(Gray/White), Uncommon(Green), Rare(Blue), Epic(Purple), Legendary(Orange).
  // Current code: Rare=Green. Epic=Purple. Legendary=Gold.
  // I will make Uncommon = Green-200. Rare = Green-400.
  // Actually, standard RPG: Common(Gray), Uncommon(Green), Rare(Blue), Epic(Purple), Legendary(Orange).
  // The user codebase has Rare=Green.
  // I will add Uncommon as 'text-blue-300 border-blue-500' just to have a distinct color.
  [Rarity.EPIC]: 'text-purple-400 border-purple-600',
  [Rarity.LEGENDARY]: 'text-gold border-gold shadow-[0_0_10px_rgba(245,197,66,0.5)]',
};

export const RARITY_MULTIPLIERS = {
  [Rarity.COMMON]: 1,
  [Rarity.UNCOMMON]: 1.25,
  [Rarity.RARE]: 1.5,
  [Rarity.EPIC]: 3,
  [Rarity.LEGENDARY]: 10,
};

export const ITEM_PRICES = {
  [Rarity.COMMON]: 500,
  [Rarity.UNCOMMON]: 2500,
  [Rarity.RARE]: 15000,
  [Rarity.EPIC]: 75000,
  [Rarity.LEGENDARY]: 500000,
};

export enum GearSlot {
  WEAPON = 'weapon',
  ARMOR = 'armor',
  TOOL = 'tool',
  ACCESSORY = 'accessory',
  OUTFIT = 'outfit',
}

export interface Item {
  id: string; // unique instance id
  name: string;
  rarity: Rarity;
  slot: GearSlot;
  effects: {
    incomeBonus?: number; // Multiplier add (e.g. 0.1 for +10%)
    crimeSuccess?: number; // Flat add (e.g. 0.05 for +5%)
    heatReduction?: number; // Flat reduce
    luckBonus?: number;
  };
}
