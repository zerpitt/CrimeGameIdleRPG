import React, { useState } from 'react';
import { Bank } from './Bank';
import { StockMarket } from './StockMarket';
import { Building2, LineChart } from 'lucide-react';

export const FinanceDashboard = () => {
    const [tab, setTab] = useState<'BANK' | 'STOCKS'>('BANK');

    return (
        <div className="space-y-4">
            {/* Sub-nav for Finance */}
            <div className="flex p-1 bg-black/40 rounded-xl border border-white/10 mx-4 backdrop-blur-sm relative z-20">
                <button
                    onClick={() => setTab('BANK')}
                    className={`relative flex-1 py-3 rounded-lg text-xs font-bold font-mono tracking-wider flex items-center justify-center gap-2 transition-all 
                        ${tab === 'BANK'
                            ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                            : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                >
                    <Building2 size={14} /> OFFSHORE_BANK
                </button>
                <button
                    onClick={() => setTab('STOCKS')}
                    className={`relative flex-1 py-3 rounded-lg text-xs font-bold font-mono tracking-wider flex items-center justify-center gap-2 transition-all 
                        ${tab === 'STOCKS'
                            ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]'
                            : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                >
                    <LineChart size={14} /> DARK_EXCHANGE
                </button>
            </div>

            <div className="px-4">
                {tab === 'BANK' ? <Bank /> : <StockMarket />}
            </div>
        </div>
    );
};
