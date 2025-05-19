'use client';

import { useState } from 'react';
import Chat from "@/components/Chat";
import FriendManager from "@/components/FriendManager";

export default function Dashboard() {
  const [friends, setFriends] = useState<string[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);

  // Esta función se pasará al FriendManager para actualizar la lista de amigos
  const handleFriendsUpdate = (updatedFriends: string[]) => {
    setFriends(updatedFriends);
    // Si el amigo seleccionado ya no está en la lista, lo deseleccionamos
    if (selectedFriend && !updatedFriends.includes(selectedFriend)) {
      setSelectedFriend(updatedFriends.length > 0 ? updatedFriends[0] : null);
    } else if (!selectedFriend && updatedFriends.length > 0) {
      // Si no hay amigo seleccionado pero hay amigos, seleccionar el primero
      setSelectedFriend(updatedFriends[0]);
    }
  };

  return (
    <main className="min-h-screen p-4 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h1 className="text-2xl font-bold mb-6">Gestión de Amigos</h1>
          <FriendManager onFriendsUpdate={handleFriendsUpdate} />
        </div>
        <div>
          <h1 className="text-2xl font-bold mb-6">Chat con Amigos</h1>
          <Chat 
            recipientId={selectedFriend}
            friends={friends}
            onSelectRecipient={setSelectedFriend}
            showFriendList={true}
          />
        </div>
      </div>
    </main>
  );
}
