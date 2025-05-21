"use client";
import React, { useRef, useEffect, useState, useCallback } from "react";
import { MatchDto, ParticipantDto } from "@/types";
import { useUserContext } from "@/context/UserContext";
import { useApi } from "@/hooks/useApi";
import MatchDetailsModal from "@/components/MatchDetailsModal";

interface MatchHistoryProps {
  puuid: string;
  region: string;
}

const MatchHistory: React.FC<MatchHistoryProps> = ({ puuid, region }) => {
  const loader = useRef<HTMLDivElement | null>(null);
  const { lolVersion } = useUserContext();
  const { callApi } = useApi();
  const [matchIds, setMatchIds] = useState<string[]>([]);
  const [matchDetails, setMatchDetails] = useState<Record<string, MatchDto>>({});
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [championIdToName, setChampionIdToName] = useState<Record<number, string>>({});
  
  // Estado para el modal de detalles de partida
  const [selectedMatch, setSelectedMatch] = useState<MatchDto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estados para controlar la carga
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  // Función para abrir el modal con los detalles de la partida seleccionada
  const handleMatchClick = (match: MatchDto) => {
    setSelectedMatch(match);
    setIsModalOpen(true);
  };
  
  // Función para cerrar el modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Cargar datos de campeones desde Data Dragon
  useEffect(() => {
    if (!lolVersion) return;
    
    // Intentar obtener del localStorage primero
    const cachedData = localStorage.getItem(`champion-data-${lolVersion}`);
    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
        setChampionIdToName(parsedData);
        return;
      } catch (e) {
        console.error('Error al parsear datos en caché:', e);
      }
    }
    
    // Si no hay caché o hubo error, cargamos de la API
    fetch(`https://ddragon.leagueoflegends.com/cdn/${lolVersion}/data/es_ES/champion.json`)
      .then(res => res.json())
      .then(data => {
        const mapping: Record<number, string> = {};
        Object.values(data.data).forEach((champ: any) => {
          mapping[parseInt(champ.key)] = champ.id;
        });
        // Guardar en localStorage para futuras cargas
        localStorage.setItem(`champion-data-${lolVersion}`, JSON.stringify(mapping));
        setChampionIdToName(mapping);
      })
      .catch(err => {
        console.error('Error cargando datos de campeones:', err);
      });
  }, [lolVersion]);

  // Cargar ids de partidas por página
  const fetchMatchIds = useCallback(async (pageNum: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await callApi(
        `/api/lol/match/matches?puuid=${encodeURIComponent(puuid)}&region=${encodeURIComponent(region)}&page=${pageNum}&pageSize=20`
      );
      
      if (!response.ok) {
        throw new Error("Error al cargar las partidas");
      }
      
      const data = response.data;
      
      // Si no hay nuevos IDs, terminar la carga
      if (data.length === 0) {
        setHasMore(false);
        setIsLoading(false);
        setInitialLoading(false);
        return;
      }
      
      setMatchIds(prev => {
        // Evitar duplicados
        const set = new Set([...prev, ...data]);
        return Array.from(set).slice(0, 100);
      });
      
      setHasMore(data.length === 20 && (pageNum + 1) * 20 < 100);
      
      // Solo para la carga inicial, activar loadingDetails
      if (pageNum === 0) {
        setLoadingDetails(true);
      } else {
        // Para cargas posteriores, desactivar isLoading
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Error cargando partidas:", err);
      setError("No se pudieron cargar las partidas");
      setHasMore(false);
      setInitialLoading(false);
      setIsLoading(false);
      setLoadingDetails(false);
    }
  }, [puuid, region, callApi]);

  // Cargar detalles de partidas nuevas
  useEffect(() => {
    const toLoad = matchIds.filter(id => !matchDetails[id]);
    if (toLoad.length === 0) {
      // Si no hay nada que cargar pero estamos en estado de carga, finalizar la carga
      if (loadingDetails) {
        setLoadingDetails(false);
        setInitialLoading(false);
      }
      return;
    }
    
    const loadMatchDetails = async () => {
      try {
        const promises = toLoad.map(matchId => 
          callApi(`/api/lol/match/match/${matchId}?region=${encodeURIComponent(region)}`)
            .then(res => res.ok ? { matchId, data: res.data } : null)
            .catch(() => null)
        );
        
        setLoadingDetails(true);
        const results = await Promise.all(promises);
        const newDetails: Record<string, MatchDto> = {};
        
        results.forEach(result => {
          if (result && result.data) {
            newDetails[result.matchId] = result.data;
          }
        });
        
        setMatchDetails(prev => ({ ...prev, ...newDetails }));
      } catch (error) {
        console.error("Error cargando detalles de partidas:", error);
      } finally {
        // Finalizar todos los estados de carga
        setLoadingDetails(false);
        setInitialLoading(false);
        setIsLoading(false);
      }
    };
    
    loadMatchDetails();
  }, [matchIds, region, callApi]);

  // Resetear todo cuando cambia el puuid o la región
  useEffect(() => {
    setMatchIds([]);
    setMatchDetails({});
    setPage(0);
    setHasMore(true);
    setError(null);
  }, [puuid, region]);

  // Cargar la primera página al inicio
  useEffect(() => {
    if (page === 0) fetchMatchIds(0);
  }, [page, fetchMatchIds]);

  // Función para cargar más partidas manualmente
  const loadMoreMatches = () => {
    if (!hasMore || isLoading) return;
    
    setPage(p => {
      fetchMatchIds(p + 1);
      return p + 1;
    });
  };

  // Función para obtener la URL de la imagen del campeón
  const getChampionImageUrl = (championId: number): string => {
    const championName = championIdToName[championId] || 'Unknown';
    return `https://ddragon.leagueoflegends.com/cdn/${lolVersion || '14.9.1'}/img/champion/${championName}.png`;
  };

  // Función para formatear la duración de la partida
  const formatGameDuration = (durationInSeconds: number): string => {
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = durationInSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Función para formatear la fecha
  const formatGameDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Función para obtener el nombre de la cola
  const getQueueName = (queueId: number): string => {
    const queueMap: Record<number, string> = {
      400: 'Normal',
      420: 'Clasificatoria Solo/Dúo',
      430: 'Normal',
      440: 'Clasificatoria Flexible',
      450: 'ARAM',
      700: 'Clash',
      1700: 'Arena',
      // Añadir más colas según sea necesario
    };
    return queueMap[queueId] || `Cola ${queueId}`;
  };

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="w-full h-full">
      <h2 className="text-lg font-semibold text-white mb-4">Historial de Partidas</h2>
      
      {/* Modal de detalles de partida */}
      {selectedMatch && (
        <MatchDetailsModal
          match={selectedMatch}
          region={region}
          onClose={handleCloseModal}
          isOpen={isModalOpen}
        />
      )}
      
      <div className="flex flex-col gap-3">
        {Object.entries(matchDetails).map(([matchId, match], index) => {
          if (!match || !match.info || !match.metadata) return null;
          
          const user = match.info.participants?.find(p => p && p.puuid === puuid);
          if (!user) return null;
          
          const win = user.win || false;
          const queueId = match.info.queueId || 0;
          const queueName = getQueueName(queueId);
          const gameCreation = match.info.gameCreation || Date.now();
          const date = new Date(gameCreation);
          const dateStr = formatGameDate(gameCreation);
          const timeStr = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
          const duration = formatGameDuration(match.info.gameDuration || 0);
          
          const kills = user.kills || 0;
          const deaths = user.deaths || 0;
          const assists = user.assists || 0;
          const kda = `${kills}/${deaths}/${assists}`;
          const kdaRatio = ((kills + assists) / Math.max(1, deaths)).toFixed(2);
          
          const totalMinionsKilled = user.totalMinionsKilled || 0;
          const neutralMinionsKilled = user.neutralMinionsKilled || 0;
          const cs = totalMinionsKilled + neutralMinionsKilled;
          const csPerMin = (cs / (Math.max(1, match.info.gameDuration) / 60)).toFixed(1);
          
          return (
            <div 
              key={matchId}
              className={`p-4 rounded-lg ${win ? 'bg-blue-900/40' : 'bg-red-900/40'} flex flex-col md:flex-row items-start md:items-center gap-3 cursor-pointer hover:shadow-lg transition-shadow`}
              onClick={() => handleMatchClick(match)}
            >
              <div className="flex items-center gap-3 w-full md:w-auto min-w-[180px]">
                {user.championId ? (
                  <img 
                    src={getChampionImageUrl(user.championId)}
                    alt={user.championName || 'Champion'}
                    className="w-12 h-12 rounded-full border-2 border-gray-800"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ddragon.leagueoflegends.com/cdn/${lolVersion || '14.9.1'}/img/champion/Aatrox.png`;
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-700 border-2 border-gray-800"></div>
                )}
                <div>
                  <div className="font-medium text-white">{user.championName || 'Campeón desconocido'}</div>
                  <div className="text-xs text-gray-300">{queueName}</div>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4 w-full justify-between items-center">
                <div className="flex flex-col min-w-[120px] items-center md:items-start">
                  <div className="text-sm text-white font-medium">{win ? 'Victoria' : 'Derrota'}</div>
                  <div className="text-xs text-gray-300">{duration}</div>
                  <div className="text-xs text-gray-300">{dateStr} {timeStr}</div>
                </div>
                
                <div className="flex flex-col min-w-[100px] items-center md:items-start">
                  <div className="text-sm text-white">{kda} KDA</div>
                  <div className="text-xs text-gray-300">{kdaRatio} ratio</div>
                </div>
                
                <div className="flex flex-col min-w-[100px] items-center md:items-start">
                  <div className="text-sm text-white">{cs} CS</div>
                  <div className="text-xs text-gray-300">{csPerMin} CS/min</div>
                </div>
                
                <div className="flex gap-1 min-w-[180px] justify-center md:justify-end">
                  {[...Array(7)].map((_, i) => {
                    // Verificar que user existe y tiene la propiedad item
                    if (!user) return null;
                    
                    // Intentar obtener el ID del item de forma segura
                    const itemKey = `item${i}` as keyof ParticipantDto;
                    const itemId = user[itemKey] as number | undefined;
                    
                    // Si el itemId no es válido o es 0, mostrar un espacio vacío
                    if (!itemId || itemId === 0) return (
                      <div key={`item-${i}`} className="w-8 h-8 bg-gray-800 rounded-md"></div>
                    );
                    
                    // Si tenemos un itemId válido, mostrar la imagen
                    return (
                      <img 
                        key={`item-${i}`}
                        src={`https://ddragon.leagueoflegends.com/cdn/${lolVersion || '14.9.1'}/img/item/${itemId}.png`}
                        alt={`Item ${i}`}
                        className="w-8 h-8 rounded-md"
                        onError={(e) => {
                          // Si hay un error al cargar la imagen, ocultar el elemento
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Estado de carga inicial */}
        {initialLoading && (
          <div className="text-center p-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
            <p className="mt-2 text-white">Cargando partidas...</p>
          </div>
        )}
        
        {/* Botón de cargar más partidas (siempre visible, pero bloqueado durante la carga) */}
        {!initialLoading && matchIds.length > 0 && hasMore && (
          <div className="text-center p-4 flex justify-center">
            <button 
              onClick={loadMoreMatches}
              disabled={isLoading || loadingDetails}
              className={`px-4 py-2 rounded-md transition-colors inline-flex items-center justify-center gap-2 ${(isLoading || loadingDetails) ? 'bg-blue-800 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
            >
              {(isLoading || loadingDetails) && (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              )}
              {isLoading ? 'Cargando partidas...' : loadingDetails ? 'Cargando detalles...' : 'Cargar más partidas'}
            </button>
          </div>
        )}
        
        {/* Mensaje cuando no hay más partidas */}
        {!initialLoading && !isLoading && !hasMore && matchIds.length > 0 && (
          <div className="text-center p-4 text-gray-300">
            No hay más partidas para mostrar
          </div>
        )}
        
        {/* Mensaje cuando no se encontraron partidas */}
        {!initialLoading && !isLoading && matchIds.length === 0 && (
          <div className="text-center p-4 text-gray-300">
            No se encontraron partidas para este jugador
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchHistory;