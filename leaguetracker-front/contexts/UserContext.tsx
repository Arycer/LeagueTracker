"use client";
import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import {useAuth, useUser} from '@clerk/nextjs';


export interface UserData {
  id: string | null;
  username: string | null;
  email: string | null;
  fullName: string | null;
  isLoaded: boolean;
  isSignedIn: boolean;
}


interface UserContextType {
  user: UserData;
  isLoading: boolean;
}


const UserContext = createContext<UserContextType | undefined>(undefined);


interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({children}) => {
  const {isLoaded: isAuthLoaded, isSignedIn} = useAuth();
  const {user: clerkUser, isLoaded: isUserLoaded} = useUser();
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
    
    if (isAuthLoaded && isUserLoaded) {
      setIsLoading(false);

      if (isSignedIn && clerkUser) {
        
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
    <UserContext.Provider value={{user: userData, isLoading}}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext debe ser usado dentro de un UserProvider');
  }
  return context;
};
