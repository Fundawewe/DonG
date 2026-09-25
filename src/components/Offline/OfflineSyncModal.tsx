import React, { useState, useEffect } from 'react';
import { useBaristaOS } from '../../context/BaristaOSContext';
import { 
  Wifi, 
  WifiOff, 
  Database, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  HardDrive, 
  X, 
  Cpu,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { OfflineSyncItem, OfflineStorageStats } from '../../types';

interface OfflineSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OfflineSyncModal: React.FC<OfflineSyncModalProps> = ({ isOpen, onClose }) => {
  const { 
    isOnline, 
    simulatedOffline, 
    toggleSimulatedOffline,
    syncOfflineQueue,
    isSyncing,
    storageStats,
    pendingSyncQueue,
    refreshOfflineStats
  } = useBaristaOS();

  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      refreshOfflineStats();
    }
  }, [isOpen, refreshOfflineStats]);

  if (!isOpen) return null;

  const handleManualSync = async () => {
    const result = await syncOfflineQueue();
    if (result.syncedCount > 0) {
      setSyncSuccessMsg(`Successfully synchronized ${result.syncedCount} offline record${result.syncedCount > 1 ? 's' : ''} with café cloud!`);
      setTimeout(() => setSyncSuccessMsg(null), 4000);
    } else {
      setSyncSuccessMsg('All offline espresso records are already in sync.');
      setTimeout(() => setSyncSuccessMsg(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-2xl my-8 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                Offline Storage & Service Worker Engine
              </h2>
              <p className="text-xs text-neutral-400">
                IndexedDB client-side database & background sync for zero café downtime
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Connectivity Status & Café Wi-Fi Simulator Banner */}
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
            isOnline 
              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' 
              : 'bg-amber-950/25 border-amber-500/40 text-amber-300'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
              </div>
              <div>
                <div className="text-sm font-bold flex items-center gap-2">
                  <span>{isOnline ? 'Connected to Café Network' : 'Operating in Offline Mode'}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold ${
                    isOnline ? 'bg-emerald-900/60 text-emerald-300' : 'bg-amber-900/60 text-amber-300'
                  }`}>
                    {isOnline ? 'ONLINE' : 'OFFLINE'}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {isOnline 
                    ? 'All espresso dials and timer runs sync directly with IndexedDB and café servers.' 
                    : 'Network unavailable. All dial-in logs, timer runs, and recipes are recorded locally in IndexedDB.'}
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <button
                onClick={toggleSimulatedOffline}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                  simulatedOffline
                    ? 'bg-amber-500 text-neutral-950 border-amber-400 hover:bg-amber-400'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700'
                }`}
                title="Toggle simulated café Wi-Fi drop to test offline dial-in"
              >
                {simulatedOffline ? (
                  <>
                    <Wifi className="w-3.5 h-3.5" />
                    <span>Disable Sim</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3.5 h-3.5" />
                    <span>Simulate Wi-Fi Drop</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {syncSuccessMsg && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{syncSuccessMsg}</span>
            </div>
          )}

          {/* IndexedDB Storage Telemetry Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                IndexedDB Persistent Store Stats
              </h3>
              <span className="text-[11px] text-neutral-500 font-mono">
                Store: barista_os_offline_db v2
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
                <div className="text-neutral-500 text-[10px] font-mono uppercase">DIAL-IN LOGS</div>
                <div className="text-xl font-bold font-mono text-neutral-100 mt-1">
                  {storageStats?.dialInCount ?? '—'}
                </div>
                <div className="text-[10px] text-emerald-400 mt-0.5">Cached in IDB</div>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
                <div className="text-neutral-500 text-[10px] font-mono uppercase">RECIPES STORED</div>
                <div className="text-xl font-bold font-mono text-neutral-100 mt-1">
                  {storageStats?.recipeCount ?? '—'}
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5">Available Offline</div>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
                <div className="text-neutral-500 text-[10px] font-mono uppercase">SHOT TIMER RUNS</div>
                <div className="text-xl font-bold font-mono text-neutral-100 mt-1">
                  {storageStats?.timerSessionCount ?? '—'}
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5">Flow & scale runs</div>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
                <div className="text-neutral-500 text-[10px] font-mono uppercase">PENDING SYNC</div>
                <div className={`text-xl font-bold font-mono mt-1 ${
                  (storageStats?.pendingSyncCount ?? 0) > 0 ? 'text-amber-400' : 'text-neutral-100'
                }`}>
                  {storageStats?.pendingSyncCount ?? 0}
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5">
                  {(storageStats?.pendingSyncCount ?? 0) > 0 ? 'Queued for sync' : 'Fully synced'}
                </div>
              </div>
            </div>
          </div>

          {/* Service Worker Cache Specs */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-amber-400" />
                Service Worker & PWA Cache
              </span>
              <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Workbox Auto-Updating Active
              </span>
            </div>
            <p className="text-neutral-400 text-[11px] leading-relaxed">
              Vite PWA precaches all core UI bundles, fonts, icons, sound timers, and SVG assets. When baristas lose internet in a basement roastery or crowded mall café, Barista OS launches instantly with 100% dial-in and timer functionality.
            </p>
          </div>

          {/* Pending Sync Queue List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Pending Sync Queue ({pendingSyncQueue.length})
              </h3>

              <button
                onClick={handleManualSync}
                disabled={isSyncing || !isOnline}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-neutral-950 transition-colors shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>
            </div>

            {pendingSyncQueue.length === 0 ? (
              <div className="p-6 rounded-xl bg-neutral-950 border border-neutral-800 text-center text-xs text-neutral-500">
                <CheckCircle2 className="w-6 h-6 text-emerald-500/60 mx-auto mb-2" />
                <span>All local IndexedDB dial-ins and timer sessions are synced with the cloud.</span>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto divide-y divide-neutral-800/60 pr-1">
                {pendingSyncQueue.map(item => (
                  <div key={item.id} className="pt-2 pb-1 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-neutral-200 flex items-center gap-1.5">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                          {item.entityType.toUpperCase()}
                        </span>
                        <span>
                          {item.entityType === 'dial-in' 
                            ? `Dose: ${item.payload?.doseIn}g → Yield: ${item.payload?.yieldOut}g (${item.payload?.recipeName})`
                            : item.entityType === 'timer-session'
                            ? `Timer: ${item.payload?.totalTimeSeconds}s, Flow: ${item.payload?.flowRateGramsPerSec} g/s`
                            : item.payload?.name || 'Item'}
                        </span>
                      </div>
                      <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                        Queued at {new Date(item.timestamp).toLocaleTimeString()} · Status: {item.status}
                      </div>
                    </div>
                    <span className="text-amber-400 text-[11px] font-mono font-medium">Pending</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-950/80 flex items-center justify-between">
          <div className="text-[11px] text-neutral-400">
            Last sync: {storageStats?.lastSyncTimestamp 
              ? new Date(storageStats.lastSyncTimestamp).toLocaleTimeString() 
              : 'Never (all fresh)'}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 rounded-xl transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
