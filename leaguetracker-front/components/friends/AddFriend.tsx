"use client";
import React, { useState } from 'react';
import { useFriends } from '@/contexts/FriendsContext';
import { useToast } from '@/hooks/useToast';

/**
 * Componente para añadir amigos mediante nombre de usuario
 */
const AddFriend: React.FC = () => {
  const { sendFriendRequest } = useFriends();
  const { error: showError } = useToast();
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar el nombre de usuario
    if (!username.trim()) {
      showError('Error', 'Debes introducir un nombre de usuario');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await sendFriendRequest(username.trim());
      setUsername(''); // Limpiar el campo después de enviar
    } catch (err) {
      console.error('Error al enviar solicitud:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="p-4">
      <h3 className="text-base font-medium text-white mb-2">Añadir amigo</h3>
      <p className="text-sm text-gray-400 mb-4">
        Envía una solicitud de amistad a otro usuario introduciendo su nombre de usuario.
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
            Nombre de usuario
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 bg-[#0f172a] border border-[#1e293b] text-white rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Introduce un nombre de usuario"
            disabled={isSubmitting}
          />
        </div>
        
        <button
          type="submit"
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting || !username.trim()}
        >
          {isSubmitting ? 'Enviando...' : 'Enviar solicitud'}
        </button>
      </form>
      
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-300 mb-2">¿Cómo funciona?</h4>
        <ol className="text-sm text-gray-400 space-y-2 list-decimal pl-5">
          <li>Introduce el nombre de usuario exacto de la persona que quieres añadir.</li>
          <li>Envía la solicitud y espera a que la otra persona la acepte.</li>
          <li>Una vez aceptada, podrás ver su estado online y jugar juntos.</li>
        </ol>
      </div>
    </div>
  );
};

export default AddFriend;
