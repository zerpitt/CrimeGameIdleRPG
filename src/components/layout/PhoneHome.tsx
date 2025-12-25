import React from 'react';
import {
    Briefcase, Skull, Trophy, ShoppingBag,
    MessageCircle, Settings, Camera, Map,
    Dna, Building2, UserCircle, Backpack
} from 'lucide-react';

interface PhoneHomeProps {
    onNavigate: (appId: string) => void;
}

export const PhoneHome = ({ onNavigate }: PhoneHomeProps) => {
    const apps = [
        { id: 'crime', label: 'Jobs', icon: Skull, color: 'bg-red-500' },
        { id: 'assets', label: 'Business', icon: Briefcase, color: 'bg-blue-500' },
        { id: 'tech', label: 'Lab', icon: Dna, color: 'bg-purple-500' },
        { id: 'finance', label: 'Bank', icon: Building2, color: 'bg-green-600' },
        { id: 'market', label: 'Shop', icon: ShoppingBag, color: 'bg-orange-500' },
        { id: 'inventory', label: 'Bag', icon: Backpack, color: 'bg-yellow-600' },
        { id: 'social', label: 'Social', icon: MessageCircle, color: 'bg-sky-400' },
        { id: 'leaderboard', label: 'Rank', icon: Trophy, color: 'bg-yellow-400' },
        { id: 'profile', label: 'Profile', icon: UserCircle, color: 'bg-slate-500' },
        { id: 'settings', label: 'Settings', icon: Settings, color: 'bg-gray-600' },
    ];

    return (
        <div className="h-full pt-10 pb-20 px-4 overflow-y-auto">
            {/* Clock Widget */}
            <div className="flex flex-col items-center mb-10 mt-4">
                <div className="text-6xl font-thin text-white tracking-widest">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-gray-400 text-sm uppercase tracking-widest mt-1">
                    {new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* App Grid */}
            <div className="grid grid-cols-4 gap-x-4 gap-y-8">
                {apps.map((app) => (
                    <button
                        key={app.id}
                        onClick={() => onNavigate(app.id)}
                        className="flex flex-col items-center group active:scale-95 transition-transform"
                    >
                        <div className={`w-14 h-14 ${app.color} rounded-2xl flex items-center justify-center shadow-lg shadow-black/50 mb-2 group-hover:brightness-110 transition-all border border-white/10`}>
                            <app.icon className="text-white drop-shadow-md" size={28} />
                        </div>
                        <span className="text-[11px] font-medium text-gray-200 tracking-tight drop-shadow-md">
                            {app.label}
                        </span>
                    </button>
                ))}
            </div>

            {/* Dock Area (Visual only for now, maybe Favorites later) */}
            <div className="fixed bottom-6 left-4 right-4 h-24 bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 -z-10" />
        </div>
    );
};
