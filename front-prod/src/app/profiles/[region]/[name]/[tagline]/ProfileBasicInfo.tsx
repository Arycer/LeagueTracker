"use client";
import React, { useState, useEffect } from "react";
import { useUserContext } from "@/context/UserContext";
import FavoriteButton from "@/components/FavoriteButton";

export type LeagueEntryDTO = {
  leagueId?: string;
  summonerId?: string;
  queueType?: string;
  tier?: string;
  rank?: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  hotStreak: boolean;
  veteran: boolean;
  freshBlood: boolean;
  inactive: boolean;
  miniSeries?: any;
};

export type ChampionMasteryDTO = {
  championId: number;
  championLevel: number;
  championPoints: number;
};

export type SummonerProfileDTO = {
  name: string;
  puuid: string;
  summonerLevel: number;
  profileIconId: number;
  leagueEntries: LeagueEntryDTO[];
  region: string;
  championMasteries?: ChampionMasteryDTO[];
  tagline?: string;
};

// Función auxiliar para obtener el nombre de la cola en español
const getQueueName = (queueType: string | undefined): string => {
  switch (queueType) {
    case 'RANKED_SOLO_5x5':
      return 'Solo/Dúo';
    case 'RANKED_FLEX_SR':
      return 'Flexible';
    case 'RANKED_TFT':
      return 'TFT';
    default:
      return queueType || 'Desconocido';
  }
};

// Función auxiliar para obtener el color del tier
const getTierColor = (tier: string | undefined): string => {
  switch (tier?.toLowerCase()) {
    case 'iron':
      return 'from-gray-500 to-gray-600';
    case 'bronze':
      return 'from-amber-700 to-amber-800';
    case 'silver':
      return 'from-gray-300 to-gray-400';
    case 'gold':
      return 'from-yellow-400 to-yellow-500';
    case 'platinum':
      return 'from-emerald-400 to-emerald-500';
    case 'emerald':
      return 'from-emerald-500 to-emerald-600';
    case 'diamond':
      return 'from-sky-400 to-sky-500';
    case 'master':
      return 'from-purple-500 to-purple-600';
    case 'grandmaster':
      return 'from-red-500 to-red-600';
    case 'challenger':
      return 'from-blue-400 to-blue-500';
    default:
      return 'from-gray-600 to-gray-700';
  }
};

// Función auxiliar para obtener el nombre del tier en español
const getTierName = (tier: string | undefined): string => {
  switch (tier?.toLowerCase()) {
    case 'iron':
      return 'Hierro';
    case 'bronze':
      return 'Bronce';
    case 'silver':
      return 'Plata';
    case 'gold':
      return 'Oro';
    case 'platinum':
      return 'Platino';
    case 'emerald':
      return 'Esmeralda';
    case 'diamond':
      return 'Diamante';
    case 'master':
      return 'Maestro';
    case 'grandmaster':
      return 'Gran Maestro';
    case 'challenger':
      return 'Retador';
    default:
      return tier || 'Sin clasificar';
  }
};

// Función para formatear los puntos de maestría
const formatMasteryPoints = (points: number): string => {
  if (points >= 1000000) {
    return `${(points / 1000000).toFixed(1)}M`;
  } else if (points >= 1000) {
    return `${(points / 1000).toFixed(1)}K`;
  } else {
    return points.toString();
  }
};

