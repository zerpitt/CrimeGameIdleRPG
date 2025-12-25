import React, { useMemo } from 'react';
import { useGameStore } from '../../../store/useGameStore';
import { formatMoney } from '../../../lib/utils';
import { Crown, User } from 'lucide-react';

interface LeaderboardEntry {
    rank: number;
    name: string;
    netWorth: number;
    isPlayer: boolean;
}

const RIVAL_NAMES = [
    "Don Salieri", "Vito Scaletta", "Tony Montana", "Walter White", "Gustavo Fring",
    "Michael Corleone", "Tommy Vercetti", "Carl Johnson", "Niko Bellic", "Arthur Morgan",
    "Dutch van der Linde", "Frank Lucas", "Al Capone", "Pablo Escobar", "El Chapo"
];

export const Leaderboard = () => {
    const { netWorth } = useGameStore();

    const leaderboardData = useMemo(() => {
        // Generate rivals based on player's net worth
        // Some above, some below
        const rivals: LeaderboardEntry[] = [];

        // Ensure player is always reachable but not #1 immediately unless super rich
        // Let's sim 10 rivals
        // Rivals range from 0.5x to 5x Player NetWorth

        // Seed random is strict in React render, so we just use Math.random for now inside useMemo 
        // (will refresh on netWorth change which is fine, kinda like live updates)

        for (let i = 0; i < 10; i++) {
            const multiplier = 0.8 + (Math.random() * 4); // 0.8x to 4.8x
            rivals.push({
                rank: 0,
                name: RIVAL_NAMES[i % RIVAL_NAMES.length],
                netWorth: Math.max(1000, netWorth * multiplier), // Min 1000 for rivals
                isPlayer: false
            });
        }

        // Add Player
        rivals.push({
            rank: 0,
            name: "คุณ (You)",
            netWorth: netWorth,
            isPlayer: true
        });

        // Add a "Kingpin" goal
        rivals.push({
            rank: 0,
            name: "เดอะ ก็อดฟาเธอร์",
            netWorth: Math.max(1000000000, netWorth * 100), // Very high goal
            isPlayer: false
        });

        // Sort
        rivals.sort((a, b) => b.netWorth - a.netWorth);

        // Assign Ranks
        return rivals.map((entry, index) => ({ ...entry, rank: index + 1 }));

    }, [netWorth]);

    // Find player index to ensure scroll/focus if list is long (not needed for short list)

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-black text-center text-gold drop-shadow-md flex items-center justify-center gap-2">
                <Crown fill="currentColor" /> อันดับอาชญากร
            </h2>

            <div className="bg-surface/50 rounded-xl border border-white/10 overflow-hidden backdrop-blur-sm">
                <div className="flex flex-col">
                    {leaderboardData.map((entry) => (
                        <div
                            key={`${entry.name}-${entry.rank}`}
                            className={`flex items-center justify-between p-4 border-b border-white/5 last:border-0 transition-colors
                                ${entry.isPlayer ? 'bg-money/10 border-money/30' : 'hover:bg-white/5'}
                            `}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm
                                    ${entry.rank === 1 ? 'bg-gold text-black shadow-[0_0_10px_gold]' :
                                        entry.rank === 2 ? 'bg-gray-300 text-black' :
                                            entry.rank === 3 ? 'bg-amber-700 text-white' : 'bg-white/10 text-gray-400'}
                                `}>
                                    {entry.rank}
                                </div>
                                <div className="flex flex-col">
                                    <span className={`font-bold ${entry.isPlayer ? 'text-money' : 'text-gray-300'}`}>
                                        {entry.name}
                                    </span>
                                    {entry.isPlayer && <span className="text-[10px] text-money uppercase tracking-wider">ตัวคุณ</span>}
                                </div>
                            </div>

                            <span className="font-mono text-gray-300 text-right">
                                {formatMoney(entry.netWorth)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="text-center text-xs text-gray-500 mt-4">
                สร้างเนื้อสร้างตัวเพื่อไต่อันดับโลก
            </div>
        </div>
    );
};
