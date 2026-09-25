import React, { useState } from 'react';
import { useBaristaOS } from '../../context/BaristaOSContext';
import { DialInLog } from '../../types';
import { ExtractionYieldChart } from './ExtractionYieldChart';
import { BrewRatioCalculator } from './BrewRatioCalculator';
import { ShotDeviationAlertsPanel } from './ShotDeviationAlertsPanel';
import { ShiftHandoverPdfModal } from '../Export/ShiftHandoverPdfModal';
import { 
  SlidersHorizontal, 
  Plus, 
  Timer, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Coffee, 
  Search, 
  Filter, 
  ArrowUpRight, 
  Sparkles,
  Calculator,
  FileText,
  ShieldAlert
} from 'lucide-react';

interface DailyQCViewProps {
  onOpenDialInModal: (prefill?: { 
    doseIn?: number; 
    yieldOut?: number; 
    timeSeconds?: number;
    tdsPercent?: number; 
    recipeId?: string;
    adjustmentsMade?: string;
  }) => void;
  onOpenShotTimer: () => void;
}

export const DailyQCView: React.FC<DailyQCViewProps> = ({ 
  onOpenDialInModal, 
  onOpenShotTimer 
}) => {
  const { dialInLogs, recipes, activeBarista } = useBaristaOS();
  const [filterRecipe, setFilterRecipe] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLog, setSelectedLog] = useState<DialInLog | null>(null);
  const [pdfModalOpen, setPdfModalOpen] = useState<boolean>(false);

  // Filter logs
  const filteredLogs = dialInLogs.filter(log => {
    const matchesRecipe = filterRecipe === 'all' || log.recipeId === filterRecipe;
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
    const matchesSearch = 
      log.recipeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.baristaName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.tastingNotes.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRecipe && matchesStatus && matchesSearch;
  });

  // Calculate high-level telemetry
  const totalLogs = dialInLogs.length;
  const sweetSpotCount = dialInLogs.filter(l => l.status === 'sweet-spot').length;
  const sweetSpotRate = totalLogs > 0 ? Math.round((sweetSpotCount / totalLogs) * 100) : 0;
  
  const avgEY = totalLogs > 0 
    ? (dialInLogs.reduce((acc, l) => acc + l.extractionYieldPercent, 0) / totalLogs).toFixed(1)
    : '0.0';

  const avgTDS = totalLogs > 0
    ? (dialInLogs.reduce((acc, l) => acc + l.tdsPercent, 0) / totalLogs).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      {/* Top Banner / Metric Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="text-xs text-neutral-400">Shift QC Compliance</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-emerald-400">{sweetSpotRate}%</span>
            <span className="text-[11px] text-neutral-400">{sweetSpotCount}/{totalLogs} in sweet spot</span>
          </div>
          <div className="mt-2 w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-400 h-full" style={{ width: `${sweetSpotRate}%` }} />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="text-xs text-neutral-400">Average Extraction Yield</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-neutral-100">{avgEY}% EY</span>
            <span className="text-[11px] text-neutral-400">Target: 18.0 - 22.0%</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Optimal SCA extraction zone</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="text-xs text-neutral-400">Refractometer Mean TDS</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-amber-400">{avgTDS}%</span>
            <span className="text-[11px] text-neutral-400">Concentration</span>
          </div>
          <div className="mt-2 text-[11px] text-neutral-400">
            Calculated via optical Brix scale
          </div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="text-xs text-neutral-400">Active Station Barista</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-base font-bold text-neutral-100 truncate">{activeBarista.name.split(' ')[0]}</span>
            <span className="text-[11px] font-mono text-amber-400">{activeBarista.dialInStreakDays}d streak</span>
          </div>
          <div className="mt-2 text-[11px] text-neutral-400 truncate">
            {activeBarista.role} · {activeBarista.totalShotsLogged.toLocaleString()} shots
          </div>
        </div>
      </div>

      {/* Recipe Target Deviation Alerts & Real-Time Notification Center */}
      <ShotDeviationAlertsPanel 
        onOpenDialInWithData={(data) => onOpenDialInModal(data)}
      />

      {/* Pre-Shot Brew Ratio & Predicted Extraction Yield (EY) Calculator */}
      <BrewRatioCalculator 
        onApplyToDialIn={onOpenDialInModal}
        onOpenShotTimer={onOpenShotTimer}
      />

      {/* SCA Extraction Control Chart Section */}
      <ExtractionYieldChart logs={dialInLogs} onSelectLog={(log) => setSelectedLog(log)} />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-neutral-900/60 p-3 rounded-xl border border-neutral-800">
        <div className="flex flex-wrap items-center gap-2">
          {/* Recipe Filter */}
          <select
            value={filterRecipe}
            onChange={(e) => setFilterRecipe(e.target.value)}
            className="bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none"
          >
            <option value="all">All Espresso Profiles</option>
            {recipes.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>

          {/* Status Segmented Buttons */}
          <div className="flex items-center gap-1 p-0.5 bg-neutral-950 rounded-lg border border-neutral-800">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-2.5 py-1 text-xs rounded transition-colors ${
                filterStatus === 'all' ? 'bg-neutral-800 text-neutral-100 font-medium' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('sweet-spot')}
              className={`px-2.5 py-1 text-xs rounded transition-colors ${
                filterStatus === 'sweet-spot' ? 'bg-emerald-950 text-emerald-300 font-medium' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Sweet Spot
            </button>
            <button
              onClick={() => setFilterStatus('under-extracted')}
              className={`px-2.5 py-1 text-xs rounded transition-colors ${
                filterStatus === 'under-extracted' ? 'bg-amber-950 text-amber-300 font-medium' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Under-Extracted
            </button>
          </div>
        </div>

        {/* Right side search + action */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-500" />
            <input
              type="text"
              placeholder="Search notes, barista..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
            />
          </div>

          <button
            onClick={onOpenShotTimer}
            className="p-1.5 text-xs text-neutral-300 hover:text-neutral-100 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors"
            title="Launch Stopwatch & Flow Scale"
          >
            <Timer className="w-4 h-4 text-amber-400" />
          </button>

          <button
            onClick={() => setPdfModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-200 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition-colors whitespace-nowrap"
            title="Export Shift Handover PDF Report"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Export to PDF</span>
          </button>

          <button
            onClick={() => onOpenDialInModal()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Dial-In</span>
          </button>
        </div>
      </div>

      {/* Shift Handover PDF Export Modal */}
      <ShiftHandoverPdfModal 
        isOpen={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
        defaultType="qc"
      />

      {/* QC Logs Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-950/60 text-neutral-400 font-semibold">
                <th className="py-3 px-4">Timestamp & Profile</th>
                <th className="py-3 px-3">Barista</th>
                <th className="py-3 px-3 font-mono">Dose → Yield</th>
                <th className="py-3 px-3 font-mono">Time</th>
                <th className="py-3 px-3 font-mono">Grind / Temp</th>
                <th className="py-3 px-3 font-mono">TDS</th>
                <th className="py-3 px-3 font-mono">EY %</th>
                <th className="py-3 px-3">Sensory & Notes</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-neutral-500">
                    No calibration logs match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => {
                  const isSweet = log.status === 'sweet-spot';
                  const isUnder = log.status === 'under-extracted';

                  const matchedRecipe = recipes.find(r => r.id === log.recipeId);
                  const timeDelta = matchedRecipe ? Number((log.timeSeconds - matchedRecipe.targetTimeSeconds).toFixed(1)) : null;
                  const yieldDelta = matchedRecipe ? Number((log.yieldOut - matchedRecipe.targetYield).toFixed(1)) : null;
                  const isTimeDeviated = timeDelta !== null && Math.abs(timeDelta) >= 2.5;
                  const isYieldDeviated = yieldDelta !== null && Math.abs(yieldDelta) >= 2.0;

                  return (
                    <tr 
                      key={log.id} 
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-neutral-800/40 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-neutral-200 flex items-center gap-1.5">
                          <span>{log.recipeName}</span>
                          {(isTimeDeviated || isYieldDeviated) && (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                              DRIFT
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-neutral-500 font-mono">{log.timestamp}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-neutral-300 font-medium">{log.baristaName.split(' ')[0]}</div>
                        <div className="text-[10px] text-neutral-500">{log.baristaName.split(' ')[1] || ''}</div>
                      </td>
                      <td className="py-3 px-3 font-mono text-neutral-200 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{log.doseIn}g</span> <span className="text-neutral-500">→</span> <span>{log.yieldOut}g</span>
                          {isYieldDeviated && (
                            <span 
                              className="text-[9px] font-mono px-1 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold"
                              title={`Yield variance: ${yieldDelta! > 0 ? `+${yieldDelta}` : yieldDelta}g from recipe target (${matchedRecipe?.targetYield}g)`}
                            >
                              {yieldDelta! > 0 ? `+${yieldDelta}g` : `${yieldDelta}g`}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-neutral-500">1:{(log.yieldOut / log.doseIn).toFixed(2)}</div>
                      </td>
                      <td className="py-3 px-3 font-mono text-neutral-200 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{log.timeSeconds}s</span>
                          {isTimeDeviated && (
                            <span 
                              className="text-[9px] font-mono px-1 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold"
                              title={`Contact time variance: ${timeDelta! > 0 ? `+${timeDelta}` : timeDelta}s from recipe target (${matchedRecipe?.targetTimeSeconds}s)`}
                            >
                              {timeDelta! > 0 ? `+${timeDelta}s` : `${timeDelta}s`}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-neutral-300 whitespace-nowrap">
                        <div className="truncate max-w-[110px]" title={log.grindSetting}>{log.grindSetting}</div>
                        <div className="text-[10px] text-neutral-500">{log.brewTemp}°C · {log.pressureBar} bar</div>
                      </td>
                      <td className="py-3 px-3 font-mono text-amber-300 font-semibold whitespace-nowrap">
                        {log.tdsPercent}%
                      </td>
                      <td className="py-3 px-3 font-mono whitespace-nowrap">
                        <span className={`font-bold ${isSweet ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {log.extractionYieldPercent}%
                        </span>
                      </td>
                      <td className="py-3 px-3 max-w-[200px]">
                        <div className="truncate text-neutral-300 text-[11px]">{log.tastingNotes}</div>
                        <div className="text-[10px] text-neutral-500 flex items-center gap-2 mt-0.5">
                          <span>Cup: <strong>{log.sensoryScores.overallScore}</strong>/100</span>
                          <span>Acid: {log.sensoryScores.acidity}</span>
                          <span>Sweet: {log.sensoryScores.sweetness}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded ${
                          isSweet 
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                            : isUnder 
                            ? 'bg-amber-950 text-amber-300 border border-amber-800' 
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}>
                          {isSweet && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                          {log.status === 'sweet-spot' ? 'Sweet Spot' : log.status === 'under-extracted' ? 'Under-Ext' : 'Over-Ext'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Log Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg p-6 overflow-hidden shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div>
                <h3 className="font-bold text-base text-neutral-100">{selectedLog.recipeName}</h3>
                <p className="text-xs text-neutral-400 font-mono">{selectedLog.timestamp} · Calibrated by {selectedLog.baristaName}</p>
              </div>
              <button 
                onClick={() => setSelectedLog(null)}
                className="text-neutral-400 hover:text-neutral-200 text-sm"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center bg-neutral-950 p-3 rounded-xl border border-neutral-800">
              <div>
                <div className="text-[10px] text-neutral-400">DOSE IN</div>
                <div className="font-mono font-bold text-neutral-100">{selectedLog.doseIn}g</div>
              </div>
              <div>
                <div className="text-[10px] text-neutral-400">YIELD OUT</div>
                <div className="font-mono font-bold text-neutral-100">{selectedLog.yieldOut}g</div>
              </div>
              <div>
                <div className="text-[10px] text-neutral-400">TDS %</div>
                <div className="font-mono font-bold text-amber-400">{selectedLog.tdsPercent}%</div>
              </div>
              <div>
                <div className="text-[10px] text-neutral-400">EY %</div>
                <div className="font-mono font-bold text-emerald-400">{selectedLog.extractionYieldPercent}%</div>
              </div>
            </div>

            {/* Target vs Actual Deviation Inspector */}
            {(() => {
              const matched = recipes.find(r => r.id === selectedLog.recipeId);
              if (!matched) return null;

              const tDelta = Number((selectedLog.timeSeconds - matched.targetTimeSeconds).toFixed(1));
              const yDelta = Number((selectedLog.yieldOut - matched.targetYield).toFixed(1));
              const hasDeviation = Math.abs(tDelta) >= 2.5 || Math.abs(yDelta) >= 2.0;

              return (
                <div className={`p-3 rounded-xl border ${
                  hasDeviation ? 'bg-rose-950/30 border-rose-800/80' : 'bg-neutral-950 border-neutral-800'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-neutral-200 flex items-center gap-1.5">
                      {hasDeviation ? <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      Recipe Targets Alignment
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      hasDeviation ? 'bg-rose-900/60 text-rose-300' : 'bg-emerald-900/60 text-emerald-300'
                    }`}>
                      {hasDeviation ? 'DEVIATION DETECTED' : 'IN TARGET RANGE'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2 rounded-lg bg-neutral-900/80 border border-neutral-800/80">
                      <span className="text-[10px] text-neutral-400 block font-sans">Contact Time</span>
                      <span className="text-neutral-100 font-bold">{selectedLog.timeSeconds}s</span>
                      <span className="text-[10px] text-neutral-400 block font-sans">
                        Target: {matched.targetTimeSeconds}s ({tDelta > 0 ? `+${tDelta}` : tDelta}s)
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-neutral-900/80 border border-neutral-800/80">
                      <span className="text-[10px] text-neutral-400 block font-sans">Beverage Yield</span>
                      <span className="text-neutral-100 font-bold">{selectedLog.yieldOut}g</span>
                      <span className="text-[10px] text-neutral-400 block font-sans">
                        Target: {matched.targetYield}g ({yDelta > 0 ? `+${yDelta}` : yDelta}g)
                      </span>
                    </div>
                  </div>

                  {hasDeviation && (
                    <div className="mt-2 text-[11px] text-neutral-300">
                      <div className="text-amber-300 font-semibold mb-0.5">Recommended Adjustment:</div>
                      {tDelta <= -2.5 && "Shot ran too fast. Adjust grinder 1-2 notches finer or check puck distribution."}
                      {tDelta >= 2.5 && "Shot choked or ran slow. Adjust grinder 1-2 notches coarser and verify shower screen."}
                      {Math.abs(tDelta) < 2.5 && yDelta !== 0 && "Time within target but yield deviated. Calibrate volumetric cutoff button."}
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="space-y-2 text-xs">
              <div className="text-neutral-400">Sensory Notes:</div>
              <p className="text-neutral-200 bg-neutral-950 p-2.5 rounded-lg border border-neutral-800">
                {selectedLog.tastingNotes}
              </p>

              <div className="text-neutral-400 mt-2">Adjustments Made on Bar:</div>
              <p className="text-neutral-300 bg-neutral-950 p-2.5 rounded-lg border border-neutral-800">
                {selectedLog.adjustmentsMade}
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-200 rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
