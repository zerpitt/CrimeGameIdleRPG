
import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface AppHeaderProps {
    title: string;
    onBack: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ title, onBack }) => {
    return (
        <div className="flex items-center gap-3 p-4 bg-surface/95 backdrop-blur-md border-b border-white/10 sticky top-0 z-50 animate-in slide-in-from-top-2 duration-200">
            <button
                onClick={onBack}
                className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors active:scale-95"
            >
                <ChevronLeft size={24} className="text-gray-300" />
            </button>
            <h1 className="text-xl font-bold text-white tracking-tight">{title}</h1>
        </div>
    );
};
