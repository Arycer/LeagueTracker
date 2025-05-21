"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Definición de tipos
interface DDragonContextType {
  currentVersion: string | null;
  isLoading: boolean;
  error: string | null;
  refreshVersion: () => Promise<void>;
  getChampionIcon: (championId: string) => string;
  getItemIcon: (itemId: string) => string;
  getSummonerSpellIcon: (spellId: string) => string;
  getProfileIcon: (iconId: number) => string;
}

// Valores por defecto del contexto
const defaultContext: DDragonContextType = {
  currentVersion: null,
  isLoading: false,
  error: null,
  refreshVersion: async () => {},
  getChampionIcon: () => '',
  getItemIcon: () => '',
  getSummonerSpellIcon: () => '',
  getProfileIcon: () => '',
};

// Creación del contexto
const DDragonContext = createContext<DDragonContextType>(defaultContext);

// URL base de Data Dragon
const DDRAGON_BASE_URL = 'https://ddragon.leagueoflegends.com';
const VERSIONS_URL = `${DDRAGON_BASE_URL}/api/versions.json`;

// Props para el proveedor del contexto
interface DDragonProviderProps {
  children: ReactNode;
}

/**
 * Proveedor del contexto DDragon
 * Gestiona la obtención y almacenamiento de la versión actual del parche de LoL
 */
export const DDragonProvider: React.FC<DDragonProviderProps> = ({ children }) => {
  const [currentVersion, setCurrentVersion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener la versión actual del parche
  const fetchCurrentVersion = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(VERSIONS_URL);
      
      if (!response.ok) {
        throw new Error(`Error al obtener versiones: ${response.status} ${response.statusText}`);
      }
      
      const versions: string[] = await response.json();
      
      // La primera versión en el array es la más reciente
      if (versions && versions.length > 0) {
        setCurrentVersion(versions[0]);
        console.log(`✅ Versión de DDragon obtenida: ${versions[0]}`);
      } else {
        throw new Error('No se encontraron versiones disponibles');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al obtener la versión';
      setError(errorMessage);
      console.error('❌ Error al obtener la versión de DDragon:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar la versión al montar el componente
  useEffect(() => {
    fetchCurrentVersion();
  }, []);

  // Función para obtener la URL del icono de un campeón
  const getChampionIcon = (championId: string): string => {
    if (!currentVersion) return '';
    return `${DDRAGON_BASE_URL}/cdn/${currentVersion}/img/champion/${championId}.png`;
  };

  // Función para obtener la URL del icono de un ítem
  const getItemIcon = (itemId: string): string => {
    if (!currentVersion) return '';
    return `${DDRAGON_BASE_URL}/cdn/${currentVersion}/img/item/${itemId}.png`;
  };

  // Función para obtener la URL del icono de un hechizo de invocador
  const getSummonerSpellIcon = (spellId: string): string => {
    if (!currentVersion) return '';
    return `${DDRAGON_BASE_URL}/cdn/${currentVersion}/img/spell/${spellId}.png`;
  };

  // Función para obtener la URL del icono de perfil
  const getProfileIcon = (iconId: number): string => {
    if (!currentVersion) return '';
    return `${DDRAGON_BASE_URL}/cdn/${currentVersion}/img/profileicon/${iconId}.png`;
  };

  // Valor del contexto
  const contextValue: DDragonContextType = {
    currentVersion,
    isLoading,
    error,
    refreshVersion: fetchCurrentVersion,
    getChampionIcon,
    getItemIcon,
    getSummonerSpellIcon,
    getProfileIcon,
  };

  return (
    <DDragonContext.Provider value={contextValue}>
      {children}
    </DDragonContext.Provider>
  );
};

/**
 * Hook personalizado para acceder al contexto DDragon
 * @returns Contexto DDragon con la versión actual y funciones de utilidad
 */
export const useDDragon = (): DDragonContextType => {
  const context = useContext(DDragonContext);
  
  if (!context) {
    throw new Error('useDDragon debe ser usado dentro de un DDragonProvider');
  }
  
  return context;
};
