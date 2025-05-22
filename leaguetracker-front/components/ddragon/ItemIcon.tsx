import React from 'react';
import Image from 'next/image';
import { useDDragon } from '../../contexts/DDragonContext';
import { cn } from '@/lib/utils';

export interface ItemIconProps {
  itemId: string;
  size?: number;
  className?: string;
  withBorder?: boolean;
  withTooltip?: boolean;
  alt?: string;
  emptySlot?: boolean;
}

/**
 * Componente para mostrar el icono de un ítem
 */
const ItemIcon: React.FC<ItemIconProps> = ({
  itemId,
  size = 32,
  className,
  withBorder = true,
  withTooltip = false,
  alt,
  emptySlot = false,
}) => {
  const { getItemIcon, isLoading } = useDDragon();
  
  // Placeholder para cuando está cargando o no hay ID
  if (isLoading || !itemId || itemId === '0') {
    return (
      <div 
        className={cn(
          'bg-blue-900/90 flex items-center justify-center rounded-md',
          withBorder && 'border border-blue-900/30',
          emptySlot && 'opacity-30',
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
        withBorder && 'border border-blue-900/100',
        className
      )}
      style={{ width: size, height: size }}
      title={withTooltip ? `Item ${itemId}` : undefined}
    >
      <Image
        src={getItemIcon(itemId)}
        alt={alt || `Item ${itemId}`}
        width={size}
        height={size}
        className="object-cover"
      />
    </div>
  );
};

export default ItemIcon;
