"use client";
import React from 'react';
import {useUserContext} from '@/contexts/UserContext';

/**
 * Componente que muestra la información del usuario actual
 */
const UserInfo = () => {
  const {user, isLoading} = useUserContext();

  if (isLoading) {
    return (
      <div className="p-4 bg-card rounded-lg shadow-md animate-pulse">
        <div className="h-6 bg-secondary/50 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-secondary/50 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-secondary/50 rounded w-2/3"></div>
      </div>
    );
  }

  if (!user.isSignedIn) {
    return (
      <div className="p-4 bg-card rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-2">No has iniciado sesión</h2>
        <p className="text-muted-foreground">
          Inicia sesión para ver tu información de usuario
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-card rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Información de Usuario</h2>

      <div className="space-y-2">
        <div>
          <span className="font-medium text-muted-foreground">ID: </span>
          <span className="font-mono text-sm">{user.id}</span>
        </div>

        <div>
          <span className="font-medium text-muted-foreground">Nombre de usuario: </span>
          <span>{user.username || 'No disponible'}</span>
        </div>

        <div>
          <span className="font-medium text-muted-foreground">Nombre completo: </span>
          <span>{user.fullName || 'No disponible'}</span>
        </div>

        <div>
          <span className="font-medium text-muted-foreground">Email: </span>
          <span>{user.email || 'No disponible'}</span>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
