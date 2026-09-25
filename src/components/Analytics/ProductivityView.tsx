import React from 'react';
import { useBaristaOS } from '../../context/BaristaOSContext';
import { 
  TrendingUp, 
  Coffee, 
  DollarSign, 
  Clock, 
  Trash2, 
  ArrowUpRight, 
  CheckCircle2,
  BarChart3,
  SlidersHorizontal,
  Users
} from 'lucide-react';
import { ExtractionScatterPlot } from './ExtractionScatterPlot';

export const ProductivityView: React.FC = () => {
  const { dialInLogs, branches, setActiveTab } = useBaristaOS();

  // Hourly throughput simulation
  const hourlyData = [
    { hour: '07:00', shots: 42, pace: 'Peak Rush' },
    { hour: '08:00', shots: 58, pace: 'Peak Rush' },
    { hour: '09:00', shots: 48, pace: 'High' },
    { hour: '10:00', shots: 32, pace: 'Moderate' },
    { hour: '11:00', shots: 26, pace: 'Moderate' },
    { hour: '12:00', shots: 38, pace: 'High' },
    { hour: '13:00', shots: 45, pace: 'Peak Rush' },
    { hour: '14:00', shots: 30, pace: 'Moderate' },
    { hour: '15:00', shots: 22, pace: 'Steady' },
  ];

  const totalShotsToday = hourlyData.reduce((sum, h) => sum + h.shots, 0);
  const avgPricePerDrinkKSh = 380; // Standard Kenyan specialty flat white / cappuccino
  const estimatedRevenueKSh = totalShotsToday * avgPricePerDrinkKSh;
  const wasteSavedKg = 1.4; // Coffee saved through precision digital dial-in vs trial-and-error

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            Café Productivity, Speed of Service & QC Analytics
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Real-time extraction throughput, refractometry calibration trajectories, and espresso revenue
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-2 text-xs bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg font-mono">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-neutral-300">Peak Speed: <strong className="text-neutral-100">58 shots/hr</strong></span>
          </div>
          <button
            onClick={() => setActiveTab('staff')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-200 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>Barista KPI Reports</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="text-xs text-neutral-400">Total Espresso Drinks Today</div>
          <div className="mt-1 flex items-baseline justify-between font-mono">
            <span className="text-2xl font-bold text-neutral-100">{totalShotsToday}</span>
            <span className="text-xs text-emerald-400 flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              +14% vs avg
            </span>
          </div>
          <div className="mt-2 text-[11px] text-neutral-500">
            Across 2 commercial groups
          </div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="text-xs text-neutral-400">Estimated Espresso Sales</div>
          <div className="mt-1 flex items-baseline justify-between font-mono">
            <span className="text-2xl font-bold text-emerald-400">KSh {estimatedRevenueKSh.toLocaleString()}</span>
          </div>
          <div className="mt-2 text-[11px] text-neutral-500">
            Avg KSh 380 per specialty beverage
          </div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="text-xs text-neutral-400">Dial-In Consistency Score</div>
          <div className="mt-1 flex items-baseline justify-between font-mono">
            <span className="text-2xl font-bold text-amber-400">96.2%</span>
            <span className="text-xs text-neutral-400">±0.2g variance</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>High recipe adherence</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="text-xs text-neutral-400">Puck & Purge Waste Saved</div>
          <div className="mt-1 flex items-baseline justify-between font-mono">
            <span className="text-2xl font-bold text-neutral-100">{wasteSavedKg} kg</span>
            <span className="text-xs text-emerald-400">~KSh 3,100</span>
          </div>
          <div className="mt-2 text-[11px] text-neutral-500">
            Saved by 1st-try dial-in accuracy
          </div>
        </div>
      </div>

      {/* D3 Extraction Yield (EY) vs TDS Scatter Plot */}
      <ExtractionScatterPlot logs={dialInLogs} />

      {/* Hourly Flow Chart & Barista Velocity */}
      <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-neutral-100 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              Hourly Espresso Throughput & Rush Dynamics
            </h2>
            <p className="text-xs text-neutral-400">
              Bar load distribution across morning commute and lunchtime rushes
            </p>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="pt-4 pb-2">
          <div className="h-44 flex items-end gap-2 sm:gap-4 justify-between border-b border-neutral-800 pb-2">
            {hourlyData.map((item, idx) => {
              const heightPercent = (item.shots / 60) * 100;
              const isPeak = item.pace === 'Peak Rush';

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-neutral-950 text-neutral-100 text-[10px] font-mono px-2 py-0.5 rounded border border-neutral-800 pointer-events-none whitespace-nowrap z-10">
                    {item.shots} drinks ({item.pace})
                  </div>

                  <div className="w-full max-w-[48px] bg-neutral-950 rounded-t-lg overflow-hidden h-36 flex items-end">
                    <div 
                      className={`w-full transition-all duration-300 rounded-t ${
                        isPeak ? 'bg-amber-400' : 'bg-neutral-700 group-hover:bg-neutral-600'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>

                  <span className="text-[11px] font-mono text-neutral-400">
                    {item.hour}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Multi-Branch Benchmark Table */}
      <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
        <h3 className="font-bold text-sm text-neutral-100">
          Multi-Location Quality & Dial-In Benchmark
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 font-semibold">
                <th className="py-2.5 px-3">Café Location</th>
                <th className="py-2.5 px-3">Manager</th>
                <th className="py-2.5 px-3 font-mono">Today Shots</th>
                <th className="py-2.5 px-3 font-mono">Mean EY%</th>
                <th className="py-2.5 px-3 font-mono">TDS%</th>
                <th className="py-2.5 px-3 text-right">License Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-mono">
              {branches.map(branch => (
                <tr key={branch.id} className="hover:bg-neutral-800/40">
                  <td className="py-3 px-3 font-sans font-semibold text-neutral-200">
                    {branch.name}
                  </td>
                  <td className="py-3 px-3 font-sans text-neutral-400">
                    {branch.manager}
                  </td>
                  <td className="py-3 px-3 text-neutral-100">
                    {branch.id === 'branch-westlands' ? '341 drinks' : branch.id === 'branch-karen' ? '280 drinks' : '210 drinks'}
                  </td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">
                    20.4% EY
                  </td>
                  <td className="py-3 px-3 text-amber-300">
                    9.6% TDS
                  </td>
                  <td className="py-3 px-3 text-right font-sans">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
                      {branch.licenseTier}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
