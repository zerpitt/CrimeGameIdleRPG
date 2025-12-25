import React from 'react';
import { useGameLoop } from './hooks/useGameLoop';
import { useGameStore } from './store/useGameStore';
import { Sparkles, Skull, Briefcase, ShoppingBag, Trophy, Crown, Dna, Building2 } from 'lucide-react';
import { AssetList } from './components/features/assets/AssetList';
import { CrimeList } from './components/features/crime/CrimeList';
import { Leaderboard } from './components/features/leaderboard/Leaderboard';
import { Market } from './components/features/market/Market';
import { Profile } from './components/features/dashboard/Profile';
import { useOfflineProgress } from './hooks/useOfflineProgress';
import { OfflineModal } from './components/ui/OfflineModal';
import { useState } from 'react';
import { TopBar } from './components/layout/TopBar';
import { JailModal } from './components/ui/JailModal';
import { TechTree } from './components/features/tech/TechTree';
import { TutorialOverlay } from './components/features/tutorial/TutorialOverlay';
import { PhoneHome } from './components/layout/PhoneHome';
import { SocialApp } from './components/features/social/SocialApp';
import { Inventory } from './components/features/inventory/Inventory';

import { FinanceDashboard } from './components/features/finance/FinanceDashboard';

// BottomNav removed in favor of Phone OS navigation

import { FloatingText } from './components/ui/FloatingText';

function App() {
    useGameLoop(); // Start the engine
    const [activeApp, setActiveApp] = React.useState<string | null>(null);

    // Offline Progress handling
    const initialGains = useOfflineProgress();
    const [offlineGains, setOfflineGains] = useState<{ time: number, money: number } | null>(null);

    // Floating Text State
    const [floatingTexts, setFloatingTexts] = useState<{ id: number, x: number, y: number, text: string }[]>([]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        const earned = useGameStore.getState().clickMainButton();

        // Add floating text
        const id = Date.now();
        setFloatingTexts(prev => [...prev, {
            id,
            x: e.clientX,
            y: e.clientY,
            text: `+$${earned.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
        }]);
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

            <main className="px-0 relative z-10 h-[calc(100vh-80px)] overflow-hidden">
                {!activeApp ? (
                    <PhoneHome onNavigate={setActiveApp} />
                ) : (
                    <div className="h-full animate-in slide-in-from-bottom-5 duration-300 bg-void flex flex-col">
                        <div className="flex-1 overflow-y-auto overflow-x-hidden">
                            {/* Back Button / Header adjustment if needed within apps, usually apps have their own headers */}

                            {activeApp === 'crime' && <CrimeList />}
                            {activeApp === 'assets' && <AssetList />}
                            {activeApp === 'tech' && <TechTree />}
                            {activeApp === 'finance' && <FinanceDashboard />}
                            {activeApp === 'market' && <Market />}
                            {activeApp === 'leaderboard' && <Leaderboard />}
                            {activeApp === 'profile' && <Profile />}
                            {activeApp === 'inventory' && <div className="p-4"><Inventory /></div>}
                            {activeApp === 'social' && <SocialApp />}
                        </div>
                    </div>
                )}
            </main>


            <JailModal />
            <TutorialOverlay />


        </div>
    );
}

export default App;
