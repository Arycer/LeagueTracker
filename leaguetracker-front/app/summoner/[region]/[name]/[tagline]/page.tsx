"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Region, getRegionLabel } from '@/constants/regions';
import { useProfiles, SummonerProfileDTO } from '@/hooks/useProfiles';
import ProfileVisitTracker from '@/components/summoner/ProfileVisitTracker';
import BasicInfo from '@/components/summoner/BasicInfo';
import LeagueEntries from '@/components/summoner/LeagueEntries';
import TopChampionMasteries from '@/components/summoner/TopChampionMasteries';
import RankedIcon from '@/components/ddragon/RankedIcon';
import ProfileIcon from '@/components/ddragon/ProfileIcon';
import MatchHistory from '@/components/summoner/MatchHistory';

// Tipos para los parámetros de la URL
type SummonerPageParams = {
  [key: string]: string;
  region: string;
  name: string;
  tagline: string;
}

// Datos de ejemplo para el perfil (fallback)
const mockProfile: SummonerProfileDTO = {
  name: "Ejemplo",
  tagline: "0000", // Añadido el campo tagline requerido
  puuid: "12345678-1234-5678-1234-567812345678",
  summonerLevel: 250,
  profileIconId: 29,
  region: "EUW" as Region,
  leagueEntries: [
    {
      leagueId: "12345678-1234-5678-1234-567812345678",
      summonerId: "12345678-1234-5678-1234-567812345678",
      queueType: "RANKED_SOLO_5x5",
      tier: "GOLD",
      rank: "II",
      leaguePoints: 75,
      wins: 120,
      losses: 100,
      hotStreak: false,
      veteran: false,
      freshBlood: false,
      inactive: false,
      miniSeries: null
    },
    {
      leagueId: "12345678-1234-5678-1234-567812345678",
      summonerId: "12345678-1234-5678-1234-567812345678",
      queueType: "RANKED_FLEX_SR",
      tier: "SILVER",
      rank: "I",
      leaguePoints: 45,
      wins: 80,
      losses: 70,
      hotStreak: false,
      veteran: false,
      freshBlood: false,
      inactive: false,
      miniSeries: null
    }
  ]
};

export default function SummonerPage() {
  // Obtener parámetros de la URL
  const params = useParams<SummonerPageParams>();
  const { region, name, tagline } = params;
  
  // Decodificar parámetros (pueden contener caracteres especiales)
  const decodedName = decodeURIComponent(name);
  const decodedTagline = decodeURIComponent(tagline);
  
  // Estados
  const [profile, setProfile] = useState<SummonerProfileDTO | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Referencias para controlar el ciclo de vida
  const isMounted = useRef(true);
  const initialLoadDone = useRef(false);
  
  // Hooks
  const { getProfile, refreshProfile, isLoading, error } = useProfiles();
  
  // Cargar el perfil del invocador
  useEffect(() => {
    const loadProfile = async () => {
      // Evitar múltiples cargas
      if (initialLoadDone.current) return;
      initialLoadDone.current = true;
      
      try {
        console.log(`Intentando cargar perfil: ${region}/${decodedName}/${decodedTagline}`);
        const data = await getProfile(region as Region, decodedName, decodedTagline);
        
        // Verificar que el componente sigue montado
        if (!isMounted.current) return;
        
        console.log('Respuesta de API:', data);
        
        if (data) {
          console.log('Estableciendo perfil con datos de la API');
          setProfile(data);
          setIsError(false);
          setErrorMessage(null);
        } else {
          console.warn('getProfile devolvió null, usando datos de ejemplo');
          // Usar el perfil mock si no hay datos
          const mockData = {
            ...mockProfile,
            name: decodedName,
            tagline: decodedTagline,
            region: region as Region
          };
          console.log('Estableciendo perfil con datos mock:', mockData);
          setProfile(mockData);
          setIsError(true);
          setErrorMessage('No se pudo cargar el perfil del invocador. Mostrando datos de ejemplo.');
        }
      } catch (err) {
        console.error('Error al cargar el perfil:', err);
        if (!isMounted.current) return;
        
        // Usar el perfil mock en caso de error
        const mockData = {
          ...mockProfile,
          name: decodedName,
          region: region as Region
        };
        console.log('Estableciendo perfil con datos mock por error:', mockData);
        setProfile(mockData);
        setIsError(true);
        setErrorMessage('Error al cargar el perfil. Mostrando datos de ejemplo.');
      }
    };
    
    // Inicializar el estado
    isMounted.current = true;
    loadProfile();
    
    // Limpiar al desmontar
    return () => {
      isMounted.current = false;
    };
  }, [region, decodedName, decodedTagline, getProfile]);
  
  // Refrescar el perfil del invocador
  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    
    try {
      console.log(`Intentando refrescar perfil: ${region}/${decodedName}/${decodedTagline}`);
      const data = await refreshProfile(region as Region, decodedName, decodedTagline);
      
      if (isMounted.current) {
        if (data) {
          console.log('Perfil actualizado correctamente:', data);
          setProfile(data);
          setIsError(false);
          setErrorMessage(null);
        } else {
          console.log('No se encontró el perfil del invocador');
          setIsError(true);
          setErrorMessage('No se encontró el perfil del invocador');
        }
      }
    } catch (err) {
      console.error('Error al refrescar perfil:', err);
      if (isMounted.current) {
        setIsError(true);
        setErrorMessage('Error al refrescar el perfil del invocador');
      }
    } finally {
      if (isMounted.current) {
        setIsRefreshing(false);
      }
    }
  };
  
  // Añadir logs para depuración
  useEffect(() => {
    console.log('Estado actual:', {
      profile,
      isLoading,
      error,
      isError,
      errorMessage
    });
  }, [profile, isLoading, error, isError, errorMessage]);

  // Renderizar el componente
  const renderContent = () => {
    if (isLoading && !profile) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
          <p className="text-gray-300">Cargando perfil del invocador...</p>
        </div>
      );
    }
    
    if (!profile) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <AlertCircle className="w-10 h-10 text-yellow-500 mb-4" />
          <p className="text-yellow-500 font-medium mb-2">No se encontró el perfil</p>
          <p className="text-gray-300 text-center max-w-md">No se pudo encontrar información para este invocador.</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        {/* Header con BasicInfo */}
        <div className="w-full">
          <BasicInfo 
            profile={profile} 
            onRefresh={handleRefresh} 
            isRefreshing={isRefreshing} 
          />
        </div>

        {isError && errorMessage && (
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-md p-3">
            <p className="text-yellow-400 text-sm">
              <AlertCircle className="inline-block w-4 h-4 mr-2" />
              {errorMessage}
            </p>
          </div>
        )}
        
        {/* Contenido principal con grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar izquierdo */}
          <div className="md:col-span-1 space-y-6">
            <LeagueEntries entries={profile.leagueEntries} />
            
            {/* Componente de maestrías de campeones */}
            <TopChampionMasteries 
              summonerName={profile.name}
              tagline={profile.tagline}
              region={profile.region}
            />
          </div>
          
          {/* Contenido principal */}
          <div className="md:col-span-3 space-y-6">
            {profile && (
              <MatchHistory 
                puuid={profile.puuid} 
                region={profile.region} 
                summonerName={profile.name} 
              />
            )}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Componente invisible que registra la visita al perfil */}
      <ProfileVisitTracker 
        summonerName={decodedName} 
        region={region} 
        tagline={decodedTagline}
      />

      {renderContent()}
    </div>
  );
}