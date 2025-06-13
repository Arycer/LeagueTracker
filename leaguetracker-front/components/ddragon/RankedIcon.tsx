"use client";
import React from 'react';
import Image from 'next/image';

interface RankedIconProps {
  tier: string | null;
  size?: number;
  className?: string;
}

const RankedIcon: React.FC<RankedIconProps> = ({
                                                 tier,
                                                 size = 64,
                                                 className = ""
                                               }) => {
  
  const getNormalizedTier = (tier: string | null): string => {
    if (!tier || tier === 'UNRANKED') return 'unranked';

    
    return tier.toLowerCase();
  };

  
  const getEmblemUrl = (tier: string | null): string => {
    const normalizedTier = getNormalizedTier(tier);
    return `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/${normalizedTier}.png`;
  };

  return (
    <div className={`relative ${className}`} style={{width: size, height: size}}>
      <Image
        src={getEmblemUrl(tier)}
        alt={tier || 'Unranked'}
        width={size}
        height={size}
        className="object-contain"
        
        onError={(e) => {
          
          if (tier && tier !== 'UNRANKED') {
            (e.target as HTMLImageElement).src = getEmblemUrl('UNRANKED');
          }
        }}
      />
    </div>
  );
};

export default RankedIcon;
