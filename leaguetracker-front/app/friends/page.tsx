"use client";
import React, {useState} from 'react';
import {useFriends} from '@/contexts/FriendsContext';
import {useUserContext} from '@/contexts/UserContext';
import {useToast} from '@/hooks/useToast';
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {MessageSquare, Search, UserCheck, UserMinus, UserPlus} from "lucide-react";
import {useRouter} from "next/navigation";

export default function FriendsPage() {
  const router = useRouter();
  const { user, isLoading: isLoadingUser } = useUserContext();
  const { 
    friends, 
    friendsStatus, 
    incomingRequests, 
    outgoingRequests,
    isLoading,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend
  } = useFriends();
  const { success, error, info } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [newFriendUsername, setNewFriendUsername] = useState('');
  const [activeTab, setActiveTab] = useState('friends');
  
  // Filtrar amigos por término de búsqueda
  const filteredFriends = friends.filter(friend => 
    friend.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Manejar envío de solicitud de amistad
  const handleSendRequest = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newFriendUsername.trim()) {
      error('Error', 'Debes introducir un nombre de usuario');
      return;
    }
    
    sendFriendRequest(newFriendUsername.trim())
      .then(() => {
        success('Solicitud enviada', `Se ha enviado una solicitud de amistad a ${newFriendUsername}`);
        setNewFriendUsername('');
      })
      .catch((err: Error) => {
        error('Error', err.message || 'No se pudo enviar la solicitud');
      });
  };
  
  // Iniciar chat con un amigo
  const startChat = (username: string) => {
    router.push(`/chat?user=${username}`);
  };
  

  
  // Si el usuario no ha iniciado sesión, mostrar mensaje
  if (!user.isSignedIn) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <Card className="bg-[#0f172a] border-[#1e293b]">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white">Inicia sesión para gestionar tus amigos</CardTitle>
            <CardDescription className="text-gray-400">
              Debes iniciar sesión para acceder a esta funcionalidad.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Amigos</h1>
            <p className="text-gray-400 text-sm mt-1">Gestiona tus amigos y solicitudes</p>
          </div>
          
          <div className="w-full md:w-auto flex flex-col md:flex-row gap-3">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
              <Input 
                placeholder="Buscar amigos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 py-2 bg-[#1e293b]/50 border-[#1e293b] text-white rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full"
              />
            </div>
            
            <form onSubmit={handleSendRequest} className="flex gap-2 w-full md:w-auto">
              <Input
                placeholder="Añadir amigo"
                value={newFriendUsername}
                onChange={(e) => setNewFriendUsername(e.target.value)}
                className="py-2 bg-[#1e293b]/50 border-[#1e293b] text-white rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 flex-1"
              />
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Añadir
              </Button>
            </form>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Lista de amigos */}
          <Card className="md:col-span-2 bg-[#0f172a] border-[#1e293b]">
            <CardHeader className="pb-3">
              <div className="flex items-center">
                <UserCheck className="h-5 w-5 mr-2 text-blue-400" />
                <CardTitle className="text-lg font-semibold text-white">Amigos ({filteredFriends.length})</CardTitle>
              </div>
              <CardDescription className="text-gray-400">
                {filteredFriends.length === 0 ? "No tienes amigos en tu lista" : "Lista de tus amigos"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : filteredFriends.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  {searchTerm ? "No se encontraron amigos con ese nombre" : "Aún no tienes amigos en tu lista"}
                </div>
              ) : (
                <div className="divide-y divide-[#1e293b]/50">
                  {filteredFriends.map((friend) => (
                    <div key={friend} className="py-3 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="relative">
                          <Avatar className="h-10 w-10 mr-3 border border-[#1e293b]">
                            <AvatarImage src={`https://avatar.vercel.sh/${friend}`} />
                            <AvatarFallback className="bg-[#1e293b] text-blue-400">{friend.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          {friendsStatus[friend] && (
                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-[#0f172a]"></span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white">{friend}</p>
                          <p className="text-xs text-gray-400">
                            {friendsStatus[friend] ? "En línea" : "Desconectado"}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                          onClick={() => startChat(friend)}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                          onClick={() => {
                            removeFriend(friend)
                              .then(() => success('Amigo eliminado', `${friend} ha sido eliminado de tu lista de amigos`))
                              .catch((err: Error) => error('Error', err.message || 'No se pudo eliminar al amigo'));
                          }}
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Solicitudes */}
          <Card className="bg-[#0f172a] border-[#1e293b]">
            <CardHeader className="pb-3">
              <div className="flex items-center">
                <UserPlus className="h-5 w-5 mr-2 text-blue-400" />
                <CardTitle className="text-lg font-semibold text-white">Solicitudes</CardTitle>
              </div>
              <CardDescription className="text-gray-400">
                Gestiona tus solicitudes de amistad
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-white mb-2 flex items-center">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-500/20 text-blue-400 text-xs mr-2">
                      {incomingRequests.length}
                    </span>
                    Solicitudes recibidas
                  </h3>
                  
                  {incomingRequests.length === 0 ? (
                    <p className="text-sm text-gray-400 py-2">No tienes solicitudes pendientes</p>
                  ) : (
                    <div className="space-y-2">
                      {incomingRequests.map((request) => (
                        <Card key={`${request.requesterUsername}-${request.createdAt}`} className="bg-[#1e293b]/30 border-[#1e293b]">
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <Avatar className="h-8 w-8 mr-2 border border-[#1e293b]">
                                  <AvatarImage src={`https://avatar.vercel.sh/${request.requesterUsername}`} />
                                  <AvatarFallback className="bg-[#1e293b] text-blue-400">
                                    {request.requesterUsername.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-white">{request.requesterUsername}</span>
                              </div>
                              <span className="text-xs text-gray-400">
                                {new Date(request.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex space-x-2">
                              <Button 
                                className="flex-1 h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={() => {
                                  acceptFriendRequest(request.requesterUsername)
                                    .then(() => success('Solicitud aceptada', `Has aceptado la solicitud de amistad de ${request.requesterUsername}`))
                                    .catch((err: Error) => error('Error', err.message || 'No se pudo aceptar la solicitud'));
                                }}
                              >
                                Aceptar
                              </Button>
                              <Button 
                                variant="outline" 
                                className="flex-1 h-8 text-xs border-[#1e293b] bg-transparent text-gray-400 hover:bg-[#1e293b] hover:text-white"
                                onClick={() => {
                                  rejectFriendRequest(request.requesterUsername)
                                    .then(() => info('Solicitud rechazada', `Has rechazado la solicitud de amistad de ${request.requesterUsername}`))
                                    .catch((err: Error) => error('Error', err.message || 'No se pudo rechazar la solicitud'));
                                }}
                              >
                                Rechazar
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="pt-2">
                  <h3 className="text-sm font-medium text-white mb-2 flex items-center">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-500/20 text-blue-400 text-xs mr-2">
                      {outgoingRequests.length}
                    </span>
                    Solicitudes enviadas
                  </h3>
                  
                  {outgoingRequests.length === 0 ? (
                    <p className="text-sm text-gray-400 py-2">No has enviado solicitudes</p>
                  ) : (
                    <div className="space-y-2">
                      {outgoingRequests.map((request) => (
                        <div 
                          key={`${request.recipientUsername}-${request.createdAt}`} 
                          className="flex items-center justify-between p-2 bg-[#1e293b]/30 rounded-md"
                        >
                          <div className="flex items-center">
                            <Avatar className="h-6 w-6 mr-2 border border-[#1e293b]">
                              <AvatarImage src={`https://avatar.vercel.sh/${request.recipientUsername}`} />
                              <AvatarFallback className="bg-[#1e293b] text-blue-400 text-xs">
                                {request.recipientUsername.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-white">{request.recipientUsername}</span>
                          </div>
                          <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-md">
                            Pendiente
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
