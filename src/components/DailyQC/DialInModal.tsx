import React, { useState, useEffect } from 'react';
import { useBaristaOS } from '../../context/BaristaOSContext';
import { 
  X, 
  Check, 
  Flame, 
  AlertCircle, 
  Database, 
  Wifi, 
  WifiOff, 
  Clock, 
  CheckCircle2 
} from 'lucide-react';

interface DialInModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    timeSeconds?: number;
    yieldGrams?: number;
    doseIn?: number;
    tdsPercent?: number;
    recipeId?: string;
    adjustmentsMade?: string;
  };
}

export const DialInModal: React.FC<DialInModalProps> = ({ 
  isOpen, 
  onClose,
  initialData
}) => {
  const { recipes, activeBarista, addDialInLog, isOnline } = useBaristaOS();

  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(recipes[0]?.id || '');
  const [doseIn, setDoseIn] = useState<number>(18.5);
  const [yieldOut, setYieldOut] = useState<number>(38.0);
  const [timeSeconds, setTimeSeconds] = useState<number>(28);
  const [grindSetting, setGrindSetting] = useState<string>('Mythos II: 2.35');
  const [brewTemp, setBrewTemp] = useState<number>(93.5);
  const [pressureBar, setPressureBar] = useState<number>(9.0);
  const [tdsPercent, setTdsPercent] = useState<number>(9.8);
  const [acidity, setAcidity] = useState<number>(4.5);
  const [sweetness, setSweetness] = useState<number>(4.5);
  const [body, setBody] = useState<number>(4.0);
  const [balance, setBalance] = useState<number>(4.5);
  const [cleanliness, setCleanliness] = useState<number>(4.8);
  const [overallScore, setOverallScore] = useState<number>(92);
  const [tastingNotes, setTastingNotes] = useState<string>('Vibrant stone fruit and blackcurrant acidity balanced by cane sugar sweetness.');
  const [adjustmentsMade, setAdjustmentsMade] = useState<string>('Dialed in for morning service; WDT distribution applied.');
  const [approvedForShift, setApprovedForShift] = useState<boolean>(true);

  // Apply initial data from shot timer or brew ratio calculator if provided
  useEffect(() => {
    if (initialData) {
      if (initialData.timeSeconds !== undefined) setTimeSeconds(initialData.timeSeconds);
      if (initialData.yieldGrams !== undefined) setYieldOut(initialData.yieldGrams);
      if (initialData.doseIn !== undefined) setDoseIn(initialData.doseIn);
      if (initialData.tdsPercent !== undefined) setTdsPercent(initialData.tdsPercent);
      if (initialData.recipeId) setSelectedRecipeId(initialData.recipeId);
      if (initialData.adjustmentsMade !== undefined) setAdjustmentsMade(initialData.adjustmentsMade);
    }
  }, [initialData]);

  if (!isOpen) return null;

  // Selected recipe details
  const currentRecipe = recipes.find(r => r.id === selectedRecipeId) || recipes[0];

  // Calculated Extraction Yield: (Yield * TDS) / Dose
  const calculatedEY = doseIn > 0 ? Number(((yieldOut * tdsPercent) / doseIn).toFixed(2)) : 0;

  // Dynamic extraction diagnosis
  let diagnosisText = '';
  let statusBadgeColor = 'text-emerald-400 bg-emerald-950/60 border-emerald-800';
  let statusLabel = 'Ideal Sweet Spot';

  if (calculatedEY < 18.0) {
    statusLabel = 'Under-Extracted (Sour/Thin)';
    statusBadgeColor = 'text-amber-400 bg-amber-950/60 border-amber-800';
    diagnosisText = 'Extraction Yield is below 18.0%. Recommend: Grind 0.5 notch finer, raise water temp +0.5°C, or extend yield by +2g to dissolve more sugars.';
  } else if (calculatedEY > 22.0) {
    statusLabel = 'Over-Extracted (Dry/Bitter)';
    statusBadgeColor = 'text-rose-400 bg-rose-950/60 border-rose-800';
    diagnosisText = 'Extraction Yield exceeds 22.0%. Recommend: Grind 0.5 notch coarser, shorten yield by -2g, or lower temperature to reduce harsh tannins.';
  } else {
    diagnosisText = 'Balanced extraction within SCA Specialty Golden Cup standard (18% - 22% EY). Excellent flavor clarity.';
  }

  const handleRecipeChange = (recId: string) => {
    setSelectedRecipeId(recId);
    const rec = recipes.find(r => r.id === recId);
    if (rec) {
      setDoseIn(rec.recommendedDose);
      setYieldOut(rec.targetYield);
      setTimeSeconds(rec.targetTimeSeconds);
      setGrindSetting(rec.grindSetting);
      setBrewTemp(rec.tempCelsius);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addDialInLog({
      recipeId: currentRecipe?.id || 'rec-custom',
      recipeName: currentRecipe?.name || 'Custom Espresso',
      baristaName: activeBarista.name,
      doseIn,
      yieldOut,
      timeSeconds,
      grindSetting,
      brewTemp,
      pressureBar,
      tdsPercent,
      status: calculatedEY < 18 ? 'under-extracted' : calculatedEY > 22 ? 'over-extracted' : 'sweet-spot',
      sensoryScores: {
        acidity,
        sweetness,
        body,
        balance,
        cleanliness,
        overallScore
      },
      tastingNotes,
      adjustmentsMade,
      approvedForShift
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-2xl my-8 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/70">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <h2 className="text-base font-bold text-neutral-100">
                Log Espresso Dial-In & QC Calibration
              </h2>

              {/* Online/Offline Badge */}
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                isOnline 
                  ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/80' 
                  : 'bg-amber-950/80 text-amber-300 border-amber-800/80'
              }`}>
                {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3 text-amber-400" />}
                <span>{isOnline ? 'Online Synced' : 'Offline (IndexedDB)'}</span>
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Calibrated by {activeBarista.name} · {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Offline Notice Banner if offline */}
        {!isOnline && (
          <div className="bg-amber-950/30 border-b border-amber-500/20 px-6 py-2 flex items-center gap-2 text-xs text-amber-300">
            <Database className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Café network offline. Dial-in will be saved locally into IndexedDB and synced upon reconnection.</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Recipe Selection */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Select Espresso Recipe / Origin
            </label>
            <select
              value={selectedRecipeId}
              onChange={(e) => handleRecipeChange(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-amber-400"
            >
              {recipes.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.variety} · {r.process} · {r.region})
                </option>
              ))}
            </select>
          </div>

          {/* Core Extraction Parameters Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-950/70 p-4 rounded-xl border border-neutral-800">
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">Dose In (g)</label>
              <input
                type="number"
                step="0.1"
                min="10"
                max="26"
                value={doseIn}
                onChange={(e) => setDoseIn(parseFloat(e.target.value) || 0)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 font-mono text-sm text-neutral-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">Yield Out (g)</label>
              <input
                type="number"
                step="0.1"
                min="15"
                max="60"
                value={yieldOut}
                onChange={(e) => setYieldOut(parseFloat(e.target.value) || 0)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 font-mono text-sm text-amber-400 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">Contact Time (s)</label>
              <input
                type="number"
                step="1"
                min="10"
                max="60"
                value={timeSeconds}
                onChange={(e) => setTimeSeconds(parseInt(e.target.value) || 0)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 font-mono text-sm text-neutral-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">TDS Refractometer (%)</label>
              <input
                type="number"
                step="0.05"
                min="5"
                max="15"
                value={tdsPercent}
                onChange={(e) => setTdsPercent(parseFloat(e.target.value) || 0)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 font-mono text-sm text-emerald-400 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Real-time Math Output: Extraction Yield (EY %) */}
          <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-neutral-500 tracking-wider">
                  SCA EXTRACTION YIELD (EY %)
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-black font-mono text-neutral-100">
                    {calculatedEY.toFixed(2)}%
                  </span>
                  <span className="text-xs font-mono text-neutral-400">
                    Ratio 1:{(doseIn > 0 ? (yieldOut / doseIn).toFixed(2) : '0')}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className={`text-xs px-2.5 py-1 rounded-full font-mono border font-medium ${statusBadgeColor}`}>
                  {statusLabel}
                </span>
                <div className="text-[10px] text-neutral-500 font-mono mt-1">Golden Cup: 18.0 - 22.0%</div>
              </div>
            </div>

            <div className="text-xs text-neutral-300 bg-neutral-900/90 p-2.5 rounded-lg border border-neutral-800/80 leading-relaxed flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{diagnosisText}</span>
            </div>
          </div>

          {/* Machine & Environmental Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">Grinder Collar Setting</label>
              <input
                type="text"
                value={grindSetting}
                onChange={(e) => setGrindSetting(e.target.value)}
                placeholder="e.g. Mahlkönig: 2.35"
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">Boiler Temp (°C)</label>
              <input
                type="number"
                step="0.1"
                value={brewTemp}
                onChange={(e) => setBrewTemp(parseFloat(e.target.value) || 0)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">Group Pressure (Bar)</label>
              <input
                type="number"
                step="0.1"
                value={pressureBar}
                onChange={(e) => setPressureBar(parseFloat(e.target.value) || 0)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Sensory Calibration Sliders (1 - 5) */}
          <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-300">Sensory Evaluation Scores (1 to 5)</span>
              <div className="flex items-center gap-2">
                <span className="text-neutral-400">Total Cup Score:</span>
                <span className="text-sm font-bold font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                  {overallScore} / 100
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div>
                <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                  <span>Acidity</span>
                  <span className="font-mono text-amber-400">{acidity}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.1"
                  value={acidity}
                  onChange={(e) => setAcidity(parseFloat(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                  <span>Sweetness</span>
                  <span className="font-mono text-amber-400">{sweetness}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.1"
                  value={sweetness}
                  onChange={(e) => setSweetness(parseFloat(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                  <span>Body</span>
                  <span className="font-mono text-amber-400">{body}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.1"
                  value={body}
                  onChange={(e) => setBody(parseFloat(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                  <span>Balance</span>
                  <span className="font-mono text-amber-400">{balance}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.1"
                  value={balance}
                  onChange={(e) => setBalance(parseFloat(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                  <span>Cleanliness</span>
                  <span className="font-mono text-amber-400">{cleanliness}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.1"
                  value={cleanliness}
                  onChange={(e) => setCleanliness(parseFloat(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
              <span className="text-[11px] text-neutral-400">Calibrated Cup Quality:</span>
              <input
                type="number"
                min="50"
                max="100"
                value={overallScore}
                onChange={(e) => setOverallScore(parseInt(e.target.value) || 0)}
                className="w-20 bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-center font-mono text-neutral-100"
              />
            </div>
          </div>

          {/* Tasting & Adjustments */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Sensory & Flavor Notes
              </label>
              <input
                type="text"
                value={tastingNotes}
                onChange={(e) => setTastingNotes(e.target.value)}
                placeholder="e.g. Crisp blackcurrant, Meyer lemon, cane sugar sweetness..."
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Calibration Adjustments Logged
              </label>
              <input
                type="text"
                value={adjustmentsMade}
                onChange={(e) => setAdjustmentsMade(e.target.value)}
                placeholder="e.g. Purged 15g, adjusted collar -0.15 notches, enforced needle WDT"
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Approval Checkbox */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="approveCheck"
              checked={approvedForShift}
              onChange={(e) => setApprovedForShift(e.target.checked)}
              className="w-4 h-4 accent-amber-400 rounded"
            />
            <label htmlFor="approveCheck" className="text-xs text-neutral-300 select-none">
              Approve this recipe calibration for active café service shift
            </label>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span>Persisted to IndexedDB</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow"
              >
                <Check className="w-4 h-4" />
                <span>Save Dial-In Log</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
