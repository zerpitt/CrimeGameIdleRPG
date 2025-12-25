import React from 'react';
import { AssetItem } from './AssetItem';
import { ASSETS } from '../../../lib/constants';

export const AssetList = () => {
    return (
        <div className="space-y-3 pb-20">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Businesses</h2>
                <span className="text-xs text-gray-500">Automated Income</span>
            </div>

            {ASSETS.map((asset) => (
                <AssetItem key={asset.id} assetId={asset.id} />
            ))}
        </div>
    );
};
