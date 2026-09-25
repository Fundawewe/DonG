import React, { useState, useEffect } from 'react';
import { useBaristaOS } from '../../context/BaristaOSContext';
import { WifiOff, Database, RefreshCw, CheckCircle2, ArrowRight } from 'lucide-react';

interface OfflineIndicatorProps {
  onOpenSyncModal: () => void;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ onOpenSyncModal }) => {
  const { isOnline, pendingSyncQueue, isSyncing, syncOfflineQueue } = useBaristaOS();
  const [wasOffline, setWasOffline] = useState(false);
  const [showOnlineToast, setShowOnlineToast] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline && isOnline) {
      // Returned online!
      setShowOnlineToast(true);
      syncOfflineQueue(); // auto-sync on reconnect
      const timer = setTimeout(() => {
        setShowOnlineToast(false);
        setWasOffline(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline, syncOfflineQueue]);

  if (showOnlineToast) {
    return (
      <div className="fixed bottom-4 left-4 sm:left-6 z-50 flex items-center gap-3 rounded-2xl bg-emerald-950/95 border border-emerald-500/50 px-4 py-2.5 text-xs text-emerald-200 shadow-2xl backdrop-blur-md transition-all animate-bounce-short">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <div>
          <div className="font-bold text-emerald-100">Café Wi-Fi Reconnected</div>
          <div className="text-[11px] text-emerald-300/80">Local IndexedDB records synchronized with cloud.</div>
        </div>
      </div>
    );
  }

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 sm:left-6 z-50 flex items-center gap-3 rounded-2xl bg-neutral-900/95 border border-amber-500/40 px-4 py-2.5 text-xs text-neutral-200 shadow-2xl backdrop-blur-md">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
        </span>
        <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
      </div>

      <div>
        <div className="font-bold text-neutral-100 flex items-center gap-1.5">
          <span>Offline Mode</span>
          <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
            IndexedDB Active
          </span>
        </div>
        <div className="text-[11px] text-neutral-400">
          Espresso dialing & timer remain fully functional.
          {pendingSyncQueue.length > 0 && (
            <span className="text-amber-300 ml-1 font-medium">
              ({pendingSyncQueue.length} pending sync)
            </span>
          )}
        </div>
      </div>

      <button
        onClick={onOpenSyncModal}
        className="ml-2 flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-neutral-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm whitespace-nowrap"
      >
        <Database className="w-3 h-3" />
        <span>Inspect</span>
      </button>
    </div>
  );
};
