import React from 'react';
import FavoriteProfiles from './FavoriteProfiles';
import RecentProfiles from './RecentProfiles';

const LeftSidebar = () => {
  // Ya no necesitamos los jugadores simulados, ahora usamos el hook useRecentProfiles

  return (
    <aside className="hidden md:block w-64 border-r border-blue-900/20 bg-[#0f172a]/80 p-4 overflow-y-auto">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">Acceso Rápido</h2>
          <div className="space-y-4">
            {/* Componente de perfiles favoritos */}
            <FavoriteProfiles />
            
            {/* Visitados recientemente */}
            <RecentProfiles />
          </div>
        </div>
      </div>
    </aside>
  );
};

export default LeftSidebar;
