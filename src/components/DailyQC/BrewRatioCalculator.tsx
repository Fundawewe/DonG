import React, { useState } from 'react';
import { useBaristaOS } from '../../context/BaristaOSContext';
import { 
  Calculator, 
  Scale, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  ArrowRight, 
  Coffee, 
  Flame, 
  Info,
  Sliders,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface BrewRatioCalculatorProps {
  onApplyToDialIn?: (data: { doseIn: number; yieldOut: number; tdsPercent: number; recipeId?: string }) => void;
  onOpenShotTimer?: () => void;
}

export const BrewRatioCalculator: React.FC<BrewRatioCalculatorProps> = ({ 
  onApplyToDialIn,
  onOpenShotTimer 
}) => {
  const { recipes } = useBaristaOS();

  // State
  const [doseIn, setDoseIn] = useState<number>(18.5);
  const [yieldOut, setYieldOut] = useState<number>(38.0);
  const [tdsPercent, setTdsPercent] = useState<number>(9.8);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Calculations
  // Brew ratio = 1 : (Yield / Dose)
  const ratioNumber = doseIn > 0 ? Number((yieldOut / doseIn).toFixed(2)) : 0;
  
  // Predicted Extraction Yield (EY %) = (Yield * TDS) / Dose
  const predictedEY = doseIn > 0 ? Number(((yieldOut * tdsPercent) / doseIn).toFixed(2)) : 0;

  // Dissolved Coffee Solubles mass in liquid cup (grams)
  const solublesGrams = Number(((yieldOut * tdsPercent) / 100).toFixed(2));

  // Determine SCA Golden Cup extraction status
  let status: 'under-extracted' | 'sweet-spot' | 'over-extracted' = 'sweet-spot';
  let statusBadge = {
    label: 'SCA Golden Cup Sweet Spot',
    badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80',
    color: '#10b981',
    description: 'Balanced soluble yield. Optimal harmony of fruit acidity, sweetness, and tactile mouthfeel without astringency.'
  };

  if (predictedEY < 18.0) {
    status = 'under-extracted';
    // Yield needed for 20.0% EY with current dose and TDS: (20.0 * dose) / TDS
    const idealYield = tdsPercent > 0 ? Number(((20.0 * doseIn) / tdsPercent).toFixed(1)) : 0;
    const idealRatio = doseIn > 0 ? Number((idealYield / doseIn).toFixed(2)) : 0;

    statusBadge = {
      label: 'Under-Extracted (Sour/Thin Risk)',
      badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-700/80',
      color: '#f59e0b',
      description: `Predicted EY is below 18.0%. Risk of sharp sourness, underdeveloped sweetness, and short finish. To target 20.0% EY, increase yield to ~${idealYield}g (ratio 1:${idealRatio}) or grind finer to increase dissolution efficiency.`
    };
  } else if (predictedEY > 22.0) {
    status = 'over-extracted';
    const idealYield = tdsPercent > 0 ? Number(((20.0 * doseIn) / tdsPercent).toFixed(1)) : 0;
    const idealRatio = doseIn > 0 ? Number((idealYield / doseIn).toFixed(2)) : 0;

    statusBadge = {
      label: 'Over-Extracted (Bitter/Dry Risk)',
      badgeClass: 'bg-rose-950/80 text-rose-300 border-rose-700/80',
      color: '#f43f5e',
      description: `Predicted EY exceeds 22.0%. Risk of astringent tannins, lingering bitterness, and dry throat-feel. To lower EY to 20.0%, shorten target yield to ~${idealYield}g (ratio 1:${idealRatio}) or grind slightly coarser.`
    };
  }

  // Visual Gauge Calculation (Range 14% to 26%)
  const gaugeMin = 14.0;
  const gaugeMax = 26.0;
  const clampedEY = Math.max(gaugeMin, Math.min(gaugeMax, predictedEY));
  const pointerPercent = ((clampedEY - gaugeMin) / (gaugeMax - gaugeMin)) * 100;

  // Preset Ratio Buttons
  const applyRatioPreset = (targetRatio: number) => {
    const newYield = Number((doseIn * targetRatio).toFixed(1));
    setYieldOut(newYield);
  };

  // Preset TDS Strengths
  const applyTdsPreset = (newTds: number) => {
    setTdsPercent(newTds);
  };

  // Recipe Autofill
  const handleRecipeSelect = (recipeId: string) => {
    setSelectedRecipeId(recipeId);
    const rec = recipes.find(r => r.id === recipeId);
    if (rec) {
      setDoseIn(rec.recommendedDose);
      setYieldOut(rec.targetYield);
      // Auto-set reasonable TDS baseline for this origin
      setTdsPercent(9.6);
    }
  };

  const handleReset = () => {
    setDoseIn(18.5);
    setYieldOut(38.0);
    setTdsPercent(9.8);
    setSelectedRecipeId('');
  };

  const handleTransferToDialIn = () => {
    if (onApplyToDialIn) {
      onApplyToDialIn({
        doseIn,
        yieldOut,
        tdsPercent,
        recipeId: selectedRecipeId || undefined
      });
    }
  };

  return (
    <div className="rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden shadow-lg transition-all">
      {/* Utility Header */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-5 py-3.5 bg-neutral-950/80 border-b border-neutral-800 flex items-center justify-between cursor-pointer hover:bg-neutral-950 transition-colors select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-400">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-neutral-100">
                Brew Ratio & Extraction Yield (EY) Calculator
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
                Pre-Shot Modeling
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Model dose, yield, and target refractometry to predict extraction yield before pulling
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 font-mono text-xs">
            <span className="text-neutral-400">Ratio:</span>
            <span className="font-bold text-amber-400">1:{ratioNumber}</span>
            <span className="text-neutral-600">|</span>
            <span className="text-neutral-400">Predicted EY:</span>
            <span className={`font-bold ${status === 'sweet-spot' ? 'text-emerald-400' : status === 'under-extracted' ? 'text-amber-400' : 'text-rose-400'}`}>
              {predictedEY}%
            </span>
          </div>

          <button
            type="button"
            className="p-1 rounded text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Body */}
      {isExpanded && (
        <div className="p-5 space-y-6">
          {/* Top Bar: Recipe Preset & Reset */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-neutral-950/60 p-3 rounded-xl border border-neutral-800/80">
            <div className="flex items-center gap-2 flex-1">
              <Coffee className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <label className="text-xs text-neutral-300 font-medium whitespace-nowrap">Load Profile:</label>
              <select
                value={selectedRecipeId}
                onChange={(e) => handleRecipeSelect(e.target.value)}
                className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1 text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
              >
                <option value="">Manual Calibration (Custom Dose & Yield)</option>
                {recipes.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} · {r.recommendedDose}g in → {r.targetYield}g out
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleReset}
                className="px-2.5 py-1 text-xs text-neutral-400 hover:text-neutral-200 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg flex items-center gap-1 transition-colors"
                title="Reset to default espresso parameters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Interactive Parameters Input Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Dry Dose (g) */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-amber-400" />
                  Dry Coffee Dose (g)
                </span>
                <span className="text-xl font-bold font-mono text-neutral-100">
                  {doseIn.toFixed(1)} <span className="text-xs font-normal text-neutral-500">g</span>
                </span>
              </div>

              {/* Slider */}
              <input
                type="range"
                min="14.0"
                max="24.0"
                step="0.1"
                value={doseIn}
                onChange={(e) => setDoseIn(parseFloat(e.target.value) || 18.0)}
                className="w-full accent-amber-400 cursor-pointer"
              />

              {/* Stepper buttons */}
              <div className="flex items-center justify-between gap-1 pt-1 text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => setDoseIn(prev => Math.max(12, Number((prev - 0.5).toFixed(1))))}
                  className="px-2 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800"
                >
                  -0.5g
                </button>
                <button
                  type="button"
                  onClick={() => setDoseIn(prev => Math.max(12, Number((prev - 0.1).toFixed(1))))}
                  className="px-2 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800"
                >
                  -0.1g
                </button>
                <button
                  type="button"
                  onClick={() => setDoseIn(18.0)}
                  className="px-2 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-400"
                >
                  18g
                </button>
                <button
                  type="button"
                  onClick={() => setDoseIn(prev => Math.min(26, Number((prev + 0.1).toFixed(1))))}
                  className="px-2 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800"
                >
                  +0.1g
                </button>
                <button
                  type="button"
                  onClick={() => setDoseIn(prev => Math.min(26, Number((prev + 0.5).toFixed(1))))}
                  className="px-2 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800"
                >
                  +0.5g
                </button>
              </div>
            </div>

            {/* 2. Target Liquid Yield (g) */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                  <Coffee className="w-3.5 h-3.5 text-amber-400" />
                  Target Liquid Yield (g)
                </span>
                <span className="text-xl font-bold font-mono text-amber-400">
                  {yieldOut.toFixed(1)} <span className="text-xs font-normal text-neutral-500">g</span>
                </span>
              </div>

              {/* Slider */}
              <input
                type="range"
                min="20.0"
                max="60.0"
                step="0.5"
                value={yieldOut}
                onChange={(e) => setYieldOut(parseFloat(e.target.value) || 36.0)}
                className="w-full accent-amber-400 cursor-pointer"
              />

              {/* Quick Ratio Presets */}
              <div className="flex items-center justify-between gap-1 pt-1 text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => applyRatioPreset(1.5)}
                  className="px-1.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800"
                  title="Ristretto 1:1.5"
                >
                  1:1.5
                </button>
                <button
                  type="button"
                  onClick={() => applyRatioPreset(2.0)}
                  className="px-1.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800"
                  title="Normale 1:2.0"
                >
                  1:2.0
                </button>
                <button
                  type="button"
                  onClick={() => applyRatioPreset(2.2)}
                  className="px-1.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800"
                  title="Specialty 1:2.2"
                >
                  1:2.2
                </button>
                <button
                  type="button"
                  onClick={() => applyRatioPreset(2.5)}
                  className="px-1.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800"
                  title="High Yield 1:2.5"
                >
                  1:2.5
                </button>
                <button
                  type="button"
                  onClick={() => applyRatioPreset(2.8)}
                  className="px-1.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800"
                  title="Lungo 1:2.8"
                >
                  1:2.8
                </button>
              </div>
            </div>

            {/* 3. Target Refractometer TDS (%) */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-emerald-400" />
                  Target TDS Refractometer (%)
                </span>
                <span className="text-xl font-bold font-mono text-emerald-400">
                  {tdsPercent.toFixed(1)} <span className="text-xs font-normal text-neutral-500">%</span>
                </span>
              </div>

              {/* Slider */}
              <input
                type="range"
                min="7.5"
                max="12.0"
                step="0.1"
                value={tdsPercent}
                onChange={(e) => setTdsPercent(parseFloat(e.target.value) || 9.5)}
                className="w-full accent-emerald-400 cursor-pointer"
              />

              {/* Quick Strength Presets */}
              <div className="flex items-center justify-between gap-1 pt-1 text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => applyTdsPreset(8.5)}
                  className={`px-1.5 py-1 rounded border text-[10px] ${tdsPercent === 8.5 ? 'bg-emerald-950 text-emerald-300 border-emerald-700' : 'bg-neutral-900 text-neutral-400 border-neutral-800'}`}
                  title="Delicate Turbo Shot (8.5%)"
                >
                  8.5% Light
                </button>
                <button
                  type="button"
                  onClick={() => applyTdsPreset(9.5)}
                  className={`px-1.5 py-1 rounded border text-[10px] ${tdsPercent === 9.5 ? 'bg-emerald-950 text-emerald-300 border-emerald-700' : 'bg-neutral-900 text-neutral-400 border-neutral-800'}`}
                  title="Standard Specialty Balanced (9.5%)"
                >
                  9.5% Balanced
                </button>
                <button
                  type="button"
                  onClick={() => applyTdsPreset(10.5)}
                  className={`px-1.5 py-1 rounded border text-[10px] ${tdsPercent === 10.5 ? 'bg-emerald-950 text-emerald-300 border-emerald-700' : 'bg-neutral-900 text-neutral-400 border-neutral-800'}`}
                  title="Dense Traditional Body (10.5%)"
                >
                  10.5% Dense
                </button>
              </div>
            </div>
          </div>

          {/* Real-time Math Output & Predictive SCA Spectrum Panel */}
          <div className="bg-neutral-950 p-5 rounded-2xl border border-neutral-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-neutral-500 tracking-wider">
                  PREDICTED EXTRACTION METRICS
                </span>
                <div className="flex items-baseline gap-3 mt-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black font-mono tracking-tight text-neutral-100">
                      {predictedEY.toFixed(2)}%
                    </span>
                    <span className="text-xs font-mono text-neutral-400">EY</span>
                  </div>

                  <span className="text-neutral-700 font-mono text-xl">|</span>

                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold font-mono text-amber-400">
                      1:{ratioNumber}
                    </span>
                    <span className="text-xs font-mono text-neutral-400">ratio</span>
                  </div>

                  <span className="text-neutral-700 font-mono text-xl">|</span>

                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-mono text-neutral-300">
                      {solublesGrams}g
                    </span>
                    <span className="text-xs text-neutral-500">solubles</span>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="sm:text-right">
                <span className={`text-xs px-3 py-1 rounded-full font-mono border font-semibold inline-flex items-center gap-1.5 ${statusBadge.badgeClass}`}>
                  {status === 'sweet-spot' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  <span>{statusBadge.label}</span>
                </span>
                <div className="text-[10px] text-neutral-500 font-mono mt-1">
                  SCA Golden Cup Standard: 18.0% – 22.0% EY
                </div>
              </div>
            </div>

            {/* Visual Color-Coded SCA Extraction Gauge Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="relative h-4 rounded-full bg-neutral-900 border border-neutral-800 overflow-hidden flex">
                {/* 14% to 18% Under-extracted zone */}
                <div 
                  className="h-full bg-amber-500/25 border-r border-amber-500/30 flex items-center justify-center text-[9px] font-mono text-amber-300/80 font-bold"
                  style={{ width: `${((18 - 14) / (26 - 14)) * 100}%` }}
                >
                  &lt;18% SOUR
                </div>

                {/* 18% to 22% Golden Cup Sweet Spot */}
                <div 
                  className="h-full bg-emerald-500/35 border-r border-emerald-500/40 flex items-center justify-center text-[9px] font-mono text-emerald-200 font-bold"
                  style={{ width: `${((22 - 18) / (26 - 14)) * 100}%` }}
                >
                  ★ 18% - 22% GOLDEN CUP SWEET SPOT ★
                </div>

                {/* 22% to 26% Over-extracted zone */}
                <div 
                  className="h-full bg-rose-500/25 flex items-center justify-center text-[9px] font-mono text-rose-300/80 font-bold"
                  style={{ width: `${((26 - 22) / (26 - 14)) * 100}%` }}
                >
                  &gt;22% BITTER
                </div>

                {/* Needle Indicator for active predicted EY */}
                <div
                  className="absolute top-0 bottom-0 w-1.5 bg-white shadow-md rounded-full transition-all duration-150 transform -translate-x-1/2 ring-2 ring-neutral-950"
                  style={{ left: `${pointerPercent}%` }}
                />
              </div>

              {/* Axis labels */}
              <div className="flex justify-between text-[10px] font-mono text-neutral-500 px-1">
                <span>14%</span>
                <span className="text-amber-400">18.0% (Lower Limit)</span>
                <span className="text-emerald-400 font-bold">20.0% (Sweet Center)</span>
                <span className="text-rose-400">22.0% (Upper Limit)</span>
                <span>26%</span>
              </div>
            </div>

            {/* Dynamic Extraction Advice & Formula Explanation */}
            <div className="bg-neutral-900/90 p-3 rounded-xl border border-neutral-800 text-xs leading-relaxed space-y-2">
              <div className="flex items-start gap-2 text-neutral-300">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{statusBadge.description}</span>
              </div>

              <div className="pt-2 border-t border-neutral-800/80 flex flex-wrap items-center justify-between text-[11px] font-mono text-neutral-400">
                <span>Formula: EY% = ({yieldOut}g yield × {tdsPercent}% TDS) ÷ {doseIn}g dose = <strong>{predictedEY}%</strong></span>
                <span className="text-neutral-500">Brew Ratio: 1:{(yieldOut / doseIn).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Transfer & Apply Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="text-xs text-neutral-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Transfer modeled ratio directly to active espresso bar tools</span>
            </div>

            <div className="flex items-center gap-2">
              {onOpenShotTimer && (
                <button
                  type="button"
                  onClick={onOpenShotTimer}
                  className="px-3.5 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Scale className="w-3.5 h-3.5 text-amber-400" />
                  <span>Configure Shot Scale</span>
                </button>
              )}

              {onApplyToDialIn && (
                <button
                  type="button"
                  onClick={handleTransferToDialIn}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors"
                >
                  <span>Log Dial-In with this Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
