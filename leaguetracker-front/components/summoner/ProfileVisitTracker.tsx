"use client";
import { useEffect } from 'react';
import { useRecentProfiles } from '@/hooks/useRecentProfiles';

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
  
  useEffect(() => {
    // Generar un ID único basado en región y nombre
    const id = `${region.toLowerCase()}_${summonerName.toLowerCase()}`;
    
    // Registrar la visita al perfil
    addRecentProfile({
      id,
      summonerName,
      region: region.toLowerCase(),
      tagline
    });
  }, [summonerName, region, tagline, addRecentProfile]);
  
  // Este componente no renderiza nada visible
  return null;
};

export default ProfileVisitTracker;
