import React from 'react';
import { CrimeItem } from './CrimeItem';
import { CRIMES } from '../../../lib/constants';

export const CrimeList = () => {
    return (
        <div className="space-y-3 pb-20">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Active Crimes</h2>
                <span className="text-xs text-gray-500">Risk vs Reward</span>
            </div>

            {CRIMES.map((crime) => (
                <CrimeItem key={crime.id} crimeId={crime.id} />
            ))}

            <div className="mt-8 p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-lg text-xs text-yellow-500/80 text-center">
                Warning: High Heat reduces success chance significantly.
            </div>
        </div>
    );
};
