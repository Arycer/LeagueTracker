"use client";
import React, { useEffect, useState, useCallback } from "react";
import { MatchDto, ParticipantDto } from "@/types";
import { useUserContext } from "@/context/UserContext";
import { useApi } from "@/hooks/useApi";
import Link from "next/link";
import Image from "next/image";
import GoldTimelineChart from "@/components/GoldTimelineChart";

interface MatchDetailPageProps {
  params: Promise<{
    region: string;
    matchid: string;
  }>;
}

export default function MatchDetailPage({ params }: MatchDetailPageProps) {
  const { region, matchid } = React.use(params);
  const { lolVersion } = useUserContext();
  const { callApi } = useApi();
  const [match, setMatch] = useState<MatchDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [championIdToName, setChampionIdToName] = useState<Record<number, string>>({});

  const loadChampionData = useCallback(() => {
    if (!lolVersion) return;
    
    fetch(`https://ddragon.leagueoflegends.com/cdn/${lolVersion}/data/es_ES/champion.json`)
      .then(res => res.json())
      .then(data => {
        const mapping: Record<number, string> = {};
        Object.values(data.data).forEach((champ) => {
          const championData = champ as { key: string; id: string };
          mapping[parseInt(championData.key)] = championData.id;
        });
        localStorage.setItem(`champion-data-${lolVersion}`, JSON.stringify(mapping));
        setChampionIdToName(mapping);
      })
      .catch(err => {
        console.error('Error cargando datos de campeones:', err);
      });
  }, [lolVersion, setChampionIdToName]);

  useEffect(() => {
    if (!lolVersion) return;
    
    const cachedData = localStorage.getItem(`champion-data-${lolVersion}`);
    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
        setChampionIdToName(parsedData);
      } catch (e) {
        console.error('Error al parsear datos en caché:', e);
        loadChampionData();
      }
    } else {
      loadChampionData();
    }
  }, [lolVersion, loadChampionData]);

  useEffect(() => {
    const fetchMatchDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await callApi(
          `/api/lol/match/match/${matchid}?region=${encodeURIComponent(region)}`
        );
        
        if (!response.ok) {
          throw new Error("Error al cargar los detalles de la partida");
        }
        
        setMatch(response.data);
      } catch (err) {
        console.error("Error cargando detalles de la partida:", err);
        setError("No se pudieron cargar los detalles de la partida");
      } finally {
        setLoading(false);
      }
    };
    
    if (matchid && region) {
      fetchMatchDetails();
    }
  }, [matchid, region, callApi]);

  const getChampionImageUrl = (championId: number): string => {
    const championName = championIdToName[championId] || 'Unknown';
    return `https://ddragon.leagueoflegends.com/cdn/${lolVersion || '14.9.1'}/img/champion/${championName}.png`;
  };
  const formatGameDuration = (durationInSeconds: number): string => {
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = durationInSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-xl">Cargando detalles de la partida...</p>
        </div>
      </div>
    );
  }

  if (error || !match || !match.info) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-500/20 border border-red-500/30 p-4 rounded-lg text-center">
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p>{error || "No se pudieron cargar los detalles de la partida"}</p>
            <Link href="/" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const team1 = match.info.participants?.filter(p => p.teamId === 100) || [];
  const team2 = match.info.participants?.filter(p => p.teamId === 200) || [];

  const team1Won = team1.length > 0 && team1[0].win;
  const team2Won = team2.length > 0 && team2[0].win;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-[#1e293b]/80 rounded-lg p-6 mb-6 shadow-lg border border-blue-900/30">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">Detalles de la Partida</h1>
              <div className="text-blue-300 mb-1">
                {getQueueName(match.info.queueId || 0)}
              </div>
              <div className="text-gray-300">
                {formatGameDate(match.info.gameCreation || 0)}
              </div>
              <div className="text-gray-300">
                Duración: {formatGameDuration(match.info.gameDuration || 0)}
              </div>
            </div>
            <Link 
              href="/"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors text-white"
            >
              Volver al inicio
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-900/30">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              Equipo Azul {team1Won && <span className="ml-2 text-sm bg-green-600 px-2 py-0.5 rounded">Victoria</span>}
            </h2>
            <div className="space-y-3">
              {team1.map((player) => (
                <div 
                  key={player.puuid} 
                  className="grid grid-cols-[auto_1fr_auto_auto] md:grid-cols-[auto_1fr_auto_auto] gap-3 p-3 rounded bg-black/20 items-center"
                >
                  <div className="relative">
                    <Image
                      src={getChampionImageUrl(player.championId || 0)}
                      alt={player.championName || "Champion"}
                      width={48}
                      height={48}
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
                  
                  <div>
                    <Link 
                      href={player.riotIdGameName && player.riotIdTagline 
                        ? `/profiles/${region}/${encodeURIComponent(player.riotIdGameName)}/${encodeURIComponent(player.riotIdTagline)}` 
                        : '#'}
                      className={`font-medium text-white hover:text-blue-400 transition-colors ${(!player.riotIdGameName || !player.riotIdTagline) ? 'pointer-events-none' : ''}`}
                      title={player.riotIdGameName ? `${player.riotIdGameName}${player.riotIdTagline ? ` #${player.riotIdTagline}` : ''}` : player.summonerName || "Jugador"}
                    >
                      {player.riotIdGameName ? `${player.riotIdGameName}${player.riotIdTagline ? ` #${player.riotIdTagline}` : ''}` : player.summonerName || "Jugador"}
                    </Link>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <span>{player.kills || 0}/{player.deaths || 0}/{player.assists || 0}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-800">
                        {(((player.kills || 0) + (player.assists || 0)) / Math.max(1, (player.deaths || 1))).toFixed(2)}:1 KDA
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-white">{(player.totalMinionsKilled || 0) + (player.neutralMinionsKilled || 0)} CS</div>
                    <div className="text-xs text-gray-300">{player.goldEarned?.toLocaleString() || 0} oro</div>
                  </div>
                  
                  <div className="grid grid-cols-3 grid-rows-2 gap-1">
                    {[...Array(6)].map((_, i) => {
                      const itemKey = `item${i}` as keyof ParticipantDto;
                      const itemId = player[itemKey] as number | undefined;
                      
                      if (!itemId || itemId === 0) return (
                        <div key={`item-${i}`} className="w-8 h-8 bg-gray-800 rounded-md"></div>
                      );
                      
                      return (
                        <div key={`item-${i}`} className="relative w-8 h-8">
                          <Image 
                            src={`https://ddragon.leagueoflegends.com/cdn/${lolVersion || '14.9.1'}/img/item/${itemId}.png`}
                            alt={`Item ${i}`}
                            width={32}
                            height={32}
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
            
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-black/20 rounded">
              <div className="text-center">
                <div className="text-xs text-gray-400">Asesinatos</div>
                <div className="text-xl font-bold">{team1.reduce((sum, p) => sum + (p.kills || 0), 0)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-400">Torres</div>
                <div className="text-xl font-bold">{match.info.teams?.find(t => t.teamId === 100)?.objectives?.tower?.kills || 0}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-400">Dragones</div>
                <div className="text-xl font-bold">{match.info.teams?.find(t => t.teamId === 100)?.objectives?.dragon?.kills || 0}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-400">Barones</div>
                <div className="text-xl font-bold">{match.info.teams?.find(t => t.teamId === 100)?.objectives?.baron?.kills || 0}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-red-900/20 rounded-lg p-4 border border-red-900/30">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              Equipo Rojo {team2Won && <span className="ml-2 text-sm bg-green-600 px-2 py-0.5 rounded">Victoria</span>}
            </h2>
            <div className="space-y-3">
              {team2.map((player) => (
                <div 
                  key={player.puuid} 
                  className="grid grid-cols-[auto_1fr_auto_auto] md:grid-cols-[auto_1fr_auto_auto] gap-3 p-3 rounded bg-black/20 items-center"
                >
                  <div className="relative">
                    <Image
                      src={getChampionImageUrl(player.championId || 0)}
                      alt={player.championName || "Champion"}
                      width={48}
                      height={48}
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
                  
                  <div>
                    <Link 
                      href={player.riotIdGameName && player.riotIdTagline 
                        ? `/profiles/${region}/${encodeURIComponent(player.riotIdGameName)}/${encodeURIComponent(player.riotIdTagline)}` 
                        : '#'}
                      className={`font-medium text-white hover:text-blue-400 transition-colors ${(!player.riotIdGameName || !player.riotIdTagline) ? 'pointer-events-none' : ''}`}
                      title={player.riotIdGameName ? `${player.riotIdGameName}${player.riotIdTagline ? ` #${player.riotIdTagline}` : ''}` : player.summonerName || "Jugador"}
                    >
                      {player.riotIdGameName ? `${player.riotIdGameName}${player.riotIdTagline ? ` #${player.riotIdTagline}` : ''}` : player.summonerName || "Jugador"}
                    </Link>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <span>{player.kills || 0}/{player.deaths || 0}/{player.assists || 0}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-800">
                        {(((player.kills || 0) + (player.assists || 0)) / Math.max(1, (player.deaths || 1))).toFixed(2)}:1 KDA
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-white">{(player.totalMinionsKilled || 0) + (player.neutralMinionsKilled || 0)} CS</div>
                    <div className="text-xs text-gray-300">{player.goldEarned?.toLocaleString() || 0} oro</div>
                  </div>
                  
                  <div className="grid grid-cols-3 grid-rows-2 gap-1">
                    {[...Array(6)].map((_, i) => {
                      const itemKey = `item${i}` as keyof ParticipantDto;
                      const itemId = player[itemKey] as number | undefined;
                      
                      if (!itemId || itemId === 0) return (
                        <div key={`item-${i}`} className="w-8 h-8 bg-gray-800 rounded-md"></div>
                      );
                      
                      return (
                        <div key={`item-${i}`} className="relative w-8 h-8">
                          <Image 
                            src={`https://ddragon.leagueoflegends.com/cdn/${lolVersion || '14.9.1'}/img/item/${itemId}.png`}
                            alt={`Item ${i}`}
                            width={32}
                            height={32}
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
            
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-black/20 rounded">
              <div className="text-center">
                <div className="text-xs text-gray-400">Asesinatos</div>
                <div className="text-xl font-bold">{team2.reduce((sum, p) => sum + (p.kills || 0), 0)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-400">Torres</div>
                <div className="text-xl font-bold">{match.info.teams?.find(t => t.teamId === 200)?.objectives?.tower?.kills || 0}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-400">Dragones</div>
                <div className="text-xl font-bold">{match.info.teams?.find(t => t.teamId === 200)?.objectives?.dragon?.kills || 0}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-400">Barones</div>
                <div className="text-xl font-bold">{match.info.teams?.find(t => t.teamId === 200)?.objectives?.baron?.kills || 0}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 bg-[#1e293b]/80 rounded-lg p-6 border border-blue-900/30">
          <h2 className="text-xl font-semibold mb-4">Estadísticas de la partida</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-black/20 p-4 rounded">
              <div className="text-xs text-gray-400 mb-1">Duración total</div>
              <div className="text-2xl font-bold">{formatGameDuration(match.info.gameDuration || 0)}</div>
            </div>
            <div className="bg-black/20 p-4 rounded">
              <div className="text-xs text-gray-400 mb-1">Asesinatos totales</div>
              <div className="text-2xl font-bold">
                {match.info.participants?.reduce((sum, p) => sum + (p.kills || 0), 0) || 0}
              </div>
            </div>
            <div className="bg-black/20 p-4 rounded">
              <div className="text-xs text-gray-400 mb-1">Torres destruidas</div>
              <div className="text-2xl font-bold">
                {(match.info.teams?.find(t => t.teamId === 100)?.objectives?.tower?.kills || 0) + 
                 (match.info.teams?.find(t => t.teamId === 200)?.objectives?.tower?.kills || 0)}
              </div>
            </div>
            <div className="bg-black/20 p-4 rounded">
              <div className="text-xs text-gray-400 mb-1">Oro total</div>
              <div className="text-2xl font-bold">
                {match.info.participants?.reduce((sum, p) => sum + (p.goldEarned || 0), 0)?.toLocaleString() || 0}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <GoldTimelineChart matchId={matchid} region={region} />
        </div>
      </div>
    </div>
  );
}
