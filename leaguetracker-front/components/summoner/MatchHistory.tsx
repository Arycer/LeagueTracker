import React, {useCallback, useEffect, useState} from "react";
import {useMatches} from "@/hooks/useMatches";
import {MatchDto, MatchSummary} from "@/types/match";
import {useApi} from "@/hooks/useApi";
import {useToast} from "@/hooks/useToast";
import {Skeleton} from "@/components/ui/skeleton";
import {formatDistanceToNow} from "date-fns";
import {es} from "date-fns/locale";
import {Region} from "@/constants/regions";
import {Button} from "@/components/ui/button";
import {Loader2, RefreshCw} from "lucide-react";
import {ItemIcon} from "../ddragon";
import MatchDetailsModal from "./MatchDetailsModal";
import {useModal} from "@/contexts/ModalContext";
import {QUEUE_TYPES} from "@/constants/queueTypes";
import {ChampionIcon} from "@/components/ddragon";

interface MatchHistoryProps {
  puuid: string;
  region: Region;
  summonerName: string;
}

// El mapeo de queueId a nombre de cola se ha movido a constants/queueTypes.ts

// Convierte segundos a formato mm:ss
const formatGameDuration = (durationInSeconds: number): string => {
  const minutes = Math.floor(durationInSeconds / 60);
  const seconds = durationInSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const MatchHistory: React.FC<MatchHistoryProps> = ({
                                                     puuid,
                                                     region,
                                                     summonerName,
                                                   }) => {
  console.log("🎮 MatchHistory renderizando con:", {
    puuid: puuid ? `${puuid.substring(0, 10)}...` : "undefined",
    region,
    summonerName,
  });

  // Validar que tenemos los datos necesarios
  const hasValidData = Boolean(puuid && region && summonerName);

  // Usar el hook con validación
  const {matches, isLoading, error, hasMore, loadMore, refreshMatches} =
    useMatches(
      hasValidData ? puuid : undefined,
      hasValidData ? region : "EUW",
      hasValidData ? summonerName : ""
    );

  const {get} = useApi();
  const toast = useToast();
  const {openModal, closeModal} = useModal();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

  // Log para debugging
  useEffect(() => {
    console.log("📊 MatchHistory estado actualizado:", {
      hasValidData,
      matchesCount: matches.length,
      isLoading,
      hasMore,
      error: error ? error.substring(0, 50) + "..." : null,
    });
  }, [hasValidData, matches.length, isLoading, hasMore, error]);

  // Efecto para manejar la carga inicial
  useEffect(() => {
    if (
      hasValidData &&
      !isLoading &&
      !hasInitiallyLoaded &&
      matches.length === 0 &&
      !error
    ) {
      console.log("🚀 Forzando carga inicial de partidas...");
      setHasInitiallyLoaded(true);
      refreshMatches().catch((err) => {
        console.error("❌ Error en carga inicial:", err);
      });
    }
  }, [
    hasValidData,
    isLoading,
    hasInitiallyLoaded,
    matches.length,
    error,
    refreshMatches,
  ]);

  // Efecto para resetear el estado cuando cambian los datos del invocador
  useEffect(() => {
    if (hasValidData) {
      setHasInitiallyLoaded(false);
    }
  }, [puuid, region, summonerName, hasValidData]);

  // Manejar la carga manual de más partidas
  const handleLoadMore = useCallback(async () => {
    if (isLoading || isLoadingMore || !hasMore || !hasValidData) {
      console.log("⏭️ Saltando carga manual:", {
        isLoading,
        isLoadingMore,
        hasMore,
        hasValidData,
      });
      return;
    }

    console.log("⬇️ Cargando más partidas manualmente...");
    try {
      setIsLoadingMore(true);
      await loadMore();
    } catch (err) {
      console.error("❌ Error al cargar más partidas:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoading, isLoadingMore, hasMore, hasValidData, loadMore]);

  // Manejar refresh manual
  const handleRefresh = useCallback(async () => {
    if (isLoading || !hasValidData) return;

    console.log("🔄 Refresh manual iniciado");
    setIsRefreshing(true);
    try {
      await refreshMatches();
    } catch (err) {
      console.error("❌ Error al refrescar partidas:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, [isLoading, hasValidData, refreshMatches]);

  const handleOpenMatchDetails = useCallback(async (match: MatchSummary) => {
    try {
      // Cargar los detalles completos de la partida
      const response = await get<MatchDto>(
        `/api/lol/match/match/${match.matchId}?region=${region}`,
        {supressErrorToast: true}
      );

      if (response.ok && response.data) {
        // Abrir el modal con el componente MatchDetailsModal como contenido
        openModal(
          <MatchDetailsModal
            match={match}
            matchDetails={response.data}
            onClose={closeModal}
            region={region}
            summonerName={summonerName}
          />
        );
      } else {
        console.log(`No se pudieron cargar los detalles completos para ${match.matchId}`);
        toast.error("Error al cargar detalles", "No se pudieron cargar los detalles completos de la partida");
      }
    } catch (error) {
      console.error('Error al cargar detalles de partida:', error);
      toast.error('Error al cargar detalles', 'No se pudieron cargar los detalles completos de la partida');
    }
  }, [get, region, toast, openModal, closeModal, summonerName]);

  // Renderizar un esqueleto de carga para cada partida
  const renderMatchSkeleton = (index: number) => (
    <div
      key={`skeleton-${index}`}
      className="bg-slate-800 rounded-lg p-3 sm:p-4 shadow-md animate-pulse"
    >
      {/* Versión móvil */}
      <div className="flex flex-col space-y-3 md:hidden">
        {/* Encabezado con campeón e info básica */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-700 shrink-0"/>
            <div className="min-w-0 flex-1">
              <Skeleton className="w-20 h-4 mb-1 bg-slate-700"/>
              <Skeleton className="w-16 h-3 bg-slate-700"/>
            </div>
          </div>
          <div className="text-right shrink-0">
            <Skeleton className="w-12 h-3 mb-1 bg-slate-700"/>
            <Skeleton className="w-10 h-3 bg-slate-700"/>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-3 gap-2 text-center py-2">
          <div>
            <Skeleton className="w-12 h-4 mb-1 mx-auto bg-slate-700"/>
            <Skeleton className="w-8 h-3 mx-auto bg-slate-700"/>
          </div>
          <div>
            <Skeleton className="w-10 h-4 mb-1 mx-auto bg-slate-700"/>
            <Skeleton className="w-6 h-3 mx-auto bg-slate-700"/>
          </div>
          <div>
            <Skeleton className="w-16 h-4 mb-1 mx-auto bg-slate-700"/>
            <Skeleton className="w-8 h-3 mx-auto bg-slate-700"/>
          </div>
        </div>

        {/* Ítems */}
        <div className="flex justify-center gap-1 overflow-hidden">
          {Array(7)
            .fill(0)
            .map((_, idx) => (
              <Skeleton
                key={idx}
                className="w-6 h-6 sm:w-7 sm:h-7 rounded bg-slate-700 shrink-0"
              />
            ))}
        </div>
      </div>

      {/* Versión desktop */}
      <div className="hidden md:flex items-center gap-4 overflow-hidden">
        {/* Sección del campeón */}
        <div className="flex items-center gap-3 w-48 shrink-0">
          <Skeleton className="w-12 h-12 rounded-full bg-slate-700"/>
          <div className="min-w-0 flex-1">
            <Skeleton className="w-20 h-4 mb-1 bg-slate-700"/>
            <Skeleton className="w-16 h-3 bg-slate-700"/>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="flex-1 flex items-center justify-between gap-4 min-w-0">
          <div className="flex items-center gap-6 min-w-0 flex-1">
            <div className="min-w-0">
              <Skeleton className="w-16 h-4 mb-1 bg-slate-700"/>
              <Skeleton className="w-20 h-3 bg-slate-700"/>
            </div>
            <div className="min-w-0">
              <Skeleton className="w-20 h-4 mb-1 bg-slate-700"/>
              <Skeleton className="w-16 h-3 bg-slate-700"/>
            </div>
            <div className="min-w-0">
              <Skeleton className="w-12 h-4 mb-1 bg-slate-700"/>
              <Skeleton className="w-16 h-3 bg-slate-700"/>
            </div>
          </div>

          {/* Ítems */}
          <div className="flex gap-1 shrink-0">
            {Array(7)
              .fill(0)
              .map((_, idx) => (
                <Skeleton key={idx} className="w-8 h-8 rounded bg-slate-700"/>
              ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Renderizar una partida
  const renderMatch = (match: MatchSummary, index: number) => {
    const {participant, gameCreation, gameDuration, queueId} = match;
    const gameDate = new Date(gameCreation);
    const queueName = QUEUE_TYPES[queueId] || `Cola ${queueId}`;
    const isWin = match.win;
    const bgColor = isWin
      ? "bg-blue-500/10 border-blue-500/30"
      : "bg-red-500/10 border-red-500/30";
    const statusColor = isWin ? "text-blue-400" : "text-red-400";
    const statusText = isWin ? "Victoria" : "Derrota";

    // Crear una clave única combinando matchId, gameCreation e index
    const uniqueKey = `${match.matchId}-${gameCreation}-${index}`;

    // Formateamos el KDA
    const kdaRatio =
      participant.deaths === 0
        ? "Perfect"
        : (
          (participant.kills + participant.assists) /
          participant.deaths
        ).toFixed(2);

    // Calculamos el CS total
    const totalCS =
      (participant.totalMinionsKilled || 0) +
      (participant.neutralMinionsKilled || 0);

    return (
      <div
        key={uniqueKey}
        className={`${bgColor} border rounded-lg p-3 sm:p-4 shadow-md transition-all hover:shadow-lg hover:scale-[1.01] duration-200 overflow-hidden cursor-pointer`}
        onClick={() => handleOpenMatchDetails(match)}
      >
        {/* Versión móvil y tablet */}
        <div className="flex flex-col space-y-3 md:hidden">
          {/* Encabezado con campeón y resultado */}
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="relative shrink-0">
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-slate-600 overflow-hidden">
                  <ChampionIcon championId={participant.championName} size={48}/>
                </div>
                <div
                  className="absolute -bottom-1 -right-1 bg-slate-800 text-xs text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center border border-slate-600">
                  <span className="text-xs">{participant.champLevel}</span>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-white font-medium text-sm sm:text-base truncate">
                  {participant.championName}
                </div>
                <div
                  className={`${statusColor} text-xs sm:text-sm font-medium`}
                >
                  {statusText}
                </div>
              </div>
            </div>

            {/* Tiempo de la partida */}
            <div className="text-right shrink-0">
              <div className="text-slate-400 text-xs mb-1">
                {formatDistanceToNow(gameDate, {addSuffix: true, locale: es})}
              </div>
              <div className="text-white text-xs">
                {formatGameDuration(gameDuration)}
              </div>
            </div>
          </div>

          {/* Estadísticas en grid para móvil/tablet */}
          <div className="grid grid-cols-3 gap-1 text-center border-t border-b border-slate-700 py-2">
            <div className="min-w-0">
              <div
                className="text-white text-sm font-medium truncate">{`${participant.kills}/${participant.deaths}/${participant.assists}`}</div>
              <div className="text-slate-400 text-xs truncate">
                {kdaRatio} KDA
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-white text-sm truncate">{totalCS}</div>
              <div className="text-slate-400 text-xs">CS</div>
            </div>
            <div className="min-w-0">
              <div className="text-white text-sm truncate" title={queueName}>
                {queueName.length > 12
                  ? queueName.substring(0, 12) + "..."
                  : queueName}
              </div>
              <div className="text-slate-400 text-xs">Tipo</div>
            </div>
          </div>

          {/* Ítems en vista móvil */}
          <div className="flex justify-center gap-1 overflow-hidden">
            {[
              participant.item0,
              participant.item1,
              participant.item2,
              participant.item3,
              participant.item4,
              participant.item5,
              participant.item6,
            ].map((itemId, idx) => (
              <div
                key={`${uniqueKey}-item-${idx}`}
                className="w-6 h-6 sm:w-7 sm:h-7 bg-slate-800 rounded overflow-hidden border border-slate-600 shrink-0"
              >
                {itemId && itemId > 0 && (
                  <ItemIcon
                    itemId={itemId.toString()}
                    className="w-full h-full"
                    withBorder={false}
                    alt={`Item ${itemId}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Versión desktop */}
        <div className="hidden md:flex items-center gap-4 overflow-hidden">
          {/* Sección del campeón */}
          <div className="flex items-center gap-3 w-48 shrink-0">
            <div className="relative">
              <ChampionIcon
                championId={participant.championName}
                size={48}
                className="rounded-full border-2 border-slate-600"
                alt={participant.championName}
                withBorder={false}
                withTooltip={false}
              />

              <div
                className="absolute -bottom-1 -right-1 bg-slate-800 text-xs text-white rounded-full w-5 h-5 flex items-center justify-center border border-slate-600">
                {participant.champLevel}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-white font-medium truncate">
                {participant.championName}
              </div>
              <div className={`${statusColor} text-sm font-medium`}>
                {statusText}
              </div>
            </div>
          </div>

          {/* Estadísticas y contenido principal */}
          <div className="flex-1 flex items-center justify-between gap-4 min-w-0">
            {/* Contenedor de estadísticas */}
            <div className="flex items-center gap-6 min-w-0 flex-1">
              {/* KDA */}
              <div className="min-w-0">
                <div className="text-white font-medium">
                  {`${participant.kills}/${participant.deaths}/${participant.assists}`}
                </div>
                <div className="text-slate-400 text-xs truncate">
                  {participant.deaths === 0
                    ? "KDA Perfecto"
                    : `${kdaRatio} KDA`}
                </div>
              </div>

              {/* Información de la partida */}
              <div className="min-w-0 flex-1">
                <div className="text-white text-sm truncate" title={queueName}>
                  {queueName}
                </div>
                <div className="text-slate-400 text-xs truncate">
                  {formatDistanceToNow(gameDate, {
                    addSuffix: true,
                    locale: es,
                  })}
                </div>
              </div>

              {/* CS y duración */}
              <div className="min-w-0">
                <div className="text-white text-sm">{totalCS} CS</div>
                <div className="text-slate-400 text-xs">
                  {formatGameDuration(gameDuration)}
                </div>
              </div>
            </div>

            {/* Ítems - Solo en desktop grande */}
            <div className="hidden lg:flex gap-1 shrink-0">
              {[
                participant.item0,
                participant.item1,
                participant.item2,
                participant.item3,
                participant.item4,
                participant.item5,
                participant.item6,
              ].map((itemId, idx) => (
                <ItemIcon
                  key={`${uniqueKey}-desktop-item-${idx}`}
                  itemId={itemId?.toString() || "0"}
                  size={32}
                  className="w-8 h-8"
                  withBorder={true}
                  emptySlot={!itemId || itemId <= 0}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Si no tenemos datos válidos, mostrar mensaje de error
  if (!hasValidData) {
    return (
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 shadow-md">
        <p className="text-yellow-400 font-medium mb-2">
          ⚠️ No se pueden cargar las partidas: faltan datos del invocador
        </p>
        <div className="mt-2 text-xs text-slate-400 space-y-1">
          <p>PUUID: {puuid ? "✅ Disponible" : "❌ Faltante"}</p>
          <p>Región: {region ? "✅ " + region : "❌ Faltante"}</p>
          <p>Nombre: {summonerName ? "✅ " + summonerName : "❌ Faltante"}</p>
        </div>
      </div>
    );
  }

  // Si hay error en la carga
  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 shadow-md">
        <div className="flex items-center justify-between mb-3 gap-2">
          <p className="text-red-400 font-medium min-w-0 flex-1">
            ❌ Error al cargar el historial de partidas
          </p>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            size="sm"
            variant="outline"
            className="text-red-400 border-red-500/30 hover:bg-red-500/10 shrink-0"
          >
            {isRefreshing ? (
              <Loader2 className="w-4 h-4 animate-spin"/>
            ) : (
              <RefreshCw className="w-4 h-4"/>
            )}
          </Button>
        </div>
        <p className="text-red-300 text-sm mb-3 break-words">{error}</p>
        <div className="text-xs text-slate-400 space-y-1">
          <p className="break-all">PUUID: {puuid.substring(0, 15)}...</p>
          <p>Región: {region}</p>
          <p className="break-words">Invocador: {summonerName}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 min-w-0">

      <div className="bg-slate-800 rounded-lg p-4 sm:p-6 shadow-md">
        <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
          <h2 className="text-lg sm:text-xl font-bold text-white min-w-0 flex-1">
            🎮 Historial de Partidas
          </h2>
        </div>

        {/* Lista de partidas */}
        <div className="space-y-3 sm:space-y-4">
          {/* Partidas cargadas */}
          {matches.map((match, index) => renderMatch(match, index))}

          {/* Estado de carga inicial */}
          {isLoading && matches.length === 0 && (
            <>
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4"/>
                <p className="text-white font-medium text-center">
                  Cargando historial de partidas...
                </p>
                <p className="text-slate-400 text-sm mt-1 text-center">
                  Esto puede tardar unos segundos
                </p>
              </div>
              {/* Mostrar algunos skeletons mientras carga */}
              {Array(3)
                .fill(0)
                .map((_, idx) => renderMatchSkeleton(idx))}
            </>
          )}

          {/* Estado de carga de más partidas */}
          {(isLoadingMore || (isLoading && matches.length > 0)) && (
            <div className="space-y-3 sm:space-y-4">
              {Array(3)
                .fill(0)
                .map((_, idx) => renderMatchSkeleton(idx))}
              <div className="flex justify-center pt-2">
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin"/>
              </div>
            </div>
          )}

          {/* Botón para cargar más partidas - solo mostrar si no está cargando */}
          {hasMore && matches.length > 0 && !isLoading && !isLoadingMore && (
            <div className="flex justify-center mt-6">
              <Button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6"
              >
                Cargar más partidas
              </Button>
            </div>
          )}

          {/* Mensaje cuando no hay más partidas */}
          {!isLoading && !hasMore && matches.length > 0 && (
            <div className="text-center text-slate-400 py-4 border-t border-slate-700">
              📭 No hay más partidas para mostrar
            </div>
          )}

          {/* Resto del código se mantiene igual... */}
        </div>
      </div>
    </div>
  );
};

export default MatchHistory;
