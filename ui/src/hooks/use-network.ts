'use client';

import { useState, useEffect, useCallback } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
}

export function useNetwork(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: true,
    isSlowConnection: false,
  });

  const updateStatus = useCallback(() => {
    const isOnline = navigator.onLine;
    
    // Check connection speed if available
    let isSlowConnection = false;
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        const effectiveType = connection.effectiveType;
        isSlowConnection = effectiveType === 'slow-2g' || effectiveType === '2g';
      }
    }

    setStatus({
      isOnline,
      isSlowConnection,
    });
  }, []);

  useEffect(() => {
    // Set initial status
    updateStatus();

    // Listen for online/offline events
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    // Listen for connection changes if available
    if ('connection' in navigator) {
      (navigator as any).connection?.addEventListener('change', updateStatus);
    }

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
      if ('connection' in navigator) {
        (navigator as any).connection?.removeEventListener('change', updateStatus);
      }
    };
  }, [updateStatus]);

  return status;
}
