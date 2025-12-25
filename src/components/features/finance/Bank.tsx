import React, { useState } from 'react';
import { useGameStore } from '../../../store/useGameStore';
import { formatMoney } from '../../../lib/utils';
import { BANK_CONFIG } from '../../../lib/constants';
import { Building2, ArrowDownRight, ArrowUpRight, ShieldCheck, Wallet } from 'lucide-react';

export const Bank = () => {
    const { money, bankBalance, depositToBank, withdrawFromBank } = useGameStore();
    const [action, setAction] = useState<'DEPOSIT' | 'WITHDRAW'>('DEPOSIT');
    const [amount, setAmount] = useState<string>('');

    const handleTransaction = () => {
        const value = parseFloat(amount);
        if (isNaN(value) || value <= 0) return;

        if (action === 'DEPOSIT') {
            depositToBank(value);
        } else {
            withdrawFromBank(value);
        }
        setAmount('');
    };

    const setMax = () => {
        if (action === 'DEPOSIT') {
            setAmount(Math.floor(money).toString());
        } else {
            setAmount(Math.floor(bankBalance).toString());
        }
    };

    const interestRate = (BANK_CONFIG.INTEREST_RATE * 10).toFixed(3); // Show per second approx (10 ticks)

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600 flex items-center justify-center gap-2">
                    <Building2 className="text-blue-500" /> Offshore Bank
                </h2>
                <p className="text-gray-400 text-xs text-center px-8">
                    ฟอกเงินให้สะอาดและปลอดภัย รับดอกเบี้ยรายวินาที
                </p>
            </div>

            {/* Balance Cards */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface/50 border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                    <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                        <Wallet size={12} /> เงินสด
                    </div>
                    <div className="text-lg font-bold text-money truncate w-full px-2">{formatMoney(money)}</div>
                </div>
                <div className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-1">
                        <ShieldCheck size={14} className="text-blue-500/50" />
                    </div>
                    <div className="text-xs text-blue-300 mb-1 flex items-center gap-1">
                        <Building2 size={12} /> เงินฝาก
                    </div>
                    <div className="text-lg font-bold text-blue-400 truncate w-full px-2">{formatMoney(bankBalance)}</div>
                    <div className="text-[10px] text-blue-300/50 mt-1">+{interestRate}% / วินาที</div>
                </div>
            </div>

            {/* Action Panel */}
            <div className="bg-surface border border-white/10 rounded-2xl p-4 space-y-4">
                <div className="flex bg-black/20 p-1 rounded-xl">
                    <button
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${action === 'DEPOSIT' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                        onClick={() => setAction('DEPOSIT')}
                    >
                        ฝากเงิน
                    </button>
                    <button
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${action === 'WITHDRAW' ? 'bg-money text-black shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                        onClick={() => setAction('WITHDRAW')}
                    >
                        ถอนเงิน
                    </button>
                </div>

                <div className="space-y-2">
                    <div className="relative">
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="ระบุจำนวนเงิน..."
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono focus:border-blue-500 outline-none transition-colors"
                        />
                        <button
                            onClick={setMax}
                            className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-white/10 rounded-md text-[10px] text-gray-400 hover:bg-white/20 transition-colors"
                        >
                            MAX
                        </button>
                    </div>

                    {action === 'DEPOSIT' && (
                        <div className="flex justify-between text-xs px-1">
                            <span className="text-gray-500">ค่าธรรมเนียมฟอกเงิน ({BANK_CONFIG.DEPOSIT_FEE * 100}%)</span>
                            <span className="text-risk">-{formatMoney((parseFloat(amount) || 0) * BANK_CONFIG.DEPOSIT_FEE)}</span>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleTransaction}
                    disabled={!amount || parseFloat(amount) <= 0 || (action === 'DEPOSIT' && money < parseFloat(amount)) || (action === 'WITHDRAW' && bankBalance < parseFloat(amount))}
                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all
                        ${action === 'DEPOSIT'
                            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
                            : 'bg-money hover:brightness-110 text-black shadow-lg shadow-green-900/20'}
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
                    `}
                >
                    {action === 'DEPOSIT' ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
                    {action === 'DEPOSIT' ? 'ยืนยันการฝาก' : 'ยืนยันการถอน'}
                </button>
            </div>
        </div>
    );
};
