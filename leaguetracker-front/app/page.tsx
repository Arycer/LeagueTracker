"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

export default function Home() {
  const router = useRouter();
  const [region, setRegion] = useState("euw");
  const [summonerName, setSummonerName] = useState("");
  const [tagline, setTagline] = useState("");
  
  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    
    if (!summonerName.trim()) return;
    
    const formattedTagline = tagline.startsWith("#") ? tagline.substring(1) : tagline;
    
    router.push(`/summoner/${region}/${encodeURIComponent(summonerName)}?tagline=${formattedTagline}`);
  };
  
  return (
    <div className="flex flex-col items-center justify-center w-full py-8">
      {/* Hero Section */}
      <div className="relative w-full max-w-6xl mx-auto text-center mb-12">
        <div className="flex flex-col items-center justify-center space-y-6 z-10 relative">
          <h1 className="text-4xl md:text-6xl font-bold">
            <span className="text-blue-400">League</span>
            <span className="text-white">Tracker</span>
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">
            Información acerca de tus partidas de League of Legends y las de tus amigos y oponentes en un solo lugar.
          </p>
          
          {/* Search Form */}
          <div className="w-full max-w-xl mx-auto mt-8">
            <Card className="bg-[#1e293b]/70 border-blue-900/30">
              <CardContent className="p-4">
                <form onSubmit={handleSearch} className="flex flex-col space-y-4">
                  <div className="flex space-x-2">
                    <div className="w-1/4">
                      <select 
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="w-full h-10 px-3 rounded-md bg-[#0f172a] border border-blue-900/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="euw">Europa West</option>
                        <option value="eune">Europa Nordic & East</option>
                        <option value="na">North America</option>
                        <option value="kr">Korea</option>
                        <option value="br">Brazil</option>
                      </select>
                    </div>
                    <div className="w-1/2">
                      <Input 
                        type="text" 
                        value={summonerName}
                        onChange={(e) => setSummonerName(e.target.value)}
                        placeholder="Nombre de invocador..." 
                        className="h-10 bg-[#0f172a] border-blue-900/30 focus:ring-blue-500 text-white"
                        required
                      />
                    </div>
                    <div className="w-1/4">
                      <Input 
                        type="text" 
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                        placeholder="#0000" 
                        className="h-10 bg-[#0f172a] border-blue-900/30 focus:ring-blue-500 text-white"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                    Buscar
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full max-w-6xl mx-auto mt-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-[#1e293b]/70 border border-blue-900/30 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Estadísticas detalladas</h3>
            <p className="text-gray-300">Accede a estadísticas completas de tus partidas y rendimiento con diferentes campeones.</p>
          </div>
          
          {/* Feature 2 */}
          <div className="bg-[#1e293b]/70 border border-blue-900/30 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Seguimiento de amigos</h3>
            <p className="text-gray-300">Añade a tus amigos y sigue su progreso, compara estadísticas y celebra sus victorias.</p>
          </div>
          
          {/* Feature 3 */}
          <div className="bg-[#1e293b]/70 border border-blue-900/30 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Análisis de partidas</h3>
            <p className="text-gray-300">Revisa tus partidas pasadas con análisis detallado para mejorar tu juego.</p>
          </div>
        </div>
      </div>

      {/* Version info */}
      <div className="mt-12 text-xs text-gray-500">
        Versión de la app: v0.1 - ©2025
      </div>
    </div>
  );
}
