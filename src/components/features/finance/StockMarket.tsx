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
        <div className="space-y-6 pb-20">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-600 flex items-center justify-center gap-2">
                    <LineChart className="text-red-500" /> Dark Exchange
                </h2>
                <p className="text-gray-400 text-xs">ตลาดหุ้นมืด ความเสี่ยงสูง ผลตอบแทนสูง</p>
            </div>

            {/* Stock List */}
            <div className="space-y-3">
                {STOCKS.map((stock) => {
                    const price = stockPrices[stock.id] || stock.basePrice;
                    const change = getChangePercent(stock.id);
                    const isUp = change >= 0;
                    const amountOwned = stockPortfolio[stock.id] || 0;

                    return (
                        <div
                            key={stock.id}
                            onClick={() => setSelectedStockId(selectedStockId === stock.id ? null : stock.id)}
                            className={`bg-surface border rounded-xl p-3 transition-all cursor-pointer ${selectedStockId === stock.id ? 'border-orange-500/50 bg-orange-950/20' : 'border-white/5 hover:border-white/20'}`}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-xs ${isUp ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {stock.symbol}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-gray-200">{stock.name}</div>
                                        <div className="text-[10px] text-gray-500">{stock.description}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-mono font-bold text-sm text-white">{formatMoney(price)}</div>
                                    <div className={`text-[10px] flex items-center justify-end gap-1 ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                                        {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                        {change.toFixed(2)}%
                                    </div>
                                </div>
                            </div>

                            {/* Portfolio Summary for this stock */}
                            {amountOwned > 0 && (
                                <div className="mt-2 pt-2 border-t border-white/5 flex justify-between text-[10px] text-gray-400">
                                    <span>ครอบครอง: {formatNumber(amountOwned)} หุ้น</span>
                                    <span>มูลค่า: {formatMoney(amountOwned * price)}</span>
                                </div>
                            )}

                            {/* Trade Panel (Inline expansion) */}
                            {selectedStockId === stock.id && (
                                <div className="mt-3 bg-black/20 rounded-lg p-3 space-y-3 animate-in slide-in-from-top-2">
                                    <div className="flex gap-2">
                                        {['1', '10', '100', 'MAX'].map(amt => (
                                            <button
                                                key={amt}
                                                onClick={(e) => { e.stopPropagation(); setTradeAmount(amt); }}
                                                className={`flex-1 py-1 rounded text-[10px] font-bold border ${tradeAmount === amt ? 'bg-white/10 border-white/30 text-white' : 'border-transparent text-gray-500 hover:bg-white/5'}`}
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
                                            className="flex-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/30 py-2 rounded-lg text-xs font-bold disabled:opacity-30"
                                        >
                                            ซื้อ (Buy)
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const qty = tradeAmount === 'MAX' ? (stockPortfolio[stock.id] || 0) : parseInt(tradeAmount);
                                                sellStock(stock.id, qty);
                                            }}
                                            disabled={!stockPortfolio[stock.id]}
                                            className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 py-2 rounded-lg text-xs font-bold disabled:opacity-30"
                                        >
                                            ขาย (Sell)
                                        </button>
                                    </div>
                                    <div className="text-center text-[10px] text-gray-500">
                                        เงินสด: {formatMoney(money)}
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
