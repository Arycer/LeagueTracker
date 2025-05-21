"use client";
import React from "react";
import { MatchDto, ParticipantDto } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { useUserContext } from "@/context/UserContext";

interface MatchDetailsModalProps {
  match: MatchDto;
  region: string;
  onClose: () => void;
  isOpen: boolean;
}

const MatchDetailsModal: React.FC<MatchDetailsModalProps> = ({
  match,
  region,
  onClose,
  isOpen,
}) => {
  const { lolVersion } = useUserContext();
  const [championIdToName, setChampionIdToName] = React.useState<Record<number, string>>({});

  // Cargar datos de campeones desde Data Dragon
  React.useEffect(() => {
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
        Object.values(data.data).forEach((champ) => {
          const championData = champ as { key: string; id: string };
          mapping[parseInt(championData.key)] = championData.id;
        });
        // Guardar en localStorage para futuras cargas
        localStorage.setItem(`champion-data-${lolVersion}`, JSON.stringify(mapping));
        setChampionIdToName(mapping);
      })
      .catch(err => {
        console.error('Error cargando datos de campeones:', err);
      });
  }, [lolVersion]);

  if (!isOpen || !match || !match.info) return null;

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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
    };
    return queueMap[queueId] || `Cola ${queueId}`;
  };

  // Dividir participantes en equipos
  const team1 = match.info.participants?.filter(p => p.teamId === 100) || [];
  const team2 = match.info.participants?.filter(p => p.teamId === 200) || [];

  // Determinar el equipo ganador
  const team1Won = team1.length > 0 && team1[0].win;
  const team2Won = team2.length > 0 && team2[0].win;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0f172a] rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-[#0f172a] z-10">
          <h2 className="text-xl font-bold text-white">
            Detalles de la Partida
          </h2>
          <div className="flex items-center gap-3">
            <Link 
              href={`/matches/${region}/${match.metadata.matchId}`}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors"
            >
              Ver página completa
            </Link>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Game Info */}
        <div className="p-4 border-b border-gray-700 bg-[#1e293b]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <p className="text-white">
                <span className="font-semibold">Tipo de partida:</span>{" "}
                {getQueueName(match.info.queueId || 0)}
              </p>
              <p className="text-white">
                <span className="font-semibold">Fecha:</span>{" "}
                {formatGameDate(match.info.gameCreation || 0)}
              </p>
              <p className="text-white">
                <span className="font-semibold">Duración:</span>{" "}
                {formatGameDuration(match.info.gameDuration || 0)}
              </p>
            </div>
            <Link
              href={`/matches/${region}/${match.metadata.matchId}`}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              Ver página detallada
            </Link>
          </div>
        </div>

        {/* Teams */}
        <div className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Team 1 */}
            <div className={`rounded-lg p-3 ${team1Won ? 'bg-blue-900/40' : 'bg-gray-800/40'}`}>
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                Equipo Azul {team1Won && <span className="ml-2 text-sm bg-green-600 px-2 py-0.5 rounded">Victoria</span>}
              </h3>
              <div className="space-y-2">
                {team1.map((player) => (
                  <div key={player.puuid} className="grid grid-cols-[auto_minmax(120px,1fr)_auto_auto] gap-3 p-2 rounded bg-black/20 items-center">
                    <div className="relative">
                      <Image
                        src={getChampionImageUrl(player.championId || 0)}
                        alt={player.championName || "Champion"}
                        width={40}
                        height={40}
                        className="rounded-full"
                        onError={(e) => {
                          const fallbackSrc = `https://ddragon.leagueoflegends.com/cdn/${lolVersion || '14.9.1'}/img/champion/Aatrox.png`;
                          if ((e.target as HTMLImageElement).src !== fallbackSrc) {
                            (e.target as HTMLImageElement).src = fallbackSrc;
                          }
                        }}
                      />
                      <span className="absolute bottom-0 right-0 bg-gray-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {player.champLevel || "?"}
                      </span>
                    </div>
                    <div className="w-32 md:w-40 overflow-hidden">
                      <Link 
                        href={player.riotIdGameName && player.riotIdTagline 
                          ? `/profiles/${region}/${encodeURIComponent(player.riotIdGameName)}/${encodeURIComponent(player.riotIdTagline)}` 
                          : '#'}
                        className={`font-medium text-white truncate block hover:text-blue-400 transition-colors ${(!player.riotIdGameName || !player.riotIdTagline) ? 'pointer-events-none' : ''}`}
                        title={player.riotIdGameName ? `${player.riotIdGameName}${player.riotIdTagline ? ` #${player.riotIdTagline}` : ''}` : player.summonerName || "Jugador"}
                      >
                        {player.riotIdGameName ? `${player.riotIdGameName}${player.riotIdTagline ? ` #${player.riotIdTagline}` : ''}` : player.summonerName || "Jugador"}
                      </Link>
                      <div className="text-xs text-gray-300">
                        {player.kills || 0}/{player.deaths || 0}/{player.assists || 0} KDA
                      </div>
                    </div>
                    <div className="w-20 text-right">
                      <div className="text-sm text-white">{(player.totalMinionsKilled || 0) + (player.neutralMinionsKilled || 0)} CS</div>
                      <div className="text-xs text-gray-300">{player.goldEarned?.toLocaleString() || 0} oro</div>
                    </div>
                    <div className="grid grid-cols-3 grid-rows-2 gap-1 w-24">
                      {[...Array(6)].map((_, i) => {
                        const itemKey = `item${i}` as keyof ParticipantDto;
                        const itemId = player[itemKey] as number | undefined;
                        
                        if (!itemId || itemId === 0) return (
                          <div key={`item-${i}`} className="w-7 h-7 bg-gray-800 rounded-md"></div>
                        );
                        
                        return (
                          <div key={`item-${i}`} className="relative w-7 h-7">
                            <Image 
                              src={`https://ddragon.leagueoflegends.com/cdn/${lolVersion || '14.9.1'}/img/item/${itemId}.png`}
                              alt={`Item ${i}`}
                              width={28}
                              height={28}
                              className="rounded-md"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team 2 */}
            <div className={`rounded-lg p-3 ${team2Won ? 'bg-blue-900/40' : 'bg-gray-800/40'}`}>
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                Equipo Rojo {team2Won && <span className="ml-2 text-sm bg-green-600 px-2 py-0.5 rounded">Victoria</span>}
              </h3>
              <div className="space-y-2">
                {team2.map((player) => (
                  <div key={player.puuid} className="grid grid-cols-[auto_minmax(120px,1fr)_auto_auto] gap-3 p-2 rounded bg-black/20 items-center">
                    <div className="relative">
                      <Image
                        src={getChampionImageUrl(player.championId || 0)}
                        alt={player.championName || "Champion"}
                        width={40}
                        height={40}
                        className="rounded-full"
                        onError={(e) => {
                          const fallbackSrc = `https://ddragon.leagueoflegends.com/cdn/${lolVersion || '14.9.1'}/img/champion/Aatrox.png`;
                          if ((e.target as HTMLImageElement).src !== fallbackSrc) {
                            (e.target as HTMLImageElement).src = fallbackSrc;
                          }
                        }}
                      />
                      <span className="absolute bottom-0 right-0 bg-gray-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {player.champLevel || "?"}
                      </span>
                    </div>
                    <div className="w-32 md:w-40 overflow-hidden">
                      <Link 
                        href={player.riotIdGameName && player.riotIdTagline 
                          ? `/profiles/${region}/${encodeURIComponent(player.riotIdGameName)}/${encodeURIComponent(player.riotIdTagline)}` 
                          : '#'}
                        className={`font-medium text-white truncate block hover:text-blue-400 transition-colors ${(!player.riotIdGameName || !player.riotIdTagline) ? 'pointer-events-none' : ''}`}
                        title={player.riotIdGameName ? `${player.riotIdGameName}${player.riotIdTagline ? ` #${player.riotIdTagline}` : ''}` : player.summonerName || "Jugador"}
                      >
                        {player.riotIdGameName ? `${player.riotIdGameName}${player.riotIdTagline ? ` #${player.riotIdTagline}` : ''}` : player.summonerName || "Jugador"}
                      </Link>
                      <div className="text-xs text-gray-300">
                        {player.kills || 0}/{player.deaths || 0}/{player.assists || 0} KDA
                      </div>
                    </div>
                    <div className="w-20 text-right">
                      <div className="text-sm text-white">{(player.totalMinionsKilled || 0) + (player.neutralMinionsKilled || 0)} CS</div>
                      <div className="text-xs text-gray-300">{player.goldEarned?.toLocaleString() || 0} oro</div>
                    </div>
                    <div className="grid grid-cols-3 grid-rows-2 gap-1 w-24">
                      {[...Array(6)].map((_, i) => {
                        const itemKey = `item${i}` as keyof ParticipantDto;
                        const itemId = player[itemKey] as number | undefined;
                        
                        if (!itemId || itemId === 0) return (
                          <div key={`item-${i}`} className="w-7 h-7 bg-gray-800 rounded-md"></div>
                        );
                        
                        return (
                          <div key={`item-${i}`} className="relative w-7 h-7">
                            <Image 
                              src={`https://ddragon.leagueoflegends.com/cdn/${lolVersion || '14.9.1'}/img/item/${itemId}.png`}
                              alt={`Item ${i}`}
                              width={28}
                              height={28}
                              className="rounded-md"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchDetailsModal;
