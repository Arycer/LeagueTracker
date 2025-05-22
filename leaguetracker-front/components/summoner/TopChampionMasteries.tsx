"use client";
import React, {useEffect, useState} from 'react';
import Image from 'next/image';
import {Skeleton} from '@/components/ui/skeleton';
import {useDDragon} from '@/contexts/DDragonContext';
import {ChampionMasteryDTO, useChampionMastery} from '@/hooks/useChampionMastery';
import {Region} from '@/constants/regions';

interface TopChampionMasteriesProps {
  summonerName: string;
  tagline: string;
  region: Region;
}

/**
 * Componente que muestra las 3 mejores maestrías de campeones de un invocador
 */
const TopChampionMasteries: React.FC<TopChampionMasteriesProps> = ({ 
  summonerName, 
  tagline, 
  region 
}) => {
  const { getTopMasteries, isLoading } = useChampionMastery();
  const { getChampionById, currentVersion } = useDDragon();
  const [masteries, setMasteries] = useState<ChampionMasteryDTO[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Cargar las maestrías al montar el componente
  useEffect(() => {
    const loadMasteries = async () => {
      try {
        const data = await getTopMasteries(region, summonerName, tagline);
        if (data) {
          setMasteries(data);
        } else {
          setError('No se pudieron cargar las maestrías');
        }
      } catch (err) {
        console.error('Error al cargar maestrías:', err);
        setError('Error al cargar las maestrías de campeón');
      }
    };

    loadMasteries();
  }, [getTopMasteries, region, summonerName, tagline]);

  // Formatear número de puntos de maestría
  const formatPoints = (points: number): string => {
    if (points >= 1000000) {
      return `${(points / 1000000).toFixed(1)}M`;
    } else if (points >= 1000) {
      return `${(points / 1000).toFixed(1)}K`;
    }
    return points.toString();
  };

  // Obtener color según nivel de maestría
  const getMasteryColor = (level: number): string => {
    switch (level) {
      case 7: return 'text-purple-500';
      case 6: return 'text-pink-500';
      case 5: return 'text-red-500';
      case 4: return 'text-orange-500';
      case 3: return 'text-yellow-500';
      case 2: return 'text-blue-500';
      case 1: return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[#1e293b] rounded-lg p-4 shadow-md">
        <h2 className="text-lg font-semibold text-white mb-4 text-center sm:text-left">Campeones más jugados</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#0f172a] p-3 rounded-md flex items-center">
              <Skeleton className="w-12 h-12 rounded-full mr-3 bg-blue-900/20" />
              <div className="flex-1">
                <Skeleton className="h-4 w-24 bg-blue-900/20 mb-1" />
                <Skeleton className="h-3 w-16 bg-blue-900/20" />
              </div>
              <Skeleton className="h-4 w-16 bg-blue-900/20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || masteries.length === 0) {
    return (
      <div className="bg-[#1e293b] rounded-lg p-4 shadow-md">
        <h2 className="text-lg font-semibold text-white mb-4 text-center sm:text-left">Campeones más jugados</h2>
        <div className="text-center py-6 text-gray-400">
          <p>No hay información de maestría disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1e293b] rounded-lg p-4 shadow-md">
      <h2 className="text-lg font-semibold text-white mb-4 text-center sm:text-left">Campeones más jugados</h2>
      <div className="space-y-3">
        {masteries.map((mastery) => {
          const champion = getChampionById(mastery.championId.toString());
          const championName = champion?.name || 'Desconocido';
          const championImage = champion ? 
            `https://ddragon.leagueoflegends.com/cdn/${currentVersion}/img/champion/${champion.image.full}` : 
            '/placeholder.png';
          
          return (
            <div key={mastery.championId} className="bg-[#0f172a] p-3 rounded-md flex items-center">
              <div className="relative mr-3 flex-shrink-0">
                <Image 
                  src={championImage} 
                  alt={championName} 
                  width={48} 
                  height={48} 
                  className="rounded-full object-cover border-2 border-blue-900/50"
                />
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#0f172a] flex items-center justify-center text-xs font-semibold ${getMasteryColor(mastery.championLevel)} border border-blue-900/50`}>
                  {mastery.championLevel}
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="text-white font-medium truncate">{championName}</div>
                <div className="text-gray-400 text-xs">
                  {formatPoints(mastery.championPoints)} puntos
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopChampionMasteries;
