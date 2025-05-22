import React from 'react';
import Image from 'next/image';
import {useDDragon} from '../../contexts/DDragonContext';
import {cn} from '@/lib/utils';

export interface ProfileIconProps {
  iconId: number;
  size?: number;
  className?: string;
  withBorder?: boolean;
  withLevel?: number | null;
  alt?: string;
}

/**
 * Componente para mostrar el icono de perfil de un invocador
 */
const ProfileIcon: React.FC<ProfileIconProps> = ({
  iconId,
  size = 64,
  className,
  withBorder = true,
  withLevel = null,
  alt,
}) => {
  const { getProfileIcon, isLoading } = useDDragon();
  
  // Placeholder para cuando está cargando o no hay ID
  if (isLoading || !iconId) {
    return (
      <div 
        className={cn(
          'bg-blue-900/30 flex items-center justify-center rounded-full',
          withBorder && 'border-2 border-blue-500/50',
          className
        )} 
        style={{ width: size, height: size }}
      />
    );
  }
  
  return (
    <div className="relative">
      <div 
        className={cn(
          'relative overflow-hidden rounded-full',
          withBorder && 'border-2 border-blue-500/50',
          className
        )}
        style={{ width: size, height: size }}
      >
        <Image
          src={getProfileIcon(iconId)}
          alt={alt || `Profile icon ${iconId}`}
          width={size}
          height={size}
          className="object-cover"
          priority={size > 64} // Prioriza la carga para iconos grandes
        />
      </div>
      
      {/* Nivel del invocador (opcional) */}
      {withLevel !== null && (
        <div 
          className="absolute bottom-0 right-0 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center border border-[#0f172a]"
          style={{ 
            width: Math.max(size / 3, 20), 
            height: Math.max(size / 3, 20),
            transform: 'translate(20%, 20%)'
          }}
        >
          {withLevel}
        </div>
      )}
    </div>
  );
};

export default ProfileIcon;
