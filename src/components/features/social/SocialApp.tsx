import React, { useRef, useEffect } from 'react';
import { useGameStore } from '../../../store/useGameStore';
import { MessageCircle, Bell, User, ShieldAlert } from 'lucide-react';

export const SocialApp = () => {
    const feed = useGameStore(state => state.socialFeed);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto scroll to latest if needed (optional, logic might be reverse for feeds)
    // Actually, feeds usually put newest at top. Let's stick to newest at top.

    const getIcon = (type: string, sender: string) => {
        if (type === 'system') return <ShieldAlert size={16} className="text-red-500" />;
        if (sender === 'Police Radio') return <Bell size={16} className="text-blue-500" />;
        return <User size={16} className="text-gray-400" />;
    };

    const getBgColor = (type: string) => {
        if (type === 'system') return 'bg-red-900/10 border-red-500/20';
        return 'bg-surface/50 border-white/5';
    };

    return (
        <div className="h-full flex flex-col bg-slate-950">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <MessageCircle className="text-blue-400" />
                    Social Feed
                </h2>
                <p className="text-xs text-gray-500">ข่าวสารและเรื่องราวในโลกมืด</p>
            </div>

            {/* Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
                {feed.length === 0 && (
                    <div className="text-center text-gray-500 mt-10 text-sm">
                        ไม่มีข่าวสารใหม่...
                    </div>
                )}

                {feed.map((msg) => (
                    <div key={msg.id} className={`p-3 rounded-xl border ${getBgColor(msg.type)} animate-in fade-in slide-in-from-bottom-2`}>
                        <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-black/30 flex items-center justify-center border border-white/10">
                                    {getIcon(msg.type, msg.sender)}
                                </div>
                                <span className={`font-bold text-sm ${msg.sender === 'System' ? 'text-red-400' : 'text-blue-300'}`}>
                                    {msg.sender}
                                </span>
                            </div>
                            <span className="text-[10px] text-gray-600">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <p className="text-sm text-gray-300 pl-8 leading-relaxed">
                            {msg.message}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};
