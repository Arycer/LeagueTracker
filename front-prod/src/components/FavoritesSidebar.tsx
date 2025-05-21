import { useFavorites } from '@/context/FavoritesContext';
import { useUserContext } from '@/context/UserContext';
import Link from 'next/link';
import { FaStar, FaRegStar } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { getProfileIconFromCache } from '@/utils/profileIconCache';

const FavoritesSidebar: React.FC = () => {
  const { favorites, loading, removeFavorite } = useFavorites();
  const { lolVersion } = useUserContext();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  return (
    <>
      <li className="opacity-70 mt-4 flex items-center gap-1">
        <FaStar className="text-yellow-400" /> Favoritos
      </li>
      
      {loading && favorites.length === 0 && (
        <li className="text-gray-400 text-sm pl-2">Cargando...</li>
      )}
      
      {!loading && favorites.length === 0 && (
        <li className="text-gray-400 text-sm pl-2">No tienes perfiles favoritos</li>
      )}
      
      {favorites.map((favorite) => {
        // Intentar obtener el icono cacheado
        const cachedIconId = getProfileIconFromCache(favorite.region, favorite.summonerName.split('#')[0], favorite.tagline);
        const iconId = cachedIconId || favorite.profileIconId;
        
        return (
        <li key={favorite.id} className="flex items-center gap-2 p-2 bg-gray-800 rounded hover:bg-gray-700 transition-colors">
          <img
            src={`https://ddragon.leagueoflegends.com/cdn/${lolVersion || '14.9.1'}/img/profileicon/${iconId}.png`}
            alt="Profile Icon"
            className="w-8 h-8 rounded-full"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ddragon.leagueoflegends.com/cdn/${lolVersion || '14.9.1'}/img/profileicon/1.png`;
            }}
          />
          <div className="flex-1 min-w-0">
            <Link 
              href={`/profiles/${favorite.region}/${encodeURIComponent(favorite.summonerName.split('#')[0])}/${encodeURIComponent(favorite.tagline)}`}
              className="text-white hover:text-blue-300 transition-colors truncate block"
            >
              {favorite.summonerName}
            </Link>
            <div className="text-xs text-gray-400">{favorite.region}</div>
          </div>
          <button
            onClick={async () => {
              setDeletingId(favorite.id);
              await removeFavorite(favorite.id);
              setDeletingId(null);
            }}
            disabled={deletingId === favorite.id}
            className="transition-colors p-1"
            title="Quitar de favoritos"
          >
            {deletingId === favorite.id ? (
              <div className="w-4 h-4 border-t-2 border-yellow-400 border-solid rounded-full animate-spin"></div>
            ) : (
              <FaStar size={14} className="text-yellow-400" />
            )}
          </button>
        </li>
      );})}
    </>
  );
};

export default FavoritesSidebar;
