import React from 'react';
import Image from 'next/image';
import { useDDragon } from '../../contexts/DDragonContext';
import { cn } from '@/lib/utils';

export interface ChampionIconProps {
  championId: string;
  size?: number;
  className?: string;
  withBorder?: boolean;
  withTooltip?: boolean;
  alt?: string;
}

/**
 * Componente para mostrar el icono de un campeón
 */
const ChampionIcon: React.FC<ChampionIconProps> = ({
  championId,
  size = 40,
  className,
  withBorder = false,
  withTooltip = false,
  alt,
}) => {
  const { getChampionIcon, isLoading } = useDDragon();
  
  // Placeholder para cuando está cargando o no hay ID
  if (isLoading || !championId) {
    return (
      <div 
        className={cn(
          'bg-blue-900/30 flex items-center justify-center rounded-md',
          withBorder && 'border border-blue-500/50',
          className
        )} 
        style={{ width: size, height: size }}
      />
    );
  }
  
  // Nombre formateado para el tooltip
  const formattedName = championId
    .replace(/([A-Z])/g, ' $1') // Añade espacios antes de mayúsculas
    .replace(/^./, (str) => str.toUpperCase()) // Primera letra mayúscula
    .trim();
  
  return (
    <div 
      className={cn(
        'relative overflow-hidden rounded-md',
        withBorder && 'border border-blue-500/50',
        className
      )}
      style={{ width: size, height: size }}
      title={withTooltip ? formattedName : undefined}
    >
      <Image
        src={getChampionIcon(championId)}
        alt={alt || `${formattedName} icon`}
        width={size}
        height={size}
        className="object-cover"
        priority={size > 64} // Prioriza la carga para iconos grandes
      />
    </div>
  );
};

export default ChampionIcon;
