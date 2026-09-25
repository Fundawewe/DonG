import { useEffect, useState, useCallback } from 'react';

export function useOnlineStatus() {
  const [browserOnline, setBrowserOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  
  const [simulatedOffline, setSimulatedOffline] = useState<boolean>(() => {
    return localStorage.getItem('barista_os_simulate_offline') === 'true';
  });

  useEffect(() => {
    const handleOnline = () => setBrowserOnline(true);
    const handleOffline = () => setBrowserOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleSimulatedOffline = useCallback(() => {
    setSimulatedOffline(prev => {
      const next = !prev;
      localStorage.setItem('barista_os_simulate_offline', String(next));
      return next;
    });
  }, []);

  // Effective status: if either the browser is offline or user activated café offline simulation
  const isOnline = browserOnline && !simulatedOffline;

  return {
    isOnline,
    browserOnline,
    simulatedOffline,
    toggleSimulatedOffline
  };
}
