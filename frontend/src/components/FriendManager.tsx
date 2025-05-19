'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import useAuthenticatedFetch from '../hooks/useAuthenticatedFetch';

interface FriendRequest {
  id: string;
  requesterId: string;
  recipientId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

interface FriendManagerProps {
  onFriendsUpdate?: (friends: string[]) => void;
}

export default function FriendManager({ onFriendsUpdate }: FriendManagerProps) {
  const { userId } = useAuth();
  const fetcher = useAuthenticatedFetch();
  const [friendId, setFriendId] = useState('');
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [incoming, outgoing, friendsList] = await Promise.all([
        fetcher('http://localhost:8080/api/friends/requests/incoming'),
        fetcher('http://localhost:8080/api/friends/requests/outgoing'),
        fetcher('http://localhost:8080/api/friends')
      ]);
      setIncomingRequests(incoming || []);
      setOutgoingRequests(outgoing || []);
      // Aseguramos que friendsList sea un array
      const updatedFriends = Array.isArray(friendsList) ? friendsList : [];
      setFriends(updatedFriends);
      // Notificar al componente padre sobre la actualización de la lista de amigos
      if (onFriendsUpdate) {
        onFriendsUpdate(updatedFriends);
      }
      console.log('Incoming:', incoming, 'Outgoing:', outgoing, 'Friends:', updatedFriends);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Error loading data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendId.trim()) return;
    
    try {
      setIsLoading(true);
      await fetcher(`http://localhost:8080/api/friends/requests/${friendId}`, {
        method: 'POST'
      });
      setFriendId('');
      await loadData();
      setMessage('Friend request sent!');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to send friend request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRespondRequest = async (requesterId: string, accept: boolean) => {
    try {
      setIsLoading(true);
      await fetcher(`http://localhost:8080/api/friends/requests/${requesterId}/respond?accept=${accept}`, {
        method: 'POST'
      });
      await loadData();
      setMessage(`Request ${accept ? 'accepted' : 'rejected'}!`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to process request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFriend = async (friendId: string) => {
    if (!window.confirm(`Are you sure you want to remove this friend?`)) return;
    
    try {
      setIsLoading(true);
      const response = await fetcher(`http://localhost:8080/api/friends/delete/${friendId}`, {
        method: 'DELETE'
      });
      
      // No necesitamos hacer nada con la respuesta ya que puede ser vacía
      await loadData();
      setMessage('Friend removed successfully');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to remove friend');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Friend Manager</h1>
      <div className="mb-4 p-2 bg-gray-100 rounded text-sm">
        <p>Your User ID: <span className="font-mono">{userId}</span></p>
      </div>
      
      {message && (
        <div className="mb-4 p-2 bg-blue-100 text-blue-800 rounded">
          {message}
        </div>
      )}

      {/* Add Friend */}
      <div className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-4">Add Friend</h2>
        <form onSubmit={handleSendRequest} className="flex gap-2">
          <input
            type="text"
            value={friendId}
            onChange={(e) => setFriendId(e.target.value)}
            placeholder="Enter friend's ID"
            className="flex-1 p-2 border rounded"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            disabled={isLoading || !friendId.trim()}
          >
            Send Request
          </button>
        </form>
      </div>

      {/* Incoming Requests */}
      <div className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-4">Incoming Requests</h2>
        {incomingRequests.length === 0 ? (
          <p className="text-gray-500">No incoming friend requests</p>
        ) : (
          <ul className="space-y-2">
            {incomingRequests.map((request) => (
              <li key={request.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span>{request.requesterId}</span>
                <div className="space-x-2">
                  <button
                    onClick={() => handleRespondRequest(request.requesterId, true)}
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                    disabled={isLoading}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRespondRequest(request.requesterId, false)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    disabled={isLoading}
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Outgoing Requests */}
      <div className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-4">Outgoing Requests</h2>
        {outgoingRequests.length === 0 ? (
          <p className="text-gray-500">No outgoing friend requests</p>
        ) : (
          <ul className="space-y-2">
            {outgoingRequests.map((request) => (
              <li key={request.id} className="p-2 bg-gray-50 rounded">
                {request.recipientId} - <span className="text-yellow-600">Pending</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Friends List */}
      <div className="p-4 border rounded">
        <h2 className="text-xl font-semibold mb-4">My Friends</h2>
        {friends.length === 0 ? (
          <p className="text-gray-500">You don't have any friends yet</p>
        ) : (
          <ul className="space-y-2">
            {friends.map((friendId) => (
              <li key={friendId} className="flex justify-between items-center p-2 bg-green-50 rounded">
                <span>{friendId}</span>
                <button
                  onClick={() => handleDeleteFriend(friendId)}
                  className="px-2 py-1 bg-red-100 text-red-600 rounded text-sm hover:bg-red-200"
                  disabled={isLoading}
                  title="Remove friend"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