// Función para obtener la URL de la imagen del campeón
const getChampionImageUrl = (championId: number, championIdToName: Record<number, string>, version: string): string => {
  const championName = championIdToName[championId] || 'Unknown';
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${championName}.png`;
};

export default function ProfileBasicInfo({ 
  profile, 
  onRefresh, 
  loading, 
  championIdToName, 
  lolVersion 
}: {
  profile: SummonerProfileDTO;
  onRefresh: () => void;
  loading: boolean;
  championIdToName: Record<number, string>;
  lolVersion: string;
}) {

  // Ordenar las entradas de liga para que Solo Queue aparezca primero
  const sortedLeagueEntries = [...(profile.leagueEntries || [])].sort((a, b) => {
    if (a.queueType === 'RANKED_SOLO_5x5') return -1;
    if (b.queueType === 'RANKED_SOLO_5x5') return 1;
    return 0;
  });
  
  // Verificar si tenemos maestrías de campeones
  const hasChampionMasteries = profile.championMasteries && profile.championMasteries.length > 0;

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Información básica del perfil */}
      <div className="flex items-center justify-between w-full">
        {/* Lado izquierdo: Icono y datos del perfil */}
        <div className="flex items-center gap-2">
          <img
            src={`https://ddragon.leagueoflegends.com/cdn/${lolVersion}/img/profileicon/${profile.profileIconId}.png`}
            alt="Profile Icon"
            className="w-16 h-16 rounded-full border-2 border-[#232946] shadow bg-white flex-shrink-0"
          />
          <div className="flex flex-col gap-y-0.5 justify-center">
            <span className="text-xs text-white/60">Región: {profile.region}</span>
            <div className="text-lg font-bold text-white truncate">{profile.name}</div>
            <div className="text-xs text-white/80">Nivel {profile.summonerLevel}</div>
          </div>
        </div>
        
        {/* Lado derecho: Botones de acción */}
        <div className="flex items-center gap-1">
          <FavoriteButton 
            region={profile.region} 
            summonerName={profile.name} 
            tagline={profile.tagline || ""} 
          />
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors"
            style={{ width: 28, height: 28 }}
            aria-label="Refrescar perfil"
          >
            {loading ? (
              <svg className="animate-spin" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="10" cy="10" r="8" stroke="white" strokeWidth="3" strokeDasharray="25 10" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 10a6 6 0 0 1 10.39-4.19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="14 3 14 7 10 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Tarjetas de Ranked */}
      {sortedLeagueEntries.length > 0 ? (
        <div className="w-full flex flex-col gap-2 mt-2">
          {sortedLeagueEntries.map((entry, index) => (
            <div 
              key={`${entry.queueType}-${index}`}
              className={`p-3 rounded-lg bg-gradient-to-r ${getTierColor(entry.tier)} shadow-md`}
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-white/80">{getQueueName(entry.queueType)}</span>
                  <span className="text-sm font-bold text-white">
                    {getTierName(entry.tier)} {entry.rank} 
                    <span className="ml-1 text-xs font-normal">{entry.leaguePoints} LP</span>
                  </span>
                </div>
                <div className="text-xs text-white/90">
                  <span className="font-medium">{entry.wins}W</span>
                  <span className="mx-1">/</span>
                  <span className="font-medium">{entry.losses}L</span>
                  <span className="ml-1 text-xs">(
                    {Math.round((entry.wins / (entry.wins + entry.losses)) * 100)}%
                  )</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full p-3 rounded-lg bg-gray-700/50 text-center text-sm text-white/70 mt-2">
          Sin clasificar en ninguna cola
        </div>
      )}

      {/* Maestrías de Campeones */}
      <div className="w-full mt-4">
        <h3 className="text-sm font-semibold text-white/90 mb-2">Maestrías de Campeones</h3>
        {hasChampionMasteries && profile.championMasteries ? (
          <div className="flex flex-col space-y-2">
            {profile.championMasteries.map((mastery) => (
              <div key={mastery.championId} className="bg-gray-800 rounded-lg p-3 flex items-center space-x-3">
                <img
                  src={getChampionImageUrl(mastery.championId, championIdToName, lolVersion)}
                  alt="Champion"
                  className="w-12 h-12 rounded-full"
                  loading="eager"
                  onError={(e) => {
                    // Fallback si la imagen falla
                    (e.target as HTMLImageElement).src = `https://ddragon.leagueoflegends.com/cdn/${lolVersion}/img/champion/Aatrox.png`;
                  }}
                />
                <div>
                  <div className="font-medium">{championIdToName[mastery.championId] || `Campeón #${mastery.championId}`}</div>
                  <div className="text-sm text-gray-400">
                    <span className="text-yellow-500">Nivel {mastery.championLevel}</span> - {formatMasteryPoints(mastery.championPoints)} puntos
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full p-3 rounded-lg bg-gray-700/50 text-center text-sm text-white/70">
            No hay datos de maestría disponibles
          </div>
        )}
      </div>
    </div>
  );
}
