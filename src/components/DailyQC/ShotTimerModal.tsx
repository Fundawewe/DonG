import React, { useState, useEffect, useRef } from 'react';
import { useBaristaOS } from '../../context/BaristaOSContext';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Check, 
  X, 
  Timer, 
  Coffee, 
  Flame, 
  Database, 
  Wifi, 
  WifiOff, 
  Save, 
  History, 
  Clock 
} from 'lucide-react';

interface ShotTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDialInModalWithData?: (data: { timeSeconds: number; yieldGrams: number }) => void;
}

export const ShotTimerModal: React.FC<ShotTimerModalProps> = ({ 
  isOpen, 
  onClose, 
  onOpenDialInModalWithData 
}) => {
  const { recipes, isOnline, saveShotTimerRun, timerSessions } = useBaristaOS();
  const [selectedRecipe, setSelectedRecipe] = useState(recipes[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [yieldGrams, setYieldGrams] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [justSavedNotice, setJustSavedNotice] = useState(false);

  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() - elapsedMs;
      timerRef.current = window.setInterval(() => {
        const now = Date.now();
        const currentElapsed = now - startTimeRef.current;
        setElapsedMs(currentElapsed);

        // Simulate realistic espresso scale flow if yield isn't manually locked
        // Espresso flow kicks in after pre-infusion (approx 4 seconds)
        const seconds = currentElapsed / 1000;
        if (seconds > 4) {
          const flowRate = (selectedRecipe.targetYield / Math.max(1, selectedRecipe.targetTimeSeconds - 4));
          const simulatedYield = Math.min(
            selectedRecipe.targetYield + 2.5, 
            parseFloat(((seconds - 4) * flowRate).toFixed(1))
          );
          setYieldGrams(simulatedYield);
        }
      }, 50);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, selectedRecipe]);

  if (!isOpen) return null;

  const seconds = (elapsedMs / 1000);
  const formattedTime = seconds.toFixed(1);
  const targetTime = selectedRecipe.targetTimeSeconds;
  const targetYield = selectedRecipe.targetYield;

  const progressPercent = Math.min(100, (seconds / targetTime) * 100);
  const flowRatePerSec = seconds > 4 && yieldGrams > 0 ? (yieldGrams / (seconds - 4)).toFixed(2) : '0.00';

  const handleReset = () => {
    setIsRunning(false);
    setElapsedMs(0);
    setYieldGrams(0);
  };

  const handleSaveToIndexedDB = async () => {
    if (seconds === 0) return;
    setIsRunning(false);
    await saveShotTimerRun({
      recipeId: selectedRecipe.id,
      recipeName: selectedRecipe.name,
      totalTimeSeconds: parseFloat(seconds.toFixed(1)),
      preInfusionSeconds: Math.min(4, parseFloat(seconds.toFixed(1))),
      yieldGrams: parseFloat((yieldGrams > 0 ? yieldGrams : targetYield).toFixed(1)),
      flowRateGramsPerSec: parseFloat(flowRatePerSec),
      targetTimeSeconds: targetTime,
      targetYieldGrams: targetYield,
      notes: `Recorded on espresso timer · Flow: ${flowRatePerSec} g/s`
    });

    setJustSavedNotice(true);
    setTimeout(() => setJustSavedNotice(false), 3000);
  };

  const handleTransferToLog = async () => {
    setIsRunning(false);
    // Also ensure saved to IndexedDB
    if (seconds > 0) {
      await saveShotTimerRun({
        recipeId: selectedRecipe.id,
        recipeName: selectedRecipe.name,
        totalTimeSeconds: parseFloat(seconds.toFixed(1)),
        preInfusionSeconds: Math.min(4, parseFloat(seconds.toFixed(1))),
        yieldGrams: parseFloat((yieldGrams > 0 ? yieldGrams : targetYield).toFixed(1)),
        flowRateGramsPerSec: parseFloat(flowRatePerSec),
        targetTimeSeconds: targetTime,
        targetYieldGrams: targetYield,
        notes: 'Direct export to Dial-In QC log'
      });
    }

    if (onOpenDialInModalWithData) {
      onOpenDialInModalWithData({
        timeSeconds: Math.round(seconds),
        yieldGrams: yieldGrams > 0 ? yieldGrams : targetYield
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header with Connectivity & IndexedDB Indicator */}
        <div className="px-5 py-3.5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/70">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-sm text-neutral-100">Espresso Shot Timer & Scale</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Connectivity Badge */}
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1 border ${
              isOnline 
                ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/80' 
                : 'bg-amber-950/80 text-amber-300 border-amber-800/80'
            }`}>
              {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3 text-amber-400" />}
              <span>{isOnline ? 'ONLINE' : 'OFFLINE (IDB)'}</span>
            </span>

            <button 
              onClick={onClose} 
              className="p-1 rounded text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 text-center space-y-5">
          {/* Target Recipe selector & History toggle */}
          <div className="flex items-center justify-between gap-2 text-left">
            <div className="flex-1">
              <label className="block text-[11px] text-neutral-400 mb-1">Target Profile</label>
              <select
                value={selectedRecipe.id}
                onChange={(e) => {
                  const rec = recipes.find(r => r.id === e.target.value);
                  if (rec) setSelectedRecipe(rec);
                }}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
              >
                {recipes.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.recommendedDose}g in → {r.targetYield}g out / {r.targetTimeSeconds}s)
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`mt-4 p-2 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                showHistory 
                  ? 'bg-amber-400/10 border-amber-400 text-amber-300' 
                  : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
              title="View recent IndexedDB timer runs"
            >
              <History className="w-4 h-4" />
            </button>
          </div>

          {/* Big Digital Chronometer */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 shadow-inner relative overflow-hidden">
            {/* Target flow status indicator */}
            <div className="flex items-center justify-between text-xs mb-4 text-neutral-400">
              <span className="font-mono">TARGET: {targetTime}s</span>
              <span className={`px-2.5 py-0.5 rounded-full font-mono text-[11px] font-medium ${
                seconds >= targetTime - 2 && seconds <= targetTime + 2
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : seconds > targetTime + 2
                  ? 'bg-rose-950 text-rose-300'
                  : 'bg-neutral-800 text-neutral-400'
              }`}>
                {seconds < 4 ? 'PRE-INFUSION' : seconds <= targetTime ? 'FLOW EXTRACTION' : 'OVERRUN'}
              </span>
              <span className="font-mono">TARGET: {targetYield}g</span>
            </div>

            <div className="text-6xl font-black font-mono tracking-tight text-neutral-100 my-2 select-none">
              {formattedTime}<span className="text-2xl text-neutral-500 font-sans">s</span>
            </div>

            {/* Simulated Live Scale Output */}
            <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-neutral-800/80">
              <div>
                <div className="text-[10px] text-neutral-400 uppercase font-mono">ACALA SCALE YIELD</div>
                <div className="text-2xl font-bold font-mono text-amber-400">
                  {yieldGrams.toFixed(1)} <span className="text-xs text-neutral-400 font-normal">g</span>
                </div>
              </div>
              <div className="h-8 w-px bg-neutral-800" />
              <div>
                <div className="text-[10px] text-neutral-400 uppercase font-mono">FLOW VELOCITY</div>
                <div className="text-2xl font-bold font-mono text-neutral-300">
                  {flowRatePerSec} <span className="text-xs text-neutral-400 font-normal">g/s</span>
                </div>
              </div>
            </div>

            {/* Target Timeline Progress Bar */}
            <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden mt-4">
              <div 
                className={`h-full transition-all duration-75 ${
                  seconds <= targetTime ? 'bg-amber-400' : 'bg-rose-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {justSavedNotice && (
            <div className="p-2 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center justify-center gap-2 animate-fade-in">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Shot session committed to local IndexedDB!</span>
            </div>
          )}

          {/* Stopwatch Controls */}
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <button
              onClick={handleReset}
              className="p-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-colors ${
                isRunning 
                  ? 'bg-rose-600 hover:bg-rose-500 text-white' 
                  : 'bg-amber-400 hover:bg-amber-300 text-neutral-950'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause Timer</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Shot</span>
                </>
              )}
            </button>

            <button
              onClick={handleSaveToIndexedDB}
              disabled={seconds === 0}
              className="p-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-neutral-700 transition-colors disabled:opacity-40"
              title="Save Shot to IndexedDB"
            >
              <Save className="w-4 h-4" />
            </button>

            <button
              onClick={handleTransferToLog}
              disabled={seconds === 0}
              className="px-4 py-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-semibold text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 whitespace-nowrap"
              title="Export Shot Data to Dial-In Log"
            >
              <Check className="w-4 h-4" />
              <span>Log Shot</span>
            </button>
          </div>

          {/* IndexedDB Offline Telemetry Notice */}
          <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1">
            <span className="flex items-center gap-1">
              <Database className="w-3 h-3 text-amber-400" />
              <span>IndexedDB Active: 100% Offline Capable</span>
            </span>
            <span>{timerSessions.length} shot runs cached</span>
          </div>

          {/* Recent IndexedDB Timer Sessions Drawer */}
          {showHistory && (
            <div className="text-left bg-neutral-950 p-3 rounded-xl border border-neutral-800 space-y-2 max-h-40 overflow-y-auto">
              <div className="text-[10px] font-mono uppercase text-neutral-400 font-semibold flex items-center justify-between">
                <span>Recent Offline Timer Runs ({timerSessions.length})</span>
                <span className="text-emerald-400">IndexedDB</span>
              </div>
              {timerSessions.length === 0 ? (
                <div className="text-[11px] text-neutral-500 py-2 text-center">
                  No timer runs logged yet today.
                </div>
              ) : (
                <div className="space-y-1.5 divide-y divide-neutral-900">
                  {timerSessions.slice(0, 5).map(s => (
                    <div key={s.id} className="pt-1.5 flex items-center justify-between text-xs font-mono">
                      <div>
                        <div className="text-neutral-200">{s.recipeName}</div>
                        <div className="text-[10px] text-neutral-500">
                          {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · Flow {s.flowRateGramsPerSec}g/s
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-amber-400 font-bold">{s.totalTimeSeconds}s</span>
                        <span className="text-neutral-400 text-[10px]"> / {s.yieldGrams}g</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
