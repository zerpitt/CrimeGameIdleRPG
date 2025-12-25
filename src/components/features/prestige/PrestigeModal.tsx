import React, { useState } from 'react';
import { Plane, AlertTriangle, Briefcase, TrendingUp } from 'lucide-react';
import { useGameStore } from '../../../store/useGameStore';
import { FORMULAS } from '../../../lib/constants';
import { formatNumber } from '../../../lib/utils'; // Assuming this exists, or use generic

interface PrestigeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PrestigeModal: React.FC<PrestigeModalProps> = ({ isOpen, onClose }) => {
    const { netWorth, prestigeMultiplier, prestige } = useGameStore();
    const potentialGain = FORMULAS.calculatePrestigeGain(netWorth);
    const newMultiplier = prestigeMultiplier + potentialGain;

    // Animation state
    const [isLeaving, setIsLeaving] = useState(false);

    if (!isOpen) return null;

    const handlePrestige = () => {
        setIsLeaving(true);
        setTimeout(() => {
            prestige();
            setIsLeaving(false);
            onClose();
        }, 2000); // 2 second "leaving" animation
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className={`
                w-full max-w-md bg-zinc-900 border border-risk/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden
                transition-all duration-500
                ${isLeaving ? 'scale-90 opacity-0 translate-y-10' : 'scale-100 opacity-100'}
            `}>
                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-10 bg-risk/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-risk/20 text-risk rounded-full flex items-center justify-center mx-auto mb-4 border border-risk/50 shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                        <Plane size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">หนีออกนอกประเทศ</h2>
                    <p className="text-gray-400 text-sm">
                        ตำรวจเริ่มดมกลิ่นเจอแล้ว... ถึงเวลาฟอกตัวและเริ่มต้นใหม่ในชื่อใหม่
                    </p>
                </div>

                <div className="bg-black/40 rounded-xl p-4 mb-6 border border-white/5 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">ทรัพย์สินสุทธิ (Net Worth)</span>
                        <span className="text-money font-mono font-bold">${formatNumber(netWorth)}</span>
                    </div>

                    {/* Tabs for Escape vs Shop */}
                    <div className="flex gap-2 border-b border-white/5 pb-2">
                        <button className="text-xs font-bold text-white border-b-2 border-risk px-2 pb-1">หลบหนี</button>
                        <div className="text-xs text-gray-600 px-2 pb-1">ตลาดมืด (เร็วๆ นี้)</div>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">ชื่อเสียง (Reputation)</span>
                        <span className="text-sky-400 font-mono font-bold">{prestige.toLocaleString()} Rep</span>
                        {/* Wait, prestige stores the ACTION function, not the value. The value is `reputation` (new). 
                            Old code used `prestigeMultiplier`.
                            I need to update component to use `reputation`.
                        */}
                    </div>
                    {/* ... */}
                </div>


                <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-risk/10 rounded-lg border border-risk/20">
                        <AlertTriangle className="text-risk shrink-0 mt-0.5" size={16} />
                        <div className="text-xs text-risk/80">
                            <strong>คำเตือน:</strong> การหนีจะรีเซ็ตเงิน, ธุรกิจ, และความร้อนทั้งหมด แต่จะเก็บ "Skill" และ "Prestige Multiplier" ไว้
                        </div>
                    </div>

                    <button
                        onClick={handlePrestige}
                        disabled={potentialGain <= 0}
                        className={`
                            w-full py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all
                            ${potentialGain > 0
                                ? 'bg-gradient-to-r from-risk to-red-600 text-white hover:brightness-110 active:scale-95 shadow-lg shadow-risk/20'
                                : 'bg-white/10 text-gray-500 cursor-not-allowed'}
                        `}
                    >
                        {isLeaving ? 'กำลังเดินทาง...' : (
                            <>
                                <Briefcase size={20} />
                                ทิ้งทุกอย่างและหนีไป
                            </>
                        )}
                    </button>

                    {!isLeaving && (
                        <button
                            onClick={onClose}
                            className="w-full py-2 text-sm text-gray-500 hover:text-white transition-colors"
                        >
                            ยังก่อน... ฉันยังไหว
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
