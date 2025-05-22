"use client";
import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import {useUserContext} from './UserContext';
import {useApi} from '@/hooks/useApi';
import {useToast} from '@/hooks/useToast';

// Tipos para perfiles favoritos
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

// Tipo para el contexto
interface FavoriteProfilesContextType {
  // Perfiles favoritos
  favorites: FavoriteProfile[];

  // Estado de carga
  isLoading: boolean;

  // Acciones
  addFavorite: (request: AddFavoriteProfileRequest) => Promise<boolean>;
  deleteFavorite: (id: string) => Promise<boolean>;

  // Actualizaciones
  refreshFavorites: () => Promise<void>;
}

// Crear el contexto
export const FavoriteProfilesContext = createContext<FavoriteProfilesContextType | undefined>(undefined);

// Props para el proveedor
interface FavoriteProfilesProviderProps {
  children: ReactNode;
}

/**
 * Proveedor del contexto de perfiles favoritos
 * Gestiona la lista de perfiles favoritos del usuario
 */
export const FavoriteProfilesProvider: React.FC<FavoriteProfilesProviderProps> = ({children}) => {
  const {user} = useUserContext();
  const {get, post, delete: del} = useApi();
  const {success, error: showError} = useToast();

  // Estado para perfiles favoritos
  const [favorites, setFavorites] = useState<FavoriteProfile[]>([]);

  // Estado de carga
  const [isLoading, setIsLoading] = useState(true);

  // Cargar la lista de perfiles favoritos
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

  // Añadir perfil favorito
  const addFavorite = async (request: AddFavoriteProfileRequest): Promise<boolean> => {
    try {
      // Procesar el nombre y el tagline correctamente
      let summonerName = request.summonerName;
      let tagline = request.tagline;

      // Si el nombre contiene un # pero no hay tagline, separarlos
      if (summonerName.includes('#') && !tagline) {
        const parts = summonerName.split('#');
        summonerName = parts[0];
        tagline = parts[1] || '';
      }

      console.log('Guardando favorito:', {region: request.region, summonerName, tagline});

      // Convertir a Record<string, unknown> para satisfacer el tipo esperado por post
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

  // Eliminar perfil favorito
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

  // Valor del contexto
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

// Hook personalizado para usar el contexto
export const useFavoriteProfiles = () => {
  const context = useContext(FavoriteProfilesContext);
  if (context === undefined) {
    throw new Error('useFavoriteProfiles debe ser usado dentro de un FavoriteProfilesProvider');
  }
  return context;
};
