"use client";
import {useCallback, useEffect, useRef, useState} from 'react';

export interface RecentProfile {
  id: string;
  summonerName: string;
  region: string;
  tagline: string;
  timestamp: number;
}


const MAX_RECENT_PROFILES = 10;

const STORAGE_KEY = 'leaguetracker_recent_profiles';

export const useRecentProfiles = () => {
  const [recentProfiles, setRecentProfiles] = useState<RecentProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  
  useEffect(() => {
    const loadProfiles = () => {
      try {
        
        if (typeof window !== 'undefined') {
          const storedProfiles = localStorage.getItem(STORAGE_KEY);
          if (storedProfiles) {
            const parsedProfiles = JSON.parse(storedProfiles) as RecentProfile[];
            setRecentProfiles(parsedProfiles);
          }
        }
      } catch (error) {
        console.error('Error al cargar perfiles recientes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfiles();
  }, []);

  
  useEffect(() => {
    
    if (!isLoading && typeof window !== 'undefined' && recentProfiles.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(recentProfiles));
      } catch (error) {
        console.error('Error al guardar perfiles recientes:', error);
      }
    }
  }, [recentProfiles, isLoading]);

  
  const profilesRef = useRef(recentProfiles);

  
  useEffect(() => {
    profilesRef.current = recentProfiles;
  }, [recentProfiles]);

  const addRecentProfile = useCallback((profile: Omit<RecentProfile, 'timestamp'>) => {
    
    if (typeof window === 'undefined') return;

    setRecentProfiles(prevProfiles => {
      
      if (
        prevProfiles.length > 0 &&
        prevProfiles[0].region === profile.region &&
        prevProfiles[0].summonerName === profile.summonerName
      ) {
        return prevProfiles;
      }

      
      const updatedProfiles = [...prevProfiles];

      
      const existingIndex = updatedProfiles.findIndex(
        p => p.region === profile.region && p.summonerName === profile.summonerName
      );

      
      if (existingIndex !== -1) {
        updatedProfiles.splice(existingIndex, 1);
      }

      
      updatedProfiles.unshift({
        ...profile,
        timestamp: Date.now()
      });

      
      return updatedProfiles.slice(0, MAX_RECENT_PROFILES);
    });
  }, []);

  const removeRecentProfile = useCallback((profileId: string) => {
    setRecentProfiles(prevProfiles =>
      prevProfiles.filter(profile => profile.id !== profileId)
    );
  }, []);

  const clearRecentProfiles = useCallback(() => {
    setRecentProfiles([]);
  }, []);

  return {
    recentProfiles,
    isLoading,
    addRecentProfile,
    removeRecentProfile,
    clearRecentProfiles
  };
};
