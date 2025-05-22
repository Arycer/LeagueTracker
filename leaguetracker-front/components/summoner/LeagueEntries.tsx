"use client";
import React from 'react';
import {LeagueEntryDTO} from '@/hooks/useProfiles';
import RankedIcon from '@/components/ddragon/RankedIcon';

interface LeagueEntriesProps {
  entries: LeagueEntryDTO[];
}

// Mapeo de tipos de cola a nombres legibles
const queueTypeNames: Record<string, string> = {
  'RANKED_SOLO_5x5': 'Solo/Dúo',
  'RANKED_FLEX_SR': 'Flexible',
  'RANKED_TFT': 'TFT',
  'RANKED_TFT_PAIRS': 'TFT Dobles',
  'RANKED_TFT_TURBO': 'TFT Hiperoll'
};

/**
 * Componente que muestra las entradas de liga de un invocador
 */
const LeagueEntries: React.FC<LeagueEntriesProps> = ({ entries }) => {
  // Ordenar las entradas: primero Solo/Dúo, luego Flex, luego TFT
  const sortedEntries = [...entries].sort((a, b) => {
    const queueOrder: Record<string, number> = {
      'RANKED_SOLO_5x5': 1,
      'RANKED_FLEX_SR': 2,
      'RANKED_TFT': 3,
      'RANKED_TFT_PAIRS': 4,
      'RANKED_TFT_TURBO': 5
    };
    
    return (queueOrder[a.queueType || ''] || 99) - (queueOrder[b.queueType || ''] || 99);
  });
  
  if (sortedEntries.length === 0) {
    return (
      <div className="bg-[#1e293b] rounded-lg p-4 sm:p-6 shadow-md">
        <h2 className="text-lg font-semibold text-white mb-4 text-center sm:text-left">Clasificación</h2>
        <div className="text-center py-6 sm:py-8 text-gray-400">
          <p>Este invocador no tiene partidas clasificatorias en esta temporada</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-[#1e293b] rounded-lg p-4 sm:p-6 shadow-md">
      <h2 className="text-lg font-semibold text-white mb-4 text-center sm:text-left">Clasificación</h2>
      
      <div className="space-y-3 sm:space-y-4">
        {sortedEntries.map((entry) => (
          <LeagueEntryCard 
            key={`${entry.queueType}-${entry.summonerId}`} 
            entry={entry} 
          />
        ))}
      </div>
    </div>
  );
};

interface LeagueEntryCardProps {
  entry: LeagueEntryDTO;
}

/**
 * Tarjeta que muestra la información de una entrada de liga
 */
const LeagueEntryCard: React.FC<LeagueEntryCardProps> = ({ entry }) => {
  const { tier, rank, leaguePoints, wins = 0, losses = 0, queueType } = entry;
  const totalGames = wins + losses;
  const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;
  
  // Determinar el color del borde según la liga
  const getBorderColor = (tier: string | null) => {
    if (!tier) return 'border-gray-500';
    
    const tierColors: Record<string, string> = {
      'IRON': 'border-gray-500',
      'BRONZE': 'border-amber-800',
      'SILVER': 'border-gray-400',
      'GOLD': 'border-yellow-500',
      'PLATINUM': 'border-teal-400',
      'EMERALD': 'border-emerald-500',
      'DIAMOND': 'border-blue-400',
      'MASTER': 'border-purple-500',
      'GRANDMASTER': 'border-red-500',
      'CHALLENGER': 'border-yellow-300'
    };
    
    return tierColors[tier] || 'border-gray-500';
  };
  
  return (
    <div className={`bg-[#0f172a] rounded-lg p-3 sm:p-4 border-l-4 ${getBorderColor(tier || null)}`}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="flex-shrink-0 flex justify-center sm:justify-start">
          <RankedIcon 
            tier={tier || null} 
            size={56} 
            className="object-contain" 
          />
        </div>
        
        <div className="flex-1">
          <div className="text-gray-400 text-sm mb-1 text-center sm:text-left">
            {queueType ? (queueTypeNames[queueType] || queueType) : 'Desconocido'}
          </div>
          
          <div className="text-white font-semibold text-center sm:text-left">
            {tier 
              ? `${tier.charAt(0)}${tier.slice(1).toLowerCase()}${rank ? ` ${rank}` : ''}` 
              : 'Sin clasificar'}
            {tier && <span className="ml-2 text-gray-400">{leaguePoints} LP</span>}
          </div>
          
          <div className="flex flex-wrap justify-center sm:justify-start items-center mt-2 text-sm gap-2 sm:gap-3">
            <div className="text-green-500">{wins}W</div>
            <div className="text-red-500">{losses}L</div>
            <div className="text-gray-400">
              {winRate}% ({totalGames} partidas)
            </div>
          </div>
        </div>
      </div>
      
      {entry.miniSeries && (
        <div className="mt-3 pt-3 border-t border-[#1e293b]">
          <div className="text-gray-400 text-sm mb-2 text-center sm:text-left">Series de promoción</div>
          <div className="flex justify-center sm:justify-start space-x-2">
            {entry.miniSeries.progress.split('').map((progress, idx) => (
              <div 
                key={`${entry.summonerId}-${entry.queueType}-series-${idx}`} 
                className={`w-7 h-7 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  progress === 'W' ? 'bg-green-500 text-white' : 
                  progress === 'L' ? 'bg-red-500 text-white' : 
                  'bg-[#1e293b] text-gray-400'
                }`}
              >
                {progress === 'W' ? 'W' : progress === 'L' ? 'L' : '?'}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LeagueEntries;
