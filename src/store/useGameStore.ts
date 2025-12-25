import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ASSETS, CRIMES, FORMULAS, GAME_CONFIG, Item, GearSlot, RARITY_MULTIPLIERS, UPGRADES, PRESTIGE_UPGRADES_DATA, ITEM_PRICES, BANK_CONFIG, STOCKS, Rarity } from '../lib/constants';
import { generateLoot, generateSpecificLoot } from '../lib/generators';

interface AssetState {
    id: string;
    level: number;
    owned: boolean;
}

interface GameState {
    // Resources
    money: number;
    heat: number;
    actionPoints: number;
    netWorth: number;

    // Stats
    power: number;
    speed: number;
    luck: number;

    // Progression
    assets: Record<string, AssetState>;
    upgrades: Record<string, number>; // id -> level

    // Market
    marketItems: Item[];
    marketRefreshTime: number;

    // Inventory
    inventory: Item[];
    equipped: Partial<Record<GearSlot, Item>>;
    maxInventorySize: number;

    // Scrap & Mastery
    scrap: number;
    slotLevels: Record<GearSlot, number>;

    // Smuggling
    smuggling: {
        active: boolean;
        endTime: number;
        slot: GearSlot | null;
        rarity: Rarity | null;
        claimed: boolean;
    };

    // Meta / Save Data
    reputation: number; // Unspent Prestige Points
    prestigeUpgrades: Record<string, number>; // id -> level
    startTime: number;
    lastSaveTime: number;
    incomePerSecond: number;
    jailTime: number;
    tutorialStep: number;
    soundEnabled: boolean;

    // Financials
    bankBalance: number;
    stockPortfolio: Record<string, number>;
    stockPrices: Record<string, number>;
    stockHistory: Record<string, number[]>;

    // Actions
    tick: (dt: number) => void;

    // Core Actions
    buyAsset: (assetId: string) => void;
    buyAssetMax: (assetId: string) => void;
    performCrime: (crimeId: string) => boolean;

    // Inventory Actions
    equipItem: (item: Item) => void;
    unequipItem: (slot: GearSlot) => void;
    sellItem: (itemId: string) => void;
    salvageItem: (itemId: string) => void;
    salvageFilteredItems: (rarity: Rarity) => void;
    upgradeSlot: (slot: GearSlot) => void;

    // Helper Actions
    subtractMoney: (amount: number) => void;
    addToInventory: (item: Item) => void;
    expandInventory: () => void;
    buyItem: (item: Item, cost: number) => void;

    // Upgrade Actions
    buyUpgrade: (upgradeId: string) => void;

    // Market Actions
    refreshMarket: (force?: boolean) => void;
    buyMarketItem: (item: Item) => void;
    startSmuggling: (slot: GearSlot, rarity: Rarity, cost: number, durationMinutes: number) => void;
    claimSmuggling: () => void;

    // Financial Actions
    depositToBank: (amount: number) => void;
    withdrawFromBank: (amount: number) => void;
    buyStock: (stockId: string, quantity: number) => void;
    sellStock: (stockId: string, quantity: number) => void;

    // Misc Actions
    bribePolice: () => void;
    toggleSound: () => void;
    resetGame: () => void;
    prestige: () => void;
    advanceTutorial: () => void;
    skipTutorial: () => void;

    // Debug
    addMoney: (amount: number) => void;
    clickMainButton: () => number;
}

const INITIAL_STATE = {
    money: 0,
    heat: 0,
    actionPoints: 100,
    netWorth: 0,
    power: 1,
    speed: 1,
    luck: 1,
    assets: ASSETS.reduce((acc, asset) => ({ ...acc, [asset.id]: { id: asset.id, level: 0, owned: false } }), {}),
    upgrades: {},
    marketItems: [],
    marketRefreshTime: 0,
    // Inventory
    inventory: [],
    equipped: {},
    maxInventorySize: 20, // Initial size

    // Scrap & Mastery
    scrap: 0,
    slotLevels: {
        [GearSlot.WEAPON]: 0,
        [GearSlot.ARMOR]: 0,
        [GearSlot.TOOL]: 0,
        [GearSlot.ACCESSORY]: 0,
        [GearSlot.OUTFIT]: 0,
    },
    smuggling: {
        active: false,
        endTime: 0,
        slot: null,
        rarity: null,
        claimed: false
    },

    reputation: 0,
    prestigeUpgrades: {
        'starter_kit': 0,
        'connection_master': 0,
        'heat_resist': 0
    },
    startTime: Date.now(),
    lastSaveTime: Date.now(),
    incomePerSecond: 0,
    jailTime: 0,
    tutorialStep: 0,
    soundEnabled: true,

    // Financials
    bankBalance: 0,
    stockPortfolio: {},
    stockPrices: STOCKS.reduce((acc, stock) => ({ ...acc, [stock.id]: stock.basePrice }), {}),
    stockHistory: STOCKS.reduce((acc, stock) => ({ ...acc, [stock.id]: [stock.basePrice] }), {}),
};

