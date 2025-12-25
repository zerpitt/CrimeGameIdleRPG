import { useEffect, useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { GAME_CONFIG } from '../lib/constants';
import { formatMoney } from '../lib/utils'; // Assuming you have this helper

export const useOfflineProgress = () => {
    const { lastSaveTime, incomePerSecond, addMoney } = useGameStore();
    const [offlineGains, setOfflineGains] = useState<{ time: number, money: number } | null>(null);

    useEffect(() => {
        const now = Date.now();
        const timeDiff = now - lastSaveTime;

        // Minimum 1 minute to count as "Offline"
        if (timeDiff > 60000 && incomePerSecond > 0) {
            // Cap at 12 hours (in ms)
            const maxTime = GAME_CONFIG.OFFLINE_CAP_HOURS * 3600000;
            const validTime = Math.min(timeDiff, maxTime);

            const income = (incomePerSecond * (validTime / 1000)) * GAME_CONFIG.OFFLINE_EFFICIENCY;

            if (income > 0) {
                // Apply gains
                addMoney(income);

                // Show modal/notification via state
                setOfflineGains({
                    time: validTime,
                    money: income
                });
            }
        }
    }, []); // Run once on mount

    return offlineGains;
};
