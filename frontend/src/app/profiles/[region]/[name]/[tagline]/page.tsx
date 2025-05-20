// Página de perfil de un jugador de League of Legends
'use client';
import React, {useEffect, useState} from 'react';
import type {MatchDto, ParticipantDto} from '@/lib/types/matchTypes';
import {useParams, usePathname} from 'next/navigation';
import useAuthenticatedFetch from '@/hooks/useAuthenticatedFetch';

interface LeagueEntryDTO {
    leagueId: string;
    summonerId: string;
    puuid: string;
    queueType: string;
    tier: string;
    rank: string;
    leaguePoints: number;
    wins: number;
    losses: number;
    hotStreak: boolean;
    veteran: boolean;
    freshBlood: boolean;
    inactive: boolean;
    miniSeries?: any;
}

interface SummonerProfileDTO {
    name: string;
    puuid: string;
    summonerLevel: number;
    profileIconId: number;
    leagueEntries: LeagueEntryDTO[];
    region: string;
}

const QUEUE_LABELS: Record<string, string> = {
    'RANKED_SOLO_5x5': 'Solo/Duo',
    'RANKED_FLEX_SR': 'Flex',
};

import { useLolVersion } from '@/context/LolVersionContext';
import MatchHistoryInfinite from '@/components/MatchHistoryInfinite';

