import React from 'react';
import { useGameLoop } from './hooks/useGameLoop';
import { useGameStore } from './store/useGameStore';
import { Sparkles, Skull, Briefcase, ShoppingBag, Trophy, Crown } from 'lucide-react';
import { AssetList } from './components/features/assets/AssetList';
import { CrimeList } from './components/features/crime/CrimeList';
import { Leaderboard } from './components/features/leaderboard/Leaderboard';
import { Market } from './components/features/market/Market';
import { Profile } from './components/features/dashboard/Profile';
import { useOfflineProgress } from './hooks/useOfflineProgress';
import { OfflineModal } from './components/ui/OfflineModal';
import { useState } from 'react';
import { TopBar } from './components/layout/TopBar';

const BottomNav = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) => {
    const tabs = [
        { id: 'dashboard', icon: Sparkles, label: 'Home' },
        { id: 'assets', icon: Briefcase, label: 'Assets' },
        { id: 'crime', icon: Skull, label: 'Crime' },
        { id: 'market', icon: ShoppingBag, label: 'Shop' },
        { id: 'leaderboard', icon: Crown, label: 'Rank' },
        { id: 'profile', icon: Trophy, label: 'Profile' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-md border-t border-white/10 pb-safe z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
            <div className="flex justify-around items-center p-2 max-w-md mx-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex flex-col items-center p-2 rounded-xl transition-all duration-200 active:scale-95 ${activeTab === tab.id ? 'text-gold bg-white/5' : 'text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        <tab.icon size={20} className={activeTab === tab.id ? 'drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]' : ''} />
                        <span className="text-[10px] mt-1 font-medium">{tab.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

import { FloatingText } from './components/ui/FloatingText';

function App() {
    useGameLoop(); // Start the engine
    const [activeTab, setActiveTab] = React.useState('dashboard');

    // Offline Progress handling
    const initialGains = useOfflineProgress();
    const [offlineGains, setOfflineGains] = useState<{ time: number, money: number } | null>(null);

    // Floating Text State
    const [floatingTexts, setFloatingTexts] = useState<{ id: number, x: number, y: number, text: string }[]>([]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        useGameStore.getState().addMoney(10);

        // Add floating text
        const id = Date.now();
        setFloatingTexts(prev => [...prev, { id, x: e.clientX, y: e.clientY, text: '+$10' }]);

        // Cleanup happens in the component or via timeout here? 
        // Component calls onComplete, but we need to remove from state.
    };

    const removeText = (id: number) => {
        setFloatingTexts(prev => prev.filter(ft => ft.id !== id));
    };

    React.useEffect(() => {
        if (initialGains) {
            setOfflineGains(initialGains);
        }
    }, [initialGains]);

    return (
        <div className="min-h-screen pb-24 pt-20 max-w-md mx-auto relative overflow-hidden bg-void text-primaryText selection:bg-money/30">
            <div className="absolute inset-0 pointer-events-none bg-gradient-radial from-violet-900/10 to-transparent opacity-50 fixed" />

            <TopBar />

            {floatingTexts.map(ft => (
                <FloatingText key={ft.id} x={ft.x} y={ft.y} text={ft.text} onComplete={() => removeText(ft.id)} />
            ))}

            <main className="px-4 relative z-10">
                {activeTab === 'dashboard' && (
                    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                        <div className="text-center py-10">
                            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500 mb-2 tracking-tighter drop-shadow-lg">
                                EMPIRE
                            </h1>
                            <p className="text-gray-400 text-sm font-medium tracking-wide">CLICK TO EARN • BUILD TO RULE</p>

                            <div className="relative mt-12 w-40 h-40 mx-auto">
                                <button
                                    onClick={handleClick}
                                    className="w-full h-full rounded-full bg-gradient-to-b from-surface to-black border-4 border-money/20 shadow-[0_0_50px_rgba(30,215,96,0.1)] active:scale-95 transition-all flex items-center justify-center group relative overflow-hidden hover:border-money/50 hover:shadow-[0_0_70px_rgba(30,215,96,0.2)]"
                                >
                                    <div className="absolute inset-0 bg-money/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <Sparkles className="text-money group-hover:text-white transition-colors duration-300 drop-shadow-[0_0_10px_rgba(30,215,96,0.8)]" size={48} />
                                </button>
                                {/* Pulse Ring */}
                                <div className="absolute -inset-4 border border-money/10 rounded-full animate-[spin_10s_linear_infinite] pointer-events-none border-dashed" />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'assets' && (
                    <div className="animate-in slide-in-from-right-10 duration-300">
                        <AssetList />
                    </div>
                )}
                {activeTab === 'crime' && (
                    <div className="animate-in slide-in-from-right-10 duration-300">
                        <CrimeList />
                    </div>
                )}
                {activeTab === 'market' && (
                    <div className="animate-in slide-in-from-right-10 duration-300">
                        <Market />
                    </div>
                )}
                {activeTab === 'leaderboard' && (
                    <div className="animate-in slide-in-from-right-10 duration-300">
                        <Leaderboard />
                    </div>
                )}
                {activeTab === 'profile' && (
                    <div className="animate-in slide-in-from-right-10 duration-300">
                        <Profile />
                    </div>
                )}
            </main>

            {offlineGains && <OfflineModal gains={offlineGains} onClose={() => setOfflineGains(null)} />}

            <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
    );
}

export default App;
