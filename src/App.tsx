import React, { useState } from 'react';
import { useGameLoop } from './hooks/useGameLoop';
import { useGameStore } from './store/useGameStore';
import { Sparkles, Skull, Briefcase, ShoppingBag, Trophy, Crown, Dna, Building2 } from 'lucide-react';
import { AssetList } from './components/features/assets/AssetList';
import { CrimeList } from './components/features/crime/CrimeList';
import { Leaderboard } from './components/features/leaderboard/Leaderboard';
import { Market } from './components/features/market/Market';
import { Profile } from './components/features/dashboard/Profile';
import { useOfflineProgress } from './hooks/useOfflineProgress';
import { TopBar } from './components/layout/TopBar';
import { JailModal } from './components/ui/JailModal';
import { TechTree } from './components/features/tech/TechTree';
import { TutorialOverlay } from './components/features/tutorial/TutorialOverlay';
import { SocialApp } from './components/features/social/SocialApp';
import { Inventory } from './components/features/inventory/Inventory';
import { FinanceDashboard } from './components/features/finance/FinanceDashboard';
import { FloatingText } from './components/ui/FloatingText';

const BottomNav = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) => {
    const tabs = [
        { id: 'dashboard', icon: Sparkles, label: 'หน้าแรก' },
        { id: 'jobs', icon: Skull, label: 'งาน' },
        { id: 'assets', icon: Briefcase, label: 'ธุรกิจ' },
        { id: 'market', icon: ShoppingBag, label: 'ตลาด' },
        { id: 'empire', icon: Crown, label: 'อาณาจักร' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-md border-t border-white/10 pb-safe z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
            <div className="flex justify-around items-center p-2 max-w-md mx-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex flex-col items-center p-2 rounded-xl transition-all duration-200 active:scale-95 flex-1 ${activeTab === tab.id ? 'text-gold bg-white/5' : 'text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        <tab.icon size={22} className={activeTab === tab.id ? 'drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]' : ''} />
                        <span className="text-[10px] mt-1 font-medium">{tab.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

function App() {
    useGameLoop(); // Start the engine
    const [activeTab, setActiveTab] = useState('dashboard');
    const startTime = useGameStore(state => state.startTime);

    // Offline Progress handling
    const initialGains = useOfflineProgress();
    const [offlineGains, setOfflineGains] = useState<{ time: number, money: number } | null>(null);

    // Floating Text State
    const [floatingTexts, setFloatingTexts] = useState<{ id: number, x: number, y: number, text: string }[]>([]);

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
                    <div className="space-y-6">
                        <Profile />
                        <div className="border-t border-white/5 pt-6">
                            <h3 className="text-lg font-bold text-white mb-4 px-2">ข่าวสารล่าสุด</h3>
                            <SocialApp />
                        </div>
                    </div>
                )}
                {activeTab === 'jobs' && <CrimeList />}
                {activeTab === 'assets' && <AssetList />}
                {activeTab === 'market' && (
                    <div className="space-y-6">
                        <Market />
                        <div className="border-t border-white/5 pt-6">
                            <h3 className="text-lg font-bold text-white mb-4 px-2 font-black uppercase tracking-tight">คลังเก็บของ</h3>
                            <Inventory />
                        </div>
                    </div>
                )}
                {activeTab === 'empire' && (
                    <div className="space-y-8 pb-10">
                        <div className="bg-surface/50 p-4 rounded-2xl border border-white/5 shadow-xl">
                            <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                                <Building2 size={20} className="text-gold" />
                                การเงินและการธนาคาร
                            </h3>
                            <FinanceDashboard />
                        </div>
                        <div className="bg-surface/50 p-4 rounded-2xl border border-white/5 shadow-xl">
                            <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                                <Dna size={20} className="text-blue-400" />
                                การวิจัยและพัฒนา
                            </h3>
                            <TechTree />
                        </div>
                        <div className="bg-surface/50 p-4 rounded-2xl border border-white/5 shadow-xl">
                            <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                                <Trophy size={20} className="text-yellow-500" />
                                ทำเนียบเจ้าพ่อ
                            </h3>
                            <Leaderboard />
                        </div>
                    </div>
                )}
            </main>

            <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

            <JailModal />
            <TutorialOverlay />
        </div>
    );
}

export default App;
