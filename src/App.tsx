import React, { useState } from 'react';
import { useGameLoop } from './hooks/useGameLoop';
import { useGameStore } from './store/useGameStore';
import { Sparkles, Skull, Briefcase, ShoppingBag, Trophy, Crown, Dna, Building2, Share2, Package } from 'lucide-react';
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
import { AchievementsModal } from './components/ui/AchievementsModal';
import { PrestigeModal } from './components/features/prestige/PrestigeModal';
import { OfflineModal } from './components/ui/OfflineModal';

const BottomNav = ({ activeTab, setActiveTab, unreadCount }: { activeTab: string, setActiveTab: (t: string) => void, unreadCount: number }) => {
    const tabs = [
        { id: 'dashboard', icon: Sparkles, label: 'หน้าแรก', hasBadge: unreadCount > 0 },
        { id: 'social', icon: Share2, label: 'ข่าวสาร' },
        { id: 'jobs', icon: Skull, label: 'งาน' },
        { id: 'assets', icon: Briefcase, label: 'ธุรกิจ' },
        { id: 'market', icon: ShoppingBag, label: 'ตลาด' },
        { id: 'inventory', icon: Package, label: 'กระเป๋า' },
        { id: 'finance', icon: Building2, label: 'การเงิน' },
        { id: 'tech', icon: Dna, label: 'วิจัย' },
        { id: 'leaderboard', icon: Trophy, label: 'อันดับ' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-md border-t border-white/10 pb-safe z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
            <div className="flex overflow-x-auto no-scrollbar items-center p-2 max-w-md mx-auto masking-gradient-right">
                <div className="flex gap-1 px-2 min-w-max">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex flex-col items-center p-2 rounded-xl transition-all duration-200 active:scale-95 min-w-[72px] relative ${activeTab === tab.id ? 'text-gold bg-white/5' : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            <div className="relative">
                                <tab.icon size={22} className={activeTab === tab.id ? 'drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]' : ''} />
                                {tab.id === 'dashboard' && unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-surface">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </div>
                            <span className="text-[10px] mt-1 font-medium whitespace-nowrap">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

function App() {
    useGameLoop(); // Start the engine
    const [activeTab, setActiveTab] = useState('dashboard');
    const startTime = useGameStore(state => state.startTime);

    // Modals State
    const [isAwardsOpen, setIsAwardsOpen] = useState(false);
    const [isPrestigeOpen, setIsPrestigeOpen] = useState(false);

    // Offline Progress handling
    const initialGains = useOfflineProgress();
    const [offlineGains, setOfflineGains] = useState<{ time: number, money: number } | null>(null);

    // Floating Text State
    const [floatingTexts, setFloatingTexts] = useState<{ id: number, x: number, y: number, text: string }[]>([]);

    const removeText = (id: number) => {
        setFloatingTexts(prev => prev.filter(ft => ft.id !== id));
    };

    const unreadSocialCount = useGameStore(state => state.unreadSocialCount);
    const clearSocialNotifications = useGameStore(state => state.clearSocialNotifications);

    React.useEffect(() => {
        if (activeTab === 'dashboard' && unreadSocialCount > 0) {
            clearSocialNotifications();
        }
    }, [activeTab, unreadSocialCount, clearSocialNotifications]);

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

            <main className="px-4 relative z-10 tab-content-entry" key={activeTab}>
                {activeTab === 'dashboard' && (
                    <div className="space-y-6">
                        <div className="flex justify-end -mb-4 px-2">
                            <button
                                onClick={() => setIsAwardsOpen(true)}
                                className="p-2 bg-yellow-500/10 text-yellow-500 rounded-full border border-yellow-500/20 hover:bg-yellow-500/20 transition-colors shadow-lg shadow-yellow-500/5 group"
                            >
                                <Trophy size={18} className="group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                        <Profile />
                    </div>
                )}
                {activeTab === 'social' && (
                    <div className="space-y-6">
                        <h3 className="text-xl font-black text-white px-2">ข่าวสารล่าสุด</h3>
                        <SocialApp />
                    </div>
                )}
                {activeTab === 'jobs' && <CrimeList />}
                {activeTab === 'assets' && <AssetList />}
                {activeTab === 'market' && <Market />}
                {activeTab === 'inventory' && (
                    <div className="space-y-6">
                        <h3 className="text-xl font-black text-white px-2 uppercase tracking-tight">คลังเก็บของ</h3>
                        <Inventory />
                    </div>
                )}
                {activeTab === 'finance' && (
                    <div className="space-y-6">
                        <h3 className="text-xl font-black text-white px-2 flex items-center gap-2">
                            <Building2 size={24} className="text-gold" />
                            การเงินและการธนาคาร
                        </h3>
                        <FinanceDashboard />
                    </div>
                )}
                {activeTab === 'tech' && (
                    <div className="space-y-6">
                        <h3 className="text-xl font-black text-white px-2 flex items-center gap-2">
                            <Dna size={24} className="text-blue-400" />
                            การวิจัยและพัฒนา
                        </h3>
                        <TechTree />
                    </div>
                )}
                {activeTab === 'leaderboard' && (
                    <div className="space-y-6">
                        <h3 className="text-xl font-black text-white px-2 flex items-center gap-2">
                            <Trophy size={24} className="text-yellow-500" />
                            ทำเนียบเจ้าพ่อ
                        </h3>
                        <Leaderboard />
                    </div>
                )}

                {/* Prestige/Shadow Council Button (Visible on certain tabs or everywhere?) */}
                {(activeTab === 'dashboard' || activeTab === 'finance') && (
                    <div className="pt-8 pb-10">
                        <button
                            onClick={() => setIsPrestigeOpen(true)}
                            className="w-full py-4 bg-gradient-to-r from-risk/80 to-red-600/80 hover:from-risk hover:to-red-600 text-white rounded-2xl border border-white/10 shadow-lg shadow-red-900/20 font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95"
                        >
                            <Crown size={24} />
                            เข้าสู่สภาเงา (Shadow Council)
                        </button>
                    </div>
                )}
            </main>

            <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} unreadCount={unreadSocialCount} />

            <JailModal />
            <TutorialOverlay />

            <AchievementsModal isOpen={isAwardsOpen} onClose={() => setIsAwardsOpen(false)} />
            <PrestigeModal isOpen={isPrestigeOpen} onClose={() => setIsPrestigeOpen(false)} />

            {offlineGains && (
                <OfflineModal
                    gains={offlineGains}
                    onClose={() => setOfflineGains(null)}
                />
            )}
        </div>
    );
}

export default App;