export const useGameStore = create<GameState>()(
    persist(
        (set, get) => ({
            ...INITIAL_STATE,

            tick: (dt: number) => {
                const state = get();
                const now = Date.now();

                // Smuggling Check
                let newSmuggling = state.smuggling;
                if (state.smuggling.active && !state.smuggling.claimed && now >= state.smuggling.endTime) {
                    newSmuggling = { ...state.smuggling, claimed: true };
                }

                // 1. Calculate Passive Income
                // BaseIncome/sec = Base × (Power ^ 1.2) - Handled in Asset Logic agg

                let totalAssetIncome = 0;
                ASSETS.forEach(def => {
                    const assetState = state.assets[def.id];
                    if (assetState && assetState.level > 0) {
                        const income = FORMULAS.calculateAssetIncome(def.baseIncome, assetState.level);
                        totalAssetIncome += income;
                    }
                });

                // Apply Multipliers
                // Income/sec = BaseIncome × AssetMultiplier × (1 + CapitalBonus) × PrestigeMultiplier
                const capitalBonus = FORMULAS.calculateCapitalBonus(state.money);

                // Prestige Multiplier = 1 + (Unspent Reputation * 10%)
                const prestigeMultiplier = 1 + (state.reputation * 0.1);

                // Calculate Gear Bonus (Income)
                let gearIncomeBonus = 0;
                Object.values(state.equipped).forEach(item => {
                    if (item?.effects.incomeBonus) gearIncomeBonus += item.effects.incomeBonus;
                });

                const assetMultiplier = 1 + gearIncomeBonus; // Gear adds to Asset Multiplier for now

                let incomePerSecond = totalAssetIncome * assetMultiplier * (1 + capitalBonus) * prestigeMultiplier;

                // Add Base Income from Power Stats (Clicker/Active base? Or just free flow?)
                // Spec: "BaseIncome/sec = Base × (Power ^ 1.2)" -> If this implies a 'base' unrelated to assets.
                // Let's assume a small base income exists or it's 0. Let's give 0 for now until first asset/click.

                // Income for this tick (dt is in ms)
                const incomeThisTick = (incomePerSecond * dt) / 1000;

                // 2. Heat Decay & Jail Timer
                let newHeat = state.heat;
                let newJailTime = state.jailTime;

                if (state.jailTime > 0) {
                    newJailTime = Math.max(0, state.jailTime - dt);
                    // While in jail, heat resets when time is up? Or stays high?
                    // Let's say heat drops to 0 when released naturally.
                    if (newJailTime === 0) {
                        newHeat = 0;
                    }
                } else {
                    // Heat Decay only when not in jail
                    // Upgrade: Smooth Talker (+10% per level)
                    const smoothTalkerLevel = state.upgrades['smooth_talker'] || 0;
                    const decayMultiplier = 1 + (smoothTalkerLevel * 0.1);

                    const heatDecay = ((1 * dt) / 1000) * decayMultiplier;
                    newHeat = Math.max(0, state.heat - heatDecay);
                }

                // 4. Market Rotation Check
                let newMarketItems = state.marketItems;
                let newMarketDetails = { time: state.marketRefreshTime };

                if (now > state.marketRefreshTime) {
                    // Auto Refresh logic duplicate (refactor later or keep simple)
                    // We call refresh logic inside? simpler to just mark a flag or do it here.
                    // Let's do it here for atomic update logic
                    const itemCount = 3 + (state.upgrades['connections'] ? 1 : 0); // Connections maybe gives more slots? Or just luck? Let's say luck.
                    // Let's just generate 3 items for now.
                    const generated: Item[] = [];
                    for (let i = 0; i < 4; i++) { // Generate 4 items
                        const item = generateLoot(2, state.luck); // Tier 2 loot
                        if (item) {
                            // Assign random cost based on rarity
                            // This needs a cost field on Item? 
                            // Item interface doesn't have cost, let's ad-hoc it or add it.
                            // Current code in Market.tsx has hardcoded cost. 
                            // We need to extend Item or manage standard costs.
                            // Let's rely on rarity.
                            // Helper to calculate price?
                            generated.push(item);
                        }
                    }
                    newMarketItems = generated;
                    newMarketDetails.time = now + (30 * 60 * 1000); // 30 minutes
                }

                // 3. Action Regen
                // 3. Action Regen
                // Speed scales AP Regen: Base 5 + (Speed * 0.5)
                const speedBonus = state.speed * 0.5;
                const actionRegen = ((5 + speedBonus) * dt) / 1000;
                // Upgrade: Endurance Training (+50 AP per level)
                const enduranceLevel = state.upgrades['endurance_training'] || 0;
                const maxActionPoints = 100 + (enduranceLevel * 50);

                const newAction = Math.min(maxActionPoints, state.actionPoints + actionRegen);

                // --- Financial Updates ---
                let newBankBalance = state.bankBalance;
                // Bank Interest (Compound every tick might be heavy? Rate is small enough)
                // Interest = Balance * Rate * (dt/1000 * 10) -> Approx rate per tick
                // Let's keep it simple: Rate is per tick.
                // 100ms per tick. Rate 0.0001 per tick.
                if (state.bankBalance > 0) {
                    const interest = state.bankBalance * BANK_CONFIG.INTEREST_RATE;
                    newBankBalance += interest;
                }

                // Stock Market Update (Every 5 seconds? Or every tick but slow? Real-time feels better)
                // Random Walk
                let newStockPrices = { ...state.stockPrices };
                let newStockHistory = { ...state.stockHistory }; // Mutable copy is okay here since we replace content
                const stockUpdateChance = 0.1; // 10% chance per tick to update a stock price (jitter)

                STOCKS.forEach(stock => {
                    const currentPrice = state.stockPrices[stock.id] || stock.basePrice;

                    if (Math.random() < stockUpdateChance) {
                        const fluctuation = (Math.random() - 0.5) * 2 * stock.volatility; // -Volatility to +Volatility
                        // Bias towards base price if too far? Mean reversion.
                        const deviation = (currentPrice - stock.basePrice) / stock.basePrice;
                        const reversion = -deviation * 0.05; // 5% pull back to center

                        const changePercent = fluctuation + reversion;
                        let newPrice = currentPrice * (1 + changePercent);
                        newPrice = Math.max(1, newPrice); // Min price $1

                        newStockPrices[stock.id] = newPrice;

                        // History Update
                        const history = state.stockHistory[stock.id] || [];
                        // Keep last 20 points
                        const newHistory = [...history, newPrice];
                        if (newHistory.length > 20) newHistory.shift();
                        newStockHistory[stock.id] = newHistory;
                    }
                });

                set({
                    money: state.money + incomeThisTick,
                    netWorth: state.netWorth + incomeThisTick,
                    actionPoints: newAction,
                    heat: newHeat,
                    jailTime: newJailTime,
                    marketItems: newMarketItems,
                    marketRefreshTime: newMarketDetails.time,
                    lastSaveTime: now,
                    incomePerSecond: incomePerSecond,
                    bankBalance: newBankBalance,
                    stockPrices: newStockPrices,
                    stockHistory: newStockHistory,
                    smuggling: newSmuggling
                });
            },

            buyAsset: (assetId: string) => {
                const state = get();
                const assetDef = ASSETS.find(a => a.id === assetId);
                const assetState = state.assets[assetId];

                if (!assetDef || !assetState) return;

                const cost = FORMULAS.calculateAssetCost(assetDef.baseCost, assetState.level);

                if (state.money >= cost) {
                    set((prev) => ({
                        money: prev.money - cost,
                        assets: {
                            ...prev.assets,
                            [assetId]: {
                                ...assetState,
                                level: assetState.level + 1,
                                owned: true,
                            }
                        }
                    }));
                }
            },

            buyAssetMax: (assetId: string) => {
                const state = get();
                const assetDef = ASSETS.find(a => a.id === assetId);
                const assetState = state.assets[assetId];

                if (!assetDef || !assetState) return;

                const nextCost = FORMULAS.calculateAssetCost(assetDef.baseCost, assetState.level);

                if (state.money < nextCost) return;

                // Calculate max levels affordable (Geometric Series Sum)
                // Sum = a * (r^n - 1) / (r - 1)
                // r = 1.15
                // a = nextCost
                // solve for n: n = log_r( (Money * (r-1) / a) + 1 )

                const r = 1.15;
                const maxLevels = Math.floor(
                    Math.log((state.money * (r - 1) / nextCost) + 1) / Math.log(r)
                );

                if (maxLevels > 0) {
                    const totalCost = nextCost * (Math.pow(r, maxLevels) - 1) / (r - 1);

                    // Safety check (rounding errors might make totalCost slightly > money)
                    if (totalCost > state.money) {
                        // slightly reduce levels or just clamp cost? 
                        // If floating point error, it's safer to re-run with maxLevels - 1 or just loop?
                        // Formula is reliable enough for games, usually safe margin is fine.
                        // Let's rely on formula but recalculate cost exactly.
                    }

                    set((prev) => ({
                        money: prev.money - totalCost,
                        assets: {
                            ...prev.assets,
                            [assetId]: {
                                ...assetState,
                                level: assetState.level + maxLevels,
                                owned: true,
                            }
                        }
                    }));
                }
            },

            performCrime: (crimeId: string) => {
                const state = get();
                const crime = CRIMES.find(c => c.id === crimeId);
                if (!crime) return false;

                if (state.jailTime > 0) return false; // In Jail

                // Check for Arrest (Heat >= 100)
                if (state.heat >= 100) {
                    set({ jailTime: 30000 }); // 30 seconds jail
                    return false;
                }

                if (state.actionPoints < crime.actionCost) return false;

                // Check Inventory Space if loot drops
                // We don't know if loot drops yet, but if full, we might lose it?
                // Or prevent crime? Let's prevent crime if full to be safe/nice.
                if (state.inventory.length >= state.maxInventorySize) {
                    // Ideally show a toast, but for now just return false (fail/block)
                    // Or let them perform crime but lose loot?
                    // Let's BLOCK.
                    return false;
                }

                // ... (rest of logic calculation)

                // Calculate Success
                let powerBonus = state.power;
                let luckBonus = state.luck;
                let heatReduction = 0;
                let crimeSuccessBonus = 0;

                // Apply Gear Stats
                // Apply Gear Stats
                Object.values(state.equipped).forEach(item => {
                    if (item?.effects.crimeSuccess) crimeSuccessBonus += item.effects.crimeSuccess;
                    if (item?.effects.heatReduction) heatReduction += item.effects.heatReduction;
                    if (item?.effects.luckBonus) luckBonus += item.effects.luckBonus;
                });

                // Upgrade: Planning Mastery (+2% Success per level)
                const planningLevel = state.upgrades['planning_mastery'] || 0;
                const planningBonus = planningLevel * 0.02;

                const successChance = FORMULAS.calculateCrimeSuccess(
                    crime.baseSuccessChance + crimeSuccessBonus + planningBonus,
                    powerBonus,
                    luckBonus,
                    state.heat
                );

                const isSuccess = Math.random() < successChance;

                // Base Reward is based on Income/sec * RiskMultiplier
                const baseIncomeRef = Math.max(10, state.incomePerSecond);

                let newMoney = state.money;
                let newHeat = state.heat;
                let newInventory = [...state.inventory];
                let lootDropped = false;

                if (isSuccess) {
                    // Upgrade: Connections (+5% money)
                    const connectionsLevel = state.upgrades['connections'] || 0;
                    const connectionBonus = 1 + (connectionsLevel * 0.05);

                    const reward = baseIncomeRef * crime.riskMultiplier * connectionBonus;

                    // Power Bonus to Reward: +2% per Power
                    const powerRewardMultiplier = 1 + (powerBonus * 0.02);
                    const finalReward = reward * powerRewardMultiplier;

                    newMoney += finalReward;
                    // Heat gain on success (small)
                    const heatGain = Math.floor(Math.random() * (crime.maxHeat - crime.minHeat + 1)) + crime.minHeat;
                    newHeat += Math.max(0, heatGain - heatReduction); // Apply reduction

                    // Loot Drop Logic
                    // Double check inventory limit again just in case (though we checked above)
                    if (newInventory.length < state.maxInventorySize) {
                        const loot = generateLoot(crime.tier, luckBonus);
                        if (loot) {
                            newInventory.push(loot);
                            lootDropped = true;
                        }
                    }

                } else {
                    // Failure
                    // Penalty: Heat increases more
                    newHeat += Math.max(1, crime.baseHeatError - (heatReduction * 0.5)); // Less reduction on fail
                }

                set({
                    money: newMoney,
                    actionPoints: state.actionPoints - crime.actionCost,
                    heat: newHeat,
                    inventory: newInventory,
                    netWorth: isSuccess ? state.netWorth + (baseIncomeRef * crime.riskMultiplier) : state.netWorth
                });

                return isSuccess;
            },

            equipItem: (item: Item) => {
                const state = get();
                const oldItem = state.equipped[item.slot];

                // If swapping (oldItem exists), inventory count stays same.
                // If equipping empty slot, inventory count decreases by 1 (item moves to equipped).
                // So limits are fine.

                const newEquipped = { ...state.equipped, [item.slot]: item };
                let newInventory = state.inventory.filter(i => i.id !== item.id);

                if (oldItem) {
                    newInventory.push(oldItem); // Return old item to inventory
                }

                set({ equipped: newEquipped, inventory: newInventory });
            },

            unequipItem: (slot: GearSlot) => {
                const state = get();
                const item = state.equipped[slot];
                if (!item) return;

                if (state.inventory.length >= state.maxInventorySize) return; // Cannot unequip if full

                const newEquipped = { ...state.equipped };
                delete newEquipped[slot];

                set({
                    equipped: newEquipped,
                    inventory: [...state.inventory, item]
                });
            },

            sellItem: (itemId: string) => {
                // Deprecated or alternative to salvage?
                // Let's keep sell for money if someone REALLY needs money, but UI might hide it?
                // User wants "Trash" -> Useful.
                // Let's keep sellItem as is, but implementing salvageItem as primary.
                const state = get();
                const item = state.inventory.find(i => i.id === itemId);
                if (!item) return;

                const salvageValue = 100 * RARITY_MULTIPLIERS[item.rarity];

                set({
                    inventory: state.inventory.filter(i => i.id !== itemId),
                    money: state.money + salvageValue
                });
            },

            salvageItem: (itemId: string) => {
                const state = get();
                const item = state.inventory.find(i => i.id === itemId);
                if (!item) return;

                // Scrap Value: Common=1, Uncommon=3, Rare=10, Epic=50, Legendary=250
                let scrapValue = 1;
                switch (item.rarity) {
                    case 'common': scrapValue = 1; break;
                    case 'uncommon': scrapValue = 3; break;
                    case 'rare': scrapValue = 10; break;
                    case 'epic': scrapValue = 50; break;
                    case 'legendary': scrapValue = 250; break;
                }

                set({
                    inventory: state.inventory.filter(i => i.id !== itemId),
                    scrap: state.scrap + scrapValue
                });
            },

            salvageFilteredItems: (rarity: Rarity) => {
                const state = get();
                const itemsToSalvage = state.inventory.filter(i => i.rarity === rarity);

                if (itemsToSalvage.length === 0) return;

                let totalScrap = 0;
                itemsToSalvage.forEach(item => {
                    let scrapValue = 1;
                    switch (item.rarity) {
                        case 'common': scrapValue = 1; break;
                        case 'uncommon': scrapValue = 3; break;
                        case 'rare': scrapValue = 10; break;
                        case 'epic': scrapValue = 50; break;
                        case 'legendary': scrapValue = 250; break;
                    }
                    totalScrap += scrapValue;
                });

                set({
                    inventory: state.inventory.filter(i => i.rarity !== rarity),
                    scrap: state.scrap + totalScrap
                });
            },

            upgradeSlot: (slot: GearSlot) => {
                const state = get();
                const currentLevel = state.slotLevels[slot] || 0;

                const cost = FORMULAS.calculateSlotUpgradeCost(currentLevel);

                if (state.scrap >= cost) {
                    set({
                        scrap: state.scrap - cost,
                        slotLevels: {
                            ...state.slotLevels,
                            [slot]: currentLevel + 1
                        }
                    });
                }
            },

            startSmuggling: (slot: GearSlot, rarity: Rarity, cost: number, durationMinutes: number) => {
                const state = get();
                if (state.money < cost || state.smuggling.active) return;

                set({
                    money: state.money - cost,
                    smuggling: {
                        active: true,
                        endTime: Date.now() + (durationMinutes * 60 * 1000),
                        slot,
                        rarity,
                        claimed: false
                    }
                });
            },

            claimSmuggling: () => {
                const state = get();
                const { smuggling, inventory, maxInventorySize } = state;

                if (!smuggling.active || !smuggling.claimed || inventory.length >= maxInventorySize) return;

                if (smuggling.slot && smuggling.rarity) {
                    const item = generateSpecificLoot(smuggling.slot, smuggling.rarity);
                    set({
                        inventory: [...inventory, item],
                        smuggling: {
                            active: false,
                            endTime: 0,
                            slot: null,
                            rarity: null,
                            claimed: false
                        }
                    });
                }
            },

            subtractMoney: (amount: number) => set((state) => ({ money: state.money - amount })),
            addToInventory: (item: Item) => set((state) => ({ inventory: [...state.inventory, item] })),
            expandInventory: () => set((state) => ({ maxInventorySize: state.maxInventorySize + 5 })),
            buyItem: (item: Item, cost: number) => set((state) => ({
                money: state.money - cost,
                inventory: [...state.inventory, item]
            })),

            // ... (keep buyUpgrade etc) ...

            buyUpgrade: (upgradeId: string) => {
                // ... existing code ...
                const state = get();
                const upgradeDef = UPGRADES.find(u => u.id === upgradeId);
                if (!upgradeDef) return;

                const currentLevel = state.upgrades[upgradeId] || 0;
                const cost = FORMULAS.calculateTechCost(upgradeDef.baseCost, currentLevel);

                if (state.money >= cost) {
                    const newUpgrades = { ...state.upgrades, [upgradeId]: currentLevel + 1 };

                    // Apply One-time effects
                    let newMaxInventory = state.maxInventorySize;
                    if (upgradeId === 'deep_pockets') {
                        newMaxInventory += 2;
                    }

                    let newLuck = state.luck;
                    if (upgradeId === 'lucky_charm') {
                        newLuck += 1;
                    }

                    set({
                        money: state.money - cost,
                        upgrades: newUpgrades,
                        maxInventorySize: newMaxInventory,
                        luck: newLuck
                    });
                }
            },

            bribePolice: () => set((state) => {
                const bribeCost = Math.floor(state.money * 0.5);
                return {
                    money: state.money - bribeCost,
                    jailTime: 0,
                    heat: 0
                };
            }),

            refreshMarket: (force = false) => {
                const state = get();
                const REFRESH_COST = 5000;
                if (force && state.money < REFRESH_COST) return;

                const generated: Item[] = [];
                const count = 3;

                for (let i = 0; i < count; i++) {
                    const item = generateLoot(2, state.luck);
                    if (item) generated.push(item);
                }

                set({
                    marketItems: generated,
                    marketRefreshTime: Date.now() + (30 * 60 * 1000),
                    money: force ? state.money - REFRESH_COST : state.money
                });
            },

            buyMarketItem: (item: Item) => {
                const state = get();
                const cost = ITEM_PRICES[item.rarity] || 500;

                if (state.money < cost) return;
                if (state.inventory.length >= state.maxInventorySize) return; // Limit check

                // Verify item is in market
                if (!state.marketItems.find(i => i.id === item.id)) return;

                set({
                    money: state.money - cost,
                    inventory: [...state.inventory, item],
                    marketItems: state.marketItems.filter(i => i.id !== item.id)
                });
            },

            // ... rest of actions

            resetGame: () => {
                set(INITIAL_STATE);
            },

            prestige: () => {
                const state = get();
                const gain = FORMULAS.calculatePrestigeGain(state.netWorth);

                if (gain <= 0) return;

                const newReputation = state.reputation + gain;

                // Keep Prestige Upgrades
                const savedUpgrades = state.prestigeUpgrades;

                set({
                    ...INITIAL_STATE,
                    reputation: newReputation,
                    prestigeUpgrades: savedUpgrades, // KEEP prestige upgrades

                    // Permanent Stats (if we keep them? Actually, plan says Keep Upgrades)
                    // Wait, Plan says: "Resets: Money, Bank, Stocks, Assets, Heat, JailTime."
                    // "Keeps: Upgrades (maybe? or reset them but give huge bonus?)"
                    // Decision: Reset Upgrades (Connections etc) but keep Skill?
                    // "Reset Upgrades too..."
                    // "Keeps: Scrap & Slot Levels (Permanent Progression)"

                    // Permanent Mastery & Scrap
                    scrap: state.scrap,
                    slotLevels: state.slotLevels,

                    tutorialStep: 99,
                    soundEnabled: state.soundEnabled,

                    // Apply Starter Kit Bonus
                    money: (savedUpgrades['starter_kit'] || 0) * 10000,
                });
            },

            buyPrestigeUpgrade: (upgradeId: string) => {
                const state = get();
                const upgradeDef = PRESTIGE_UPGRADES_DATA.find(u => u.id === upgradeId);
                if (!upgradeDef) return;

                const currentLevel = state.prestigeUpgrades[upgradeId] || 0;
                // Cost Logic: Flat or scaling? 
                // Plan: Cost: 5 Rep, 20 Rep... 
                // Let's assume linear or static cost for now based on Plan (Cost: 5 Rep). 
                // Or scaling? "Cost: 5 Rep" usually implies Base Cost.
                // Let's make it additive for now: cost + (level * cost)? Or simple exponential.
                // Plan says: "Cost: 5 Rep". Let's stick to baseCost + level * baseCost?
                // Or just Base Cost.
                // Let's use: Cost = BaseCost * (Level + 1)
                const cost = upgradeDef.baseCost * (currentLevel + 1);

                if (state.reputation < cost) return;

                set({
                    reputation: state.reputation - cost,
                    prestigeUpgrades: {
                        ...state.prestigeUpgrades,
                        [upgradeId]: currentLevel + 1
                    }
                });
            },

            advanceTutorial: () => set((state) => ({ tutorialStep: state.tutorialStep + 1 })),
            skipTutorial: () => set({ tutorialStep: 99 }),

            // --- Financial Actions ---
            depositToBank: (amount: number) => {
                const state = get();
                if (amount <= 0 || state.money < amount) return;

                const fee = amount * BANK_CONFIG.DEPOSIT_FEE;
                const netDeposit = amount - fee;

                set({
                    money: state.money - amount,
                    bankBalance: state.bankBalance + netDeposit
                });
            },

            withdrawFromBank: (amount: number) => {
                const state = get();
                if (amount <= 0 || state.bankBalance < amount) return;

                set({
                    money: state.money + amount,
                    bankBalance: state.bankBalance - amount
                });
            },

            buyStock: (stockId: string, quantity: number) => {
                const state = get();
                const price = state.stockPrices[stockId];
                if (!price) return;

                const cost = price * quantity;
                if (state.money < cost) return;

                const currentQty = state.stockPortfolio[stockId] || 0;

                set({
                    money: state.money - cost,
                    stockPortfolio: {
                        ...state.stockPortfolio,
                        [stockId]: currentQty + quantity
                    }
                });
            },

            sellStock: (stockId: string, quantity: number) => {
                const state = get();
                const price = state.stockPrices[stockId];
                const currentQty = state.stockPortfolio[stockId] || 0;

                if (!price || currentQty < quantity) return;

                const revenue = price * quantity;
                const newQty = currentQty - quantity;

                // Remove key if 0? Or just set to 0. Set to 0 is safer for React render.
                set({
                    money: state.money + revenue,
                    stockPortfolio: {
                        ...state.stockPortfolio,
                        [stockId]: newQty
                    }
                });
            },

            toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

            addMoney: (amount) => set((state) => ({ money: state.money + amount, netWorth: state.netWorth + amount })),

            clickMainButton: () => {
                const state = get();
                // Base: $10
                // Power Scaling: + ($5 * Power)
                // Scaling: 5% of Income Per Second
                const base = 10;
                const powerBonus = state.power * 5;
                const incomeBonus = state.incomePerSecond * 0.05;

                // Prestige Multiplier
                const prestigeMultiplier = 1 + (state.reputation * 0.1);

                const totalGain = (base + powerBonus + incomeBonus) * prestigeMultiplier;

                set({
                    money: state.money + totalGain,
                    netWorth: state.netWorth + totalGain
                });

                return totalGain;
            },
        }),
        {
            name: 'idle-crime-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
