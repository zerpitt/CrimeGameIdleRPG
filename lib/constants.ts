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
    name: 'Street Crew',
    baseCost: 100,
    baseIncome: 5,
    description: 'Local thugs collecting protection money.',
    tier: 1,
  },
  {
    id: 'front_business',
    name: 'Front Business',
    baseCost: 1500,
    baseIncome: 45,
    description: 'A laundromat that washes more than just clothes.',
    tier: 2,
  },
  {
    id: 'supply_route',
    name: 'Supply Route',
    baseCost: 12000,
    baseIncome: 250,
    description: 'Smuggling routes for illicit goods.',
    tier: 3,
  },
  {
    id: 'safehouse_network',
    name: 'Safehouse Network',
    baseCost: 85000,
    baseIncome: 1200,
    description: 'Hidden locations across the city.',
    tier: 4,
  },
  {
    id: 'money_laundering',
    name: 'Money Laundering Ops',
    baseCost: 500000,
    baseIncome: 6500,
    description: 'Professional financial systems to clean the cash.',
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
    name: 'Petty Theft',
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
    name: 'Armed Robbery',
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
    name: 'Bank Heist',
    actionCost: 50,
    baseSuccessChance: 0.4,
    riskMultiplier: 8,
    baseHeatError: 30,
    minHeat: 15,
    maxHeat: 25,
    tier: 3,
  },
];

export enum Rarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

export const RARITY_COLORS = {
  [Rarity.COMMON]: 'text-gray-400 border-gray-600',
  [Rarity.RARE]: 'text-green-400 border-green-600',
  [Rarity.EPIC]: 'text-purple-400 border-purple-600',
  [Rarity.LEGENDARY]: 'text-gold border-gold shadow-[0_0_10px_rgba(245,197,66,0.5)]',
};

export const RARITY_MULTIPLIERS = {
  [Rarity.COMMON]: 1,
  [Rarity.RARE]: 1.5,
  [Rarity.EPIC]: 3,
  [Rarity.LEGENDARY]: 10,
};

export enum GearSlot {
  WEAPON = 'weapon',
  ARMOR = 'armor',
  TOOL = 'tool',
  ACCESSORY = 'accessory',
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
