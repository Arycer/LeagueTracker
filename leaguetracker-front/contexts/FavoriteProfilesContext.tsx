"use client";
import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import {useUserContext} from './UserContext';
import {useApi} from '@/hooks/useApi';
import {useToast} from '@/hooks/useToast';


export interface FavoriteProfile {
  id: string;
  region: string;
  summonerName: string;
  tagline: string;
}

export interface AddFavoriteProfileRequest {
  region: string;
  summonerName: string;
  tagline: string;
}


interface FavoriteProfilesContextType {
  
  favorites: FavoriteProfile[];

  
  isLoading: boolean;

  
  addFavorite: (request: AddFavoriteProfileRequest) => Promise<boolean>;
  deleteFavorite: (id: string) => Promise<boolean>;

  
  refreshFavorites: () => Promise<void>;
}


export const FavoriteProfilesContext = createContext<FavoriteProfilesContextType | undefined>(undefined);


interface FavoriteProfilesProviderProps {
  children: ReactNode;
}

export const FavoriteProfilesProvider: React.FC<FavoriteProfilesProviderProps> = ({children}) => {
  const {user} = useUserContext();
  const {get, post, delete: del} = useApi();
  const {success, error: showError} = useToast();

  
  const [favorites, setFavorites] = useState<FavoriteProfile[]>([]);

  
  const [isLoading, setIsLoading] = useState(true);

  
  const refreshFavorites = async () => {
    if (!user.isSignedIn) {
      setFavorites([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await get<FavoriteProfile[]>('/api/lol/favorites');
      if (response.ok && response.data) {
        setFavorites(response.data);
      }
    } catch (err) {
      console.error('Error al cargar perfiles favoritos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  
  const addFavorite = async (request: AddFavoriteProfileRequest): Promise<boolean> => {
    try {
      
      let summonerName = request.summonerName;
      let tagline = request.tagline;

      
      if (summonerName.includes('#') && !tagline) {
        const parts = summonerName.split('#');
        summonerName = parts[0];
        tagline = parts[1] || '';
      }

      console.log('Guardando favorito:', {region: request.region, summonerName, tagline});

      
      const requestData: Record<string, unknown> = {
        region: request.region,
        summonerName: summonerName,
        tagline: tagline
      };

      const response = await post<FavoriteProfile>('/api/lol/favorites', requestData);

      if (response.ok && response.data) {
        success('Perfil añadido', `${request.summonerName} ha sido añadido a tus favoritos`);
        refreshFavorites();
        return true;
      } else {
        showError('Error', `No se pudo añadir el perfil a favoritos`);
        return false;
      }
    } catch (err) {
      console.error('Error al añadir favorito:', err);
      showError('Error', `No se pudo añadir el perfil a favoritos`);
      return false;
    }
  };

  
  const deleteFavorite = async (id: string): Promise<boolean> => {
    try {
      const response = await del(`/api/lol/favorites/${id}`);

      if (response.ok) {
        const deletedProfile = favorites.find(fav => fav.id === id);
        const profileName = deletedProfile ? deletedProfile.summonerName : 'El perfil';
        success('Perfil eliminado', `${profileName} ha sido eliminado de tus favoritos`);
        refreshFavorites();
        return true;
      } else {
        showError('Error', `No se pudo eliminar el perfil de favoritos`);
        return false;
      }
    } catch (err) {
      console.error('Error al eliminar favorito:', err);
      showError('Error', `No se pudo eliminar el perfil de favoritos`);
      return false;
    }
  };

  useEffect(() => {
    refreshFavorites();
  }, [user.isSignedIn]);

  
  const value: FavoriteProfilesContextType = {
    favorites,
    isLoading,
    addFavorite,
    deleteFavorite,
    refreshFavorites
  };

  return (
    <FavoriteProfilesContext.Provider value={value}>
      {children}
    </FavoriteProfilesContext.Provider>
  );
};


export const useFavoriteProfiles = () => {
  const context = useContext(FavoriteProfilesContext);
  if (context === undefined) {
    throw new Error('useFavoriteProfiles debe ser usado dentro de un FavoriteProfilesProvider');
  }
  return context;
};
