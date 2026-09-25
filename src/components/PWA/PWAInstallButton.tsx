import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Share, PlusSquare, X } from 'lucide-react';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  className = '', 
  variant = 'compact' 
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the prompt
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-neutral-900 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 rounded-lg shadow-sm transition-all whitespace-nowrap ${className}`}
        title="Install Barista OS for full offline café counter usage"
      >
        <Download className="w-3.5 h-3.5 text-neutral-900" />
        <span>{variant === 'full' ? 'Install Barista OS' : 'Install App'}</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors whitespace-nowrap ${className}`}
        >
          <Download className="w-3.5 h-3.5 text-amber-400" />
          <span>Install on iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl text-neutral-100">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <h3 className="text-base font-bold text-amber-300">Install on iPad / iPhone</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs text-neutral-300">
                <p className="text-neutral-400">
                  Run Barista OS offline on your café espresso station without URL bars or browser latency:
                </p>
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 font-mono font-bold flex items-center justify-center text-[10px]">1</span>
                    <span>Tap Safari's <strong className="text-neutral-100">Share</strong> button <Share className="w-3.5 h-3.5 inline text-amber-400 ml-1" /> in toolbar</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 font-mono font-bold flex items-center justify-center text-[10px]">2</span>
                    <span>Scroll down and tap <strong className="text-neutral-100">Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline text-emerald-400 ml-1" /></span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 font-mono font-bold flex items-center justify-center text-[10px]">3</span>
                    <span>Launch Barista OS for standalone, offline-ready espresso dialing</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-neutral-800 hover:bg-neutral-700 py-2.5 text-xs font-semibold text-neutral-200 transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
