import { useState, useEffect } from 'react';
import useAuthenticatedFetch from './useAuthenticatedFetch';

const useGameVersion = () => {
  const fetcher = useAuthenticatedFetch();
  const [version, setVersion] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVersion = async () => {
    try {
      const data = await fetcher('http://localhost:8080/api/lol/version/latest');
      setVersion(data.version);
      setError(null);
    } catch (err) {
      console.error('Error fetching game version:', err);
      setError('No se pudo obtener la versión del juego');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVersion();
  }, []);

  return { version, loading, error, refresh: fetchVersion };
};

export default useGameVersion;
