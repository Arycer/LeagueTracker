import React from 'react';
import Image from 'next/image';
import {useDDragon} from '../../contexts/DDragonContext';
import {cn} from '@/lib/utils';

export interface ChampionIconProps {
  championId: string;
  size?: number;
  className?: string;
  withBorder?: boolean;
  withTooltip?: boolean;
  alt?: string;
}

const ChampionIcon: React.FC<ChampionIconProps> = ({
                                                     championId,
                                                     size = 40,
                                                     className,
                                                     withBorder = false,
                                                     withTooltip = false,
                                                     alt,
                                                   }) => {
  const {getChampionIcon, isLoading} = useDDragon();

  
  if (isLoading || !championId) {
    return (
      <div
        className={cn(
          'bg-blue-900/30 flex items-center justify-center rounded-md',
          withBorder && 'border border-blue-500/50',
          className
        )}
        style={{width: size, height: size}}
      />
    );
  }

  
  const formattedName = championId
    .replace(/([A-Z])/g, ' $1') 
    .replace(/^./, (str) => str.toUpperCase()) 
    .trim();

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md',
        withBorder && 'border border-blue-500/50',
        className
      )}
      style={{width: size, height: size}}
      title={withTooltip ? formattedName : undefined}
    >
      <Image
        src={getChampionIcon(championId)}
        alt={alt || `${formattedName} icon`}
        width={size}
        height={size}
        className="object-cover"
        priority={size > 64}
      />
    </div>
  );
};

export default ChampionIcon;
