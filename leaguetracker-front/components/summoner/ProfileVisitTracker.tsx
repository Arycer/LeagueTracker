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
    if (initialRenderRef.current) {
      initialRenderRef.current = false;

      const id = `${region.toLowerCase()}_${summonerName.toLowerCase()}`;

      addRecentProfile({
        id,
        summonerName,
        region: region.toLowerCase(),
        tagline
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Este componente no renderiza nada visible
  return null;
};

export default ProfileVisitTracker;
