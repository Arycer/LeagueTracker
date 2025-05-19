'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import useAuthenticatedFetch from '../hooks/useAuthenticatedFetch';

type LolVersionContextType = {
  version: string;
  loading: boolean;
  error: string | null;
};

const LolVersionContext = createContext<LolVersionContextType>({
  version: '',
  loading: true,
  error: null,
});

export const LolVersionProvider = ({ children }: { children: ReactNode }) => {
  const fetcher = useAuthenticatedFetch();
  const [version, setVersion] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("Fetching version...");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetcher('http://localhost:8080/api/lol/version/latest')
      .then(res => {
        setVersion(res.version);
        setError(null);
      })
      .catch(err => {
        setError('No se pudo obtener la versión de LoL');
        setVersion('');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <LolVersionContext.Provider value={{ version, loading, error }}>
      {children}
    </LolVersionContext.Provider>
  );
};

export const useLolVersion = () => useContext(LolVersionContext);
