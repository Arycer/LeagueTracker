"use client";
import React from 'react';
import Link from 'next/link';
import {useRecentProfiles} from '@/hooks/useRecentProfiles';
import {Clock, Trash2, XIcon} from 'lucide-react';
import {Button} from '../ui/button';
import {useToast} from '@/hooks/useToast';

const RecentProfiles: React.FC = () => {
  const {recentProfiles, isLoading, removeRecentProfile, clearRecentProfiles} = useRecentProfiles();
  const {info} = useToast();

  // Manejar eliminación de perfil reciente
  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    removeRecentProfile(id);
  };

  // Manejar limpieza de todos los perfiles recientes
  const handleClearAll = (e: React.MouseEvent) => {
    e.preventDefault();
    clearRecentProfiles();
    info('Historial limpiado', 'Se han eliminado todos los perfiles recientes');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-2 text-blue-500"/>
          <span className="text-white">Visitados recientemente</span>
        </div>
        {recentProfiles.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-gray-400 hover:text-red-400"
            onClick={handleClearAll}
            title="Limpiar historial"
          >
            <Trash2 className="h-3 w-3"/>
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="pl-6 py-2">
          <div className="h-4 bg-blue-900/20 rounded w-3/4 animate-pulse mb-2"></div>
          <div className="h-4 bg-blue-900/20 rounded w-1/2 animate-pulse"></div>
        </div>
      ) : recentProfiles.length === 0 ? (
        <div className="text-sm text-gray-400 pl-6 py-1">
          No hay perfiles visitados recientemente
        </div>
      ) : (
        <div className="space-y-1 pl-2">
          {recentProfiles.map((profile) => (
            <Link
              key={profile.id}
              href={`/summoner/${profile.region.toLowerCase()}/${encodeURIComponent(profile.summonerName)}/${profile.tagline || ''}`}
              className="flex items-center justify-between p-2 rounded hover:bg-blue-900/20 text-gray-300 hover:text-white transition-colors group"
            >
              <div className="flex items-center overflow-hidden">
                <div
                  className="w-6 h-6 rounded-full bg-blue-900/40 flex items-center justify-center text-xs mr-2 flex-shrink-0">
                  {profile.summonerName.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <div className="text-sm truncate max-w-[140px]">{profile.summonerName}</div>
                  <div className="text-xs text-gray-500 flex items-center">
                    <span className="uppercase">{profile.region}</span>
                    <span className="ml-1">#{profile.tagline}</span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => handleDelete(e, profile.id)}
              >
                <XIcon className="h-3 w-3 text-gray-400 hover:text-red-400"/>
              </Button>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentProfiles;
