"use client";
import React from 'react';
import Image from 'next/image';

interface RankedIconProps {
  tier: string | null;
  size?: number;
  className?: string;
}

/**
 * Componente que muestra el icono de rango de un invocador usando CDragon
 */
const RankedIcon: React.FC<RankedIconProps> = ({
                                                 tier,
                                                 size = 64,
                                                 className = ""
                                               }) => {
  // Normalizar el tier para la URL de CDragon
  const getNormalizedTier = (tier: string | null): string => {
    if (!tier || tier === 'UNRANKED') return 'unranked';

    // CDragon usa minúsculas para los tiers
    return tier.toLowerCase();
  };

  // Construir la URL de CDragon para el emblema
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
        // Fallback en caso de que la imagen no se cargue
        onError={(e) => {
          // Si falla, intentar con la imagen de unranked
          if (tier && tier !== 'UNRANKED') {
            (e.target as HTMLImageElement).src = getEmblemUrl('UNRANKED');
          }
        }}
      />
    </div>
  );
};

export default RankedIcon;
