import React, { useState } from 'react';
import { Bank } from './Bank';
import { StockMarket } from './StockMarket';
import { Building2, LineChart } from 'lucide-react';

export const FinanceDashboard = () => {
    const [tab, setTab] = useState<'BANK' | 'STOCKS'>('BANK');

    return (
        <div className="space-y-4">
            {/* Sub-nav for Finance */}
            <div className="flex p-1 bg-surface/50 rounded-xl border border-white/5 mx-4">
                <button
                    onClick={() => setTab('BANK')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${tab === 'BANK' ? 'bg-blue-600/30 text-blue-400 shadow-sm border border-blue-500/30' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <Building2 size={14} /> ธนาคาร
                </button>
                <button
                    onClick={() => setTab('STOCKS')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${tab === 'STOCKS' ? 'bg-orange-600/30 text-orange-400 shadow-sm border border-orange-500/30' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <LineChart size={14} /> ตลาดหุ้น
                </button>
            </div>

            <div className="px-4">
                {tab === 'BANK' ? <Bank /> : <StockMarket />}
            </div>
        </div>
    );
};
