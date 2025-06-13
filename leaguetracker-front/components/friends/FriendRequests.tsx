"use client";
import React, {useState} from 'react';
import {FriendRequestDto, useFriends} from '@/contexts/FriendsContext';

interface FriendRequestsProps {
  incomingRequests: FriendRequestDto[];
  outgoingRequests: FriendRequestDto[];
  isLoadingIncoming: boolean;
  isLoadingOutgoing: boolean;
}

const FriendRequests: React.FC<FriendRequestsProps> = ({
                                                         incomingRequests,
                                                         outgoingRequests,
                                                         isLoadingIncoming,
                                                         isLoadingOutgoing
                                                       }) => {
  const {acceptFriendRequest, rejectFriendRequest} = useFriends();
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');

  
  const renderSkeleton = () => (
    <div className="p-4">
      {Array.from({length: 3}).map((_, index) => (
        <div key={index} className="flex items-center py-2 animate-pulse">
          <div className="w-10 h-10 rounded-full bg-secondary/50 mr-3"></div>
          <div className="flex-1">
            <div className="h-4 bg-secondary/50 rounded w-24 mb-2"></div>
            <div className="h-3 bg-secondary/50 rounded w-16"></div>
          </div>
        </div>
      ))}
    </div>
  );

  
  const renderEmptyState = (type: 'incoming' | 'outgoing') => (
    <div className="flex flex-col items-center justify-center p-4 text-center h-48">
      <div className="text-muted-foreground mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             className="w-10 h-10 mx-auto mb-2">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/>
        </svg>
      </div>
      <h3 className="text-white font-medium mb-2">
        {type === 'incoming'
          ? 'No tienes solicitudes pendientes'
          : 'No has enviado solicitudes'}
      </h3>
      <p className="text-sm text-muted-foreground">
        {type === 'incoming'
          ? 'Las solicitudes de amistad aparecerán aquí'
          : 'Las solicitudes que envíes aparecerán aquí'}
      </p>
    </div>
  );

  
  const renderIncomingRequests = () => {
    if (isLoadingIncoming) return renderSkeleton();
    if (incomingRequests.length === 0) return renderEmptyState('incoming');

    return (
      <div className="p-2">
        {incomingRequests.map((request, index) => (
          <div key={index} className="bg-secondary/10 rounded-md p-3 mb-2">
            <div className="flex items-center mb-2">
              <div
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg font-medium mr-3">
                {request.requesterUsername.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-medium text-white">{request.requesterUsername}</div>
                <div className="text-xs text-gray-300">
                  {new Date(request.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="flex space-x-2 mt-2">
              <button
                className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
                onClick={() => acceptFriendRequest(request.requesterUsername)}
              >
                Aceptar
              </button>
              <button
                className="flex-1 py-1.5 bg-[#1e293b] hover:bg-[#1e293b]/80 text-white rounded-md text-sm font-medium transition-colors"
                onClick={() => rejectFriendRequest(request.requesterUsername)}
              >
                Rechazar
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  
  const renderOutgoingRequests = () => {
    if (isLoadingOutgoing) return renderSkeleton();
    if (outgoingRequests.length === 0) return renderEmptyState('outgoing');

    return (
      <div className="p-2">
        {outgoingRequests.map((request, index) => (
          <div key={index} className="bg-secondary/10 rounded-md p-3 mb-2">
            <div className="flex items-center">
              <div
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg font-medium mr-3">
                {request.recipientUsername.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="font-medium text-white">{request.recipientUsername}</div>
                <div className="text-xs text-gray-300">
                  Enviada el {new Date(request.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-md">
                Pendiente
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      {}
      <div className="flex border-b border-[#1e293b]">
        <button
          className={`flex-1 py-2 text-sm font-medium ${
            activeTab === 'incoming'
              ? 'text-blue-400 border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('incoming')}
        >
          <div className="flex items-center justify-center gap-1.5">
            <span>Entrantes</span>
            {incomingRequests.length > 0 && (
              <span
                className="inline-flex items-center justify-center bg-blue-500 text-white text-[10px] font-bold rounded-full h-4 min-w-4 px-1">
                {incomingRequests.length}
              </span>
            )}
          </div>
        </button>
        <button
          className={`flex-1 py-2 text-sm font-medium ${
            activeTab === 'outgoing'
              ? 'text-blue-400 border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('outgoing')}
        >
          <div className="flex items-center justify-center gap-1.5">
            <span>Enviadas</span>
            {outgoingRequests.length > 0 && (
              <span
                className="inline-flex items-center justify-center bg-blue-500 text-white text-[10px] font-bold rounded-full h-4 min-w-4 px-1">
                {outgoingRequests.length}
              </span>
            )}
          </div>
        </button>
      </div>

      {}
      <div className="overflow-y-auto custom-scrollbar">
        {activeTab === 'incoming' ? renderIncomingRequests() : renderOutgoingRequests()}
      </div>
    </div>
  );
};

export default FriendRequests;
