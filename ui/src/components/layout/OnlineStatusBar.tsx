'use client';

import { WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function OnlineStatusBar() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="bg-accent text-accent-foreground px-4 py-3 flex items-center gap-2 text-sm font-medium sticky top-0 z-40">
      <WifiOff className="w-4 h-4" />
      <span>Offline mode - Last synced data is available</span>
    </div>
  );
}
