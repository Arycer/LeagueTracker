import {useDDragon} from '@/contexts/DDragonContext';
import React from 'react';

const DDragonVersionDisplay: React.FC = () => {
  const {currentVersion, isLoading, error} = useDDragon();

  if (isLoading) {
    return (
      <div className="text-sm text-gray-400">
        Cargando versión del parche...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-400">
        Error al cargar la versión: {error}
      </div>
    );
  }

  return (
    <div className="text-sm text-gray-400">
      Versión actual de LoL: <span className="text-blue-400 font-medium">{currentVersion}</span>
    </div>
  );
};

export default DDragonVersionDisplay;
