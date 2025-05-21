"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@clerk/nextjs';
import { cacheProfileIcon, getProfileIconFromCache } from '@/utils/profileIconCache';

interface FavoriteProfile {
  id: string;
  region: string;
  summonerName: string;
  tagline: string;
  profileIconId: number;
  addedAt: string;
  order?: number;
}

interface FavoritesContextType {
  favorites: FavoriteProfile[];
  loading: boolean;
  error: string | null;
  addFavorite: (region: string, summonerName: string, tagline: string) => Promise<boolean>;
  removeFavorite: (id: string) => Promise<boolean>;

  refreshFavorites: () => Promise<void>;
  isFavorite: (region: string, summonerName: string, tagline: string) => boolean;
  getFavoriteId: (region: string, summonerName: string, tagline: string) => string | undefined;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { callApi } = useApi();
  const { userId } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = async () => {
    if (!userId) {
      setFavorites([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await callApi('/api/lol/favorites');
      if (res.ok) {
        setFavorites(res.data || []);
      } else {
        setError('Error al cargar perfiles favoritos');
        console.error('Error fetching favorites:', res.error);
      }
    } catch (err) {
      setError('Error al cargar perfiles favoritos');
      console.error('Error fetching favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchFavorites();
    } else {
      setFavorites([]);
    }
  }, [userId]);

  const addFavorite = async (region: string, summonerName: string, tagline: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      // Intentar obtener el icono del caché
      const cachedIconId = getProfileIconFromCache(region, summonerName, tagline);
      
      const res = await callApi('/api/lol/favorites', 'POST', {
        region,
        summonerName,
        tagline,
        // Incluir el icono cacheado si existe
        profileIconId: cachedIconId || undefined
      });

      if (res.ok) {
        await fetchFavorites();
        return true;
      } else {
        setError(typeof res.error === 'string' ? res.error : 'Error al añadir favorito');
        return false;
      }
    } catch (err) {
      setError('Error al añadir favorito');
      console.error('Error adding favorite:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const res = await callApi(`/api/lol/favorites/${id}`, 'DELETE');

      if (res.ok) {
        await fetchFavorites();
        return true;
      } else {
        setError(typeof res.error === 'string' ? res.error : 'Error al eliminar favorito');
        return false;
      }
    } catch (err) {
      setError('Error al eliminar favorito');
      console.error('Error removing favorite:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };



  const isFavorite = (region: string, summonerName: string, tagline: string): boolean => {
    return favorites.some(
      fav => 
        fav.region.toLowerCase() === region.toLowerCase() && 
        fav.summonerName.toLowerCase() === summonerName.toLowerCase() && 
        fav.tagline.toLowerCase() === tagline.toLowerCase()
    );
  };

  const getFavoriteId = (region: string, summonerName: string, tagline: string): string | undefined => {
    const favorite = favorites.find(
      fav => 
        fav.region.toLowerCase() === region.toLowerCase() && 
        fav.summonerName.toLowerCase() === summonerName.toLowerCase() && 
        fav.tagline.toLowerCase() === tagline.toLowerCase()
    );
    return favorite?.id;
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        loading,
        error,
        addFavorite,
        removeFavorite,
        refreshFavorites: fetchFavorites,
        isFavorite,
        getFavoriteId
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
