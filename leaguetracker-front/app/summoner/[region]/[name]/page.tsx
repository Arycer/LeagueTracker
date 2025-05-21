"use client";
import React from 'react';
import { useParams } from 'next/navigation';
import ProfileVisitTracker from '@/components/summoner/ProfileVisitTracker';

type SummonerPageParams = {
  [key: string]: string;
  region: string;
  name: string;
}

export default function SummonerPage() {
  const params = useParams<SummonerPageParams>();
  const { region, name } = params;
  
  // Decodificar el nombre del invocador (puede contener caracteres especiales)
  const decodedName = decodeURIComponent(name);
  
  return (
    <div className="container mx-auto py-6 px-4">
      {/* Componente invisible que registra la visita al perfil */}
      <ProfileVisitTracker 
        summonerName={decodedName} 
        region={region} 
        tagline="0000" // Valor por defecto, en una implementación real se obtendría de la API
      />
      
      <div className="bg-gradient-to-b from-[#0f172a] to-[#1e293b] rounded-lg p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-2">{decodedName}</h1>
        <div className="text-sm text-blue-400 mb-6">
          <span className="uppercase">{region}</span>
          <span className="ml-2">#{"0000"}</span>
        </div>
        
        {/* Aquí iría el contenido real del perfil */}
        <div className="text-gray-300">
          <p>Esta es una página de ejemplo que muestra cómo integrar el componente ProfileVisitTracker.</p>
          <p className="mt-4">Cuando visitas esta página, el perfil se añade automáticamente a la lista de "Visitados recientemente" en la sidebar izquierda.</p>
        </div>
      </div>
    </div>
  );
}
