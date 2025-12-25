import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ASSETS, CRIMES, FORMULAS, GAME_CONFIG, Item, GearSlot, RARITY_MULTIPLIERS, UPGRADES, ITEM_PRICES, BANK_CONFIG, STOCKS } from '../lib/constants';
import { generateLoot } from '../lib/generators';

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

    prestigeMultiplier: number;
    startTime: number;
    lastSaveTime: number;

    // Tutorial
    tutorialStep: number; // 0 = start, 99 = done

    // Financials
    bankBalance: number;
    stockPortfolio: Record<string, number>; // stockId -> quantity owned
    stockPrices: Record<string, number>; // stockId -> currentPrice
    stockHistory: Record<string, number[]>; // stockId -> price history (for graph)

    // Computed / Helpers
    incomePerSecond: number;

    // State
    jailTime: number; // in milliseconds

    // Actions
    tick: (dt: number) => void;
    buyAsset: (assetId: string) => void;
    performCrime: (crimeId: string) => boolean; // returns success
    equipItem: (item: Item) => void;
    unequipItem: (slot: GearSlot) => void;
    sellItem: (itemId: string) => void; // Fixed type to string
    subtractMoney: (amount: number) => void;
    addToInventory: (item: Item) => void;
    expandInventory: () => void;
    buyItem: (item: Item, cost: number) => void;
    buyUpgrade: (upgradeId: string) => void;

    refreshMarket: (force?: boolean) => void;
    buyMarketItem: (item: Item) => void;

    // Financial Actions
    depositToBank: (amount: number) => void;
    withdrawFromBank: (amount: number) => void;
    buyStock: (stockId: string, quantity: number) => void;
    sellStock: (stockId: string, quantity: number) => void;

    bribePolice: () => void;

    resetGame: () => void;
    prestige: () => void;

    advanceTutorial: () => void;
    skipTutorial: () => void;

    // Setters (for debug or internal use)
    addMoney: (amount: number) => void;
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

    prestigeMultiplier: 1,
    startTime: Date.now(),
    lastSaveTime: Date.now(),
    incomePerSecond: 0,
    jailTime: 0,
    tutorialStep: 0,

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

                // Calculate Gear Bonus (Income)
                let gearIncomeBonus = 0;
                Object.values(state.equipped).forEach(item => {
                    if (item?.effects.incomeBonus) gearIncomeBonus += item.effects.incomeBonus;
                });

                const assetMultiplier = 1 + gearIncomeBonus; // Gear adds to Asset Multiplier for now

                let incomePerSecond = totalAssetIncome * assetMultiplier * (1 + capitalBonus) * state.prestigeMultiplier;

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
                const actionRegen = (5 * dt) / 1000; // 5 AP per sec
                const newAction = Math.min(100, state.actionPoints + actionRegen);

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
                    stockHistory: newStockHistory
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

                // Calculate Success
                let powerBonus = state.power;
                let luckBonus = state.luck;
                let heatReduction = 0;
                let crimeSuccessBonus = 0;

                // Apply Gear Stats
                Object.values(state.equipped).forEach(item => {
                    if (item?.effects.crimeSuccess) crimeSuccessBonus += item.effects.crimeSuccess;
                    if (item?.effects.heatReduction) heatReduction += item.effects.heatReduction;
                    if (item?.effects.luckBonus) luckBonus += item.effects.luckBonus;
                });

                const successChance = FORMULAS.calculateCrimeSuccess(
                    crime.baseSuccessChance + crimeSuccessBonus,
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
                    newMoney += reward;
                    // Heat gain on success (small)
                    const heatGain = Math.floor(Math.random() * (crime.maxHeat - crime.minHeat + 1)) + crime.minHeat;
                    newHeat += Math.max(0, heatGain - heatReduction); // Apply reduction

                    // Loot Drop Logic
                    const loot = generateLoot(crime.tier, luckBonus);
                    if (loot) {
                        newInventory.push(loot);
                        lootDropped = true;
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

                const newEquipped = { ...state.equipped };
                delete newEquipped[slot];

                set({
                    equipped: newEquipped,
                    inventory: [...state.inventory, item]
                });
            },

            sellItem: (itemId: string) => {
                const state = get();
                const item = state.inventory.find(i => i.id === itemId);
                if (!item) return;

                // Simple salvage value
                const salvageValue = 100 * RARITY_MULTIPLIERS[item.rarity]; // Placeholder value formula

                set({
                    inventory: state.inventory.filter(i => i.id !== itemId),
                    money: state.money + salvageValue
                });
            },

            subtractMoney: (amount: number) => set((state) => ({ money: state.money - amount })),
            addToInventory: (item: Item) => set((state) => ({ inventory: [...state.inventory, item] })),
            expandInventory: () => set((state) => ({ maxInventorySize: state.maxInventorySize + 5 })),
            buyItem: (item: Item, cost: number) => set((state) => ({
                money: state.money - cost,
                inventory: [...state.inventory, item]
            })),

            addMoney: (amount) => set((state) => ({ money: state.money + amount, netWorth: state.netWorth + amount })),

            buyUpgrade: (upgradeId: string) => {
                const state = get();
                const upgradeDef = UPGRADES.find(u => u.id === upgradeId);
                if (!upgradeDef) return;

                const currentLevel = state.upgrades[upgradeId] || 0;
                const cost = FORMULAS.calculateTechCost(upgradeDef.baseCost, currentLevel);

                if (state.money >= cost) {
                    const newUpgrades = { ...state.upgrades, [upgradeId]: currentLevel + 1 };

                    // Apply One-time effects (like Inventory Size) or just rely on computed where possible
                    let newMaxInventory = state.maxInventorySize;
                    if (upgradeId === 'deep_pockets') {
                        newMaxInventory += 2;
                    }

                    // Apply Stat Upgrades (Luck)
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
                    heat: 0 // Clear heat on bribe
                };
            }),

            refreshMarket: (force = false) => {
                const state = get();
                // If force refresh, cost money
                const REFRESH_COST = 5000;
                if (force && state.money < REFRESH_COST) return;

                // Generate Items
                const generated: Item[] = [];
                // Base 3 items + Connections bonus?
                const count = 3;

                // Helper to get price based on rarity (Move to utils/formulas if reused)
                // For now, implicit pricing logic in UI. We need to respect that.

                for (let i = 0; i < count; i++) {
                    const item = generateLoot(2, state.luck); // Tier 2 base
                    if (item) generated.push(item);
                }

                set({
                    marketItems: generated,
                    marketRefreshTime: Date.now() + (30 * 60 * 1000), // 30 minutes
                    money: force ? state.money - REFRESH_COST : state.money
                });
            },

            buyMarketItem: (item: Item) => {
                const state = get();
                const cost = ITEM_PRICES[item.rarity] || 500;

                if (state.money < cost) return;

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
                const newMultiplier = FORMULAS.calculatePrestigeMultiplier(state.netWorth);

                // Keep Prestige Multiplier, Unlocks (Stats? Achievements? - For MVP maybe just Multiplier)
                // Reset Money, Assets
                set({
                    ...INITIAL_STATE,
                    prestigeMultiplier: newMultiplier,
                    // Keep stats if intended? Spec says "Reset: Money, Asset level. Keep: PrestigeMultiplier, Unlocks"
                    // We'll keep Stats (Power/Speed/Luck) as 'Unlocks' or progress for now, or reset them? 
                    // Usually stats are permanent or rebought. Let's keep them for now or it feels bad.
                    power: state.power,
                    speed: state.speed,
                    luck: state.luck,
                    tutorialStep: 99, // Skip tutorial on prestige
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
        }),
        {
            name: 'idle-crime-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
