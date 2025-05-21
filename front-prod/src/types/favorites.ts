// Tipos para la funcionalidad de perfiles favoritos

export interface FavoriteProfile {
  id: string;
  region: string;
  summonerName: string;
  tagline: string;
  profileIconId: number;
  addedAt: string;
  order?: number;
}

export interface AddFavoriteRequest {
  region: string;
  summonerName: string;
  tagline: string;
}

export interface ReorderFavoritesRequest {
  order: string[];
}
