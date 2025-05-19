'use client';

import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import useAuthenticatedFetch from '../hooks/useAuthenticatedFetch';
import { useLolVersion } from '../context/LolVersionContext'

type Region = {
  descriptor: string;
  policy: string;
  apiName: string;
  name: string;
};

const REGIONS: Record<string, Region> = {
  NA: { name: 'NA', descriptor: 'North America', policy: 'AMERICAS', apiName: 'na1' },
  EUW: { name: 'EUW', descriptor: 'Europe West', policy: 'EUROPE', apiName: 'euw1' },
  EUNE: { name: 'EUNE', descriptor: 'Europe Nordic & East', policy: 'EUROPE', apiName: 'eun1' },
  KR: { name: 'KR', descriptor: 'Korea', policy: 'ASIA', apiName: 'kr' },
  BR: { name: 'BR', descriptor: 'Brazil', policy: 'AMERICAS', apiName: 'br1' },
  LAN: { name: 'LAN', descriptor: 'Latin America North', policy: 'AMERICAS', apiName: 'la1' },
  LAS: { name: 'LAS', descriptor: 'Latin America South', policy: 'AMERICAS', apiName: 'la2' },
};

const AccountLinker: React.FC = () => {
  const { userId } = useAuth();
  const fetcher = useAuthenticatedFetch();
  const [step, setStep] = useState<'form' | 'verification'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { version, loading: versionLoading } = useLolVersion();
  
  // Form state
  const [summonerName, setSummonerName] = useState('');
  const [tagline, setTagline] = useState('');
  const [region, setRegion] = useState<string>('EUW');
  
  // Verification state
  const [profileIconUrl, setProfileIconUrl] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleLinkAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summonerName || !tagline || !region) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetcher('http://localhost:8080/lol/accounts/link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summonerName,
          tagline,
          region: REGIONS[region].name
        }),
      });
      
      if (response.requiredIcon) {
        setProfileIconUrl(`https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${response.requiredIcon}.png`);
        setStep('verification');
      }
    } catch (err: any) {
      setError(err.message || 'Error al vincular la cuenta');
      console.error('Error linking account:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAccount = async () => {
    if (!userId) return;
    
    setIsVerifying(true);
    setError(null);
    
    try {
      const response = await fetcher('http://localhost:8080/lol/accounts/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.verified) {
        setVerificationStatus('success');
        // Optionally refresh accounts list or redirect
      } else {
        setVerificationStatus('error');
        setError('No se pudo verificar la cuenta. Asegúrate de haber cambiado el ícono.');
      }
    } catch (err: any) {
      setVerificationStatus('error');
      setError(err.message || 'Error al verificar la cuenta');
      console.error('Error verifying account:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  if (step === 'verification') {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Verifica tu cuenta</h2>
        
        <div className="mb-6 text-center">
          <p className="mb-4">Por favor, cambia tu ícono de invocador a:</p>
          <div className="flex flex-col items-center">
            <img 
              src={profileIconUrl} 
              alt="Ícono de verificación" 
              className="w-32 h-32 rounded-full border-2 border-blue-500 mb-4"
            />
            <p className="text-sm text-gray-600 mb-4">
              Cambia tu ícono en el cliente de League of Legends y luego haz clic en verificar.
              Puede tardar unos minutos en actualizarse.
            </p>
            
            {verificationStatus === 'success' ? (
              <div className="text-green-600 font-medium mb-4">
                ¡Cuenta verificada exitosamente!
              </div>
            ) : (
              <button
                onClick={handleVerifyAccount}
                disabled={isVerifying}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {isVerifying ? 'Verificando...' : 'Verificar cuenta'}
              </button>
            )}
            
            <button
              onClick={() => setStep('form')}
              className="mt-4 text-blue-500 hover:underline text-sm"
            >
              Volver atrás
            </button>
          </div>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Vincular cuenta de League of Legends</h2>
      
      <form onSubmit={handleLinkAccount} className="space-y-4">
        <div>
          <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
            Región
          </label>
          <select
            id="region"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            {Object.entries(REGIONS).map(([key, region]) => (
              <option key={key} value={key}>
                {key} - {region.descriptor}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="summonerName" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de invocador
          </label>
          <input
            type="text"
            id="summonerName"
            value={summonerName}
            onChange={(e) => setSummonerName(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ej: Faker"
            required
          />
        </div>
        
        <div>
          <label htmlFor="tagline" className="block text-sm font-medium text-gray-700 mb-1">
            Tagline (sin #)
          </label>
          <input
            type="text"
            id="tagline"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ej: EUW"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Tu tagline es lo que va después del # en tu nombre de invocador.
          </p>
        </div>
        
        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading || versionLoading}
            className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Procesando...' : 'Vincular cuenta'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccountLinker;
