"use client";
import React, { useState } from 'react';
import { useUserContext } from '@/contexts/UserContext';
import { useToast } from '@/hooks/useToast';
import AddFriend from './AddFriend';
import FriendRequests from './FriendRequests';
import FriendsList from './FriendsList';
import { useFriends } from '@/contexts/FriendsContext';

/**
 * Sidebar derecho que muestra la lista de amigos y su estado online
 */
const FriendsSidebar: React.FC = () => {
  const { user, isLoading: isLoadingUser } = useUserContext();
  const { 
    friends, 
    friendsStatus, 
    incomingRequests, 
    outgoingRequests,
    isLoading,
    isLoadingIncoming,
    isLoadingOutgoing
  } = useFriends();
  const { info } = useToast();
  
  // Estado para la pestaña activa
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'add'>('friends');
  
  // Contar amigos online
  const onlineFriendsCount = Object.values(friendsStatus).filter(Boolean).length;
  
  // Si el usuario no está autenticado, mostrar mensaje
  if (!user.isSignedIn && !isLoadingUser) {
    return (
      <div className="hidden lg:flex flex-col w-64 h-full border-l border-[#1e293b] bg-[#0f172a]">
        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
          <div className="text-blue-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-12 h-12 mx-auto mb-2">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Inicia sesión</h3>
          <p className="text-sm text-gray-300">
            Para ver tus amigos y gestionar solicitudes, inicia sesión en tu cuenta.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="hidden lg:flex flex-col w-64 h-full border-l border-[#1e293b] bg-[#0f172a]">
      {/* Cabecera */}
      <div className="p-4 border-b border-[#1e293b]">
        <h2 className="text-lg font-semibold text-white">Amigos</h2>
        <p className="text-sm text-blue-400">
          {isLoading ? 'Cargando...' : `${onlineFriendsCount} online de ${friends.length}`}
        </p>
      </div>
      
      {/* Pestañas */}
      <div className="flex border-b border-[#1e293b]">
        <button
          className={`flex-1 py-2 text-sm font-medium ${
            activeTab === 'friends'
              ? 'text-blue-400 border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('friends')}
          data-tab="friends"
        >
          Amigos
        </button>
        <button
          className={`flex-1 py-2 text-sm font-medium ${
            activeTab === 'requests'
              ? 'text-blue-400 border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('requests')}
          data-tab="requests"
        >
          <div className="flex items-center justify-center gap-1.5">
            <span>Solicitudes</span>
            {incomingRequests.length > 0 && (
              <span className="inline-flex items-center justify-center bg-blue-500 text-white text-[10px] font-bold rounded-full h-4 min-w-4 px-1">
                {incomingRequests.length}
              </span>
            )}
          </div>
        </button>
        <button
          className={`flex-1 py-2 text-sm font-medium ${
            activeTab === 'add'
              ? 'text-blue-400 border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('add')}
          data-tab="add"
        >
          Añadir
        </button>
      </div>
      
      {/* Contenido según la pestaña activa */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'friends' && (
          <FriendsList 
            friends={friends} 
            friendsStatus={friendsStatus} 
            isLoading={isLoading} 
          />
        )}
        
        {activeTab === 'requests' && (
          <FriendRequests 
            incomingRequests={incomingRequests} 
            outgoingRequests={outgoingRequests}
            isLoadingIncoming={isLoadingIncoming}
            isLoadingOutgoing={isLoadingOutgoing}
          />
        )}
        
        {activeTab === 'add' && (
          <AddFriend />
        )}
      </div>
    </div>
  );
};

export default FriendsSidebar;
