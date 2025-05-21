"use client";

interface ProfileIconInfo {
  profileIconId: number;
  timestamp: number;
}

const ICON_CACHE_KEY = "profile_icon_cache";
const CACHE_EXPIRATION = 7 * 24 * 60 * 60 * 1000; // 7 días en milisegundos

// Obtener el caché de iconos
export function getProfileIconCache(): Record<string, ProfileIconInfo> {
  if (typeof window === "undefined") return {};
  
  try {
    const data = localStorage.getItem(ICON_CACHE_KEY);
    if (!data) return {};
    return JSON.parse(data);
  } catch {
    return {};
  }
}

// Guardar un icono en el caché
export function cacheProfileIcon(region: string, summonerName: string, tagline: string, profileIconId: number): void {
  if (typeof window === "undefined") return;
  
  const key = `${region.toLowerCase()}:${summonerName.toLowerCase()}:${tagline.toLowerCase()}`;
  const cache = getProfileIconCache();
  
  // Actualizar o añadir el icono al caché
  cache[key] = {
    profileIconId,
    timestamp: Date.now()
  };
  
  // Limpiar entradas antiguas
  const now = Date.now();
  Object.keys(cache).forEach(k => {
    if (now - cache[k].timestamp > CACHE_EXPIRATION) {
      delete cache[k];
    }
  });
  
  localStorage.setItem(ICON_CACHE_KEY, JSON.stringify(cache));
}

// Obtener un icono del caché
export function getProfileIconFromCache(region: string, summonerName: string, tagline: string): number | null {
  if (typeof window === "undefined") return null;
  
  const key = `${region.toLowerCase()}:${summonerName.toLowerCase()}:${tagline.toLowerCase()}`;
  const cache = getProfileIconCache();
  
  // Verificar si existe y no ha expirado
  if (cache[key] && (Date.now() - cache[key].timestamp <= CACHE_EXPIRATION)) {
    return cache[key].profileIconId;
  }
  
  return null;
}
