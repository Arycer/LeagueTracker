"use client";
import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {FriendMainAccount, useFriends} from '@/contexts/FriendsContext';

interface FriendsListProps {
  friends: string[];
  friendsStatus: Record<string, boolean>;
  isLoading: boolean;
  friendsMainAccounts?: Record<string, FriendMainAccount | null>;
}

/**
 * Componente que muestra la lista de amigos y su estado online
 */
const FriendsList: React.FC<FriendsListProps> = ({ friends, friendsStatus, isLoading, friendsMainAccounts: propMainAccounts }) => {
  const router = useRouter();
  const { removeFriend, getFriendMainAccount, friendsMainAccounts: contextMainAccounts } = useFriends();
  const [expandedFriend, setExpandedFriend] = useState<string | null>(null);
  const [loadingMainAccounts, setLoadingMainAccounts] = useState<Record<string, boolean>>({});
  
  // Usar las cuentas principales proporcionadas como prop o las del contexto
  const friendsMainAccounts = propMainAccounts || contextMainAccounts;
  
  // Cargar la cuenta principal cuando se expande un amigo
  useEffect(() => {
    if (expandedFriend) {
      const loadMainAccount = async () => {
        // Si no tenemos la cuenta principal de este amigo, intentar cargarla
        if (friendsMainAccounts[expandedFriend] === undefined) {
          setLoadingMainAccounts(prev => ({ ...prev, [expandedFriend]: true }));
          await getFriendMainAccount(expandedFriend);
          setLoadingMainAccounts(prev => ({ ...prev, [expandedFriend]: false }));
        }
      };
      
      loadMainAccount();
    }
  }, [expandedFriend, friendsMainAccounts, getFriendMainAccount]);
  
  // Si está cargando, mostrar un esqueleto de carga
  if (isLoading) {
    return (
      <div className="p-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center py-2 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-[#1e293b]/50 mr-3"></div>
            <div className="flex-1">
              <div className="h-4 bg-[#1e293b]/50 rounded w-24 mb-2"></div>
              <div className="h-3 bg-[#1e293b]/50 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  // Si no hay amigos, mostrar mensaje
  if (friends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <div className="text-blue-400 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-12 h-12 mx-auto mb-2">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-white mb-2">No tienes amigos</h3>
        <p className="text-sm text-gray-300 mb-4">
          Añade amigos para ver su estado y jugar juntos.
        </p>
        <button 
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
          onClick={() => document.querySelector('[data-tab="add"]')?.dispatchEvent(new MouseEvent('click'))}
        >
          Añadir amigos
        </button>
      </div>
    );
  }
  
  // Ordenar amigos: primero los que están online
  const sortedFriends = [...friends].sort((a, b) => {
    if (friendsStatus[a] && !friendsStatus[b]) return -1;
    if (!friendsStatus[a] && friendsStatus[b]) return 1;
    return a.localeCompare(b);
  });
  
  // Manejar la eliminación de un amigo
  const handleRemoveFriend = async (username: string) => {
    const confirmed = window.confirm(`¿Estás seguro de que quieres eliminar a ${username} de tu lista de amigos?`);
    if (confirmed) {
      const success = await removeFriend(username);
      if (success) {
        setExpandedFriend(null);
      }
    }
  };
  
  return (
    <div className="p-2 custom-scrollbar">
      {sortedFriends.map((friend) => (
        <div key={friend} className="mb-1">
          <div 
            className={`flex items-center p-2 rounded-md cursor-pointer hover:bg-[#1e293b]/50 ${
              expandedFriend === friend ? 'bg-[#1e293b]/30' : ''
            }`}
            onClick={() => setExpandedFriend(expandedFriend === friend ? null : friend)}
          >
            {/* Avatar y estado online */}
            <div className="relative mr-3">
              <div className="w-10 h-10 rounded-full bg-blue-600/30 flex items-center justify-center text-lg font-medium text-white">
                {friend.charAt(0).toUpperCase()}
              </div>
              <div 
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0f172a] ${
                  friendsStatus[friend] ? 'bg-green-500' : 'bg-gray-500'
                }`}
              ></div>
            </div>
            
            {/* Nombre y estado */}
            <div className="flex-1">
              <div className="font-medium text-white">{friend}</div>
              <div className="text-xs text-gray-300">
                {friendsStatus[friend] ? 'En línea' : 'Desconectado'}
              </div>
            </div>
            
            {/* Flecha para expandir */}
            <div className="text-gray-400">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                className={`w-5 h-5 transition-transform ${
                  expandedFriend === friend ? 'rotate-180' : ''
                }`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          {/* Panel expandido con acciones */}
          {expandedFriend === friend && (
            <div className="bg-[#1e293b]/20 rounded-md mt-1 p-2 flex flex-col space-y-2">
              
              <button 
                className="flex items-center text-sm py-1 px-2 hover:bg-[#1e293b]/40 rounded-md text-gray-300 hover:text-white"
                onClick={() => {
                  // Abrir el chat con este amigo usando parámetros de consulta
                  router.push(`/chat?username=${encodeURIComponent(friend)}`);
                  // Cerrar el panel expandido
                  setExpandedFriend(null);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                Enviar mensaje
              </button>
              
              {/* Botón para visitar perfil (solo si tiene cuenta principal) */}
              {loadingMainAccounts[friend] ? (
                <div className="flex items-center text-sm py-1 px-2 text-gray-400">
                  <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Cargando perfil...
                </div>
              ) : friendsMainAccounts[friend] ? (
                <button 
                  className="flex items-center text-sm py-1 px-2 hover:bg-blue-600/30 rounded-md text-blue-400 hover:text-blue-300 transition-colors"
                  onClick={() => {
                    const mainAccount = friendsMainAccounts[friend];
                    if (mainAccount) {
                      // Navegar al perfil usando los datos de la cuenta principal
                      router.push(`/summoner/${mainAccount.region}/${mainAccount.summonerName}/${mainAccount.tagline}`);
                      // Cerrar el panel expandido
                      setExpandedFriend(null);
                    }
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Ver perfil LoL
                </button>
              ) : null}
              
              <button 
                className="flex items-center text-sm py-1 px-2 hover:bg-red-500/30 rounded-md text-red-400 hover:text-red-300 transition-colors"
                onClick={() => handleRemoveFriend(friend)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Eliminar amigo
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FriendsList;
