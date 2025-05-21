"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/clerk-react";
import { useUserContext } from "../../context/UserContext";
import { useApi } from "../../hooks/useApi";
import type { Region } from "../../types";
import { Check, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";

// Lista de regiones
const regionsList: Region[] = [
  { name: "EUW", descriptor: "Europa Oeste", policy: "", apiName: "EUW1" },
  { name: "EUNE", descriptor: "Europa Nórdica y Este", policy: "", apiName: "EUN1" },
  { name: "NA", descriptor: "Norteamérica", policy: "", apiName: "NA1" },
  { name: "LAN", descriptor: "Latinoamérica Norte", policy: "", apiName: "LA1" },
  { name: "LAS", descriptor: "Latinoamérica Sur", policy: "", apiName: "LA2" },
  { name: "KR", descriptor: "Corea", policy: "", apiName: "KR" },
  { name: "JP", descriptor: "Japón", policy: "", apiName: "JP1" },
  { name: "BR", descriptor: "Brasil", policy: "", apiName: "BR1" },
  { name: "TR", descriptor: "Turquía", policy: "", apiName: "TR1" },
  { name: "RU", descriptor: "Rusia", policy: "", apiName: "RU" },
  { name: "OCE", descriptor: "Oceanía", policy: "", apiName: "OC1" },
];

const AccountLinker = () => {
  const { userId } = useAuth();
  const { lolVersion } = useUserContext();
  const { callApi } = useApi();
  const [step, setStep] = useState<'form' | 'verification'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    const res = await callApi(
      "/lol/accounts/link",
      "POST",
      {
        summonerName,
        tagline,
        region: region,
      }
    );

    if (res.ok && res.data && res.data.requiredIcon && lolVersion) {
      setProfileIconUrl(`https://ddragon.leagueoflegends.com/cdn/${lolVersion}/img/profileicon/${res.data.requiredIcon}.png`);
      setStep('verification');
    } else {
      setError(typeof res.error === 'string' ? res.error : 'Error al vincular la cuenta');
      console.error('Error linking account:', res.error);
    }
    
    setLoading(false);
  };

  const handleVerifyAccount = async () => {
    if (!userId) return;

    setIsVerifying(true);
    setError(null);

    const res = await callApi(
      "/lol/accounts/verify",
      "POST"
    );

    if (res.ok && res.data && res.data.verified) {
      setVerificationStatus('success');
      // Opcional: redirigir o actualizar lista de cuentas
    } else {
      setVerificationStatus('error');
      setError(typeof res.error === 'string' ? res.error : 'No se pudo verificar la cuenta. Asegúrate de haber cambiado el ícono');
      console.error('Error verifying account:', res.error);
    }
    
    setIsVerifying(false);
  };

  return (
    <div className="relative w-full h-full flex items-start justify-center">
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none bg-[#232b3a]" />
      <div className="relative z-10 w-full flex flex-col items-center pt-8 pb-8 px-2 md:px-0">
        <div className="w-full max-w-lg flex flex-col gap-8">
          {step === 'form' ? (
            <form onSubmit={handleLinkAccount} className="flex flex-col gap-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-3xl font-bold text-white">Vincula tu cuenta de League of Legends</h2>
                <Link
                  href="/linked-accounts"
                  className="text-blue-400 text-sm hover:underline font-medium"
                >
                  Volver a cuentas vinculadas
                </Link>
              </div>
              <p className="text-blue-100 text-base">Conecta tu perfil para acceder a todas las funciones</p>
              {/* Región */}
              <div className="flex flex-col gap-2">
                <label htmlFor="region" className="text-gray-200 font-medium">Región</label>
                <select
                  id="region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full p-3 bg-[#232b3a] border-b-2 border-blue-700 text-white focus:outline-none focus:border-blue-400 transition-colors"
                  required
                >
                  {regionsList.map((region) => (
                    <option key={region.name} value={region.name}>
                      {region.name} - {region.descriptor}
                    </option>
                  ))}
                </select>
              </div>
              {/* Invocador */}
              <div className="flex flex-col gap-2">
                <label htmlFor="summonerName" className="text-gray-200 font-medium">Nombre de invocador</label>
                <input
                  type="text"
                  id="summonerName"
                  value={summonerName}
                  onChange={(e) => setSummonerName(e.target.value)}
                  className="w-full p-3 bg-[#232b3a] border-b-2 border-blue-700 text-white focus:outline-none focus:border-blue-400 transition-colors"
                  placeholder="Ej: Faker"
                  required
                />
              </div>
              {/* Tagline */}
              <div className="flex flex-col gap-2">
                <label htmlFor="tagline" className="text-gray-200 font-medium">Tagline <span className="text-gray-400">(sin #)</span></label>
                <input
                  type="text"
                  id="tagline"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full p-3 bg-[#232b3a] border-b-2 border-blue-700 text-white focus:outline-none focus:border-blue-400 transition-colors"
                  placeholder="Ej: EUW"
                  required
                />
                <p className="mt-1 text-xs text-gray-400">El tagline aparece después del # en tu nombre de invocador (Ej: Faker#EUW)</p>
              </div>
              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 text-red-300">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
              {/* Botón */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 mt-2 bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/50 text-white font-medium rounded flex items-center justify-center transition-colors disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  "Vincular cuenta"
                )}
              </button>
            </form>
          ) : (
            <div className="flex flex-col items-center gap-8">
              <div className="relative mb-6">
                <img
                  src={profileIconUrl}
                  alt="Ícono de verificación"
                  className="w-32 h-32 rounded-full border-4 border-blue-500 shadow-lg"
                />
                {verificationStatus === 'success' && (
                  <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
              {/* Instrucciones */}
              <div className="text-center flex flex-col gap-3">
                <h3 className="font-medium text-lg text-white">Cambia tu ícono de invocador</h3>
                <ol className="text-sm text-blue-100 list-decimal list-inside space-y-1">
                  <li>Abre el cliente de League of Legends</li>
                  <li>Ve a tu perfil y haz clic en el ícono actual</li>
                  <li>Busca y selecciona el ícono mostrado arriba</li>
                  <li>Guarda los cambios y vuelve aquí para verificar</li>
                </ol>
                <p className="text-sm text-blue-200">
                  Los cambios pueden tardar unos minutos en reflejarse en el sistema.
                </p>
              </div>
              {/* Acciones */}
              <div className="w-full space-y-3">
                {verificationStatus === 'success' ? (
                  <div className="flex items-center gap-2 text-green-300">
                    <Check className="w-5 h-5" />
                    <span className="font-medium">¡Cuenta verificada exitosamente!</span>
                  </div>
                ) : (
                  <button
                    onClick={handleVerifyAccount}
                    disabled={isVerifying}
                    className="w-full py-3 px-4 mt-2 bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/50 text-white font-medium rounded flex items-center justify-center transition-colors disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Verificando...
                      </>
                    ) : (
                      "Verificar cuenta"
                    )}
                  </button>
                )}
                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 text-red-300">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}
                {/* Volver */}
                <button
                  onClick={() => setStep('form')}
                  className="w-full py-2 flex items-center justify-center text-gray-200 font-medium gap-2 hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver al formulario
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountLinker;