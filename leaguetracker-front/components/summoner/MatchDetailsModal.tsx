import React from "react";
import {X} from "lucide-react";
import {MatchDto, MatchSummary} from "@/types/match";
import {formatDistanceToNow} from "date-fns";
import {es} from "date-fns/locale";
import {Button} from "@/components/ui/button";
import {ChampionIcon, ItemIcon} from "@/components/ddragon";
import Link from "next/link";
import {Region} from "@/constants/regions";
import {QUEUE_TYPES} from "@/constants/queueTypes";

interface MatchDetailsModalProps {
  match: MatchSummary | null;
  matchDetails?: MatchDto | null;
  onClose: () => void;
  region: Region;
  summonerName: string;
}

// Convierte segundos a formato mm:ss
const formatGameDuration = (durationInSeconds: number): string => {
  const minutes = Math.floor(durationInSeconds / 60);
  const seconds = durationInSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

// Calcula el KDA
const calculateKDA = (
  kills: number,
  deaths: number,
  assists: number
): string => {
  if (deaths === 0) return "Perfect";
  return ((kills + assists) / deaths).toFixed(2);
};

const MatchDetailsModal: React.FC<MatchDetailsModalProps> = ({
                                                               match,
                                                               matchDetails,
                                                               onClose,
                                                               region,
                                                             }) => {
  if (!match) return null;

  const {participant, gameCreation, gameDuration, queueId} = match;
  const gameDate = new Date(gameCreation);
  const queueName = QUEUE_TYPES[queueId] || `Cola ${queueId}`;
  const isWin = match.win;
  const statusColor = isWin ? "text-blue-400" : "text-red-400";
  const statusText = isWin ? "Victoria" : "Derrota";
  const statusBg = isWin ? "bg-blue-500/20" : "bg-red-500/20";
  const statusBorder = isWin ? "border-blue-500/30" : "border-red-500/30";

  // Calcular stats de la partida
  const totalCs =
    (participant.totalMinionsKilled || 0) +
    (participant.neutralMinionsKilled || 0);
  const csPerMinute = ((totalCs / gameDuration) * 60).toFixed(1);
  const kdaRatio = calculateKDA(
    participant.kills,
    participant.deaths,
    participant.assists
  );

  // Si hay detalles completos de la partida, preparar los equipos
  const blueTeam =
    matchDetails?.info.participants.filter((p) => p.teamId === 100) || [];
  const redTeam =
    matchDetails?.info.participants.filter((p) => p.teamId === 200) || [];

  return (
    <div className="bg-slate-800 rounded-lg w-full shadow-xl border border-slate-700">
      {/* Cabecera */}
      <div
        className={`p-4 flex items-center justify-between ${statusBg} ${statusBorder} border-b`}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <ChampionIcon
              championId={participant.championName}
              size={48}
              className="rounded-full border-2 border-slate-600"
            />

            <div
              className="absolute -bottom-1 -right-1 bg-slate-800 text-xs text-white rounded-full w-5 h-5 flex items-center justify-center border border-slate-600">
              {participant.champLevel}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {participant.championName}
            </h3>
            <div className={`${statusColor} text-sm font-medium`}>
              {statusText}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/matches/${region}/${match.matchId}`}>
            <Button
              variant="outline"
              size="sm"
              className={`
                  bg-blue-500/20
                  border border-blue-500/40 
                  text-blue-300 
                  hover:bg-blue-500/20 
                  hover:text-blue-100 
                  transition-colors duration-150
                `}
            >
              Ver detalles
            </Button>
          </Link>
          <div className="text-right hidden sm:block">
            <div className="text-white font-medium">{queueName}</div>
            <div className="text-slate-400 text-sm">
              {formatDistanceToNow(gameDate, {addSuffix: true, locale: es})}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5"/>
          </Button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-4 space-y-6">
        {/* Información general */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-700/50 p-3 rounded-lg">
            <div className="text-slate-400 text-sm mb-1">Puntuación KDA</div>
            <div className="text-white text-lg font-bold">
              {`${participant.kills}/${participant.deaths}/${participant.assists}`}
            </div>
            <div className="text-slate-300 text-sm">{kdaRatio} KDA</div>
          </div>

          <div className="bg-slate-700/50 p-3 rounded-lg">
            <div className="text-slate-400 text-sm mb-1">Farm</div>
            <div className="text-white text-lg font-bold">{totalCs} CS</div>
            <div className="text-slate-300 text-sm">
              {csPerMinute} por minuto
            </div>
          </div>

          <div className="bg-slate-700/50 p-3 rounded-lg">
            <div className="text-slate-400 text-sm mb-1">Duración</div>
            <div className="text-white text-lg font-bold">
              {formatGameDuration(gameDuration)}
            </div>
            <div className="text-slate-300 text-sm">
              {new Date(gameCreation).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Items y Estadísticas - en layout lado a lado */}
        <div className="mt-4 flex flex-col sm:flex-row gap-4">
          {/* Items */}
          <div className="bg-slate-700/50 rounded-lg p-4 sm:w-1/2">
            <h4 className="text-white font-medium mb-3">Ítems</h4>
            <div className="grid grid-cols-3 gap-2">
              {Array.from({length: 6}).map((_, index) => {
                const itemId = participant[
                  `item${index}` as keyof typeof participant
                  ] as number;
                return (
                  <div key={index} className="flex justify-center">
                    <ItemIcon
                      itemId={itemId?.toString() || "0"}
                      size={40}
                      withBorder={true}
                      withTooltip={true}
                      emptySlot={!itemId || Number(itemId) <= 0}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Estadísticas detalladas */}
          <div className="bg-slate-700/50 rounded-lg p-4 sm:w-1/2">
            <h4 className="text-white font-medium mb-3">
              Estadísticas detalladas
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-slate-400 text-sm">Daño a campeones</div>
                <div className="text-white font-medium">
                  {participant.totalDamageDealtToChampions?.toLocaleString() ||
                    "0"}
                </div>
              </div>
              <div>
                <div className="text-slate-400 text-sm">Daño recibido</div>
                <div className="text-white font-medium">
                  {participant.totalDamageTaken?.toLocaleString() || "0"}
                </div>
              </div>
              <div>
                <div className="text-slate-400 text-sm">Oro ganado</div>
                <div className="text-white font-medium">
                  {participant.goldEarned?.toLocaleString() || "0"}
                </div>
              </div>
              <div>
                <div className="text-slate-400 text-sm">Ward colocados</div>
                <div className="text-white font-medium">
                  {participant.wardsPlaced || "0"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Jugadores (solo si tenemos detalles completos) */}
        {(blueTeam.length > 0 || redTeam.length > 0) && (
          <div className="bg-slate-700/30 p-4 rounded-lg">
            <h4 className="text-white font-medium mb-3">Jugadores</h4>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Equipo Azul */}
              <div>
                <div
                  className="text-blue-400 font-medium mb-2 text-center bg-blue-500/20 py-1 rounded-md">
                  Equipo Azul{" "}
                  {matchDetails?.info.teams[0]?.win
                    ? "(Victoria)"
                    : "(Derrota)"}
                </div>
                <div className="space-y-2">
                  {blueTeam.map((player) => (
                    <div
                      key={player.summonerId}
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-700/50"
                    >
                      <ChampionIcon
                        championId={player.championName}
                        size={32}
                        className="rounded-full border border-slate-600"
                      />

                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/summoner/${region}/${player.riotIdGameName}/${player.riotIdTagline}`}
                          className="text-white text-sm font-medium truncate hover:text-blue-400 block"
                        >
                          {`${player.riotIdGameName}#${player.riotIdTagline}`}
                        </Link>
                        <div className="text-slate-400 text-xs">
                          {`${player.kills}/${player.deaths}/${player.assists}`}
                        </div>
                      </div>
                      <div className="text-white text-xs text-right">
                        {player.totalDamageDealtToChampions?.toLocaleString()}
                        <div className="text-slate-400 text-xs">Daño</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Equipo Rojo */}
              <div>
                <div
                  className="text-red-400 font-medium mb-2 text-center bg-red-500/20 py-1 rounded-md">
                  Equipo Rojo{" "}
                  {matchDetails?.info.teams[1]?.win
                    ? "(Victoria)"
                    : "(Derrota)"}
                </div>
                <div className="space-y-2">
                  {redTeam.map((player) => (
                    <div
                      key={player.summonerId}
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-700/50"
                    >
                      <ChampionIcon
                        championId={player.championName}
                        size={32}
                        className="rounded-full border border-slate-600"
                      />

                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/summoner/${region}/${player.riotIdGameName}/${player.riotIdTagline}`}
                          className="text-white text-sm font-medium truncate hover:text-red-400 block"
                        >
                          {`${player.riotIdGameName}#${player.riotIdTagline}`}
                        </Link>
                        <div className="text-slate-400 text-xs">
                          {`${player.kills}/${player.deaths}/${player.assists}`}
                        </div>
                      </div>
                      <div className="text-white text-xs text-right">
                        {player.totalDamageDealtToChampions?.toLocaleString()}
                        <div className="text-slate-400 text-xs">Daño</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* El enlace a la página detallada se ha movido a la cabecera */}
      </div>
    </div>
  );
};

export default MatchDetailsModal;
