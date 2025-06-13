"use client";

import React, {useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {LinkRequest, useLinkedAccounts} from '@/contexts/LinkedAccountsContext';
import {useToast} from '@/hooks/useToast';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Spinner} from '@/components/ui/spinner';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import ProfileIcon from '@/components/ddragon/ProfileIcon';
import {Region, REGIONS} from '@/constants/regions';

type LinkingStep = 'search' | 'verify' | 'success';

export default function LinkingPage() {
  const router = useRouter();
  const {linkAccount, verifyAccount, isLoading: contextLoading} = useLinkedAccounts();
  const {error: showError} = useToast();

  const [step, setStep] = useState<LinkingStep>('search');
  const [region, setRegion] = useState<Region>('EUW');
  const [summonerName, setSummonerName] = useState<string>('');
  const [tagline, setTagline] = useState<string>('');
  const [requiredIcon, setRequiredIcon] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleLinkRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!summonerName.trim()) {
      showError('Error', 'Debes introducir un nombre de invocador');
      return;
    }

    if (!tagline.trim()) {
      showError('Error', 'Debes introducir un tagline');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const normalizedTagline = tagline.startsWith('#') ? tagline.substring(1) : tagline;
      const request: LinkRequest = {
        summonerName: summonerName.trim(),
        tagline: normalizedTagline.trim(),
        region
      };

      const response = await linkAccount(request);

      if (response) {
        setRequiredIcon(response.requiredIcon);
        setStep('verify');
      } else {
        setError('No se pudo iniciar el proceso de vinculación. Verifica los datos e inténtalo de nuevo.');
      }
    } catch (err) {
      console.error("Error al iniciar vinculación:", err);
      setError('Error de conexión. Por favor, inténtalo de nuevo más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!requiredIcon) return;

    setIsLoading(true);
    setError(null);

    try {
      const verified = await verifyAccount();

      if (verified) {
        setStep('success');
      } else {
        setError('No se pudo verificar la cuenta. Asegúrate de tener el icono correcto.');
      }
    } catch (err) {
      console.error("Error al verificar cuenta:", err);
      setError('Error de conexión. Por favor, inténtalo de nuevo más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToAccounts = () => {
    router.push('/linked-accounts');
  };

  const renderSearchStep = () => (
    <Card className="w-full max-w-md bg-[#1e293b]/70 border-blue-900/40">
      <CardHeader>
        <CardTitle className="text-white">Vincular cuenta de LoL</CardTitle>
        <CardDescription className="text-gray-300">
          Introduce los datos de tu cuenta de League of Legends
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLinkRequest} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200">Región</label>
            <Select
              value={region}
              onValueChange={(value) => setRegion(value as Region)}
            >
              <SelectTrigger className="bg-[#0f172a] border-blue-900/40 text-white">
                <SelectValue placeholder="Selecciona una región"/>
              </SelectTrigger>
              <SelectContent className="bg-[#0f172a] border-blue-900/40 text-white">
                {REGIONS.map((regionItem) => (
                  <SelectItem key={regionItem.value} value={regionItem.value}>
                    {regionItem.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200">Nombre de invocador</label>
            <Input
              value={summonerName}
              onChange={(e) => setSummonerName(e.target.value)}
              placeholder="Nombre de invocador"
              className="bg-[#0f172a] border-blue-900/40 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200">Tagline</label>
            <Input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="#0000"
              className="bg-[#0f172a] border-blue-900/40 text-white"
              required
            />
            <p className="text-xs text-gray-400">
              El tagline es el código que aparece después del # en tu nombre de Riot (ej: Nombre#0000)
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-900/20 border border-red-500/50 rounded-md text-red-300 text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isLoading || contextLoading}
          >
            {(isLoading || contextLoading) ? (
              <>
                <Spinner size="sm" className="mr-2"/>
                Iniciando vinculación...
              </>
            ) : (
              'Vincular cuenta'
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between border-t border-blue-900/40 pt-4">
        <Link href="/linked-accounts" className="text-sm text-blue-400 hover:underline">
          Volver a mis cuentas
        </Link>
      </CardFooter>
    </Card>
  );

  const renderVerifyStep = () => {
    if (!requiredIcon) return null;

    return (
      <Card className="w-full max-w-md bg-[#1e293b]/70 border-blue-900/40">
        <CardHeader>
          <CardTitle className="text-white">Verificar cuenta</CardTitle>
          <CardDescription className="text-gray-300">
            Sigue estos pasos para verificar que eres el propietario de la cuenta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Cambia tu icono de perfil</h3>
            <div className="flex flex-col items-center">
              <div className="mb-2">
                <ProfileIcon
                  iconId={requiredIcon}
                  size={96}
                  withBorder={true}
                  className="border-blue-700 border-2"
                  alt="Icono requerido para verificación"
                />
              </div>
              <p className="text-sm text-center text-gray-300">
                Cambia tu icono de perfil a este en el cliente de League of Legends
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-md font-medium text-white">Pasos:</h4>
              <ol className="text-sm text-gray-300 space-y-2 list-decimal pl-5">
                <li>Abre el cliente de League of Legends</li>
                <li>Ve a tu perfil (icono en la esquina superior derecha)</li>
                <li>Haz clic en el icono de perfil actual para cambiarlo</li>
                <li>Busca y selecciona el icono mostrado arriba</li>
                <li>Guarda los cambios</li>
                <li>Espera unos minutos a que se actualice</li>
                <li>Haz clic en &quot;Verificar&quot; abajo</li>
              </ol>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-900/20 border border-red-500/50 rounded-md text-red-300 text-sm">
              {error}
            </div>
          )}

          <Button
            onClick={handleVerify}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isLoading || contextLoading}
          >
            {(isLoading || contextLoading) ? (
              <>
                <Spinner size="sm" className="mr-2"/>
                Verificando...
              </>
            ) : (
              'Verificar'
            )}
          </Button>
        </CardContent>
        <CardFooter className="flex justify-between border-t border-blue-900/40 pt-4">
          <Button
            variant="ghost"
            onClick={() => {
              setStep('search');
              setRequiredIcon(null);
              setError(null);
            }}
            className="text-gray-300 hover:text-white hover:bg-blue-900/20"
          >
            Volver
          </Button>
        </CardFooter>
      </Card>
    );
  };

  const renderSuccessStep = () => (
    <Card className="w-full max-w-md bg-[#1e293b]/70 border-blue-900/40">
      <CardHeader>
        <CardTitle className="text-white">¡Cuenta vinculada!</CardTitle>
        <CardDescription className="text-gray-300">
          Tu cuenta ha sido verificada y vinculada correctamente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center justify-center p-6">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">¡Verificación completada!</h3>
          <p className="text-center text-gray-300">
            Tu cuenta de League of Legends ha sido vinculada correctamente a tu perfil.
          </p>
        </div>

        <Button
          onClick={handleGoToAccounts}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          Ver mis cuentas vinculadas
        </Button>
      </CardContent>
    </Card>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 'search':
        return renderSearchStep();
      case 'verify':
        return renderVerifyStep();
      case 'success':
        return renderSuccessStep();
      default:
        return renderSearchStep();
    }
  };

  return (
    <div
      className="w-full min-h-full flex flex-col items-center justify-center py-8 px-4 bg-gradient-to-b from-[#0f172a] to-[#1e293b]">
      {renderCurrentStep()}
    </div>
  );
}
