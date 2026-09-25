import React, { useState } from 'react';
import { DialInLog } from '../../types';

interface ExtractionYieldChartProps {
  logs: DialInLog[];
  onSelectLog?: (log: DialInLog) => void;
}

export const ExtractionYieldChart: React.FC<ExtractionYieldChartProps> = ({ logs, onSelectLog }) => {
  const [hoveredLog, setHoveredLog] = useState<DialInLog | null>(null);

  // Chart bounds:
  // X: Extraction Yield (EY %) from 15.0% to 25.0%
  // Y: TDS (%) from 7.0% to 13.0%
  const minEY = 15.0;
  const maxEY = 25.0;
  const minTDS = 7.0;
  const maxTDS = 13.0;

  const chartWidth = 540;
  const chartHeight = 280;
  const padLeft = 45;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 35;

  const innerW = chartWidth - padLeft - padRight;
  const innerH = chartHeight - padTop - padBottom;

  const scaleX = (ey: number) => {
    const clamped = Math.max(minEY, Math.min(maxEY, ey));
    return padLeft + ((clamped - minEY) / (maxEY - minEY)) * innerW;
  };

  const scaleY = (tds: number) => {
    const clamped = Math.max(minTDS, Math.min(maxTDS, tds));
    return padTop + innerH - ((clamped - minTDS) / (maxTDS - minTDS)) * innerH;
  };

  // Ideal target zone: EY 18% to 22%, TDS 8.5% to 11.5%
  const boxX1 = scaleX(18.0);
  const boxX2 = scaleX(22.0);
  const boxY1 = scaleY(11.5);
  const boxY2 = scaleY(8.5);

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm font-semibold text-neutral-100">SCA Extraction Control Chart</div>
          <div className="text-xs text-neutral-400">Total Dissolved Solids (TDS %) vs. Extraction Yield (EY %)</div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-neutral-300">Sweet Spot (18–22% EY)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-neutral-300">Under/Over Extracted</span>
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg 
          viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
          className="w-full max-w-[640px] h-auto mx-auto select-none"
        >
          {/* Background grid */}
          <rect 
            x={padLeft} 
            y={padTop} 
            width={innerW} 
            height={innerH} 
            fill="#121215" 
            stroke="#27272a" 
            strokeWidth="1" 
          />

          {/* Sweet Spot Box */}
          <rect
            x={boxX1}
            y={boxY1}
            width={boxX2 - boxX1}
            height={boxY2 - boxY1}
            fill="#10b981"
            fillOpacity="0.12"
            stroke="#10b981"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />

          <text
            x={(boxX1 + boxX2) / 2}
            y={(boxY1 + boxY2) / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#34d399"
            fontSize="10"
            fontWeight="600"
            opacity="0.8"
          >
            IDEAL EXTRACTION
          </text>

          {/* Under-extracted label */}
          <text
            x={scaleX(16.5)}
            y={scaleY(10.0)}
            textAnchor="middle"
            fill="#71717a"
            fontSize="9"
          >
            Under-Extracted (Sour)
          </text>

          {/* Over-extracted label */}
          <text
            x={scaleX(23.5)}
            y={scaleY(10.0)}
            textAnchor="middle"
            fill="#71717a"
            fontSize="9"
          >
            Over-Extracted (Bitter)
          </text>

          {/* Grid lines & Y Axis Labels (TDS %) */}
          {[8, 9, 10, 11, 12].map(tds => {
            const y = scaleY(tds);
            return (
              <g key={`y-${tds}`}>
                <line x1={padLeft} y1={y} x2={padLeft + innerW} y2={y} stroke="#27272a" strokeWidth="0.8" strokeDasharray="2 2" />
                <text x={padLeft - 6} y={y + 3} textAnchor="end" fill="#71717a" fontSize="9" fontFamily="monospace">
                  {tds}%
                </text>
              </g>
            );
          })}

          {/* Grid lines & X Axis Labels (EY %) */}
          {[16, 18, 20, 22, 24].map(ey => {
            const x = scaleX(ey);
            return (
              <g key={`x-${ey}`}>
                <line x1={x} y1={padTop} x2={x} y2={padTop + innerH} stroke="#27272a" strokeWidth="0.8" strokeDasharray="2 2" />
                <text x={x} y={padTop + innerH + 14} textAnchor="middle" fill="#71717a" fontSize="9" fontFamily="monospace">
                  {ey}%
                </text>
              </g>
            );
          })}

          {/* Axis Titles */}
          <text 
            x={padLeft + innerW / 2} 
            y={chartHeight - 4} 
            textAnchor="middle" 
            fill="#a1a1aa" 
            fontSize="10" 
            fontWeight="500"
          >
            Extraction Yield (EY %)
          </text>
          
          <text 
            transform={`rotate(-90 ${padLeft - 30} ${padTop + innerH / 2})`}
            x={padLeft - 30} 
            y={padTop + innerH / 2} 
            textAnchor="middle" 
            fill="#a1a1aa" 
            fontSize="10" 
            fontWeight="500"
          >
            TDS (%)
          </text>

          {/* Data Points */}
          {logs.map((log) => {
            const cx = scaleX(log.extractionYieldPercent);
            const cy = scaleY(log.tdsPercent);
            const isSweet = log.status === 'sweet-spot';
            const isHovered = hoveredLog?.id === log.id;

            return (
              <g 
                key={log.id} 
                className="cursor-pointer transition-transform"
                onMouseEnter={() => setHoveredLog(log)}
                onMouseLeave={() => setHoveredLog(null)}
                onClick={() => onSelectLog && onSelectLog(log)}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 7 : 5}
                  fill={isSweet ? '#10b981' : '#f59e0b'}
                  stroke="#ffffff"
                  strokeWidth={isHovered ? 2 : 1}
                  className="transition-all duration-150"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Hovered Point Inspection */}
      {hoveredLog ? (
        <div className="mt-2.5 p-2 bg-neutral-950/80 border border-neutral-800 rounded-lg flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${hoveredLog.status === 'sweet-spot' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span className="font-medium text-neutral-200">{hoveredLog.recipeName}</span>
            <span className="text-neutral-500">· {hoveredLog.baristaName.split(' ')[0]}</span>
          </div>
          <div className="flex items-center gap-3 font-mono">
            <span>Dose: <strong className="text-neutral-200 font-normal">{hoveredLog.doseIn}g</strong></span>
            <span>Yield: <strong className="text-neutral-200 font-normal">{hoveredLog.yieldOut}g</strong></span>
            <span>TDS: <strong className="text-amber-400 font-normal">{hoveredLog.tdsPercent}%</strong></span>
            <span>EY: <strong className="text-emerald-400 font-normal">{hoveredLog.extractionYieldPercent}%</strong></span>
            <span className="text-neutral-400">Score: {hoveredLog.sensoryScores.overallScore}</span>
          </div>
        </div>
      ) : (
        <div className="mt-2 text-center text-[11px] text-neutral-500">
          Hover over data points to inspect specific extraction ratio & TDS metrics
        </div>
      )}
    </div>
  );
};
