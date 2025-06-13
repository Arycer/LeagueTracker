import React, {useContext, useEffect, useState} from 'react';
import {useChatContext} from '@/contexts/ChatContext';
import {FriendsContext} from '@/contexts/FriendsContext';
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Input} from "@/components/ui/input";
import {Search} from 'lucide-react';

interface ChatListProps {
  onSelectChat: (username: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({onSelectChat}) => {
  const friendsContext = useContext(FriendsContext);
  const {friends, friendsStatus} = friendsContext || {friends: [], friendsStatus: {}};
  const {activeChat, messages, setActiveChat, unreadMessages} = useChatContext();
  const [searchTerm, setSearchTerm] = useState('');

  
  useEffect(() => {
    if (activeChat) {
      
      onSelectChat(activeChat);
    }
  }, [activeChat, onSelectChat]);

  
  const onlineFriends = friends.filter((friend: string) => {
    const status = friendsStatus as Record<string, boolean>;
    return status[friend];
  });

  
  const filteredFriends = friends.filter((friend: string) =>
    friend.toLowerCase().includes(searchTerm.toLowerCase())
  );

  
  const sortedFriends = [...filteredFriends].sort((a: string, b: string) => {
    
    const aUnreadCount = unreadMessages[a] || 0;
    const bUnreadCount = unreadMessages[b] || 0;

    if (aUnreadCount > 0 && bUnreadCount === 0) return -1;
    if (aUnreadCount === 0 && bUnreadCount > 0) return 1;

    
    if (aUnreadCount > 0 && bUnreadCount > 0) {
      return bUnreadCount - aUnreadCount;
    }

    
    const aHasMessages = Boolean(messages[a]?.length);
    const bHasMessages = Boolean(messages[b]?.length);

    if (aHasMessages && !bHasMessages) return -1;
    if (!aHasMessages && bHasMessages) return 1;

    
    const aIsOnline = onlineFriends.includes(a);
    const bIsOnline = onlineFriends.includes(b);

    if (aIsOnline && !bIsOnline) return -1;
    if (!aIsOnline && bIsOnline) return 1;

    
    return a.localeCompare(b);
  });

  return (
    <div className="w-full h-full flex flex-col bg-[#0f172a]">
      {}
      <div className="py-4 px-4 border-b border-[#1e293b] bg-[#0f172a]/80">
        <h2 className="text-lg font-semibold text-white mb-3 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-400" viewBox="0 0 20 20"
               fill="currentColor">
            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
            <path
              d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"/>
          </svg>
          Mensajes
        </h2>
        <div className="relative">
          <Input
            placeholder="Buscar chat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 py-2 bg-[#1e293b]/50 border-[#1e293b] text-white rounded-full text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400"/>
        </div>
      </div>

      {}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {sortedFriends.length === 0 ? (
          <div className="p-4 text-center">
            <div className="bg-[#1e293b]/30 rounded-lg p-4">
              <p className="text-gray-300 text-sm mb-1">No hay conversaciones</p>
              <p className="text-gray-400 text-xs">Tus amigos aparecerán aquí</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[#1e293b]/50">
            {sortedFriends.map((friend: string) => {
              const isOnline = onlineFriends.includes(friend);
              const isActive = activeChat === friend;
              const lastMessage = messages[friend]?.slice(-1)[0];

              return (
                <div
                  key={friend}
                  className={`w-full px-3 py-3 cursor-pointer ${isActive
                    ? 'bg-blue-600/20 border-l-4 border-l-blue-500'
                    : 'hover:bg-[#1e293b]/50 border-l-4 border-l-transparent hover:border-l-blue-400/50'
                  }`}
                  onClick={() => {
                    
                    onSelectChat(friend);
                    setActiveChat(friend);
                  }}
                >
                  <div className="flex items-center w-full">
                    <div className="relative flex-shrink-0">
                      <Avatar className="h-10 w-10 mr-3 border border-[#1e293b]">
                        <AvatarImage src={`https://avatar.vercel.sh/${friend}`}/>
                        <AvatarFallback
                          className="bg-[#1e293b] text-blue-400">{friend.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      {isOnline && (
                        <span
                          className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-[#0f172a]"></span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex justify-between items-center w-full">
                        <div className="flex items-center">
                                                    <span
                                                      className={`font-medium truncate ${isActive ? 'text-white' : 'text-gray-300'}`}>{friend}</span>
                          {}
                          {unreadMessages[friend] > 0 && (
                            <span
                              className="ml-2 bg-blue-500 text-white text-xs font-medium rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">
                              {unreadMessages[friend]}
                            </span>
                          )}
                        </div>
                        {lastMessage && (
                          <span className="text-xs text-gray-400 flex-shrink-0 ml-1">
                            {new Date(lastMessage.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        )}
                      </div>
                      {lastMessage ? (
                        <p className="text-xs text-gray-400 truncate mt-1 line-clamp-1">
                          {lastMessage.content}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500 italic truncate mt-1">
                          No hay mensajes aún
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
