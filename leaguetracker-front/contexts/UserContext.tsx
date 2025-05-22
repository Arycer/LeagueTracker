"use client";
import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import {useAuth, useUser} from '@clerk/nextjs';

// Definir la estructura de datos del usuario
export interface UserData {
  id: string | null;
  username: string | null;
  email: string | null;
  fullName: string | null;
  isLoaded: boolean;
  isSignedIn: boolean;
}

// Definir el tipo del contexto
interface UserContextType {
  user: UserData;
  isLoading: boolean;
}

// Crear el contexto con un valor por defecto
const UserContext = createContext<UserContextType | undefined>(undefined);

// Props para el proveedor
interface UserProviderProps {
  children: ReactNode;
}

/**
 * Proveedor del contexto de usuario
 * Proporciona acceso global a la información del usuario autenticado
 */
export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const { user: clerkUser, isLoaded: isUserLoaded } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<UserData>({
    id: null,
    username: null,
    email: null,
    fullName: null,
    isLoaded: false,
    isSignedIn: false,
  });

  useEffect(() => {
    // Actualizar los datos del usuario cuando cambia el estado de autenticación
    if (isAuthLoaded && isUserLoaded) {
      setIsLoading(false);
      
      if (isSignedIn && clerkUser) {
        // Usuario autenticado, extraer información relevante
        setUserData({
          id: clerkUser.id,
          username: clerkUser.username,
          email: clerkUser.primaryEmailAddress?.emailAddress || null,
          fullName: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
          isLoaded: true,
          isSignedIn: true,
        });
        
        console.log('✅ Información de usuario cargada:', clerkUser.username);
      } else {
        // Usuario no autenticado
        setUserData({
          id: null,
          username: null,
          email: null,
          fullName: null,
          isLoaded: true,
          isSignedIn: false,
        });
        
        console.log('ℹ️ No hay usuario autenticado');
      }
    }
  }, [isAuthLoaded, isUserLoaded, isSignedIn, clerkUser]);

  return (
    <UserContext.Provider value={{ user: userData, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

/**
 * Hook personalizado para acceder al contexto de usuario
 * @returns Información del usuario y estado de carga
 */
export const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext debe ser usado dentro de un UserProvider');
  }
  return context;
};
