"use client";
import {useCallback, useEffect, useRef, useState} from 'react';

// Tipo para los perfiles recientes
export interface RecentProfile {
  id: string;
  summonerName: string;
  region: string;
  tagline: string;
  timestamp: number;
}

// Máximo número de perfiles a almacenar
const MAX_RECENT_PROFILES = 10;
// Clave para localStorage
const STORAGE_KEY = 'leaguetracker_recent_profiles';

/**
 * Hook personalizado para gestionar perfiles visitados recientemente
 * Almacena los perfiles en localStorage y evita duplicados
 */
export const useRecentProfiles = () => {
  const [recentProfiles, setRecentProfiles] = useState<RecentProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Cargar perfiles desde localStorage al iniciar
  useEffect(() => {
    const loadProfiles = () => {
      try {
        // Solo se ejecuta en el cliente
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
  
  // Guardar perfiles en localStorage cuando cambian
  useEffect(() => {
    // Solo guardar si ya se ha completado la carga inicial y no estamos en SSR
    if (!isLoading && typeof window !== 'undefined' && recentProfiles.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(recentProfiles));
      } catch (error) {
        console.error('Error al guardar perfiles recientes:', error);
      }
    }
  }, [recentProfiles, isLoading]);
  
  // Usar useRef para evitar dependencias circulares
  const profilesRef = useRef(recentProfiles);
  
  // Actualizar la referencia cuando cambian los perfiles
  useEffect(() => {
    profilesRef.current = recentProfiles;
  }, [recentProfiles]);
  
  /**
   * Añadir un perfil a la lista de recientes
   * Si ya existe, lo mueve al principio y actualiza su timestamp
   */
  const addRecentProfile = useCallback((profile: Omit<RecentProfile, 'timestamp'>) => {
    // Evitar actualizaciones durante SSR
    if (typeof window === 'undefined') return;
    
    setRecentProfiles(prevProfiles => {
      // Verificar si el perfil es igual al último añadido para evitar actualizaciones innecesarias
      if (
        prevProfiles.length > 0 &&
        prevProfiles[0].region === profile.region &&
        prevProfiles[0].summonerName === profile.summonerName
      ) {
        return prevProfiles;
      }
      
      // Crear una copia de los perfiles actuales
      const updatedProfiles = [...prevProfiles];
      
      // Buscar si el perfil ya existe (por región y nombre)
      const existingIndex = updatedProfiles.findIndex(
        p => p.region === profile.region && p.summonerName === profile.summonerName
      );
      
      // Si existe, eliminarlo de su posición actual
      if (existingIndex !== -1) {
        updatedProfiles.splice(existingIndex, 1);
      }
      
      // Añadir el perfil al principio con timestamp actualizado
      updatedProfiles.unshift({
        ...profile,
        timestamp: Date.now()
      });
      
      // Limitar a MAX_RECENT_PROFILES perfiles
      return updatedProfiles.slice(0, MAX_RECENT_PROFILES);
    });
  }, []);
  
  /**
   * Eliminar un perfil de la lista de recientes
   */
  const removeRecentProfile = useCallback((profileId: string) => {
    setRecentProfiles(prevProfiles => 
      prevProfiles.filter(profile => profile.id !== profileId)
    );
  }, []);
  
  /**
   * Limpiar todos los perfiles recientes
   */
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
