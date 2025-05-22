"use client";
import {useEffect, useRef} from 'react';
import {useRecentProfiles} from '@/hooks/useRecentProfiles';

interface ProfileVisitTrackerProps {
  summonerName: string;
  region: string;
  tagline: string;
}

/**
 * Componente invisible que registra la visita a un perfil
 * Se debe incluir en la página de perfil de invocador
 */
const ProfileVisitTracker: React.FC<ProfileVisitTrackerProps> = ({ 
  summonerName, 
  region,
  tagline 
}) => {
  const { addRecentProfile } = useRecentProfiles();
  const initialRenderRef = useRef(true);
  
  useEffect(() => {
    // Evitar registrar la visita durante el primer renderizado para prevenir bucles
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      
      // Generar un ID único basado en región y nombre
      const id = `${region.toLowerCase()}_${summonerName.toLowerCase()}`;
      
      // Registrar la visita al perfil
      addRecentProfile({
        id,
        summonerName,
        region: region.toLowerCase(),
        tagline
      });
    }
  }, []); // Sin dependencias para evitar múltiples ejecuciones
  
  // Este componente no renderiza nada visible
  return null;
};

export default ProfileVisitTracker;
