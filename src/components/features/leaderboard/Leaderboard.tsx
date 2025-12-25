import React, { useMemo } from 'react';
import { useGameStore } from '../../../store/useGameStore';
import { formatMoney } from '../../../lib/utils';
import { Crown } from 'lucide-react';

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
        const rivals: LeaderboardEntry[] = [];
        for (let i = 0; i < 15; i++) {
            // Seed random with index to keep it stable-ish during same netWorth?
            // Actually, for pure visual demo, Math.random is acceptable as long as it doesn't flicker too much.
            // But strict mode might cause double render flicker.

            // To make it feel "alive", we base it on netWorth roughly but with variance.
            const variance = 0.5 + (Math.sin(i * 100) + 1); // Deterministic pseudo-random
            const multiplier = 0.1 * Math.pow(1.5, i); // Exponential growth curve for ranking

            rivals.push({
                rank: 0,
                name: RIVAL_NAMES[i % RIVAL_NAMES.length],
                netWorth: Math.max(5000, 1000000 * multiplier * variance),
                isPlayer: false
            });
        }

        rivals.push({
            rank: 0,
            name: "คุณ (You)",
            netWorth: netWorth,
            isPlayer: true
        });

        rivals.sort((a, b) => b.netWorth - a.netWorth);

        return rivals.map((entry, index) => ({ ...entry, rank: index + 1 }));
    }, [netWorth]);

    // Find top 3
    const top3 = leaderboardData.slice(0, 3);
    const others = leaderboardData.slice(3);

    return (
        <div className="space-y-6 pb-24">
            <div className="text-center space-y-1">
                <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-b from-gold to-yellow-600 flex items-center justify-center gap-2 drop-shadow-md">
                    <Crown fill="currentColor" size={24} /> อันดับอาชญากร
                </h2>
                <p className="text-xs text-gray-400">ใครคือราชันย์แห่งโลกใต้ดิน?</p>
            </div>

            {/* Podium for Top 3 */}
            <div className="grid grid-cols-3 gap-2 items-end px-2 mb-8">
                {/* 2nd Place */}
                <div className="flex flex-col items-center gap-2">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full border-2 border-gray-300 bg-surface flex items-center justify-center text-gray-300 font-bold overflow-hidden">
                            #{top3[1].rank}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-[10px] font-bold text-gray-300 line-clamp-1">{top3[1].name}</div>
                        <div className="text-[9px] font-mono text-gray-400">{formatMoney(top3[1].netWorth)}</div>
                    </div>
                    <div className="w-full h-16 bg-gradient-to-t from-gray-300/20 to-transparent rounded-t-lg" />
                </div>

                {/* 1st Place */}
                <div className="flex flex-col items-center gap-2 -mt-6">
                    <Crown className="text-gold animate-bounce" size={24} fill="currentColor" />
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full border-4 border-gold bg-surface flex items-center justify-center text-gold font-black text-xl overflow-hidden shadow-[0_0_20px_rgba(255,215,0,0.3)]">
                            #{top3[0].rank}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-xs font-black text-gold line-clamp-1">{top3[0].name}</div>
                        <div className="text-[10px] font-mono text-yellow-100 font-bold">{formatMoney(top3[0].netWorth)}</div>
                    </div>
                    <div className="w-full h-24 bg-gradient-to-t from-gold/20 to-transparent rounded-t-lg" />
                </div>

                {/* 3rd Place */}
                <div className="flex flex-col items-center gap-2">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full border-2 border-amber-700 bg-surface flex items-center justify-center text-amber-700 font-bold overflow-hidden">
                            #{top3[2].rank}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-[10px] font-bold text-amber-700 line-clamp-1">{top3[2].name}</div>
                        <div className="text-[9px] font-mono text-gray-400">{formatMoney(top3[2].netWorth)}</div>
                    </div>
                    <div className="w-full h-12 bg-gradient-to-t from-amber-700/20 to-transparent rounded-t-lg" />
                </div>
            </div>

            {/* List for the rest */}
            <div className="bg-surface/50 rounded-2xl border border-white/5 overflow-hidden mx-2">
                <div className="px-4 py-2 bg-black/20 text-[10px] uppercase text-gray-500 font-bold flex justify-between">
                    <span>อันดับ</span>
                    <span>มูลค่าทรัพย์สิน</span>
                </div>
                {others.map((entry) => (
                    <div
                        key={`${entry.name}-${entry.rank}`}
                        className={`flex items-center justify-between p-3 border-b border-white/5 last:border-0 transition-colors
                            ${entry.isPlayer ? 'bg-money/10 border-money/30' : 'hover:bg-white/5'}
                        `}
                    >
                        <div className="flex items-center gap-3">
                            <span className="font-mono text-sm text-gray-500 w-6">#{entry.rank}</span>
                            <div className="flex flex-col">
                                <span className={`text-sm font-bold ${entry.isPlayer ? 'text-money' : 'text-gray-300'}`}>
                                    {entry.name}
                                </span>
                            </div>
                        </div>
                        <span className="font-mono text-xs text-gray-300">
                            {formatMoney(entry.netWorth)}
                        </span>
                    </div>
                ))}
            </div>

            {/* Sticky Player stat if not in top list (Optional polish) */}
            <div className="text-center text-[10px] text-gray-600 mt-4">
                * ข้อมูลมีการอัปเดตแบบเรียลไทม์
            </div>
        </div>
    );
};
