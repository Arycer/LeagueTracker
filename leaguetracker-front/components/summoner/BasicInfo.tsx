"use client";
import React from 'react';
import {SummonerProfileDTO} from '@/hooks/useProfiles';
import {useUserContext} from '@/contexts/UserContext';
import {AddFavoriteProfileRequest, useFavoriteProfiles} from '@/contexts/FavoriteProfilesContext';
import ProfileIcon from '@/components/ddragon/ProfileIcon';
import {getRegionLabel} from '@/constants/regions';
import {Button} from '@/components/ui/button';
import {RefreshCw, Star} from 'lucide-react';
import {useToast} from '@/hooks/useToast';

interface BasicInfoProps {
  profile: SummonerProfileDTO;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

/**
 * Componente que muestra la información básica de un invocador
 */
const BasicInfo: React.FC<BasicInfoProps> = ({ profile, onRefresh, isRefreshing = false }) => {
  const { user } = useUserContext();
  const { favorites, addFavorite, deleteFavorite, isLoading: isLoadingFavorites } = useFavoriteProfiles();
  const { info } = useToast();
  
  // Comprobar si el perfil está en favoritos
  const isFavorite = favorites.some(
    fav => fav.region.toLowerCase() === profile.region.toLowerCase() && 
           fav.summonerName.toLowerCase() === profile.name.toLowerCase() &&
           fav.tagline === profile.tagline
  );
  
  // Obtener el ID del favorito si existe
  const favoriteId = isFavorite ? 
    favorites.find(
      fav => fav.region.toLowerCase() === profile.region.toLowerCase() && 
             fav.summonerName.toLowerCase() === profile.name.toLowerCase() &&
             fav.tagline === profile.tagline
    )?.id : 
    null;
  
  // Manejar el clic en el botón de favoritos
  const handleFavoriteClick = async () => {
    if (!user.isSignedIn) {
      info('Inicia sesión', 'Debes iniciar sesión para añadir perfiles a favoritos');
      return;
    }
    
    if (isFavorite && favoriteId) {
      await deleteFavorite(favoriteId);
    } else {
      const request: AddFavoriteProfileRequest = {
        region: profile.region,
        summonerName: profile.name,
        tagline: profile.tagline
      };
      await addFavorite(request);
    }
  };
  
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex items-center">
        <div className="relative mr-4">
          <ProfileIcon 
            iconId={profile.profileIconId} 
            size={80} 
            className="rounded-full border-2 border-blue-500"
          />
          <div className="absolute bottom-0 right-0 bg-[#0f172a] text-white text-xs font-medium rounded-full px-2 py-0.5 border border-blue-500">
            {profile.summonerLevel}
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{`${profile.name}#${profile.tagline}`}</h1>
          <div className="text-blue-400 text-sm mt-1">{getRegionLabel(profile.region)}</div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 self-end md:self-center">
        {user.isSignedIn && (
          <Button 
            onClick={handleFavoriteClick} 
            variant="outline" 
            size="sm"
            disabled={isLoadingFavorites}
            className={`${isFavorite ? 'text-yellow-400 hover:text-yellow-500' : 'text-gray-400 hover:text-yellow-400'}`}
          >
            {isFavorite ? 
              <>
                <Star className="h-4 w-4 mr-2" fill="currentColor" />
                Favorito
              </> : 
              <>
                <Star className="h-4 w-4 mr-2" />
                Añadir a favoritos
              </>}
          </Button>
        )}
        
        {onRefresh && (
          <Button 
            onClick={onRefresh} 
            variant="outline" 
            size="sm"
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Actualizando...' : 'Actualizar'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default BasicInfo;
