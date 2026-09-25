import React, { useState } from 'react';
import { useBaristaOS } from '../context/BaristaOSContext';
import { 
  Timer, 
  Plus, 
  Bell, 
  MapPin, 
  User, 
  ChevronDown, 
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Wifi,
  WifiOff,
  Database
} from 'lucide-react';
import { PWAInstallButton } from './PWA/PWAInstallButton';

interface TopNavProps {
  onOpenDialInModal: () => void;
  onOpenShotTimer?: () => void;
  onOpenLicenseModal?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ 
  onOpenDialInModal, 
  onOpenShotTimer, 
  onOpenLicenseModal 
}) => {
  const { 
    activeBranch, 
    branches, 
    setActiveBranch, 
    activeBarista, 
    staffList, 
    setActiveBarista, 
    serviceAlerts, 
    currentTier, 
    setShowSubscriptionModal,
    setQuickShotTimerOpen,
    setActiveTab,
    isOnline,
    pendingSyncQueue,
    setShowOfflineSyncModal
  } = useBaristaOS();

  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const [baristaDropdownOpen, setBaristaDropdownOpen] = useState(false);
  const [alertsDropdownOpen, setAlertsDropdownOpen] = useState(false);

  const activeAlerts = serviceAlerts.filter(a => !a.resolved);

  return (
    <header className="h-14 border-b border-neutral-800 bg-neutral-900/90 backdrop-blur-md px-3 sm:px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Zone 1: Single text element brand wordmark */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button 
          onClick={() => setActiveTab('qc-dialin')}
          className="text-left font-bold text-base sm:text-lg tracking-tight text-neutral-100 hover:text-amber-400 transition-colors"
        >
          Barista OS
        </button>

        <span className="text-neutral-700 hidden sm:inline" aria-hidden="true">/</span>

        {/* Branch Context Selector */}
        <div className="relative">
          <button 
            onClick={() => {
              setBranchDropdownOpen(!branchDropdownOpen);
              setBaristaDropdownOpen(false);
              setAlertsDropdownOpen(false);
            }}
            className="flex items-center gap-1.5 text-xs text-neutral-300 hover:text-neutral-100 px-2 py-1 sm:px-2.5 sm:py-1 rounded bg-neutral-800/80 border border-neutral-700/60 transition-colors whitespace-nowrap"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-medium max-w-[100px] sm:max-w-[180px] truncate">{activeBranch.name}</span>
            <ChevronDown className="w-3 h-3 text-neutral-400 shrink-0" />
          </button>

          {branchDropdownOpen && (
            <div className="absolute left-0 mt-1.5 w-64 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl p-1.5 z-50">
              <div className="px-2 py-1 text-[10px] font-mono uppercase text-neutral-500 font-semibold">
                Select Active Branch
              </div>
              <div className="space-y-1 mt-1">
                {branches.map(b => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setActiveBranch(b);
                      setBranchDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center justify-between ${
                      b.id === activeBranch.id ? 'bg-amber-400/15 text-amber-300 font-medium' : 'text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    <div>
                      <div>{b.name}</div>
                      <div className="text-[10px] text-neutral-500">{b.location}</div>
                    </div>
                    {b.id === activeBranch.id && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Active Barista Selector */}
        <div className="relative hidden md:block">
          <button 
            onClick={() => {
              setBaristaDropdownOpen(!baristaDropdownOpen);
              setBranchDropdownOpen(false);
              setAlertsDropdownOpen(false);
            }}
            className="flex items-center gap-1.5 text-xs text-neutral-300 hover:text-neutral-100 px-2.5 py-1 rounded bg-neutral-800/80 border border-neutral-700/60 transition-colors whitespace-nowrap"
          >
            <User className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <span className="font-medium truncate max-w-[120px]">{activeBarista.name}</span>
            <ChevronDown className="w-3 h-3 text-neutral-400 shrink-0" />
          </button>

          {baristaDropdownOpen && (
            <div className="absolute left-0 mt-1.5 w-56 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl p-1.5 z-50">
              <div className="px-2 py-1 text-[10px] font-mono uppercase text-neutral-500 font-semibold">
                Active Dial-In Barista
              </div>
              <div className="space-y-1 mt-1">
                {staffList.map(s => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setActiveBarista(s);
                      setBaristaDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center justify-between ${
                      s.id === activeBarista.id ? 'bg-amber-400/15 text-amber-300 font-medium' : 'text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    <div>
                      <div>{s.name}</div>
                      <div className="text-[10px] text-neutral-500">{s.role}</div>
                    </div>
                    {s.id === activeBarista.id && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Zone 2: Status pills & Controls */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Offline / Online Status & IndexedDB Inspector Button */}
        <button
          onClick={() => setShowOfflineSyncModal(true)}
          className={`flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg border text-xs font-medium transition-all ${
            isOnline 
              ? 'bg-emerald-950/40 hover:bg-emerald-950/60 text-emerald-300 border-emerald-500/30' 
              : 'bg-amber-950/70 hover:bg-amber-950/90 text-amber-300 border-amber-500/50 animate-pulse'
          }`}
          title="Inspect Offline Storage, IndexedDB database, and sync queue"
        >
          {isOnline ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="hidden md:inline font-mono">IDB Ready</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono">
                Offline {pendingSyncQueue.length > 0 && `(${pendingSyncQueue.length})`}
              </span>
            </>
          )}
          <Database className="w-3 h-3 text-neutral-400 hidden sm:inline" />
        </button>

        {/* PWA Install Button */}
        <PWAInstallButton />

        {/* Equipment & Service Alerts Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setAlertsDropdownOpen(!alertsDropdownOpen);
              setBranchDropdownOpen(false);
              setBaristaDropdownOpen(false);
            }}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors relative"
            title="Equipment & Service Alerts"
          >
            <Bell className="w-4 h-4" />
            {activeAlerts.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400" />
            )}
          </button>

          {alertsDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <span className="text-xs font-semibold text-neutral-200">Equipment Service Alerts</span>
                <button 
                  onClick={() => {
                    setAlertsDropdownOpen(false);
                    setActiveTab('equipment');
                  }}
                  className="text-[10px] text-amber-400 hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="divide-y divide-neutral-800/80 max-h-60 overflow-y-auto mt-1">
                {activeAlerts.length === 0 ? (
                  <div className="py-4 text-center text-xs text-neutral-500">
                    All machines operational. No urgent alerts.
                  </div>
                ) : (
                  activeAlerts.map(alert => (
                    <div key={alert.id} className="py-2 text-xs">
                      <div className="flex items-center justify-between font-medium text-neutral-200">
                        <span className="truncate">{alert.title}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          alert.severity === 'critical' ? 'bg-rose-950 text-rose-300' :
                          alert.severity === 'warning' ? 'bg-amber-950 text-amber-300' :
                          'bg-neutral-800 text-neutral-300'
                        }`}>
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2">{alert.detail}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Extraction Timer Button */}
        <button
          onClick={() => onOpenShotTimer ? onOpenShotTimer() : setQuickShotTimerOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-neutral-300 hover:text-neutral-100 bg-neutral-800 hover:bg-neutral-700/80 rounded-lg transition-colors whitespace-nowrap"
        >
          <Timer className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Shot Timer</span>
        </button>

        {/* License Pill & Upgrade */}
        <button
          onClick={() => onOpenLicenseModal ? onOpenLicenseModal() : setShowSubscriptionModal(true)}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors whitespace-nowrap"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>{currentTier.name}</span>
        </button>

        {/* Primary Action: + Dial-In Log */}
        <button
          onClick={onOpenDialInModal}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log Dial-In</span>
        </button>
      </div>
    </header>
  );
};