export default function ProfilePage() {
    const [matchIds, setMatchIds] = React.useState<string[]>([]);
    const [matchesLoading, setMatchesLoading] = React.useState(false);
    const [matchesError, setMatchesError] = React.useState<string | null>(null);
    const [matchDetails, setMatchDetails] = React.useState<Record<string, MatchDto>>({});
    const [selectedMatchId, setSelectedMatchId] = React.useState<string | null>(null);
    const [modalOpen, setModalOpen] = React.useState(false);
    const { version: lolVersion } = useLolVersion();
    const params = useParams();
    const pathname = usePathname();
    const [profile, setProfile] = useState<SummonerProfileDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const fetcher = useAuthenticatedFetch();
    const [refreshing, setRefreshing] = useState(false);
    const [cooldownMessage, setCooldownMessage] = useState<string | null>(null);

    // Extrae directamente los parámetros de la ruta
    const region = decodeURIComponent(params.region as string);
    const name = decodeURIComponent(params.name as string);
    const tagline = decodeURIComponent(params.tagline as string);

    // Refrescar perfil
    const handleRefresh = async () => {
        setRefreshing(true);
        setError(null);
        setCooldownMessage(null);
        try {
            const token = await (window as any).Clerk?.session?.getToken?.({template: 'DefaultJWT'});
            const res = await fetch(`http://localhost:8080/api/profiles/${region}/${encodeURIComponent(name)}/${encodeURIComponent(tagline)}/refresh`, {
                method: 'POST',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                }
            });

            console.log(res);

            // Si la respuesta está vacía (sin datos), mostrar cooldown
            const text = await res.text();
            if (!text || text === '' || text === 'null') {
                setCooldownMessage('El refresco está en cooldown. Intenta de nuevo en unos segundos.');
                return;
            }
            const data = JSON.parse(text);
            setProfile(data);
            setCooldownMessage(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (!region || !name || !tagline) return;
        setLoading(true);
        setError(null);
        fetcher(`http://localhost:8080/api/profiles/${region}/${encodeURIComponent(name)}/${encodeURIComponent(tagline)}`)
            .then(data => {
                setProfile(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [region, name, tagline]);

    useEffect(() => {
        if (!profile || !profile.puuid || !profile.region) return;

        setMatchesLoading(true);
        setMatchesError(null);

        fetch(
            `http://localhost:8080/api/lol/match/matches?puuid=${encodeURIComponent(profile.puuid)}&region=${encodeURIComponent(profile.region)}&page=0&pageSize=20`
        )
            .then(res => {
                if (!res.ok) throw new Error('Error al cargar historial');
                return res.json();
            })
            .then((data: string[]) => setMatchIds(data))
            .catch(err => setMatchesError(err.message))
            .finally(() => setMatchesLoading(false));
    }, [profile]);

    // Obtener detalles de cada partida
    useEffect(() => {
        if (!profile || !profile.region || matchIds.length === 0) return;
        const controller = new AbortController();
        matchIds.forEach(matchId => {
            if (matchDetails[matchId]) return; // Ya está cargada
            fetch(`http://localhost:8080/api/lol/match/match/${matchId}?region=${encodeURIComponent(profile.region)}`, {signal: controller.signal})
                .then(res => {
                    if (res.status === 403) {
                        // Eliminar el matchId de la lista
                        setMatchIds(prev => prev.filter(id => id !== matchId));
                        return null;
                    }
                    if (!res.ok) return null;
                    return res.json();
                })
                .then(data => {
                    if (data) setMatchDetails(prev => ({...prev, [matchId]: data}));
                })
                .catch(() => {
                });
        });
        return () => controller.abort();
    }, [matchIds, profile?.region]);

    // Estado para paginación infinita
    const [infiniteIndex, setInfiniteIndex] = useState(20); // Cargar 20 por defecto
    const hasMoreMatches = matchIds.length > infiniteIndex && infiniteIndex < 100;
    const handleLoadMore = () => {
        if (hasMoreMatches) setInfiniteIndex(i => Math.min(i + 20, 100));
    };

    if (loading) return <div className="p-8 text-center">Cargando...</div>;
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
    if (!profile) return null;

    return (
        <div>
            <div className="flex flex-col items-end mb-4 gap-2">
                <button
                    className={"bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center gap-2 " + (refreshing ? 'opacity-50 cursor-not-allowed' : '')}
                    onClick={handleRefresh}
                    disabled={refreshing}
                >
                    {refreshing ? 'Refrescando...' : 'Refrescar perfil'}
                    <svg className={refreshing ? 'animate-spin h-4 w-4' : 'h-4 w-4'} fill="none" viewBox="0 0 24 24"
                         stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M4 4v5h.582M20 20v-5h-.581M5.455 19.545A9 9 0 1021 12.001h-1"/>
                    </svg>
                </button>
                {cooldownMessage && (
                    <div
                        className="text-yellow-600 bg-yellow-100 border border-yellow-300 rounded px-3 py-1 text-sm mt-1">
                        {cooldownMessage}
                    </div>
                )}
            </div>
            {/* HISTORIAL ANTIGUO */}
            <div className="max-w-2xl mx-auto p-4">
                <div className="flex items-center gap-4 mb-6">
                    <img
                        src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/profileicon/${profile.profileIconId}.png`}
                        alt="Profile Icon"
                        className="w-20 h-20 rounded-full border-2 border-blue-400"
                    />
                    <div>
                        <h1 className="text-2xl font-bold">{profile.name} <span
                            className="text-gray-500">({profile.region})</span></h1>
                        <div className="text-gray-700">Nivel {profile.summonerLevel}</div>
                    </div>
                </div>
                <h2 className="text-xl font-semibold mb-2">Clasificatorias</h2>
                {profile.leagueEntries.length === 0 ? (
                    <div className="text-gray-500">Sin partidas clasificatorias.</div>
                ) : (
                    <div className="grid gap-4">
                        {profile.leagueEntries.map(entry => (
                            <div key={entry.queueType} className="border rounded p-4 bg-gray-50">
                                <div className="font-bold mb-1">{QUEUE_LABELS[entry.queueType] || entry.queueType}</div>
                                <div className="flex gap-4 items-center">
                                    <span className="text-lg font-semibold">{entry.tier} {entry.rank}</span>
                                    <span>{entry.leaguePoints} LP</span>
                                    <span>Victorias: {entry.wins} / Derrotas: {entry.losses}</span>
                                    {entry.hotStreak && <span className="text-red-500 ml-2">🔥 Racha</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {/* Historial con scroll infinito */}
            <div className="max-w-2xl mx-auto p-4">
                <h2 className="text-xl font-semibold mb-2">Historial de partidas</h2>
                <MatchHistoryInfinite
                    puuid={profile.puuid}
                    region={profile.region}
                    onSelectMatch={(matchId) => { setSelectedMatchId(matchId); setModalOpen(true); }}
                />
            </div>

            {/* Modal de detalles de partida */}
            {modalOpen && selectedMatchId && matchDetails[selectedMatchId] && (() => {
                const match: MatchDto = matchDetails[selectedMatchId];
                const info = match.info;
                const user: ParticipantDto | undefined = info.participants.find((p: ParticipantDto) => p.puuid === profile?.puuid);
                const win = user?.win;
                return (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full relative">
                            <button
                                className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-2xl"
                                onClick={() => setModalOpen(false)}
                                aria-label="Cerrar"
                            >
                                ✕
                            </button>
                            <h3 className="text-2xl font-bold mb-4">Resumen de la partida</h3>
                            <div className="flex flex-wrap gap-4 mb-4">
                                <div>
                                    <span
                                        className="font-semibold">Tipo:</span> {info.queueId ? `Cola ${info.queueId}` : info.gameMode}
                                </div>
                                <div>
                                    <span
                                        className="font-semibold">Fecha:</span> {info.gameCreation ? new Date(info.gameCreation).toLocaleString() : ''}
                                </div>
                                <div>
                                    <span
                                        className="font-semibold">Duración:</span> {info.gameDuration ? `${Math.floor(info.gameDuration / 60)}:${('0' + (info.gameDuration % 60)).slice(-2)} min` : ''}
                                </div>
                                <div>
                                    <span className="font-semibold">Resultado:</span> <span
                                    className={win === true ? 'text-green-600' : win === false ? 'text-red-600' : ''}>{win === true ? 'Victoria' : win === false ? 'Derrota' : '?'}</span>
                                </div>
                            </div>
                            {user && (
                                <div className="flex gap-6 mb-6 items-center">
                                    <img
                                        src={`https://ddragon.leagueoflegends.com/cdn/${lolVersion}/img/champion/${user.championName}.png`}
                                        alt={user.championName}
                                        className="w-16 h-16 rounded-full border-2 border-blue-400"/>
                                    <div>
                                        <div
                                            className="font-bold text-lg">{user.championName} (Nivel {user.champLevel})
                                        </div>
                                        <div className="text-sm">Hechizos: {user.summoner1Id}, {user.summoner2Id}</div>
                                        <div
                                            className="text-sm">KDA: {user.kills}/{user.deaths}/{user.assists} ({user.deaths === 0 ? 'Perfecto' : ((user.kills + user.assists) / user.deaths).toFixed(2)})
                                        </div>
                                        <div className="text-sm">Oro: {user.goldEarned} |
                                            CS: {user.totalMinionsKilled + (user.neutralMinionsKilled || 0)}</div>
                                        <div className="text-sm">Participación en
                                            kills: {user.challenges?.killParticipation ? (user.challenges.killParticipation * 100).toFixed(0) + '%' : '-'}</div>
                                    </div>
                                </div>
                            )}
                            <div className="mb-2">
                                <span className="font-semibold">Jugadores:</span>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {info.participants.map((p: ParticipantDto) => (
                                        <div key={p.puuid}
                                             className="flex items-center gap-2 text-xs p-1 rounded bg-gray-50">
                                            <img
                                                src={`https://ddragon.leagueoflegends.com/cdn/${lolVersion}/img/champion/${p.championName}.png`}
                                                alt={p.championName} className="w-5 h-5 rounded-full border"/>
                                            <span
                                                className={p.puuid === profile?.puuid ? 'font-bold text-blue-700' : ''}>{p.summonerName || p.puuid.slice(0, 8)}</span>
                                            <span className="text-gray-500">{p.championName}</span>
                                            <span className="ml-1">{p.kills}/{p.deaths}/{p.assists}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}

        </div>
    );
}
