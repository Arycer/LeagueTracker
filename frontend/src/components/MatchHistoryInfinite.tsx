import React, { useRef, useEffect } from 'react';
import type { MatchDto, ParticipantDto } from '@/lib/types/matchTypes';
import { useLolVersion } from '@/context/LolVersionContext';

interface MatchHistoryInfiniteProps {
    puuid: string;
    region: string;
    onSelectMatch: (matchId: string) => void;
}

const MatchHistoryInfinite: React.FC<MatchHistoryInfiniteProps> = ({
    puuid,
    region,
    onSelectMatch
}) => {
    const loader = useRef<HTMLDivElement | null>(null);
    const { version: lolVersion } = useLolVersion();
    const [matchIds, setMatchIds] = React.useState<string[]>([]);
    const [matchDetails, setMatchDetails] = React.useState<Record<string, MatchDto>>({});
    const [page, setPage] = React.useState(0);
    const [isLoading, setIsLoading] = React.useState(false);
    const [hasMore, setHasMore] = React.useState(true);

    // Cargar ids de partidas por página
    const fetchMatchIds = React.useCallback(async (pageNum: number) => {
        setIsLoading(true);
        try {
            const res = await fetch(
                `http://localhost:8080/api/lol/match/matches?puuid=${encodeURIComponent(puuid)}&region=${encodeURIComponent(region)}&page=${pageNum}&pageSize=100`
            );
            if (!res.ok) throw new Error('Error al cargar historial');
            const data: string[] = await res.json();
            setMatchIds(prev => {
                // Evitar duplicados
                const set = new Set([...prev, ...data]);
                return Array.from(set).slice(0, 100);
            });
            setHasMore(data.length === 20 && (pageNum + 1) * 20 < 100);
        } catch {
            setHasMore(false);
        } finally {
            setIsLoading(false);
        }
    }, [puuid, region]);

    // Cargar detalles de partidas nuevas
    React.useEffect(() => {
        const toLoad = matchIds.filter(id => !matchDetails[id]);
        if (toLoad.length === 0) return;
        toLoad.forEach(matchId => {
            fetch(`http://localhost:8080/api/lol/match/match/${matchId}?region=${encodeURIComponent(region)}`)
                .then(res => res.ok ? res.json() : null)
                .then(data => {
                    if (data) setMatchDetails(prev => ({ ...prev, [matchId]: data }));
                });
        });
    }, [matchIds, region]);

    // Primer carga
    React.useEffect(() => {
        setMatchIds([]);
        setMatchDetails({});
        setPage(0);
        setHasMore(true);
    }, [puuid, region]);

    React.useEffect(() => {
        if (page === 0) fetchMatchIds(0);
    }, [page, fetchMatchIds]);

    // Scroll infinito
    React.useEffect(() => {
        if (!hasMore) return;
        const observer = new window.IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && !isLoading) {
                    setPage(p => {
                        fetchMatchIds(p + 1);
                        return p + 1;
                    });
                }
            },
            { threshold: 0.1 }
        );
        const currentLoader = loader.current;
        if (currentLoader) observer.observe(currentLoader);
        return () => {
            if (currentLoader) observer.unobserve(currentLoader);
        };
    }, [hasMore, isLoading, fetchMatchIds]);

    return (
        <div>
            {matchIds.map((matchId, idx) => {
    const match = matchDetails[matchId];
    if (!match) return null;
    const info = match.info;
    const user = info.participants.find((p: ParticipantDto) => p.puuid === puuid);
    const win = user?.win;
    // Cola (queueId)
    const queueId = info.queueId;
    // Fecha
    const date = info.gameCreation ? new Date(info.gameCreation) : null;
    // Duración
    const duration = info.gameDuration ? `${Math.floor(info.gameDuration / 60)}:${('0' + (info.gameDuration % 60)).slice(-2)}` : '';
    // KDA
    const kda = user ? `${user.kills}/${user.deaths}/${user.assists}` : '';
    return (
        <div
            key={matchId}
            className={`mb-3 cursor-pointer border border-green-300 rounded-lg p-3 hover:shadow-lg bg-white flex items-center gap-3`}
            onClick={() => onSelectMatch(matchId)}
        >
            <div className="flex flex-col items-start mr-4">
                <span className="text-xs text-gray-500">Partida</span>
                <span className="font-bold">#{idx + 1}</span>
                <span className="text-xs text-gray-400 mt-1">{matchId.slice(0,8)}</span>
            </div>
            <span className={`px-2 py-1 rounded text-xs font-semibold ${win === true ? 'bg-green-100 text-green-700' : win === false ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{win === true ? 'Victoria' : win === false ? 'Derrota' : '?'}</span>
            <span className="bg-blue-100 text-blue-700 rounded px-2 py-1 text-xs ml-2">Cola {queueId}</span>
            <span className="ml-2 text-xs text-gray-700">{date ? date.toLocaleDateString() + ', ' + date.toLocaleTimeString() : ''}</span>
            <span className="ml-2 text-xs">{duration} min</span>
            {user && (
                <>
                    <img
                        src={`https://ddragon.leagueoflegends.com/cdn/${lolVersion}/img/champion/${user.championName}.png`}
                        alt={user.championName}
                        className="w-7 h-7 rounded-full border mx-2"/>
                    <span className="font-semibold text-sm mr-1">{user.championName}</span>
                    <span className="text-xs text-gray-700">{kda} KDA</span>
                </>
            )}
        </div>
    );
})}
            <div ref={loader} />
            {isLoading && <div className="text-center py-4">Cargando más partidas...</div>}
            {!hasMore && <div className="text-center text-gray-400 py-2">No hay más partidas.</div>}
        </div>
    );
};

export default MatchHistoryInfinite;
