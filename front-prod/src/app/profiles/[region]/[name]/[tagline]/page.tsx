"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import ProfileBasicInfo, { SummonerProfileDTO, ChampionMasteryDTO } from "./ProfileBasicInfo";
import { saveRecentProfile, triggerRecentProfilesUpdate } from "@/hooks/useRecentProfiles";
import { useToast } from "@/context/ToastContext";
import { useUserContext } from "@/context/UserContext";
import MatchHistory from "./MatchHistory";
import { cacheProfileIcon } from "@/utils/profileIconCache";

const ProfilePage = () => {
  const params = useParams();
  const { callApi } = useApi();
  const { lolVersion } = useUserContext();
  const [profile, setProfile] = useState<SummonerProfileDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setChampionMasteries] = useState<ChampionMasteryDTO[]>([]);
  const [, setLoadingMasteries] = useState(false);
  const [championIdToName, setChampionIdToName] = useState<Record<number, string>>({});
  const [loadingChampions, setLoadingChampions] = useState(true);
  const { showToast } = useToast();

  const fetchProfile = async () => {
    if (!params?.region || !params?.name || !params?.tagline) return;
    setLoading(true);
    setError(null);
    const res = await callApi(`/api/profiles/${params.region}/${params.name}/${params.tagline}`);
    if (res.ok) {
      // Añadir el tagline al perfil desde los parámetros de la URL
      const profileData = {
        ...res.data,
        tagline: params.tagline as string
      };
      
      setProfile(profileData);
      
      // Guardar el icono de perfil en el caché
      if (profileData.profileIconId && params.region && params.name && params.tagline) {
        cacheProfileIcon(
          params.region as string,
          params.name as string,
          params.tagline as string,
          profileData.profileIconId
        );
      }
      
      // Una vez que tenemos el perfil, cargamos las maestrías
      fetchChampionMasteries();
    } else {
      setError("No se pudo cargar el perfil");
    }
    setLoading(false);
  };

  const fetchChampionMasteries = async () => {
    if (!params?.region || !params?.name || !params?.tagline) return;
    setLoadingMasteries(true);
    try {
      const res = await callApi(`/api/champion-mastery/top3/${params.region}/${params.name}/${params.tagline}`);
      if (res.ok && Array.isArray(res.data)) {
        setChampionMasteries(res.data);
        // Actualizar el perfil con las maestrías
        setProfile(prev => prev ? {...prev, championMasteries: res.data} : null);
      }
    } catch (error) {
      console.error("Error al cargar las maestrías de campeones:", error);
    } finally {
      setLoadingMasteries(false);
    }
  };

  const handleRefresh = async () => {
    if (!params?.region || !params?.name || !params?.tagline) return;
    setRefreshing(true);
    const res = await callApi(`/api/profiles/${params.region}/${params.name}/${params.tagline}/refresh`, "POST");
    if (res.ok) {
      // Añadir el tagline al perfil desde los parámetros de la URL
      const profileData = {
        ...res.data,
        tagline: params.tagline as string
      };
      
      setProfile(profileData);
      
      // Guardar el icono de perfil en el caché
      if (profileData.profileIconId && params.region && params.name && params.tagline) {
        cacheProfileIcon(
          params.region as string,
          params.name as string,
          params.tagline as string,
          profileData.profileIconId
        );
      }
      
      // Cargar las maestrías después de actualizar el perfil
      fetchChampionMasteries();
      
      saveRecentProfile({
        region: params.region as string,
        name: params.name as string,
        tagline: params.tagline as string,
      });
      triggerRecentProfilesUpdate();
    } else {
      if (res.status === 400) {
        showToast("¡No puedes refrescar tan rápido! Espera unos segundos.", "error");
      } else {
        showToast("Ocurrió un error al refrescar el perfil.", "error");
      }
    }
    setRefreshing(false);
  };

  // Cargar datos de campeones desde Data Dragon
  const loadChampionData = useCallback(async () => {
    if (!lolVersion) return;
    setLoadingChampions(true);
    
    // Intentar obtener del localStorage primero para evitar parpadeos
    const cachedData = localStorage.getItem(`champion-data-${lolVersion}`);
    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
        setChampionIdToName(parsedData);
        setLoadingChampions(false);
        return;
      } catch (e) {
        console.error('Error al parsear datos en caché:', e);
      }
    }
    
    try {
      const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${lolVersion}/data/es_ES/champion.json`);
      const data = await response.json();
      const mapping: Record<number, string> = {};
      Object.values(data.data).forEach((champ) => {
        const championData = champ as { key: string; id: string };
        mapping[parseInt(championData.key)] = championData.id;
      });
      // Guardar en localStorage para futuras cargas
      localStorage.setItem(`champion-data-${lolVersion}`, JSON.stringify(mapping));
      setChampionIdToName(mapping);
    } catch (err) {
      console.error('Error cargando datos de campeones:', err);
    } finally {
      setLoadingChampions(false);
    }
  }, [lolVersion, setChampionIdToName, setLoadingChampions]);

  useEffect(() => {
    if (lolVersion) {
      loadChampionData();
    }
  }, [lolVersion, loadChampionData]);

  useEffect(() => {
    if (params?.region && params?.name && params?.tagline) {
      saveRecentProfile({
        region: params.region as string,
        name: params.name as string,
        tagline: params.tagline as string,
      });
      triggerRecentProfilesUpdate();
      fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  return (
    <div className="flex w-full min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b]">
      {/* Sidebar de perfil a la izquierda, dentro del área central */}
      <aside className="w-96 min-h-screen sticky top-0 bg-gradient-to-b from-[#2a3050] to-[#434a70] border-r border-[#232946]/40 text-white flex flex-col items-center p-4 gap-4 overflow-y-auto">

        {/* Profile info arriba */}
        {loading || loadingChampions ? (
          <div className="text-lg text-gray-300">Cargando perfil...</div>
        ) : error ? (
          <div className="text-red-400">{error}</div>
        ) : profile ? (
          <ProfileBasicInfo 
            profile={profile} 
            onRefresh={handleRefresh} 
            loading={refreshing} 
            championIdToName={championIdToName} 
            lolVersion={lolVersion || '14.9.1'}
          />
        ) : null}
        {/* Espacio para navegación o secciones futuras */}
        <div className="flex-1 w-full"></div>
      </aside>
      {/* Contenido principal */}
      <main className="flex-1 min-h-screen flex flex-col p-6">
        {loading || loadingChampions ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-lg text-gray-600">Cargando datos...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-lg text-red-500">{error}</div>
          </div>
        ) : profile ? (
          <MatchHistory puuid={profile.puuid} region={profile.region} />
        ) : null}
      </main>
    </div>
  );
};

export default ProfilePage;
