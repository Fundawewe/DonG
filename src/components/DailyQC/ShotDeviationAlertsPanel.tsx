import React, { useState, useMemo } from 'react';
import { useBaristaOS } from '../../context/BaristaOSContext';
import { ShotDeviationAlert, DeviationSeverity } from '../../types';
import { TOLERANCE_PRESETS, analyzeShotDeviation, playDeviationAlertAudio } from '../../utils/deviationAnalyzer';
import { 
  BellRing, 
  BellOff, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Scale, 
  Sliders, 
  ArrowRight, 
  Check, 
  X, 
  RotateCcw, 
  Coffee, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  ChevronDown, 
  ChevronUp,
  Activity,
  Wrench,
  HelpCircle,
  ExternalLink,
  Flame
} from 'lucide-react';

interface ShotDeviationAlertsPanelProps {
  onOpenDialInWithData: (prefill: {
    doseIn?: number;
    yieldOut?: number;
    timeSeconds?: number;
    recipeId?: string;
    adjustmentsMade?: string;
  }) => void;
}

export const ShotDeviationAlertsPanel: React.FC<ShotDeviationAlertsPanelProps> = ({
  onOpenDialInWithData
}) => {
  const {
    deviationAlerts,
    recipes,
    activeBarista,
    tolerancePreset,
    setTolerancePreset,
    acknowledgeDeviationAlert,
    dismissDeviationAlert,
    clearAllDeviationAlerts,
    soundAlertsEnabled,
    setSoundAlertsEnabled,
    addDeviationAlert
  } = useBaristaOS();

  const [isExpanded, setIsExpanded] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'warning' | 'active'>('active');
  const [showSimulator, setShowSimulator] = useState(false);

  // Simulator state
  const [simRecipeId, setSimRecipeId] = useState<string>(recipes[0]?.id || '');
  const [simTimeSeconds, setSimTimeSeconds] = useState<number>(recipes[0]?.targetTimeSeconds ? recipes[0].targetTimeSeconds - 5 : 22);
  const [simYieldGrams, setSimYieldGrams] = useState<number>(recipes[0]?.targetYield ? recipes[0].targetYield + 4 : 42);

  const selectedSimRecipe = useMemo(() => {
    return recipes.find(r => r.id === simRecipeId) || recipes[0];
  }, [recipes, simRecipeId]);

  // Live simulation analysis
  const simAnalysis = useMemo(() => {
    if (!selectedSimRecipe) return null;
    return analyzeShotDeviation({
      timeSeconds: simTimeSeconds,
      yieldGrams: simYieldGrams,
      doseIn: selectedSimRecipe.recommendedDose,
      recipe: selectedSimRecipe,
      baristaName: activeBarista.name,
      source: 'manual-test',
      tolerance: tolerancePreset
    });
  }, [simTimeSeconds, simYieldGrams, selectedSimRecipe, activeBarista, tolerancePreset]);

  // Filter alerts
  const activeAlerts = useMemo(() => {
    return deviationAlerts.filter(alert => !alert.isDismissed);
  }, [deviationAlerts]);

  const displayedAlerts = useMemo(() => {
    return activeAlerts.filter(alert => {
      if (filterSeverity === 'active') return !alert.isAcknowledged;
      if (filterSeverity === 'critical') return alert.severity === 'critical';
      if (filterSeverity === 'warning') return alert.severity === 'warning';
      return true; // 'all'
    });
  }, [activeAlerts, filterSeverity]);

  const unacknowledgedCount = activeAlerts.filter(a => !a.isAcknowledged).length;
  const criticalCount = activeAlerts.filter(a => a.severity === 'critical' && !a.isAcknowledged).length;
  const warningCount = activeAlerts.filter(a => a.severity === 'warning' && !a.isAcknowledged).length;

  const handleTestSimulatorAlert = () => {
    if (simAnalysis && simAnalysis.severity !== 'optimal') {
      addDeviationAlert(simAnalysis);
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-xl transition-all">
      {/* Alert Header Bar */}
      <div className="p-4 sm:p-5 border-b border-neutral-800 bg-neutral-950/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl border transition-all ${
            criticalCount > 0
              ? 'bg-rose-950/60 border-rose-700/80 text-rose-400 animate-pulse'
              : warningCount > 0
              ? 'bg-amber-950/60 border-amber-700/80 text-amber-400'
              : 'bg-emerald-950/60 border-emerald-700/80 text-emerald-400'
          }`}>
            <BellRing className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                Recipe Target Deviation Alerts
                {unacknowledgedCount > 0 ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                    {unacknowledgedCount} Active
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                    All Targets Calibrated
                  </span>
                )}
              </h3>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Instant detection for shots deviating in contact time (±{tolerancePreset.timeToleranceWarning}s) or yield (±{tolerancePreset.yieldToleranceWarning}g)
            </p>
          </div>
        </div>

        {/* Header Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Audio Chimes Toggle */}
          <button
            onClick={() => setSoundAlertsEnabled(!soundAlertsEnabled)}
            className={`p-2 rounded-xl text-xs flex items-center gap-1.5 border transition-colors ${
              soundAlertsEnabled
                ? 'bg-amber-400/10 border-amber-400/30 text-amber-300'
                : 'bg-neutral-800 border-neutral-700 text-neutral-400'
            }`}
            title={soundAlertsEnabled ? 'Sound alert chimes enabled' : 'Sound alert chimes muted'}
          >
            {soundAlertsEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
            <span className="text-[11px] hidden sm:inline">{soundAlertsEnabled ? 'Chime ON' : 'Muted'}</span>
          </button>

          {/* Tolerance Mode Preset Picker */}
          <div className="relative">
            <select
              value={tolerancePreset.mode}
              onChange={(e) => {
                const mode = e.target.value as 'strict' | 'standard' | 'lenient';
                setTolerancePreset(TOLERANCE_PRESETS[mode]);
              }}
              className="bg-neutral-950 border border-neutral-700 text-neutral-200 text-xs rounded-xl px-3 py-2 font-mono focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="strict">🎯 Competition (±1.5s / ±1.5g)</option>
              <option value="standard">⚖️ Specialty Standard (±2.5s / ±2.0g)</option>
              <option value="lenient">⚡ High-Volume Rush (±4.0s / ±3.5g)</option>
            </select>
          </div>

          {/* Simulator Toggle */}
          <button
            onClick={() => setShowSimulator(!showSimulator)}
            className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 ${
              showSimulator
                ? 'bg-amber-400 text-neutral-950 border-amber-400 font-bold'
                : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Test Simulator</span>
          </button>

          {/* Collapse/Expand Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-neutral-400 hover:text-neutral-200 rounded-xl hover:bg-neutral-800 transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-5 space-y-4">
          {/* Live Shot Deviation Simulator (Expandable) */}
          {showSimulator && selectedSimRecipe && (
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-neutral-100">
                    Live Shot Deviation Simulator & Test Bench
                  </span>
                </div>
                <span className="text-[10px] font-mono text-neutral-400">
                  Target: {selectedSimRecipe.targetTimeSeconds}s · {selectedSimRecipe.targetYield}g
                </span>
              </div>

              {/* Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                    Select Espresso Profile:
                  </label>
                  <select
                    value={simRecipeId}
                    onChange={(e) => setSimRecipeId(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-2.5 py-1.5 text-xs text-neutral-100 focus:outline-none focus:border-amber-400"
                  >
                    {recipes.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] font-medium text-neutral-400 mb-1">
                    <span>Actual Extraction Time:</span>
                    <span className="font-mono font-bold text-neutral-200">{simTimeSeconds}s</span>
                  </div>
                  <input
                    type="range"
                    min={15}
                    max={45}
                    step={0.5}
                    value={simTimeSeconds}
                    onChange={(e) => setSimTimeSeconds(parseFloat(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-500 font-mono mt-0.5">
                    <span>15s (Fast)</span>
                    <span className="text-amber-400 font-bold">Target {selectedSimRecipe.targetTimeSeconds}s</span>
                    <span>45s (Slow)</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] font-medium text-neutral-400 mb-1">
                    <span>Actual Liquid Yield:</span>
                    <span className="font-mono font-bold text-neutral-200">{simYieldGrams}g</span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={60}
                    step={0.5}
                    value={simYieldGrams}
                    onChange={(e) => setSimYieldGrams(parseFloat(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-500 font-mono mt-0.5">
                    <span>20g (Ristretto)</span>
                    <span className="text-amber-400 font-bold">Target {selectedSimRecipe.targetYield}g</span>
                    <span>60g (Lungo)</span>
                  </div>
                </div>
              </div>

              {/* Simulator Analysis Result Card */}
              {simAnalysis && (
                <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  simAnalysis.severity === 'critical'
                    ? 'bg-rose-950/40 border-rose-800/80 text-rose-200'
                    : simAnalysis.severity === 'warning'
                    ? 'bg-amber-950/40 border-amber-800/80 text-amber-200'
                    : 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
                }`}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        simAnalysis.severity === 'critical'
                          ? 'bg-rose-900 text-rose-200'
                          : simAnalysis.severity === 'warning'
                          ? 'bg-amber-900 text-amber-200'
                          : 'bg-emerald-900 text-emerald-200'
                      }`}>
                        {simAnalysis.severity.toUpperCase()}
                      </span>
                      <span className="text-xs font-bold text-neutral-100">{simAnalysis.title}</span>
                    </div>
                    <div className="text-[11px] text-neutral-300">
                      Delta: Time <strong className="font-mono">{simAnalysis.timeDeltaSeconds > 0 ? `+${simAnalysis.timeDeltaSeconds}` : simAnalysis.timeDeltaSeconds}s</strong> · Yield <strong className="font-mono">{simAnalysis.yieldDeltaGrams > 0 ? `+${simAnalysis.yieldDeltaGrams}` : simAnalysis.yieldDeltaGrams}g</strong>
                    </div>
                    <div className="text-[11px] text-neutral-300 italic">
                      {simAnalysis.suggestedAction}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => playDeviationAlertAudio(simAnalysis.severity)}
                      className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors"
                      title="Test Audio Chime"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={handleTestSimulatorAlert}
                      disabled={simAnalysis.severity === 'optimal'}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        simAnalysis.severity !== 'optimal'
                          ? 'bg-amber-400 hover:bg-amber-300 text-neutral-950'
                          : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                      }`}
                    >
                      Trigger Test Alert
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Filter Segmented Navigation */}
          <div className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setFilterSeverity('active')}
                className={`px-3 py-1 rounded-lg transition-colors font-medium ${
                  filterSeverity === 'active'
                    ? 'bg-amber-400 text-neutral-950 font-bold'
                    : 'bg-neutral-950 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
                }`}
              >
                Active ({unacknowledgedCount})
              </button>

              <button
                onClick={() => setFilterSeverity('critical')}
                className={`px-3 py-1 rounded-lg transition-colors font-medium ${
                  filterSeverity === 'critical'
                    ? 'bg-rose-500 text-neutral-950 font-bold'
                    : 'bg-neutral-950 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
                }`}
              >
                Critical Only ({criticalCount})
              </button>

              <button
                onClick={() => setFilterSeverity('warning')}
                className={`px-3 py-1 rounded-lg transition-colors font-medium ${
                  filterSeverity === 'warning'
                    ? 'bg-amber-500 text-neutral-950 font-bold'
                    : 'bg-neutral-950 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
                }`}
              >
                Warnings ({warningCount})
              </button>

              <button
                onClick={() => setFilterSeverity('all')}
                className={`px-3 py-1 rounded-lg transition-colors font-medium ${
                  filterSeverity === 'all'
                    ? 'bg-neutral-800 text-neutral-100 font-bold'
                    : 'bg-neutral-950 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
                }`}
              >
                All History ({activeAlerts.length})
              </button>
            </div>

            {activeAlerts.some(a => a.isAcknowledged) && (
              <button
                onClick={clearAllDeviationAlerts}
                className="text-[11px] text-neutral-400 hover:text-neutral-200 underline"
              >
                Clear Acknowledged
              </button>
            )}
          </div>

          {/* Active Alerts List */}
          <div className="space-y-3">
            {displayedAlerts.length === 0 ? (
              <div className="p-8 text-center bg-neutral-950/60 border border-neutral-800 rounded-2xl space-y-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                <h4 className="text-xs font-bold text-neutral-200">No Target Deviations Detected</h4>
                <p className="text-[11px] text-neutral-400 max-w-md mx-auto">
                  All logged shots and timer runs are pulling within recipe target ranges (Time ±{tolerancePreset.timeToleranceWarning}s, Yield ±{tolerancePreset.yieldToleranceWarning}g).
                </p>
              </div>
            ) : (
              displayedAlerts.map((alert) => {
                const isCritical = alert.severity === 'critical';
                const timeDiffFormatted = alert.timeDeltaSeconds > 0 ? `+${alert.timeDeltaSeconds}` : `${alert.timeDeltaSeconds}`;
                const yieldDiffFormatted = alert.yieldDeltaGrams > 0 ? `+${alert.yieldDeltaGrams}` : `${alert.yieldDeltaGrams}`;

                return (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      alert.isAcknowledged
                        ? 'bg-neutral-950/40 border-neutral-800/60 opacity-65'
                        : isCritical
                        ? 'bg-rose-950/20 border-rose-800/80 shadow-md shadow-rose-950/20'
                        : 'bg-amber-950/20 border-amber-800/80 shadow-md shadow-amber-950/20'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                      {/* Left: Indicator + Title + Recipe */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                          isCritical 
                            ? 'bg-rose-950 text-rose-400 border border-rose-800' 
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}>
                          {isCritical ? <ShieldAlert className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                              isCritical ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                            }`}>
                              {alert.severity} DRIFT
                            </span>

                            <h4 className="text-xs font-bold text-neutral-100">
                              {alert.title}
                            </h4>

                            <span className="text-[10px] font-mono text-neutral-400">
                              {alert.timestamp} · {alert.baristaName}
                            </span>
                          </div>

                          {/* Recipe Name */}
                          <div className="text-xs font-semibold text-amber-400 mt-1 flex items-center gap-1.5">
                            <Coffee className="w-3.5 h-3.5" />
                            <span>{alert.recipeName}</span>
                          </div>

                          {/* Delta Variance Metrics Grid */}
                          <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                            <div className="p-2 rounded-xl bg-neutral-950 border border-neutral-800">
                              <span className="text-[10px] text-neutral-400 block font-mono">EXTRACTION TIME</span>
                              <span className="font-mono font-bold text-neutral-200">
                                {alert.actualTimeSeconds}s
                              </span>
                              <span className={`text-[10px] font-mono block ${
                                Math.abs(alert.timeDeltaSeconds) >= tolerancePreset.timeToleranceWarning
                                  ? 'text-rose-400 font-bold'
                                  : 'text-neutral-400'
                              }`}>
                                ({timeDiffFormatted}s vs {alert.targetTimeSeconds}s target)
                              </span>
                            </div>

                            <div className="p-2 rounded-xl bg-neutral-950 border border-neutral-800">
                              <span className="text-[10px] text-neutral-400 block font-mono">LIQUID YIELD</span>
                              <span className="font-mono font-bold text-neutral-200">
                                {alert.actualYieldGrams}g
                              </span>
                              <span className={`text-[10px] font-mono block ${
                                Math.abs(alert.yieldDeltaGrams) >= tolerancePreset.yieldToleranceWarning
                                  ? 'text-rose-400 font-bold'
                                  : 'text-neutral-400'
                              }`}>
                                ({yieldDiffFormatted}g vs {alert.targetYieldGrams}g target)
                              </span>
                            </div>

                            <div className="p-2 rounded-xl bg-neutral-950 border border-neutral-800">
                              <span className="text-[10px] text-neutral-400 block font-mono">BREW RATIO</span>
                              <span className="font-mono font-bold text-neutral-200">
                                1:{(alert.actualYieldGrams / alert.doseIn).toFixed(2)}
                              </span>
                              <span className="text-[10px] text-neutral-400 font-mono block">
                                Target 1:{(alert.targetYieldGrams / alert.doseIn).toFixed(2)}
                              </span>
                            </div>

                            <div className="p-2 rounded-xl bg-neutral-950 border border-neutral-800">
                              <span className="text-[10px] text-neutral-400 block font-mono">FLOW RATE</span>
                              <span className="font-mono font-bold text-neutral-200">
                                {alert.actualTimeSeconds > 4 ? (alert.actualYieldGrams / (alert.actualTimeSeconds - 4)).toFixed(2) : '0.00'} g/s
                              </span>
                              <span className="text-[10px] text-neutral-400 font-mono block">
                                Target {(alert.targetYieldGrams / Math.max(1, alert.targetTimeSeconds - 4)).toFixed(2)} g/s
                              </span>
                            </div>
                          </div>

                          {/* Suggested Action Callout */}
                          <div className="mt-2.5 p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-start gap-2.5">
                            <Wrench className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <div className="text-xs">
                              <span className="font-bold text-amber-300 block mb-0.5">
                                Recommended Barista Calibration Action:
                              </span>
                              <p className="text-neutral-300 leading-relaxed">
                                {alert.suggestedAction}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Quick Action Buttons */}
                      <div className="flex md:flex-col items-center justify-end gap-2 shrink-0 pt-2 md:pt-0">
                        {/* Auto Apply to Dial In */}
                        <button
                          type="button"
                          onClick={() => {
                            onOpenDialInWithData({
                              recipeId: alert.recipeId,
                              timeSeconds: alert.actualTimeSeconds,
                              yieldOut: alert.actualYieldGrams,
                              doseIn: alert.doseIn,
                              adjustmentsMade: alert.suggestedAction
                            });
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs rounded-xl transition-colors shadow-sm"
                        >
                          <span>Calibrate on Bar</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        {/* Acknowledge Toggle */}
                        {!alert.isAcknowledged ? (
                          <button
                            type="button"
                            onClick={() => acknowledgeDeviationAlert(alert.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-neutral-100 text-xs rounded-xl transition-colors"
                          >
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Acknowledge</span>
                          </button>
                        ) : (
                          <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Acknowledged
                          </span>
                        )}

                        {/* Dismiss */}
                        <button
                          type="button"
                          onClick={() => dismissDeviationAlert(alert.id)}
                          className="p-1.5 text-neutral-500 hover:text-neutral-300 rounded-lg transition-colors"
                          title="Dismiss Alert"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
