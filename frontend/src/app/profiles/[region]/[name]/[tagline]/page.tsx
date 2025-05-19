// Página de perfil de un jugador de League of Legends
'use client';
import React, { useEffect, useState } from 'react';
import { useParams, usePathname } from 'next/navigation';
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
  summonerLevel: number;
  profileIconId: number;
  leagueEntries: LeagueEntryDTO[];
  region: string;
}

const QUEUE_LABELS: Record<string, string> = {
  'RANKED_SOLO_5x5': 'Solo/Duo',
  'RANKED_FLEX_SR': 'Flex',
};

export default function ProfilePage() {
  const params = useParams();
  const pathname = usePathname();
  const [profile, setProfile] = useState<SummonerProfileDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetcher = useAuthenticatedFetch();

  // Extrae directamente los parámetros de la ruta
  const region = decodeURIComponent(params.region as string);
  const name = decodeURIComponent(params.name as string);
  const tagline = decodeURIComponent(params.tagline as string);

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

  if (loading) return <div className="p-8 text-center">Cargando...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!profile) return null;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center gap-4 mb-6">
        <img
          src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/profileicon/${profile.profileIconId}.png`}
          alt="Profile Icon"
          className="w-20 h-20 rounded-full border-2 border-blue-400"
        />
        <div>
          <h1 className="text-2xl font-bold">{profile.name} <span className="text-gray-500">({profile.region})</span></h1>
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
  );
}
