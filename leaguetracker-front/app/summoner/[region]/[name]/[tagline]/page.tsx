"use client";
import React, {useEffect, useRef, useState} from 'react';
import {useParams} from 'next/navigation';
import {AlertCircle, Loader2} from 'lucide-react';
import {Region} from '@/constants/regions';
import {SummonerProfileDTO, useProfiles} from '@/hooks/useProfiles';
import ProfileVisitTracker from '@/components/summoner/ProfileVisitTracker';
import BasicInfo from '@/components/summoner/BasicInfo';
import LeagueEntries from '@/components/summoner/LeagueEntries';
import TopChampionMasteries from '@/components/summoner/TopChampionMasteries';
import MatchHistory from '@/components/summoner/MatchHistory';

type SummonerPageParams = {
  [key: string]: string;
  region: string;
  name: string;
  tagline: string;
}

const mockProfile: SummonerProfileDTO = {
  name: "Ejemplo",
  tagline: "0000",
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
  const params = useParams<SummonerPageParams>();
  const {region, name, tagline} = params;

  const decodedName = decodeURIComponent(name);
  const decodedTagline = decodeURIComponent(tagline);

  const [profile, setProfile] = useState<SummonerProfileDTO | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isMounted = useRef(true);
  const initialLoadDone = useRef(false);

  const {getProfile, refreshProfile, isLoading, error} = useProfiles();

  useEffect(() => {
    const loadProfile = async () => {
      if (initialLoadDone.current) return;
      initialLoadDone.current = true;

      try {
        console.log(`Intentando cargar perfil: ${region}/${decodedName}/${decodedTagline}`);
        const data = await getProfile(region as Region, decodedName, decodedTagline);

        if (!isMounted.current) return;

        console.log('Respuesta de API:', data);

        if (data) {
          console.log('Estableciendo perfil con datos de la API');
          setProfile(data);
          setIsError(false);
          setErrorMessage(null);
        } else {
          console.warn('getProfile devolvió null, usando datos de ejemplo');
          
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

    
    isMounted.current = true;
    loadProfile();

    
    return () => {
      isMounted.current = false;
    };
  }, [region, decodedName, decodedTagline, getProfile]);

  
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

  
  useEffect(() => {
    console.log('Estado actual:', {
      profile,
      isLoading,
      error,
      isError,
      errorMessage
    });
  }, [profile, isLoading, error, isError, errorMessage]);

  
  const renderContent = () => {
    if (isLoading && !profile) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4"/>
          <p className="text-gray-300">Cargando perfil del invocador...</p>
        </div>
      );
    }

    if (!profile) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <AlertCircle className="w-10 h-10 text-yellow-500 mb-4"/>
          <p className="text-yellow-500 font-medium mb-2">No se encontró el perfil</p>
          <p className="text-gray-300 text-center max-w-md">No se pudo encontrar información para este
            invocador.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {}
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
              <AlertCircle className="inline-block w-4 h-4 mr-2"/>
              {errorMessage}
            </p>
          </div>
        )}

        {}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {}
          <div className="md:col-span-1 space-y-6">
            <LeagueEntries entries={profile.leagueEntries}/>

            {}
            <TopChampionMasteries
              summonerName={profile.name}
              tagline={profile.tagline}
              region={profile.region}
            />
          </div>

          {}
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
      {}
      <ProfileVisitTracker
        summonerName={decodedName}
        region={region}
        tagline={decodedTagline}
      />

      {renderContent()}
    </div>
  );
}