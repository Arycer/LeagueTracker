'use client';

import React, {useEffect, useState} from 'react';
import {useApi} from '@/hooks/useApi';
import {MatchDto} from '@/types/match';
import {Loader2} from 'lucide-react';
import {useParams} from 'next/navigation';
import {ChampionIcon, ItemIcon} from '@/components/ddragon';
import Link from 'next/link';
import {QUEUE_TYPES} from '@/constants/queueTypes';
import {useToast} from '@/hooks/useToast';
import {ScrollArea} from '@/components/ui/scroll-area';
import {GoldTimelineChart} from '@/components/summoner/GoldTimelineChart';

const formatGameDuration = (durationInSeconds: number): string => {
  const minutes = Math.floor(durationInSeconds / 60);
  const seconds = durationInSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const calculateKDA = (kills: number, deaths: number, assists: number): string => {
  if (deaths === 0) return 'Perfect';
  return ((kills + assists) / deaths).toFixed(2);
};

export default function MatchDetailsPage() {
  const params = useParams();
  const {region, matchId} = params;
  const {get} = useApi();
  const toast = useToast();

  const [matchDetails, setMatchDetails] = useState<MatchDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatchDetails = async () => {
      if (!region || !matchId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await get<MatchDto>(`/api/lol/match/match/${matchId}?region=${region}`);

        if (response.ok && response.data) {
          setMatchDetails(response.data);
        } else {
          setError('No se pudieron cargar los detalles de la partida');
          toast.error('Error al cargar la partida', 'No se encontraron los detalles de esta partida');
        }
      } catch (error) {
        console.error('Error al cargar detalles de partida:', error);
        setError('Ocurrió un error al intentar cargar los detalles de la partida');
        toast.error('Error al cargar la partida', 'Ocurrió un error al intentar cargar los detalles');
      } finally {
        setLoading(false);
      }
    };

    fetchMatchDetails();
    
  }, [region, matchId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4"/>
            <h1 className="text-2xl font-bold mb-2">Cargando detalles de la partida</h1>
            <p className="text-slate-400">Estamos obteniendo toda la información...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !matchDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center py-20">
            <div
              className="bg-red-500/20 p-6 rounded-lg border border-red-500/30 max-w-xl w-full text-center mb-8">
              <h1 className="text-2xl font-bold mb-4">No se encontró la partida</h1>
              <p className="text-slate-300 mb-6">{error || 'No se pudieron cargar los detalles de esta partida'}</p>
              <Link href="/" className="text-blue-400 hover:text-blue-300 font-medium">
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const {info} = matchDetails;
  const gameDate = new Date(info.gameCreation);
  const gameDuration = info.gameDuration;
  const queueName = QUEUE_TYPES[info.queueId] || `Cola ${info.queueId}`;
  const blueTeam = info.participants.filter(p => p.teamId === 100);
  const redTeam = info.participants.filter(p => p.teamId === 200);
  const blueTeamWin = info.teams[0].win;
  const redTeamWin = info.teams[1].win;

  const blueTeamKills = blueTeam.reduce((sum, p) => sum + p.kills, 0);
  const blueTeamDeaths = blueTeam.reduce((sum, p) => sum + p.deaths, 0);
  const blueTeamAssists = blueTeam.reduce((sum, p) => sum + p.assists, 0);
  const blueTeamGold = blueTeam.reduce((sum, p) => sum + p.goldEarned, 0);

  const redTeamKills = redTeam.reduce((sum, p) => sum + p.kills, 0);
  const redTeamDeaths = redTeam.reduce((sum, p) => sum + p.deaths, 0);
  const redTeamAssists = redTeam.reduce((sum, p) => sum + p.assists, 0);
  const redTeamGold = redTeam.reduce((sum, p) => sum + p.goldEarned, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white pb-12">
      {}
      <div className="bg-slate-800 border-b border-slate-700 py-6 mb-8 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">{queueName}</h1>
              <p className="text-slate-400">
                {gameDate.toLocaleDateString()} {gameDate.toLocaleTimeString()} ·
                Duración: {formatGameDuration(gameDuration)}
              </p>
            </div>
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${blueTeamWin ? 'bg-blue-500' : 'bg-red-500'}`}></div>
                <span className={blueTeamWin ? 'text-blue-400' : 'text-red-400'}>
                  {blueTeamWin ? 'Victoria Azul' : 'Derrota Azul'}
                </span>
              </div>
              <div className="text-xl font-bold">
                {blueTeamKills} - {redTeamKills}
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${redTeamWin ? 'bg-blue-500' : 'bg-red-500'}`}></div>
                <span className={redTeamWin ? 'text-blue-400' : 'text-red-400'}>
                  {redTeamWin ? 'Victoria Roja' : 'Derrota Roja'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {}
          <div
            className={`${blueTeamWin ? 'bg-blue-500/10 border-blue-500/30' : 'bg-slate-700/30 border-slate-600/30'} border rounded-lg overflow-hidden`}>
            <div className="bg-blue-500/20 py-3 px-4 border-b border-blue-500/30">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-blue-400">Equipo Azul</h2>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">{blueTeamKills}</span>
                  <span className="text-slate-400">/</span>
                  <span className="text-lg font-bold">{blueTeamDeaths}</span>
                  <span className="text-slate-400">/</span>
                  <span className="text-lg font-bold">{blueTeamAssists}</span>
                  <span className="text-slate-400 ml-3">|</span>
                  <span className="text-yellow-400 ml-3">{blueTeamGold.toLocaleString()} oro</span>
                </div>
              </div>
            </div>

            <ScrollArea className="max-h-[500px]">
              <div className="divide-y divide-blue-500/10">
                {blueTeam.map((player) => (
                  <div key={player.summonerId} className="p-4 hover:bg-blue-500/5">
                    <div className="flex items-center gap-4">
                      {}
                      <div className="relative">
                        <ChampionIcon
                          championId={player.championName}
                          size={48}
                          className="rounded-full border-2 border-slate-700"
                          alt={player.championName}
                        />
                        <div
                          className="absolute -bottom-1 -right-1 bg-slate-800 text-xs text-white rounded-full w-5 h-5 flex items-center justify-center border border-slate-600">
                          {player.champLevel}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/summoner/${region}/${player.riotIdGameName}/${player.riotIdTagline}`}
                          className="text-white text-base font-medium hover:text-blue-400 line-clamp-1"
                        >
                          {player.riotIdGameName}#{player.riotIdTagline}
                        </Link>
                        <div className="flex items-center mt-1">
                          <div className="text-slate-300 text-sm">
                            {player.kills}/{player.deaths}/{player.assists}
                            <span className="text-slate-400 ml-2">
                              ({calculateKDA(player.kills, player.deaths, player.assists)} KDA)
                            </span>
                          </div>
                        </div>
                      </div>

                      {}
                      <div className="text-right hidden lg:block">
                        <div
                          className="text-slate-300">{player.totalDamageDealtToChampions.toLocaleString()}</div>
                        <div className="text-slate-400 text-sm">Daño</div>
                      </div>

                      {}
                      <div className="hidden md:flex gap-1">
                        {[
                          player.item0,
                          player.item1,
                          player.item2,
                          player.item3,
                          player.item4,
                          player.item5,
                          player.item6
                        ].map((itemId, idx) => (
                          <ItemIcon
                            key={`item-${player.summonerId}-${idx}`}
                            itemId={itemId?.toString() || "0"}
                            size={24}
                            withBorder={true}
                            emptySlot={!itemId || itemId <= 0}
                          />
                        ))}
                      </div>
                    </div>

                    {}
                    <div className="mt-3 md:hidden">
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {[
                          player.item0,
                          player.item1,
                          player.item2,
                          player.item3,
                          player.item4,
                          player.item5,
                          player.item6
                        ].map((itemId, idx) => (
                          <ItemIcon
                            key={`item-mobile-${player.summonerId}-${idx}`}
                            itemId={itemId?.toString() || "0"}
                            size={24}
                            withBorder={true}
                            emptySlot={!itemId || itemId <= 0}
                          />
                        ))}
                      </div>
                      <div className="text-slate-300 text-sm">
                        Daño: {player.totalDamageDealtToChampions.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {}
          <div
            className={`${redTeamWin ? 'bg-red-500/10 border-red-500/30' : 'bg-slate-700/30 border-slate-600/30'} border rounded-lg overflow-hidden`}>
            <div className="bg-red-500/20 py-3 px-4 border-b border-red-500/30">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-red-400">Equipo Rojo</h2>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">{redTeamKills}</span>
                  <span className="text-slate-400">/</span>
                  <span className="text-lg font-bold">{redTeamDeaths}</span>
                  <span className="text-slate-400">/</span>
                  <span className="text-lg font-bold">{redTeamAssists}</span>
                  <span className="text-slate-400 ml-3">|</span>
                  <span className="text-yellow-400 ml-3">{redTeamGold.toLocaleString()} oro</span>
                </div>
              </div>
            </div>

            <ScrollArea className="max-h-[500px]">
              <div className="divide-y divide-red-500/10">
                {redTeam.map((player) => (
                  <div key={player.summonerId} className="p-4 hover:bg-red-500/5">
                    <div className="flex items-center gap-4">
                      {}
                      <div className="relative">
                        <ChampionIcon
                          championId={player.championName}
                          size={48}
                          className="rounded-full border-2 border-slate-700"
                          alt={player.championName}
                        />

                        <div
                          className="absolute -bottom-1 -right-1 bg-slate-800 text-xs text-white rounded-full w-5 h-5 flex items-center justify-center border border-slate-600">
                          {player.champLevel}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/summoner/${region}/${player.riotIdGameName}/${player.riotIdTagline}`}
                          className="text-white text-base font-medium hover:text-red-400 line-clamp-1"
                        >
                          {player.riotIdGameName}#{player.riotIdTagline}
                        </Link>
                        <div className="flex items-center mt-1">
                          <div className="text-slate-300 text-sm">
                            {player.kills}/{player.deaths}/{player.assists}
                            <span className="text-slate-400 ml-2">
                              ({calculateKDA(player.kills, player.deaths, player.assists)} KDA)
                            </span>
                          </div>
                        </div>
                      </div>

                      {}
                      <div className="text-right hidden lg:block">
                        <div
                          className="text-slate-300">{player.totalDamageDealtToChampions.toLocaleString()}</div>
                        <div className="text-slate-400 text-sm">Daño</div>
                      </div>

                      {}
                      <div className="hidden md:flex gap-1">
                        {[
                          player.item0,
                          player.item1,
                          player.item2,
                          player.item3,
                          player.item4,
                          player.item5,
                          player.item6
                        ].map((itemId, idx) => (
                          <ItemIcon
                            key={`item-${player.summonerId}-${idx}`}
                            itemId={itemId?.toString() || "0"}
                            size={24}
                            withBorder={true}
                            emptySlot={!itemId || itemId <= 0}
                          />
                        ))}
                      </div>
                    </div>

                    {}
                    <div className="mt-3 md:hidden">
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {[
                          player.item0,
                          player.item1,
                          player.item2,
                          player.item3,
                          player.item4,
                          player.item5,
                          player.item6
                        ].map((itemId, idx) => (
                          <ItemIcon
                            key={`item-mobile-${player.summonerId}-${idx}`}
                            itemId={itemId?.toString() || "0"}
                            size={24}
                            withBorder={true}
                            emptySlot={!itemId || itemId <= 0}
                          />
                        ))}
                      </div>
                      <div className="text-slate-300 text-sm">
                        Daño: {player.totalDamageDealtToChampions.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {}
        <div className="mb-8">
          <GoldTimelineChart
            matchId={matchId as string}
            region={region as string}
          />
        </div>

        {}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-6">Estadísticas detalladas</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left pb-2 pr-4 text-slate-400 font-medium">Jugador</th>
                <th className="text-center pb-2 px-4 text-slate-400 font-medium">Daño</th>
                <th className="text-center pb-2 px-4 text-slate-400 font-medium">Oro</th>
                <th className="text-center pb-2 px-4 text-slate-400 font-medium">CS</th>
                <th className="text-center pb-2 px-4 text-slate-400 font-medium">Visión</th>
                <th className="text-center pb-2 px-4 text-slate-400 font-medium">CC</th>
              </tr>
              </thead>
              <tbody>
              {}
              {blueTeam.map((player) => (
                <tr key={`stats-${player.summonerId}`}
                    className="border-b border-slate-700/50 hover:bg-slate-700/20">
                  <td className="py-3 pr-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <ChampionIcon
                        championId={player.championName}
                        size={24}
                        className="rounded-full"
                      />

                      <Link
                        href={`/summoner/${region}/${player.riotIdGameName}/${player.riotIdTagline}`}
                        className="text-white hover:text-blue-400"
                      >
                        {player.riotIdGameName}
                      </Link>
                    </div>
                  </td>
                  <td className="text-center py-3 px-4">{player.totalDamageDealtToChampions.toLocaleString()}</td>
                  <td className="text-center py-3 px-4">{player.goldEarned.toLocaleString()}</td>
                  <td
                    className="text-center py-3 px-4">{(player.totalMinionsKilled || 0) + (player.neutralMinionsKilled || 0)}</td>
                  <td className="text-center py-3 px-4">{player.wardsPlaced || 0} / {player.wardsKilled || 0}</td>
                  <td className="text-center py-3 px-4">{Math.round(player.timeCCingOthers || 0)}</td>
                </tr>
              ))}

              {}
              <tr className="h-6 bg-slate-700/10">
                <td colSpan={6}></td>
              </tr>

              {}
              {redTeam.map((player) => (
                <tr key={`stats-${player.summonerId}`}
                    className="border-b border-slate-700/50 hover:bg-slate-700/20">
                  <td className="py-3 pr-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <ChampionIcon
                        championId={player.championName}
                        size={24}
                        className="rounded-full"
                      />
                      <Link
                        href={`/summoner/${region}/${player.riotIdGameName}/${player.riotIdTagline}`}
                        className="text-white hover:text-red-400"
                      >
                        {player.riotIdGameName}
                      </Link>
                    </div>
                  </td>
                  <td className="text-center py-3 px-4">{player.totalDamageDealtToChampions.toLocaleString()}</td>
                  <td className="text-center py-3 px-4">{player.goldEarned.toLocaleString()}</td>
                  <td
                    className="text-center py-3 px-4">{(player.totalMinionsKilled || 0) + (player.neutralMinionsKilled || 0)}</td>
                  <td className="text-center py-3 px-4">{player.wardsPlaced || 0} / {player.wardsKilled || 0}</td>
                  <td className="text-center py-3 px-4">{Math.round(player.timeCCingOthers || 0)}</td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>

        {}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-3 text-slate-300">Información general</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">ID de partida:</span>
                  <span className="text-white font-mono">{matchId as string}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Región:</span>
                  <span className="text-white">{region as string}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Fecha:</span>
                  <span className="text-white">{gameDate.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Duración:</span>
                  <span className="text-white">{formatGameDuration(gameDuration)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tipo de cola:</span>
                  <span className="text-white">{queueName}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3 text-slate-300">Objetivos Equipo Azul</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Torres:</span>
                  <span className="text-white">{info.teams[0].objectives.tower.kills}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Inhibidores:</span>
                  <span className="text-white">{info.teams[0].objectives.inhibitor.kills}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Heraldos:</span>
                  <span className="text-white">{info.teams[0].objectives.riftHerald.kills}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Dragones:</span>
                  <span className="text-white">{info.teams[0].objectives.dragon.kills}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Barones:</span>
                  <span className="text-white">{info.teams[0].objectives.baron.kills}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3 text-slate-300">Objetivos Equipo Rojo</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Torres:</span>
                  <span className="text-white">{info.teams[1].objectives.tower.kills}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Inhibidores:</span>
                  <span className="text-white">{info.teams[1].objectives.inhibitor.kills}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Heraldos:</span>
                  <span className="text-white">{info.teams[1].objectives.riftHerald.kills}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Dragones:</span>
                  <span className="text-white">{info.teams[1].objectives.dragon.kills}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Barones:</span>
                  <span className="text-white">{info.teams[1].objectives.baron.kills}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
