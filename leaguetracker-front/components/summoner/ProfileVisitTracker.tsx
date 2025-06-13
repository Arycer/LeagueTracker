"use client";
import {useEffect, useRef} from 'react';
import {useRecentProfiles} from '@/hooks/useRecentProfiles';

interface ProfileVisitTrackerProps {
  summonerName: string;
  region: string;
  tagline: string;
}

const ProfileVisitTracker: React.FC<ProfileVisitTrackerProps> = ({
                                                                   summonerName,
                                                                   region,
                                                                   tagline
                                                                 }) => {
  const {addRecentProfile} = useRecentProfiles();
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
    
  }, []);

  
  return null;
};

export default ProfileVisitTracker;
