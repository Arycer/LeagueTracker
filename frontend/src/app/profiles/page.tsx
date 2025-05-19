"use client"
// Página de búsqueda de perfil de jugador para LeagueTracker
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const REGIONS = [
  { code: 'EUW', label: 'EU West' },
  { code: 'EUNE', label: 'EU Nordic & East' },
  { code: 'NA', label: 'North America' },
  { code: 'KR', label: 'Korea' },
  { code: 'BR', label: 'Brazil' },
  { code: 'JP', label: 'Japan' },
  { code: 'LAN', label: 'Latin America North' },
  { code: 'LAS', label: 'Latin America South' },
  { code: 'OCE', label: 'Oceania' },
  { code: 'TR', label: 'Turkey' },
  { code: 'RU', label: 'Russia' },
];

export default function ProfileSearchPage() {
  const [region, setRegion] = useState('EUW');
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !tagline) return;
    // Navega a la página de perfil con tagline en el path
    router.push(`/profiles/${region}/${encodeURIComponent(name)}/${encodeURIComponent(tagline)}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl mb-6 font-bold">Buscar perfil de League of Legends</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="region">
            Región
          </label>
          <select
            id="region"
            value={region}
            onChange={e => setRegion(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            {REGIONS.map(r => (
              <option key={r.code} value={r.code}>{r.label}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            Nombre de invocador
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tagline">
            Tagline
          </label>
          <input
            id="tagline"
            type="text"
            value={tagline}
            onChange={e => setTagline(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Buscar
          </button>
        </div>
      </form>
    </div>
  );
}
