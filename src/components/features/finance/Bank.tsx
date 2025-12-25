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
        <div className="space-y-6 pb-6">
            {/* Header / Vault Status */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-black rounded-3xl p-6 border border-slate-700/50 shadow-2xl">
                <div className="absolute top-0 right-0 p-3 opacity-20">
                    <ShieldCheck size={120} className="text-blue-500" />
                </div>

                <div className="relative z-10 flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                        <span className="text-[10px] font-mono tracking-widest text-blue-400 uppercase">Secure Connection</span>
                    </div>

                    <h2 className="text-3xl font-black text-white tracking-widest mb-1 flex items-center gap-2">
                        <Building2 size={24} className="text-blue-500" /> OFFSHORE
                    </h2>
                    <p className="text-blue-500/50 text-[10px] uppercase tracking-[0.2em] mb-6">Anonymous Banking Protocol</p>

                    <div className="w-full bg-black/40 rounded-2xl p-4 border border-blue-500/20 backdrop-blur-sm">
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-xs text-blue-400 font-mono">ACCOUNT_BALANCE</span>
                            <span className="text-[10px] text-green-400 flex items-center gap-1">
                                <ArrowUpRight size={10} /> {interestRate}% / sec
                            </span>
                        </div>
                        <div className="text-3xl font-mono font-bold text-white tracking-tight text-shadow-glow">
                            {formatMoney(bankBalance)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Wallet Quick View */}
            <div className="flex items-center justify-between px-4 py-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-xs text-gray-400 flex items-center gap-2">
                    <Wallet size={14} /> กระเป๋าเงิน
                </span>
                <span className="text-money font-bold font-mono">{formatMoney(money)}</span>
            </div>

            {/* Action Panel */}
            <div className="bg-surface/80 backdrop-blur-md rounded-2xl p-1 border border-white/10">
                <div className="grid grid-cols-2 gap-1 mb-4 p-1 bg-black/40 rounded-xl">
                    <button
                        className={`py-3 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-1 border ${action === 'DEPOSIT' ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.2)]' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                        onClick={() => setAction('DEPOSIT')}
                    >
                        <ArrowDownRight size={16} />
                        ฝาก/ฟอกเงิน
                    </button>
                    <button
                        className={`py-3 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-1 border ${action === 'WITHDRAW' ? 'bg-money/20 border-money text-money shadow-[0_0_15px_rgba(30,215,96,0.2)]' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                        onClick={() => setAction('WITHDRAW')}
                    >
                        <ArrowUpRight size={16} />
                        ถอนเงินสด
                    </button>
                </div>

                <div className="px-3 pb-3 space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px] uppercase text-gray-500 font-mono">
                            <span>Amount</span>
                            <span>MAX: {formatMoney(action === 'DEPOSIT' ? money : bankBalance)}</span>
                        </div>
                        <div className="relative">
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-4 text-lg font-mono text-white focus:border-blue-500 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] outline-none transition-all placeholder:text-gray-700"
                            />
                            <button
                                onClick={setMax}
                                className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-white/10 rounded-lg text-[10px] font-bold text-blue-400 hover:bg-white/20 transition-colors"
                            >
                                MAX
                            </button>
                        </div>
                    </div>

                    {action === 'DEPOSIT' && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <ShieldCheck size={16} className="text-red-400" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-red-300 uppercase">ค่าฟอกเงิน ({BANK_CONFIG.DEPOSIT_FEE * 100}%)</span>
                                    <span className="text-[9px] text-red-400/70">หัก ณ ที่จ่าย เพื่อความปลอดภัย</span>
                                </div>
                            </div>
                            <span className="font-mono font-bold text-red-400">-{formatMoney((parseFloat(amount) || 0) * BANK_CONFIG.DEPOSIT_FEE)}</span>
                        </div>
                    )}

                    <button
                        onClick={handleTransaction}
                        disabled={!amount || parseFloat(amount) <= 0 || (action === 'DEPOSIT' && money < parseFloat(amount)) || (action === 'WITHDRAW' && bankBalance < parseFloat(amount))}
                        className={`w-full py-4 rounded-xl font-black tracking-wider uppercaseflex items-center justify-center gap-2 transition-all relative overflow-hidden group
                            ${action === 'DEPOSIT'
                                ? 'bg-gradient-to-r from-blue-700 to-blue-500 text-white shadow-lg shadow-blue-900/40 hover:scale-[1.02]'
                                : 'bg-gradient-to-r from-green-700 to-green-500 text-white shadow-lg shadow-green-900/40 hover:scale-[1.02]'}
                             disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
                        `}
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            {action === 'DEPOSIT' ? 'Confirm Deposit' : 'Confirm Withdraw'}
                        </span>
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </button>
                </div>
            </div>
        </div>
    );
};
