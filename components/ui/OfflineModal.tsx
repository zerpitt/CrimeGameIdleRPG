import React from 'react';
import { formatMoney } from '../lib/utils';
import { Clock, Check } from 'lucide-react';

interface OfflineModalProps {
    gains: { time: number; money: number };
    onClose: () => void;
}

export const OfflineModal: React.FC<OfflineModalProps> = ({ gains, onClose }) => {
    const timeInHours = (gains.time / 3600000).toFixed(1);
    const timeInMinutes = (gains.time / 60000).toFixed(0);

    const timeDisplay = gains.time < 3600000 ? `${timeInMinutes} Mins` : `${timeInHours} Hours`;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-surface border border-money/20 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-money" />

                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-money/10 rounded-full flex items-center justify-center mx-auto mb-4 text-money">
                        <Clock size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-1">WELCOME BACK</h2>
                    <p className="text-gray-400 text-sm">Your crew kept working while you were away.</p>
                </div>

                <div className="bg-void rounded-xl p-4 mb-6 border border-white/5 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Time Away</span>
                        <span className="text-gray-300">{timeDisplay}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                        <span className="text-gray-500">Earnings</span>
                        <span className="text-money">+{formatMoney(gains.money)}</span>
                    </div>
                    <div className="text-[10px] text-gray-600 text-center mt-2 pt-2 border-t border-white/5">
                        Efficiency: 90% (Offline Cap: 12h)
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="w-full py-3 rounded-lg font-bold bg-money text-black hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    <Check size={18} />
                    COLLECT CASH
                </button>
            </div>
        </div>
    );
};
