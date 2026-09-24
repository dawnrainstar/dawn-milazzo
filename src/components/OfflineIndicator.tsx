import React from 'react';
import { WifiOff, Database } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-amber-500/95 backdrop-blur-md border border-amber-400 text-slate-950 px-3.5 py-2 text-xs font-mono font-semibold shadow-2xl animate-pulse">
      <WifiOff className="w-4 h-4 text-slate-950" />
      <span>Offline Field Mode Active</span>
      <span className="text-[10px] bg-slate-950/20 px-1.5 py-0.5 rounded text-slate-900">
        Local DB Cache Synced
      </span>
    </div>
  );
};
