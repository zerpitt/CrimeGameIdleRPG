import React, { useState } from 'react';
import { useGameStore } from '../../../store/useGameStore';
import { formatMoney, formatNumber } from '../../../lib/utils';
import { STOCKS } from '../../../lib/constants';
import { TrendingUp, TrendingDown, BarChart3, LineChart } from 'lucide-react';

export const StockMarket = () => {
    const { money, stockPortfolio, stockPrices, stockHistory, buyStock, sellStock } = useGameStore();
    const [selectedStockId, setSelectedStockId] = useState<string | null>(null);
    const [tradeAmount, setTradeAmount] = useState<string>('1');

    const selectedStock = selectedStockId ? STOCKS.find(s => s.id === selectedStockId) : null;
    const currentPrice = selectedStock ? stockPrices[selectedStock.id] : 0;
    const owned = selectedStock ? stockPortfolio[selectedStock.id] || 0 : 0;

    // Helper to calculate change
    const getChangePercent = (stockId: string) => {
        const history = stockHistory[stockId] || [];
        if (history.length < 2) return 0;
        const current = history[history.length - 1];
        const prev = history[history.length - 2];
        return ((current - prev) / prev) * 100;
    };

    return (
        <div className="space-y-4 pb-20">
            {/* Header */}
            <div className="bg-black/50 border border-white/10 rounded-xl p-4 flex items-center justify-between backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-900/20 rounded-lg text-red-500 animate-pulse">
                        <LineChart size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-black font-mono text-red-500 tracking-wider">DARK_EXCHANGE</h2>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            MARKET_OPEN
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] text-gray-400 font-mono">PORTFOLIO_VALUE</div>
                    {/* Calculate total portfolio value roughly */}
                    <div className="font-mono font-bold text-white">
                        {formatMoney(STOCKS.reduce((acc, stock) => acc + ((stockPortfolio[stock.id] || 0) * (stockPrices[stock.id] || stock.basePrice)), 0))}
                    </div>
                </div>
            </div>

            {/* Ticker / Rumors (Flavor) */}
            <div className="overflow-hidden bg-red-900/5 border-y border-red-500/10 py-1">
                <div className="whitespace-nowrap animate-[marquee_20s_linear_infinite] text-[10px] font-mono text-red-500/50">
                    +++ WPN UP +++ POLICE RAID SHADOW LOGISTICS +++ CHEM CORP RELEASES NEW "MEDICINE" +++ CYBER SEC HACKED +++ BUY NOW +++ NO REFUNDS +++
                </div>
            </div>

            {/* Stock List */}
            <div className="grid gap-3">
                {STOCKS.map((stock) => {
                    const price = stockPrices[stock.id] || stock.basePrice;
                    const change = getChangePercent(stock.id);
                    const isUp = change >= 0;
                    const amountOwned = stockPortfolio[stock.id] || 0;

                    return (
                        <div
                            key={stock.id}
                            onClick={() => setSelectedStockId(selectedStockId === stock.id ? null : stock.id)}
                            className={`
                                relative overflow-hidden bg-black/40 border rounded-none first:rounded-t-xl last:rounded-b-xl p-3 transition-all cursor-pointer group
                                ${selectedStockId === stock.id
                                    ? 'border-red-500/50 bg-red-950/20 z-10 my-1 rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.1)]'
                                    : 'border-white/5 hover:border-white/20 hover:bg-white/5 -mb-[1px]'}
                            `}
                        >
                            {/* Background Graph Effect (Fake) */}
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                                <BarChart3 className={`w-full h-full ${isUp ? 'text-green-500' : 'text-red-500'}`} />
                            </div>

                            <div className="relative flex justify-between items-center z-20">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded bg-black border border-white/10 flex flex-col items-center justify-center font-black font-mono shadow-inner ${isUp ? 'text-green-500 shadow-green-900/20' : 'text-red-500 shadow-red-900/20'}`}>
                                        <span className="text-xs">{stock.symbol}</span>
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-gray-200 font-mono tracking-tight group-hover:text-white transition-colors">
                                            {stock.name}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px]">
                                            <span className="text-gray-500 w-24 truncate">{stock.description}</span>
                                            {amountOwned > 0 && <span className="text-orange-400 bg-orange-950/30 px-1.5 rounded border border-orange-500/20">Own: {formatNumber(amountOwned)}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-mono font-bold text-sm text-white tracking-widest">{formatMoney(price)}</div>
                                    <div className={`text-[10px] font-mono flex items-center justify-end gap-1 ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                                        {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                        {change > 0 && '+'}{change.toFixed(2)}%
                                    </div>
                                </div>
                            </div>

                            {/* Trade Panel (Drawer) */}
                            {selectedStockId === stock.id && (
                                <div className="mt-4 pt-3 border-t border-white/5 space-y-3 animate-in slide-in-from-top-2">
                                    <div className="flex gap-1 bg-black/40 p-1 rounded-lg border border-white/5">
                                        {['1', '10', '100', 'MAX'].map(amt => (
                                            <button
                                                key={amt}
                                                onClick={(e) => { e.stopPropagation(); setTradeAmount(amt); }}
                                                className={`flex-1 py-1.5 rounded text-[10px] font-mono font-bold border transition-all ${tradeAmount === amt ? 'bg-white/10 border-white/30 text-white shadow' : 'border-transparent text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}
                                            >
                                                {amt}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const qty = tradeAmount === 'MAX' ? Math.floor(money / price) : parseInt(tradeAmount);
                                                buyStock(stock.id, qty);
                                            }}
                                            disabled={money < price}
                                            className="flex-1 bg-green-600 hover:bg-green-500 text-white border-b-4 border-green-800 active:border-b-0 active:translate-y-[4px] py-2 rounded font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-30 disabled:border-transparent disabled:cursor-not-allowed"
                                        >
                                            BUY ORDER
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const qty = tradeAmount === 'MAX' ? (stockPortfolio[stock.id] || 0) : parseInt(tradeAmount);
                                                sellStock(stock.id, qty);
                                            }}
                                            disabled={!stockPortfolio[stock.id]}
                                            className="flex-1 bg-red-600 hover:bg-red-500 text-white border-b-4 border-red-800 active:border-b-0 active:translate-y-[4px] py-2 rounded font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-30 disabled:border-transparent disabled:cursor-not-allowed"
                                        >
                                            SELL ORDER
                                        </button>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 px-1">
                                        <span>AVAILABLE_CASH: <span className="text-gray-300">{formatMoney(money)}</span></span>
                                        <span>EST_COST: <span className="text-gray-300">{formatMoney(price * (tradeAmount === 'MAX' ? Math.floor(money / price) : parseInt(tradeAmount) || 0))}</span></span>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
