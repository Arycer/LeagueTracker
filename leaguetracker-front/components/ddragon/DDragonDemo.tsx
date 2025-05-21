import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChampionIcon, ItemIcon, SummonerSpellIcon, ProfileIcon, DDragonVersionDisplay } from './';

/**
 * Componente de demostración que muestra todos los componentes de DDragon
 */
const DDragonDemo: React.FC = () => {
  return (
    <Card className="bg-[#1e293b]/70 border-blue-900/30 w-full max-w-2xl mx-auto">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Componentes DDragon</h2>
          <DDragonVersionDisplay />
        </div>
        
        <div className="space-y-4">
          {/* Sección de iconos de campeones */}
          <div>
            <h3 className="text-lg font-medium text-blue-400 mb-2">Iconos de campeones</h3>
            <div className="flex flex-wrap gap-2">
              <ChampionIcon championId="Ahri" withTooltip />
              <ChampionIcon championId="Yasuo" size={48} withBorder withTooltip />
              <ChampionIcon championId="Lux" size={32} className="rounded-full" withTooltip />
              <ChampionIcon championId="Jinx" size={56} withBorder withTooltip />
            </div>
          </div>
          
          {/* Sección de iconos de ítems */}
          <div>
            <h3 className="text-lg font-medium text-blue-400 mb-2">Iconos de ítems</h3>
            <div className="flex flex-wrap gap-2">
              <ItemIcon itemId="3006" withTooltip /> {/* Berserker's Greaves */}
              <ItemIcon itemId="3031" withTooltip /> {/* Infinity Edge */}
              <ItemIcon itemId="3036" size={40} withTooltip /> {/* Lord Dominik's Regards */}
              <ItemIcon itemId="0" emptySlot /> {/* Slot vacío */}
            </div>
          </div>
          
          {/* Sección de iconos de hechizos */}
          <div>
            <h3 className="text-lg font-medium text-blue-400 mb-2">Hechizos de invocador</h3>
            <div className="flex flex-wrap gap-2">
              <SummonerSpellIcon spellId="SummonerFlash" withTooltip />
              <SummonerSpellIcon spellId="SummonerIgnite" withTooltip />
              <SummonerSpellIcon spellId="SummonerTeleport" size={32} withTooltip />
              <SummonerSpellIcon spellId="SummonerSmite" size={36} withTooltip />
            </div>
          </div>
          
          {/* Sección de iconos de perfil */}
          <div>
            <h3 className="text-lg font-medium text-blue-400 mb-2">Iconos de perfil</h3>
            <div className="flex flex-wrap gap-4">
              <ProfileIcon iconId={29} withLevel={30} />
              <ProfileIcon iconId={5} size={80} withLevel={120} />
              <ProfileIcon iconId={4022} size={48} />
            </div>
          </div>
        </div>
        
        <div className="text-sm text-gray-400 border-t border-blue-900/30 pt-4">
          <p>Estos componentes utilizan el contexto DDragon para obtener automáticamente la versión más reciente del parche.</p>
          <p>Puedes usarlos en toda la aplicación importándolos desde <code className="text-blue-300">@/components/ddragon</code></p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DDragonDemo;
