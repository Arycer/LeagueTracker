"use client";

import {useCallback, useState} from 'react';
import {useApi} from './useApi';
import {Region} from '@/constants/regions';
import {useDDragon} from '@/contexts/DDragonContext';

// Interfaces para la respuesta de la API
export interface ChampionMasteryDTO {
  championId: number;
  championLevel: number;
  championPoints: number;
}

/**
 * Hook para gestionar las maestrías de campeones
 */
export const useChampionMastery = () => {
  const { get } = useApi();
  const { getChampionById } = useDDragon();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Obtiene las 3 mejores maestrías de campeones de un invocador
   */
  const getTopMasteries = useCallback(async (
    region: Region,
    name: string,
    tagline: string
  ): Promise<ChampionMasteryDTO[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Asegurar que la región está en mayúsculas
      const upperRegion = region.toUpperCase();
      
      // Procesar el nombre y tagline para evitar duplicación
      let summonerName = name;
      let summonerTagline = tagline;
      
      // Si el nombre ya incluye el tagline (formato 'name#tagline'), lo separamos
      if (summonerName.includes('#')) {
        const parts = summonerName.split('#');
        summonerName = parts[0];
        // Usamos el tagline del nombre solo si no se proporcionó un tagline por separado
        if (!summonerTagline && parts.length > 1) {
          summonerTagline = parts[1];
        }
      }
      
      console.log(`Obteniendo maestrías: ${upperRegion}/${summonerName}/${summonerTagline}`);
      
      const response = await get<ChampionMasteryDTO[]>(`/api/champion-mastery/top3/${upperRegion}/${summonerName}/${summonerTagline}`);

      if (response.ok && response.data) {
        console.log('Maestrías obtenidas correctamente:', response.data);
        return response.data;
      } else {
        const errorMessage = response.error || 'No se pudo obtener las maestrías del invocador';
        console.error('Error al obtener maestrías:', errorMessage);
        setError(errorMessage);
        return null;
      }
    } catch (err) {
      const errorMessage = 'Error de conexión al obtener las maestrías';
      console.error('Error de conexión:', err);
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [get]);

  return {
    getTopMasteries,
    isLoading,
    error
  };
};

export default useChampionMastery;
