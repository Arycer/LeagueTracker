'use client';

import {useEffect, useState} from 'react';
import {useAuth, useUser} from '@clerk/clerk-react';
import useAuthenticatedFetch from '../hooks/useAuthenticatedFetch';

interface FriendRequest {
    id: string;
    requesterUsername: string;
    recipientUsername: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    createdAt: string;
}

interface FriendManagerProps {
    onFriendsUpdate?: (friends: string[]) => void;
}

export default function FriendManager({onFriendsUpdate}: FriendManagerProps) {
    const {userId} = useAuth();
    const {user} = useUser();
    const fetcher = useAuthenticatedFetch();
    const [friendUsername, setFriendUsername] = useState('');
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
        if (!friendUsername.trim()) return;

        try {
            setIsLoading(true);
            await fetcher(`http://localhost:8080/api/friends/requests/${friendUsername}`, {
                method: 'POST'
            });
            setFriendUsername('');
            await loadData();
            setMessage('Friend request sent!');
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Failed to send friend request');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRespondRequest = async (requesterUsername: string, accept: boolean) => {
        try {
            setIsLoading(true);
            await fetcher(`http://localhost:8080/api/friends/requests/${requesterUsername}/respond?accept=${accept}`, {
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

    const handleDeleteFriend = async (friendUsername: string) => {
        if (!window.confirm(`Are you sure you want to remove this friend?`)) return;

        try {
            setIsLoading(true);
            const response = await fetcher(`http://localhost:8080/api/friends/delete/${friendUsername}`, {
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
                <p>Your Username: <span className="font-mono">{user?.username}</span></p>
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
                        value={friendUsername}
                        onChange={(e) => setFriendUsername(e.target.value)}
                        placeholder="Enter friend's username"
                        className="flex-1 p-2 border rounded"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                        disabled={isLoading || !friendUsername.trim()}
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
                                <span>{request.requesterUsername}</span>
                                <div className="space-x-2">
                                    <button
                                        onClick={() => handleRespondRequest(request.requesterUsername, true)}
                                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                                        disabled={isLoading}
                                    >
                                        Accept
                                    </button>
                                    <button
                                        onClick={() => handleRespondRequest(request.requesterUsername, false)}
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
                                {request.recipientUsername} - <span className="text-yellow-600">Pending</span>
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
                        {friends.map((friendUsername, idx) => (
                            <li key={friendUsername + '-' + idx}
                                className="flex justify-between items-center p-2 bg-green-50 rounded">
                                <span>{friendUsername}</span>
                                <button
                                    onClick={() => handleDeleteFriend(friendUsername)}
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
