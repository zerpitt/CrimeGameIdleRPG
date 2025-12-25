import React, { useState } from 'react';
import { Plane, AlertTriangle, Briefcase, TrendingUp, Skull, Crown, Star } from 'lucide-react';
import { useGameStore } from '../../../store/useGameStore';
import { FORMULAS, PRESTIGE_UPGRADES_DATA } from '../../../lib/constants';
import { formatNumber } from '../../../lib/utils';
import { useSound } from '../../../hooks/useSound';

interface PrestigeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PrestigeModal: React.FC<PrestigeModalProps> = ({ isOpen, onClose }) => {
    const { netWorth, reputation, prestige, prestigeUpgrades, buyPrestigeUpgrade } = useGameStore();
    const potentialGain = FORMULAS.calculatePrestigeGain(netWorth);
    const { playSuccess, playError } = useSound();

    // UI State
    const [activeTab, setActiveTab] = useState<'ESCAPE' | 'COUNCIL'>('ESCAPE');
    const [isLeaving, setIsLeaving] = useState(false);

    if (!isOpen) return null;

    const handlePrestige = () => {
        setIsLeaving(true);
        setTimeout(() => {
            prestige();
            setIsLeaving(false);
            onClose();
        }, 2000);
    };

    const handleBuyUpgrade = (id: string, cost: number) => {
        if (reputation >= cost) {
            buyPrestigeUpgrade(id);
            playSuccess();
        } else {
            playError();
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className={`
                w-full max-w-md bg-zinc-900 border border-risk/30 rounded-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]
                transition-all duration-500
                ${isLeaving ? 'scale-90 opacity-0 translate-y-10' : 'scale-100 opacity-100'}
            `}>
                {/* Header */}
                <div className="p-6 pb-2 text-center relative z-10">
                    <div className="w-16 h-16 bg-risk/20 text-risk rounded-full flex items-center justify-center mx-auto mb-4 border border-risk/50 shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                        {activeTab === 'ESCAPE' ? <Plane size={32} /> : <Skull size={32} />}
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                        {activeTab === 'ESCAPE' ? 'หนีออกนอกประเทศ' : 'สภาเงา (Shadow Council)'}
                    </h2>
                    <p className="text-gray-400 text-xs">
                        {activeTab === 'ESCAPE'
                            ? 'ตำรวจเริ่มดมกลิ่นเจอแล้ว... ถึงเวลาฟอกตัวและเริ่มต้นใหม่'
                            : 'ใช้เส้นสายและบารมีเพื่อสร้างรากฐานที่มั่นคงถาวร'}
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/5 mt-4">
                    <button
                        onClick={() => setActiveTab('ESCAPE')}
                        className={`flex-1 py-3 text-sm font-bold transition-colors relative ${activeTab === 'ESCAPE' ? 'text-white' : 'text-gray-600 hover:text-gray-400'}`}
                    >
                        แผนหลบหนี
                        {activeTab === 'ESCAPE' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-risk shadow-[0_0_10px_red]" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('COUNCIL')}
                        className={`flex-1 py-3 text-sm font-bold transition-colors relative ${activeTab === 'COUNCIL' ? 'text-purple-400' : 'text-gray-600 hover:text-gray-400'}`}
                    >
                        สภาเงา
                        {activeTab === 'COUNCIL' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 shadow-[0_0_10px_purple]" />}
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {activeTab === 'ESCAPE' ? (
                        <div className="space-y-6">
                            <div className="bg-black/40 rounded-xl p-4 border border-white/5 space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400">ทรัพย์สินสุทธิ</span>
                                    <span className="text-money font-mono font-bold">${formatNumber(netWorth)}</span>
                                </div>
                                <div className="w-full h-px bg-white/5" />
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400">จะได้รับชื่อเสียง</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-purple-400 font-mono font-bold text-lg">+{Math.floor(potentialGain).toLocaleString()}</span>
                                        <Star size={14} className="text-purple-400" fill="currentColor" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 bg-risk/10 rounded-lg border border-risk/20">
                                <AlertTriangle className="text-risk shrink-0 mt-0.5" size={16} />
                                <div className="text-xs text-risk/80 leading-relaxed">
                                    <strong>คำเตือน:</strong> การหนีจะรีเซ็ต <u>เงิน, ธุรกิจ, และค่า Heat</u> ทั้งหมด <br />
                                    แต่คุณจะได้รับ <strong>ชื่อเสียง (Reputation)</strong> เพื่อใช้ซื้อความสามารถถาวรในสภาเงา
                                </div>
                            </div>

                            <button
                                onClick={handlePrestige}
                                disabled={potentialGain <= 0}
                                className={`
                                    w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all
                                    ${potentialGain > 0
                                        ? 'bg-gradient-to-r from-risk to-red-600 text-white hover:brightness-110 active:scale-95 shadow-lg shadow-risk/20'
                                        : 'bg-white/10 text-gray-500 cursor-not-allowed'}
                                `}
                            >
                                {isLeaving ? 'กำลังเดินทาง...' : (
                                    <>
                                        <Plane size={20} />
                                        ทิ้งทุกอย่างและหนีไป
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center bg-purple-900/20 p-3 rounded-lg border border-purple-500/20">
                                <span className="text-sm font-bold text-purple-200">ชื่อเสียงคงเหลือ</span>
                                <div className="flex items-center gap-2 text-purple-400">
                                    <Star fill="currentColor" size={16} />
                                    <span className="font-mono font-black text-xl">{Math.floor(reputation).toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {PRESTIGE_UPGRADES_DATA.map((upgrade) => {
                                    const currentLevel = prestigeUpgrades[upgrade.id] || 0;
                                    const cost = Math.floor(upgrade.baseCost * Math.pow(1.5, currentLevel));
                                    const canAfford = reputation >= cost;

                                    return (
                                        <div key={upgrade.id} className="bg-surface/50 border border-white/5 rounded-xl p-3 flex justify-between items-center group hover:border-purple-500/30 transition-all">
                                            <div className="flex-1 mr-4">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-bold text-gray-200 text-sm">{upgrade.name}</h3>
                                                    <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded">Lv.{currentLevel}</span>
                                                </div>
                                                <p className="text-[10px] text-gray-400 mb-1">{upgrade.description}</p>
                                                <p className="text-[10px] text-purple-300 font-mono">
                                                    ผลลัพธ์: {upgrade.effectDescription(currentLevel)}
                                                    <span className="text-gray-500"> → </span>
                                                    <span className="text-white">{upgrade.effectDescription(currentLevel + 1)}</span>
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => handleBuyUpgrade(upgrade.id, cost)}
                                                disabled={!canAfford}
                                                className={`
                                                    shrink-0 px-3 py-2 rounded-lg font-bold text-xs flex flex-col items-center min-w-[70px] transition-all
                                                    ${canAfford
                                                        ? 'bg-purple-600 text-white hover:bg-purple-500 active:scale-95 shadow-lg shadow-purple-900/20'
                                                        : 'bg-white/5 text-gray-500 cursor-not-allowed'}
                                                `}
                                            >
                                                <span className="mb-0.5 opacity-80">อัปเกรด</span>
                                                <div className="flex items-center gap-1">
                                                    <Star size={10} fill="currentColor" />
                                                    {cost.toLocaleString()}
                                                </div>
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Close Button */}
                {!isLeaving && (
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white p-2">
                        ✕
                    </button>
                )}
            </div>
        </div>
    );
};
