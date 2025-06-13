"use client";
import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react';


interface ChampionImage {
  full: string;
  sprite: string;
  group: string;
}

interface ChampionData {
  id: string;
  key: string;
  name: string;
  title: string;
  image: ChampionImage;
}

interface ChampionsData {
  type: string;
  format: string;
  version: string;
  data: Record<string, ChampionData>;
}


interface DDragonContextType {
  currentVersion: string | null;
  isLoading: boolean;
  error: string | null;
  refreshVersion: () => Promise<void>;
  getChampionIcon: (championId: string) => string;
  getItemIcon: (itemId: string) => string;
  getSummonerSpellIcon: (spellId: string) => string;
  getProfileIcon: (iconId: number) => string;
  getChampionById: (championId: string) => ChampionData | null;
}


const defaultContext: DDragonContextType = {
  currentVersion: null,
  isLoading: false,
  error: null,
  refreshVersion: async () => {
  },
  getChampionIcon: () => '',
  getItemIcon: () => '',
  getSummonerSpellIcon: () => '',
  getProfileIcon: () => '',
  getChampionById: () => null,
};


const DDragonContext = createContext<DDragonContextType>(defaultContext);


const DDRAGON_BASE_URL = 'https://ddragon.leagueoflegends.com';
const VERSIONS_URL = `${DDRAGON_BASE_URL}/api/versions.json`;


interface DDragonProviderProps {
  children: ReactNode;
}

export const DDragonProvider: React.FC<DDragonProviderProps> = ({children}) => {
  const [currentVersion, setCurrentVersion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [championsData, setChampionsData] = useState<ChampionsData | null>(null);

  
  const fetchCurrentVersion = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(VERSIONS_URL);

      if (!response.ok) {
        throw new Error(`Error al obtener versiones: ${response.status} ${response.statusText}`);
      }

      const versions: string[] = await response.json();

      
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

  
  const fetchChampionsData = async (version: string): Promise<void> => {
    try {
      const response = await fetch(`${DDRAGON_BASE_URL}/cdn/${version}/data/es_ES/champion.json`);

      if (!response.ok) {
        throw new Error(`Error al obtener datos de campeones: ${response.status} ${response.statusText}`);
      }

      const data: ChampionsData = await response.json();
      setChampionsData(data);
      console.log(`✅ Datos de campeones cargados: ${Object.keys(data.data).length} campeones`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al obtener datos de campeones';
      console.error('❌ Error al cargar datos de campeones:', errorMessage);
    }
  };

  
  useEffect(() => {
    const initData = async () => {
      await fetchCurrentVersion();
      if (currentVersion) {
        await fetchChampionsData(currentVersion);
      }
    };

    initData();
  }, []);

  
  useEffect(() => {
    if (currentVersion) {
      fetchChampionsData(currentVersion);
    }
  }, [currentVersion]);

  
  const getChampionIcon = (championId: string): string => {
    if (!currentVersion) return '';
    return `${DDRAGON_BASE_URL}/cdn/${currentVersion}/img/champion/${championId}.png`;
  };

  
  const getItemIcon = (itemId: string): string => {
    if (!currentVersion) return '';
    return `${DDRAGON_BASE_URL}/cdn/${currentVersion}/img/item/${itemId}.png`;
  };

  
  const getSummonerSpellIcon = (spellId: string): string => {
    if (!currentVersion) return '';
    return `${DDRAGON_BASE_URL}/cdn/${currentVersion}/img/spell/${spellId}.png`;
  };

  
  const getProfileIcon = (iconId: number): string => {
    if (!currentVersion) return '';
    return `${DDRAGON_BASE_URL}/cdn/${currentVersion}/img/profileicon/${iconId}.png`;
  };

  
  const getChampionById = (championId: string): ChampionData | null => {
    if (!championsData || !championId) return null;

    
    if (championsData.data[championId]) {
      return championsData.data[championId];
    }

    
    const champion = Object.values(championsData.data).find(
      (champ) => champ.key === championId
    );

    return champion || null;
  };

  
  const contextValue: DDragonContextType = {
    currentVersion,
    isLoading,
    error,
    refreshVersion: fetchCurrentVersion,
    getChampionIcon,
    getItemIcon,
    getSummonerSpellIcon,
    getProfileIcon,
    getChampionById,
  };

  return (
    <DDragonContext.Provider value={contextValue}>
      {children}
    </DDragonContext.Provider>
  );
};

export const useDDragon = (): DDragonContextType => {
  const context = useContext(DDragonContext);

  if (!context) {
    throw new Error('useDDragon debe ser usado dentro de un DDragonProvider');
  }

  return context;
};
