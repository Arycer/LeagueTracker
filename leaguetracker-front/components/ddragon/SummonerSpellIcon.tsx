import React from 'react';
import Image from 'next/image';
import {useDDragon} from '../../contexts/DDragonContext';
import {cn} from '@/lib/utils';

export interface SummonerSpellIconProps {
  spellId: string;
  size?: number;
  className?: string;
  withBorder?: boolean;
  withTooltip?: boolean;
  alt?: string;
}

/**
 * Componente para mostrar el icono de un hechizo de invocador
 */
const SummonerSpellIcon: React.FC<SummonerSpellIconProps> = ({
  spellId,
  size = 24,
  className,
  withBorder = true,
  withTooltip = false,
  alt,
}) => {
  const { getSummonerSpellIcon, isLoading } = useDDragon();
  
  // Placeholder para cuando está cargando o no hay ID
  if (isLoading || !spellId) {
    return (
      <div 
        className={cn(
          'bg-blue-900/20 flex items-center justify-center rounded-md',
          withBorder && 'border border-blue-900/30',
          className
        )} 
        style={{ width: size, height: size }}
      />
    );
  }
  
  return (
    <div 
      className={cn(
        'relative overflow-hidden rounded-md',
        withBorder && 'border border-blue-900/30',
        className
      )}
      style={{ width: size, height: size }}
      title={withTooltip ? `Spell ${spellId}` : undefined}
    >
      <Image
        src={getSummonerSpellIcon(spellId)}
        alt={alt || `Spell ${spellId}`}
        width={size}
        height={size}
        className="object-cover"
      />
    </div>
  );
};

export default SummonerSpellIcon;
