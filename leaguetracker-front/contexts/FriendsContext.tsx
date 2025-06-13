"use client";
import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import {useWebSocket} from './WebSocketContext';
import {useUserContext} from './UserContext';
import {useApi} from '@/hooks/useApi';
import {useToast} from '@/hooks/useToast';
import {Region} from '@/constants/regions';


export interface FriendRequest {
  id: string;
  requesterUsername: string;
  recipientUsername: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

export interface FriendRequestDto {
  requesterUsername: string;
  recipientUsername: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}


export interface PresenceStatus {
  username: string;
  online: boolean;
}


export interface FriendMainAccount {
  summonerName: string;
  tagline: string;
  region: Region;
  profileIconId: number;
}


interface FriendsContextType {
  
  friends: string[];
  friendsStatus: Record<string, boolean>;
  friendsMainAccounts: Record<string, FriendMainAccount | null>;
  incomingRequests: FriendRequestDto[];
  outgoingRequests: FriendRequestDto[];

  
  isLoading: boolean;
  isLoadingIncoming: boolean;
  isLoadingOutgoing: boolean;

  
  sendFriendRequest: (username: string) => Promise<boolean>;
  acceptFriendRequest: (username: string) => Promise<boolean>;
  rejectFriendRequest: (username: string) => Promise<boolean>;
  removeFriend: (username: string) => Promise<boolean>;
  getFriendMainAccount: (username: string) => Promise<FriendMainAccount | null>;

  
  refreshFriends: () => Promise<void>;
  refreshIncomingRequests: () => Promise<void>;
  refreshOutgoingRequests: () => Promise<void>;
}


export const FriendsContext = createContext<FriendsContextType | undefined>(undefined);


interface FriendsProviderProps {
  children: ReactNode;
}

export const FriendsProvider: React.FC<FriendsProviderProps> = ({children}) => {
  const {user, isLoading: isLoadingUser} = useUserContext();
  const {connected, subscribe, unsubscribe} = useWebSocket();
  const {get, post, delete: del} = useApi();
  const {success, error: showError, info} = useToast();

  
  const [friends, setFriends] = useState<string[]>([]);
  const [friendsStatus, setFriendsStatus] = useState<Record<string, boolean>>({});
  const [friendsMainAccounts, setFriendsMainAccounts] = useState<Record<string, FriendMainAccount | null>>({});
  const [incomingRequests, setIncomingRequests] = useState<FriendRequestDto[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequestDto[]>([]);

  
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingIncoming, setIsLoadingIncoming] = useState(true);
  const [isLoadingOutgoing, setIsLoadingOutgoing] = useState(true);

  
  const refreshFriends = async () => {
    if (!user.isSignedIn) return;

    setIsLoading(true);
    try {
      const response = await get<string[]>('/api/friends');
      if (response.ok && response.data) {
        setFriends(response.data);

        
        const initialStatus: Record<string, boolean> = {};
        for (const friend of response.data) {
          initialStatus[friend] = false;

          
          const presenceResponse = await get<PresenceStatus>(`/api/presence/is-online/${friend}`);
          if (presenceResponse.ok && presenceResponse.data) {
            initialStatus[friend] = presenceResponse.data.online;
          }
        }

        setFriendsStatus(initialStatus);
      }
    } catch (err) {
      console.error('Error al cargar amigos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  
  const refreshIncomingRequests = async () => {
    if (!user.isSignedIn) return;

    setIsLoadingIncoming(true);
    try {
      const response = await get<FriendRequestDto[]>('/api/friends/requests/incoming');
      if (response.ok && response.data) {
        setIncomingRequests(response.data);
      }
    } catch (err) {
      console.error('Error al cargar solicitudes entrantes:', err);
    } finally {
      setIsLoadingIncoming(false);
    }
  };

  
  const refreshOutgoingRequests = async () => {
    if (!user.isSignedIn) return;

    setIsLoadingOutgoing(true);
    try {
      const response = await get<FriendRequestDto[]>('/api/friends/requests/outgoing');
      if (response.ok && response.data) {
        setOutgoingRequests(response.data);
      }
    } catch (err) {
      console.error('Error al cargar solicitudes salientes:', err);
    } finally {
      setIsLoadingOutgoing(false);
    }
  };

  
  const sendFriendRequest = async (username: string): Promise<boolean> => {
    try {
      
      console.log(`Enviando solicitud a: ${username}`);

      
      const response = await post<FriendRequestDto>(`/api/friends/requests/${username}`);

      if (response.ok) {
        success('Solicitud enviada', `Se ha enviado una solicitud de amistad a ${username}`);
        refreshOutgoingRequests();
        return true;
      } else {
        showError('Error', `No se pudo enviar la solicitud a ${username}`);
        return false;
      }
    } catch (err) {
      console.error('Error al enviar solicitud:', err);
      showError('Error', `No se pudo enviar la solicitud a ${username}`);
      return false;
    }
  };

  
  const acceptFriendRequest = async (username: string): Promise<boolean> => {
    try {
      
      console.log(`Aceptando solicitud de: ${username}`);

      
      const response = await post<FriendRequestDto>(`/api/friends/requests/${username}/respond?accept=true`);

      if (response.ok) {
        success('Solicitud aceptada', `Ahora eres amigo de ${username}`);
        refreshIncomingRequests();
        refreshFriends();
        return true;
      } else {
        showError('Error', `No se pudo aceptar la solicitud de ${username}`);
        return false;
      }
    } catch (err) {
      console.error('Error al aceptar solicitud:', err);
      showError('Error', `No se pudo aceptar la solicitud de ${username}`);
      return false;
    }
  };

  
  const rejectFriendRequest = async (username: string): Promise<boolean> => {
    try {
      
      console.log(`Rechazando solicitud de: ${username}`);

      
      const response = await post<FriendRequestDto>(`/api/friends/requests/${username}/respond?accept=false`);

      if (response.ok) {
        info('Solicitud rechazada', `Has rechazado la solicitud de ${username}`);
        refreshIncomingRequests();
        return true;
      } else {
        showError('Error', `No se pudo rechazar la solicitud de ${username}`);
        return false;
      }
    } catch (err) {
      console.error('Error al rechazar solicitud:', err);
      showError('Error', `No se pudo rechazar la solicitud de ${username}`);
      return false;
    }
  };

  
  const removeFriend = async (username: string): Promise<boolean> => {
    try {
      
      console.log(`Eliminando amigo: ${username}`);

      
      const response = await del(`/api/friends/delete/${username}`);

      if (response.ok) {
        info('Amigo eliminado', `Has eliminado a ${username} de tu lista de amigos`);
        refreshFriends();
        return true;
      } else {
        showError('Error', `No se pudo eliminar a ${username} de tu lista de amigos`);
        return false;
      }
    } catch (err) {
      console.error('Error al eliminar amigo:', err);
      showError('Error', `No se pudo eliminar a ${username} de tu lista de amigos`);
      return false;
    }
  };

  
  const getFriendMainAccount = async (username: string): Promise<FriendMainAccount | null> => {
    try {
      
      if (friendsMainAccounts[username] !== undefined) {
        return friendsMainAccounts[username];
      }

      
      const response = await get<FriendMainAccount>(`/api/lol/accounts/main/${username}`);

      if (response.ok && response.data) {
        
        setFriendsMainAccounts(prev => ({
          ...prev,
          [username]: response.data
        }));
        return response.data;
      } else {
        
        setFriendsMainAccounts(prev => ({
          ...prev,
          [username]: null
        }));
        return null;
      }
    } catch (err) {
      console.error(`Error al obtener la cuenta principal de ${username}:`, err);
      return null;
    }
  };

  
  useEffect(() => {
    if (!connected || !user.isSignedIn) return;

    const subscription = subscribe('/topic/presence-updates', (message) => {
      try {
        const data = JSON.parse(message.body);
        const {event, username} = data;

        if (friends.includes(username)) {
          setFriendsStatus(prev => ({
            ...prev,
            [username]: event === 'connected'
          }));

          if (event === 'connected') {
            info(`${username} está en línea`, '', {duration: 3000});
          }
        }
      } catch (err) {
        console.error('Error al procesar actualización de presencia:', err);
      }
    });

    return () => {
      if (subscription) {
        unsubscribe(subscription);
      }
    };
  }, [connected, user.isSignedIn, friends, subscribe, unsubscribe, info]);

  
  useEffect(() => {
    if (user.isSignedIn && !isLoadingUser) {
      refreshFriends();
      refreshIncomingRequests();
      refreshOutgoingRequests();
    }
  }, [user.isSignedIn, isLoadingUser]);

  return (
    <FriendsContext.Provider
      value={{
        friends,
        friendsStatus,
        friendsMainAccounts,
        incomingRequests,
        outgoingRequests,
        isLoading,
        isLoadingIncoming,
        isLoadingOutgoing,
        sendFriendRequest,
        acceptFriendRequest,
        rejectFriendRequest,
        removeFriend,
        getFriendMainAccount,
        refreshFriends,
        refreshIncomingRequests,
        refreshOutgoingRequests,
      }}
    >
      {children}
    </FriendsContext.Provider>
  );
};

export const useFriends = () => {
  const context = useContext(FriendsContext);
  if (context === undefined) {
    throw new Error('useFriends debe ser usado dentro de un FriendsProvider');
  }
  return context;
};
