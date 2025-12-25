import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { formatMoney } from '../../lib/utils';
import { Lock, Siren, Banknote } from 'lucide-react';

export const JailModal = () => {
    const { jailTime, money, bribePolice } = useGameStore();

    if (jailTime <= 0) return null;

    const remainingSeconds = Math.ceil(jailTime / 1000);
    const bribeCost = Math.floor(money * 0.5);

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-surface border-2 border-risk rounded-2xl p-6 max-w-sm w-full text-center relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_20px)]" />

                <div className="relative z-10 flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-risk/20 rounded-full flex items-center justify-center animate-pulse">
                        <Siren size={40} className="text-risk" />
                    </div>

                    <div>
                        <h2 className="text-3xl font-black text-risk mb-1 uppercase tracking-widest">โดนรวบ!</h2>
                        <p className="text-gray-400 text-sm">คุณถูกตำรวจจับกุม</p>
                    </div>

                    <div className="text-4xl font-mono font-bold text-white my-4">
                        {remainingSeconds}วิ
                    </div>

                    <div className="w-full space-y-3">
                        <button
                            disabled={true}
                            className="w-full py-3 bg-neutral rounded-xl text-gray-400 font-bold cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <Lock size={16} />
                            นอนคุกรอไป
                        </button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-surface px-2 text-gray-500">หรือ</span>
                            </div>
                        </div>

                        <button
                            onClick={bribePolice}
                            className="w-full py-3 bg-money text-black font-black rounded-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <Banknote size={20} />
                            จ่ายส่วย (${formatMoney(bribeCost)})
                        </button>
                        <p className="text-[10px] text-gray-500">ใช้ 50% ของเงินสดที่มี</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
