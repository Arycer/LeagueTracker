import {useCallback, useEffect, useRef, useState} from 'react';
import {MatchDto, MatchSummary} from '@/types/match';
import {useApi} from './useApi';
import {useToast} from './useToast';
import {Region} from '@/constants/regions';

interface UseMatchesResult {
  matches: MatchSummary[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refreshMatches: () => Promise<void>;
}

export const useMatches = (
  puuid: string | undefined,
  region: Region,
  summonerName: string
): UseMatchesResult => {
  const {get} = useApi();
  const [matches, setMatches] = useState<MatchSummary[]>([]);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const toast = useToast();
  const pageSize = 10;

  const isLoadingRef = useRef(false);
  const currentPuuidRef = useRef<string | undefined>(puuid);

  const fetchMatchIds = useCallback(async (pageNum: number): Promise<string[]> => {
    if (!puuid) {
      console.log('No puuid disponible para fetchMatchIds');
      return [];
    }

    try {
      console.log(`Obteniendo IDs de partidas - página: ${pageNum}, puuid: ${puuid.substring(0, 10)}...`);
      const response = await get<string[]>(
        `/api/lol/match/matches?puuid=${puuid}&region=${region}&page=${pageNum}&pageSize=${pageSize}`,
        {supressErrorToast: true}
      );

      if (response.ok && response.data) {
        console.log(`✅ Obtenidos ${response.data.length} IDs de partidas:`, response.data);
        return response.data;
      } else {
        console.error('❌ Error al obtener IDs de partidas:', response.error);
        throw new Error(response.error || 'Error al obtener IDs de partidas');
      }
    } catch (err) {
      console.error('❌ Excepción al obtener IDs de partidas:', err);
      throw err;
    }
  }, [puuid, region, get]);

  const fetchMatchDetails = useCallback(async (matchId: string): Promise<MatchDto | null> => {
    try {
      console.log(`📝 Obteniendo detalles para partida: ${matchId}`);

      const response = await get<MatchDto>(
        `/api/lol/match/match/${matchId}?region=${region}`,
        {supressErrorToast: true}
      );

      if (response.ok && response.data) {
        console.log(`✅ Detalles obtenidos para partida ${matchId}`);
        return response.data;
      } else {
        if (response.status === 403) {
          console.log(`🚫 Partida ${matchId} no disponible (403 - restringida por Riot)`);
          return null;
        }

        console.error(`❌ Error al obtener detalles de la partida ${matchId}:`, response.error);
        return null;
      }
    } catch (err) {
      console.error(`❌ Excepción al obtener detalles de la partida ${matchId}:`, err);
      return null;
    }
  }, [region, get]);

  const createMatchSummary = useCallback((match: MatchDto, name: string): MatchSummary | null => {
    try {
      console.log(`🔍 Creando resumen para partida ${match.metadata.matchId}, buscando jugador: ${name}`);

      let participant = match.info.participants.find(
        p => p.puuid === puuid
      );

      if (!participant) {
        console.error(`❌ No se encontró al participante ${name} en la partida ${match.metadata.matchId}`);
        console.log('Participantes disponibles:', match.info.participants.map(p => p.summonerName));
        return null;
      }

      console.log(`✅ Participante encontrado: ${participant.summonerName}`);

      const team = match.info.teams.find(t => t.teamId === participant.teamId);
      const win = team?.win || false;

      return {
        matchId: match.metadata.matchId,
        gameCreation: match.info.gameCreation,
        gameDuration: match.info.gameDuration,
        gameMode: match.info.gameMode,
        queueId: match.info.queueId,
        mapId: match.info.mapId,
        participant,
        win
      };
    } catch (err) {
      console.error('❌ Error al crear resumen de partida:', err);
      return null;
    }
  }, []);

  const loadMore = useCallback(async (): Promise<void> => {
    if (isLoadingRef.current || !hasMore || !puuid) {
      console.log('⏭️ Saltando loadMore:', {
        isLoading: isLoadingRef.current,
        hasMore,
        puuid: !!puuid
      });
      return;
    }

    console.log(`🚀 Iniciando carga de más partidas - página: ${page}`);
    isLoadingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const newMatchIds = await fetchMatchIds(page);

      if (newMatchIds.length === 0) {
        console.log('📭 No hay más partidas disponibles');
        setHasMore(false);
        return;
      }

      console.log(`📋 Procesando ${newMatchIds.length} partidas...`);

      const matchResults: (MatchDto | null)[] = [];
      let restrictedCount = 0;

      for (const id of newMatchIds) {
        const matchDetail = await fetchMatchDetails(id);
        if (matchDetail === null) {
          restrictedCount++;
        }
        matchResults.push(matchDetail);

        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const newMatches = matchResults
        .filter((match): match is MatchDto => match !== null)
        .map(match => createMatchSummary(match, summonerName))
        .filter((summary): summary is MatchSummary => summary !== null);

      console.log(`✅ Se procesaron ${newMatches.length} partidas exitosamente`);

      if (restrictedCount > 0) {
        console.log(`🚫 ${restrictedCount} partidas omitidas (no disponibles o restringidas)`);
      }

      setMatches(prevMatches => [...prevMatches, ...newMatches]);
      setPage(prevPage => prevPage + 1);

      if (newMatchIds.length < pageSize) {
        console.log('📭 Se alcanzó el final de las partidas disponibles en la API');
        setHasMore(false);
      } else {
        console.log(`✅ Página completa procesada (${newMatchIds.length} IDs), continuando...`);
        if (restrictedCount > 0) {
          console.log(`🚫 ${restrictedCount} partidas omitidas (restringidas), pero hay más páginas`);
        }
      }

    } catch (err) {
      console.error('❌ Error en loadMore:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar partidas';
      setError(errorMessage);
      toast.error('Error al cargar historial de partidas', errorMessage);
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [puuid, page, hasMore, fetchMatchIds, fetchMatchDetails, summonerName, toast, createMatchSummary, pageSize]);

  const refreshMatches = useCallback(async (): Promise<void> => {
    console.log('🔄 Iniciando refresh de partidas');
    setMatches([]);
    setPage(0);
    setHasMore(true);
    setError(null);
    isLoadingRef.current = false;

    if (puuid) {
      await loadMore();
    }
  }, [puuid, loadMore]);

  useEffect(() => {
    console.log('🔄 useEffect principal - puuid cambió:', puuid ? `${puuid.substring(0, 10)}...` : 'undefined');

    if (!puuid) {
      setMatches([]);
      setPage(0);
      setHasMore(true);
      setError(null);
      isLoadingRef.current = false;
      return;
    }

    if (currentPuuidRef.current !== puuid) {
      console.log('📥 PUUID cambió, reseteando estado y cargando partidas');
      currentPuuidRef.current = puuid;

      setMatches([]);
      setPage(0);
      setHasMore(true);
      setError(null);
      isLoadingRef.current = false;

      const timer = setTimeout(() => {
        if (currentPuuidRef.current === puuid) {
          loadMore();
        }
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [puuid, loadMore]);

  return {
    matches,
    isLoading,
    error,
    hasMore,
    loadMore,
    refreshMatches
  };
};