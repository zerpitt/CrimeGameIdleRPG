import React, { useRef, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { ACHIEVEMENTS } from '../../lib/constants';
import { X, Trophy, Lock, CheckCircle2 } from 'lucide-react';
import { formatMoney } from '../../lib/utils';

interface AchievementsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ isOpen, onClose }) => {
    const { unlockedAchievements } = useGameStore();
    const modalRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const unlockedCount = unlockedAchievements?.length || 0;
    const totalCount = ACHIEVEMENTS.length;
    const progressPercent = Math.round((unlockedCount / totalCount) * 100);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                ref={modalRef}
                className="w-full max-w-2xl bg-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-yellow-500/20 rounded-lg text-yellow-500">
                            <Trophy size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">ความสำเร็จ (Achievements)</h2>
                            <div className="text-sm text-gray-400 mt-1">
                                ปลดล็อคแล้ว {unlockedCount}/{totalCount} ({progressPercent}%)
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="h-1 bg-white/5 w-full">
                    <div
                        className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-1000"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>

                {/* List */}
                <div className="p-6 overflow-y-auto custom-scrollbar space-y-4">
                    {ACHIEVEMENTS.map((ach) => {
                        const isUnlocked = unlockedAchievements?.includes(ach.id);

                        return (
                            <div
                                key={ach.id}
                                className={`
                                    relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-300
                                    ${isUnlocked
                                        ? 'bg-yellow-500/5 border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.05)]'
                                        : 'bg-white/5 border-white/5 opacity-70 grayscale'
                                    }
                                `}
                            >
                                {/* Icon */}
                                <div className={`
                                    w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0
                                    ${isUnlocked ? 'bg-yellow-500/20' : 'bg-black/40'}
                                `}>
                                    {isUnlocked ? ach.icon : <Lock size={18} className="text-gray-500" />}
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <h3 className={`font-bold ${isUnlocked ? 'text-yellow-100' : 'text-gray-400'}`}>
                                        {ach.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-0.5">
                                        {ach.description}
                                    </p>

                                    {/* Condition Status (Optional: could show progress like 50/1000) */}
                                    {/* We can calculate progress if we pull stats, but for now just showing status is fine */}
                                </div>

                                {/* Status Icon */}
                                <div className="shrink-0">
                                    {isUnlocked && (
                                        <div className="text-yellow-500 animate-in zoom-in spin-in-180 duration-500">
                                            <CheckCircle2 size={24} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
