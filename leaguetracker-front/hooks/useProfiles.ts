"use client";

import {useCallback, useState} from 'react';
import {useApi} from './useApi';
import {useToast} from './useToast';
import {Region} from '@/constants/regions';

export interface MiniSeriesDTO {
  losses: number;
  progress: string;
  target: number;
  wins: number;
}

export interface LeagueEntryDTO {
  leagueId: string;
  summonerId: string;
  queueType: string;
  tier?: string;
  rank?: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  hotStreak: boolean;
  veteran: boolean;
  freshBlood: boolean;
  inactive: boolean;
  miniSeries: MiniSeriesDTO | null;
}

export interface SummonerProfileDTO {
  name: string;
  tagline: string;
  puuid: string;
  summonerLevel: number;
  profileIconId: number;
  leagueEntries: LeagueEntryDTO[];
  region: Region;
}

export const useProfiles = () => {
  const {get, post} = useApi();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getProfile = useCallback(async (
    region: Region,
    name: string,
    tagline: string
  ): Promise<SummonerProfileDTO | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const upperRegion = region.toUpperCase();
      console.log(`Obteniendo perfil: ${upperRegion}/${name}/${tagline}`);

      const response = await get<SummonerProfileDTO>(`/api/profiles/${upperRegion}/${name}/${tagline}`);

      if (response.ok && response.data) {
        console.log('Perfil obtenido correctamente:', response.data);
        return response.data;
      } else {
        const errorMessage = response.error || 'No se pudo obtener el perfil del invocador';
        console.error('Error al obtener perfil:', errorMessage);
        setError(errorMessage);
        toast.error('Error', errorMessage);
        return null;
      }
    } catch (err) {
      const errorMessage = 'Error de conexión al obtener el perfil';
      console.error('Error de conexión:', err);
      setError(errorMessage);
      toast.error('Error', errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [get, toast]);

  const refreshProfile = useCallback(async (
    region: Region,
    name: string,
    tagline: string
  ): Promise<SummonerProfileDTO | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const upperRegion = region.toUpperCase();
      console.log(`Actualizando perfil: ${upperRegion}/${name}/${tagline}`);

      const response = await post<SummonerProfileDTO>(
        `/api/profiles/${upperRegion}/${name}/${tagline}/refresh`,
        {}
      );

      if (response.ok && response.data) {
        console.log('Perfil actualizado correctamente:', response.data);
        toast.success('Éxito', 'Perfil actualizado correctamente');
        return response.data;
      } else {
        const errorMessage = response.error || 'No se pudo actualizar el perfil del invocador';
        console.error('Error al actualizar perfil:', errorMessage);
        setError(errorMessage);
        toast.error('Error', errorMessage);
        return null;
      }
    } catch (err) {
      const errorMessage = 'Error de conexión al actualizar el perfil';
      console.error('Error de conexión:', err);
      setError(errorMessage);
      toast.error('Error', errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [get, post, toast]);

  return {
    getProfile,
    refreshProfile,
    isLoading,
    error
  };
};

export default useProfiles;
