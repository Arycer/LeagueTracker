import { useFavorites } from '@/context/FavoritesContext';
import { useState } from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';

interface FavoriteButtonProps {
  region: string;
  summonerName: string;
  tagline: string;
  className?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  region,
  summonerName,
  tagline,
  className = ''
}) => {
  const { isFavorite, getFavoriteId, addFavorite, removeFavorite } = useFavorites();
  const [isLoading, setIsLoading] = useState(false);

  const favorited = isFavorite(region, summonerName, tagline);
  const favoriteId = getFavoriteId(region, summonerName, tagline);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading) return;
    
    setIsLoading(true);
    
    if (favorited && favoriteId) {
      await removeFavorite(favoriteId);
    } else {
      await addFavorite(region, summonerName, tagline);
    }
    
    setIsLoading(false);
  };

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className={`p-2 transition-colors ${favorited ? 'text-yellow-400 hover:text-yellow-500' : 'text-gray-400 hover:text-yellow-400'} ${className}`}
      title={favorited ? "Eliminar de favoritos" : "Añadir a favoritos"}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-t-transparent border-yellow-400 rounded-full animate-spin"></div>
      ) : favorited ? (
        <FaStar />
      ) : (
        <FaRegStar />
      )}
    </button>
  );
};

export default FavoriteButton;
