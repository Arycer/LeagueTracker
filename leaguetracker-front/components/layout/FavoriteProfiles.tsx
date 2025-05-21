"use client";
import React from 'react';
import Link from 'next/link';
import { useFavoriteProfiles } from '@/contexts/FavoriteProfilesContext';
import { StarIcon, XIcon } from 'lucide-react';
import { Button } from '../ui/button';

const FavoriteProfiles: React.FC = () => {
  const { favorites, isLoading, deleteFavorite } = useFavoriteProfiles();
  
  // Manejar eliminación de favorito
  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    deleteFavorite(id);
  };
  
  return (
    <div>
      <div className="flex items-center mb-2">
        <StarIcon className="w-4 h-4 mr-2 text-yellow-500" />
        <span className="text-white">Favoritos</span>
      </div>
      
      {isLoading ? (
        <div className="pl-6 py-2">
          <div className="h-4 bg-blue-900/20 rounded w-3/4 animate-pulse mb-2"></div>
          <div className="h-4 bg-blue-900/20 rounded w-1/2 animate-pulse"></div>
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-sm text-gray-400 pl-6 py-1">
          No tienes perfiles favoritos
        </div>
      ) : (
        <div className="space-y-1 pl-2">
          {favorites.map((profile) => (
            <Link 
              key={profile.id} 
              href={`/summoner/${profile.region}/${profile.summonerName}`}
              className="flex items-center justify-between p-2 rounded hover:bg-blue-900/20 text-gray-300 hover:text-white transition-colors group"
            >
              <div className="flex items-center overflow-hidden">
                <div className="w-6 h-6 rounded-full bg-blue-900/40 flex items-center justify-center text-xs mr-2 flex-shrink-0">
                  {profile.summonerName.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <div className="text-sm truncate max-w-[140px]">{profile.summonerName}</div>
                  <div className="text-xs text-gray-500 flex items-center">
                    <span className="uppercase">{profile.region}</span>
                    {profile.tagline && <span className="ml-1">#{profile.tagline}</span>}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => handleDelete(e, profile.id)}
              >
                <XIcon className="h-3 w-3 text-gray-400 hover:text-red-400" />
              </Button>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoriteProfiles;
