import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { DialInLog } from '../../types';
import { 
  SlidersHorizontal, 
  Target, 
  Sparkles, 
  Filter, 
  Coffee, 
  User, 
  Info, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw,
  Zap,
  TrendingUp,
  Award
} from 'lucide-react';

interface ExtractionScatterPlotProps {
  logs: DialInLog[];
  onSelectLog?: (log: DialInLog) => void;
}

interface TooltipData {
  log: DialInLog;
  x: number;
  y: number;
}

export const ExtractionScatterPlot: React.FC<ExtractionScatterPlotProps> = ({ logs, onSelectLog }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Filters & Toggles
  const [selectedRecipeFilter, setSelectedRecipeFilter] = useState<string>('all');
  const [selectedBaristaFilter, setSelectedBaristaFilter] = useState<string>('all');
  const [showTargetZone, setShowTargetZone] = useState<boolean>(true);
  const [showTrajectory, setShowTrajectory] = useState<boolean>(true);
  const [selectedLog, setSelectedLog] = useState<DialInLog | null>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  // Extract distinct recipes & baristas for dropdowns
  const recipesList = useMemo(() => {
    const map = new Map<string, string>();
    logs.forEach(l => map.set(l.recipeId, l.recipeName));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [logs]);

  const baristasList = useMemo(() => {
    const set = new Set<string>();
    logs.forEach(l => set.add(l.baristaName));
    return Array.from(set);
  }, [logs]);

  // Filtered dataset
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      if (selectedRecipeFilter !== 'all' && log.recipeId !== selectedRecipeFilter) return false;
      if (selectedBaristaFilter !== 'all' && log.baristaName !== selectedBaristaFilter) return false;
      return true;
    }).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [logs, selectedRecipeFilter, selectedBaristaFilter]);

  // Summary statistics
  const stats = useMemo(() => {
    if (filteredLogs.length === 0) {
      return { total: 0, sweetSpotRate: 0, avgEY: 0, avgTDS: 0, avgScore: 0 };
    }
    const sweetSpotCount = filteredLogs.filter(
      l => l.extractionYieldPercent >= 18.0 && l.extractionYieldPercent <= 22.0 && l.tdsPercent >= 8.5 && l.tdsPercent <= 10.5
    ).length;
    const avgEY = filteredLogs.reduce((acc, l) => acc + l.extractionYieldPercent, 0) / filteredLogs.length;
    const avgTDS = filteredLogs.reduce((acc, l) => acc + l.tdsPercent, 0) / filteredLogs.length;
    const avgScore = filteredLogs.reduce((acc, l) => acc + l.sensoryScores.overallScore, 0) / filteredLogs.length;

    return {
      total: filteredLogs.length,
      sweetSpotRate: Math.round((sweetSpotCount / filteredLogs.length) * 100),
      avgEY: parseFloat(avgEY.toFixed(2)),
      avgTDS: parseFloat(avgTDS.toFixed(2)),
      avgScore: Math.round(avgScore)
    };
  }, [filteredLogs]);

  // D3 Render Effect
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = containerRef.current.clientWidth || 700;
    const height = 420;

    svg.attr('viewBox', `0 0 ${width} ${height}`)
       .attr('width', '100%')
       .attr('height', height);

    const margin = { top: 35, right: 35, bottom: 55, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X scale: Extraction Yield (%)
    const xMin = Math.min(15.0, d3.min(filteredLogs, d => d.extractionYieldPercent) ?? 15.0) - 0.5;
    const xMax = Math.max(24.5, d3.max(filteredLogs, d => d.extractionYieldPercent) ?? 24.5) + 0.5;
    const xScale = d3.scaleLinear()
      .domain([Math.min(15.0, xMin), Math.max(24.5, xMax)])
      .range([0, innerWidth]);

    // Y scale: Total Dissolved Solids (%)
    const yMin = Math.min(7.5, d3.min(filteredLogs, d => d.tdsPercent) ?? 7.5) - 0.4;
    const yMax = Math.max(11.5, d3.max(filteredLogs, d => d.tdsPercent) ?? 11.5) + 0.4;
    const yScale = d3.scaleLinear()
      .domain([Math.min(7.5, yMin), Math.max(11.5, yMax)])
      .range([innerHeight, 0]);

    // Subtle gridlines
    const xGrid = d3.axisBottom(xScale).ticks(8).tickSize(-innerHeight).tickFormat(() => '');
    const yGrid = d3.axisLeft(yScale).ticks(6).tickSize(-innerWidth).tickFormat(() => '');

    g.append('g')
      .attr('class', 'x-grid')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xGrid)
      .selectAll('line')
      .attr('stroke', 'rgba(255, 255, 255, 0.05)')
      .attr('stroke-dasharray', '2,2');

    g.append('g')
      .attr('class', 'y-grid')
      .call(yGrid)
      .selectAll('line')
      .attr('stroke', 'rgba(255, 255, 255, 0.05)')
      .attr('stroke-dasharray', '2,2');

    // Remove domain lines for grid groups
    g.selectAll('.x-grid path, .y-grid path').remove();

    // SCA Specialty Golden Cup Target Zone Box (18.0% - 22.0% EY, 8.5% - 10.5% TDS)
    if (showTargetZone) {
      const targetZoneX = xScale(18.0);
      const targetZoneW = xScale(22.0) - xScale(18.0);
      const targetZoneY = yScale(10.5);
      const targetZoneH = yScale(8.5) - yScale(10.5);

      // Gradient definition for the sweet spot box
      const defs = svg.append('defs');
      const gradient = defs.append('linearGradient')
        .attr('id', 'goldenZoneGradient')
        .attr('x1', '0%').attr('y1', '0%')
        .attr('x2', '100%').attr('y2', '100%');

      gradient.append('stop').attr('offset', '0%').attr('stop-color', '#10b981').attr('stop-opacity', 0.12);
      gradient.append('stop').attr('offset', '100%').attr('stop-color', '#059669').attr('stop-opacity', 0.05);

      // Shaded Sweet Spot Box
      g.append('rect')
        .attr('x', targetZoneX)
        .attr('y', targetZoneY)
        .attr('width', targetZoneW)
        .attr('height', targetZoneH)
        .attr('rx', 8)
        .attr('fill', 'url(#goldenZoneGradient)')
        .attr('stroke', '#10b981')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '4,4')
        .attr('opacity', 0.85);

      // Target Zone Title Label inside box
      g.append('text')
        .attr('x', targetZoneX + targetZoneW / 2)
        .attr('y', targetZoneY + 18)
        .attr('text-anchor', 'middle')
        .attr('fill', '#34d399')
        .attr('font-size', '11px')
        .attr('font-weight', '600')
        .attr('letter-spacing', '0.04em')
        .text('SCA GOLDEN CUP TARGET ZONE');

      g.append('text')
        .attr('x', targetZoneX + targetZoneW / 2)
        .attr('y', targetZoneY + 32)
        .attr('text-anchor', 'middle')
        .attr('fill', '#10b981')
        .attr('font-size', '9px')
        .attr('font-family', 'monospace')
        .attr('opacity', 0.8)
        .text('18.0% - 22.0% EY · 8.5% - 10.5% TDS');

      // Under-extracted zone label (<18%)
      g.append('text')
        .attr('x', xScale(16.5))
        .attr('y', innerHeight - 12)
        .attr('text-anchor', 'middle')
        .attr('fill', '#f59e0b')
        .attr('font-size', '10px')
        .attr('font-family', 'monospace')
        .attr('opacity', 0.6)
        .text('UNDER-EXTRACTED (<18%)');

      // Over-extracted zone label (>22%)
      g.append('text')
        .attr('x', xScale(23.2))
        .attr('y', innerHeight - 12)
        .attr('text-anchor', 'middle')
        .attr('fill', '#f43f5e')
        .attr('font-size', '10px')
        .attr('font-family', 'monospace')
        .attr('opacity', 0.6)
        .text('OVER-EXTRACTED (>22%)');
    }

    // Trajectory Line connecting chronological calibrations
    if (showTrajectory && filteredLogs.length > 1) {
      const lineGenerator = d3.line<DialInLog>()
        .x(d => xScale(d.extractionYieldPercent))
        .y(d => yScale(d.tdsPercent))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(filteredLogs)
        .attr('fill', 'none')
        .attr('stroke', 'rgba(251, 191, 36, 0.4)')
        .attr('stroke-width', 1.8)
        .attr('stroke-dasharray', '3,3')
        .attr('d', lineGenerator);
    }

    // Color mapper for status
    const getColor = (status: DialInLog['status']) => {
      switch (status) {
        case 'sweet-spot': return '#10b981'; // Emerald
        case 'under-extracted': return '#f59e0b'; // Amber
        case 'over-extracted': return '#f43f5e'; // Rose
        case 'channeling': return '#c084fc'; // Purple
        default: return '#38bdf8';
      }
    };

    // Plot Points with interactive events
    const pointsGroup = g.append('g').attr('class', 'scatter-points');

    const circles = pointsGroup.selectAll('.qc-point')
      .data(filteredLogs)
      .enter()
      .append('g')
      .attr('class', 'qc-point-group')
      .attr('transform', d => `translate(${xScale(d.extractionYieldPercent)},${yScale(d.tdsPercent)})`)
      .style('cursor', 'pointer');

    // Pulsing outer halo for the most recent log
    const latestLog = filteredLogs[filteredLogs.length - 1];
    if (latestLog) {
      pointsGroup.selectAll('.latest-pulse')
        .data([latestLog])
        .enter()
        .append('circle')
        .attr('class', 'latest-pulse')
        .attr('cx', xScale(latestLog.extractionYieldPercent))
        .attr('cy', yScale(latestLog.tdsPercent))
        .attr('r', 14)
        .attr('fill', 'none')
        .attr('stroke', getColor(latestLog.status))
        .attr('stroke-width', 2)
        .attr('opacity', 0.6)
        .append('animate')
        .attr('attributeName', 'r')
        .attr('values', '9;18;9')
        .attr('dur', '2.4s')
        .attr('repeatCount', 'indefinite');
    }

    // Outer glow / selection circle
    circles.append('circle')
      .attr('r', d => (selectedLog?.id === d.id ? 12 : 8))
      .attr('fill', d => getColor(d.status))
      .attr('opacity', d => (selectedLog?.id === d.id ? 0.35 : 0.15));

    // Main scatter dot
    circles.append('circle')
      .attr('r', d => {
        // Size proportional to cup score (range 5.5 to 8.5)
        const baseRadius = 6;
        const scoreBonus = ((d.sensoryScores.overallScore - 60) / 40) * 2.5;
        return Math.max(5, baseRadius + scoreBonus);
      })
      .attr('fill', d => getColor(d.status))
      .attr('stroke', d => (d.approvedForShift ? '#ffffff' : '#0a0a0a'))
      .attr('stroke-width', d => (d.approvedForShift ? 2 : 1.5))
      .attr('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))');

    // Inner white dot for shift-approved shots
    circles.filter(d => d.approvedForShift)
      .append('circle')
      .attr('r', 2)
      .attr('fill', '#ffffff');

    // Hover & Click Interactions
    circles
      .on('pointerenter', function(event, d) {
        d3.select(this).select('circle:nth-child(2)')
          .transition()
          .duration(150)
          .attr('transform', 'scale(1.3)');

        const [svgX, svgY] = d3.pointer(event, svgRef.current);
        setTooltip({ log: d, x: svgX, y: svgY });
      })
      .on('pointermove', function(event) {
        const [svgX, svgY] = d3.pointer(event, svgRef.current);
        setTooltip(prev => prev ? { ...prev, x: svgX, y: svgY } : null);
      })
      .on('pointerleave', function() {
        d3.select(this).select('circle:nth-child(2)')
          .transition()
          .duration(150)
          .attr('transform', 'scale(1)');

        setTooltip(null);
      })
      .on('click', function(_event, d) {
        setSelectedLog(d);
        if (onSelectLog) onSelectLog(d);
      });

    // Bottom Axis: Extraction Yield (%)
    const xAxis = d3.axisBottom(xScale)
      .ticks(width < 500 ? 5 : 9)
      .tickFormat(d => `${d}%`);

    const xAxisGroup = g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);

    xAxisGroup.selectAll('text')
      .attr('fill', '#a3a3a3')
      .attr('font-size', '11px')
      .attr('font-family', 'monospace');

    xAxisGroup.selectAll('line')
      .attr('stroke', '#404040');

    xAxisGroup.select('.domain')
      .attr('stroke', '#404040');

    // X Axis Title
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 42)
      .attr('text-anchor', 'middle')
      .attr('fill', '#e5e5e5')
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .attr('letter-spacing', '0.02em')
      .text('Extraction Yield (EY %) → (Liquid Yield × Refractometer TDS %) ÷ Dry Dose');

    // Left Axis: Total Dissolved Solids (%)
    const yAxis = d3.axisLeft(yScale)
      .ticks(6)
      .tickFormat(d => `${d}%`);

    const yAxisGroup = g.append('g').call(yAxis);

    yAxisGroup.selectAll('text')
      .attr('fill', '#a3a3a3')
      .attr('font-size', '11px')
      .attr('font-family', 'monospace');

    yAxisGroup.selectAll('line')
      .attr('stroke', '#404040');

    yAxisGroup.select('.domain')
      .attr('stroke', '#404040');

    // Y Axis Title
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -44)
      .attr('text-anchor', 'middle')
      .attr('fill', '#e5e5e5')
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .attr('letter-spacing', '0.02em')
      .text('Total Dissolved Solids (TDS %) → Refractometer Concentration');

  }, [filteredLogs, showTargetZone, showTrajectory, selectedLog, onSelectLog]);

  return (
    <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-5">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-neutral-100">
              Espresso Calibration Scatter Plot: Extraction Yield vs TDS
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
              D3.js Refractometry
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Historical quality control dial-in mapping across SCA Golden Cup extraction boundaries (18–22% EY)
          </p>
        </div>

        {/* Filter Selectors & Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Recipe Filter */}
          <div className="flex items-center gap-1.5 bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1 text-xs">
            <Coffee className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <select
              value={selectedRecipeFilter}
              onChange={(e) => setSelectedRecipeFilter(e.target.value)}
              className="bg-transparent text-neutral-200 text-xs focus:outline-none cursor-pointer max-w-[140px] truncate"
            >
              <option value="all" className="bg-neutral-900 text-neutral-200">All Recipes ({recipesList.length})</option>
              {recipesList.map(r => (
                <option key={r.id} value={r.id} className="bg-neutral-900 text-neutral-200">{r.name}</option>
              ))}
            </select>
          </div>

          {/* Barista Filter */}
          <div className="flex items-center gap-1.5 bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1 text-xs">
            <User className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <select
              value={selectedBaristaFilter}
              onChange={(e) => setSelectedBaristaFilter(e.target.value)}
              className="bg-transparent text-neutral-200 text-xs focus:outline-none cursor-pointer max-w-[130px] truncate"
            >
              <option value="all" className="bg-neutral-900 text-neutral-200">All Baristas ({baristasList.length})</option>
              {baristasList.map(name => (
                <option key={name} value={name} className="bg-neutral-900 text-neutral-200">{name}</option>
              ))}
            </select>
          </div>

          {/* Toggle Target Zone */}
          <button
            onClick={() => setShowTargetZone(!showTargetZone)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              showTargetZone 
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60' 
                : 'bg-neutral-950 text-neutral-400 border-neutral-800'
            }`}
            title="Toggle SCA Golden Cup Target Zone Overlay"
          >
            <span className={`w-2 h-2 rounded-full ${showTargetZone ? 'bg-emerald-400' : 'bg-neutral-600'}`} />
            <span>Target Zone</span>
          </button>

          {/* Toggle Trajectory Path */}
          <button
            onClick={() => setShowTrajectory(!showTrajectory)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              showTrajectory 
                ? 'bg-amber-950/80 text-amber-300 border-amber-700/60' 
                : 'bg-neutral-950 text-neutral-400 border-neutral-800'
            }`}
            title="Toggle Chronological Calibration Trajectory Line"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Trajectory</span>
          </button>
        </div>
      </div>

      {/* Calibration Performance KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80">
          <div className="text-[10px] font-mono uppercase text-neutral-400">GOLDEN CUP HIT RATE</div>
          <div className="flex items-baseline gap-1.5 mt-1 font-mono">
            <span className="text-xl font-bold text-emerald-400">{stats.sweetSpotRate}%</span>
            <span className="text-[10px] text-neutral-500">in target box</span>
          </div>
          <div className="text-[10px] text-emerald-500/90 mt-0.5">18.0% - 22.0% EY</div>
        </div>

        <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80">
          <div className="text-[10px] font-mono uppercase text-neutral-400">MEAN EXTRACTION (EY)</div>
          <div className="flex items-baseline gap-1.5 mt-1 font-mono">
            <span className="text-xl font-bold text-neutral-100">{stats.avgEY}%</span>
            <span className="text-[10px] text-amber-400">±0.4%</span>
          </div>
          <div className="text-[10px] text-neutral-400 mt-0.5">SCA Standard: 20.0%</div>
        </div>

        <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80">
          <div className="text-[10px] font-mono uppercase text-neutral-400">MEAN CONCENTRATION (TDS)</div>
          <div className="flex items-baseline gap-1.5 mt-1 font-mono">
            <span className="text-xl font-bold text-amber-400">{stats.avgTDS}%</span>
            <span className="text-[10px] text-neutral-500">refractometer</span>
          </div>
          <div className="text-[10px] text-neutral-400 mt-0.5">Rich crema & tactile</div>
        </div>

        <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80">
          <div className="text-[10px] font-mono uppercase text-neutral-400">AVG SENSORY SCORE</div>
          <div className="flex items-baseline gap-1.5 mt-1 font-mono">
            <span className="text-xl font-bold text-neutral-100">{stats.avgScore}</span>
            <span className="text-xs text-neutral-500">/ 100</span>
          </div>
          <div className="text-[10px] text-emerald-400 mt-0.5">Specialty Grade 90+</div>
        </div>
      </div>

      {/* SVG Container with D3 rendering */}
      <div ref={containerRef} className="relative w-full bg-neutral-950 rounded-2xl border border-neutral-800/80 p-2 overflow-hidden shadow-inner">
        <svg ref={svgRef} className="w-full select-none" />

        {/* Interactive Floating Tooltip */}
        {tooltip && (
          <div
            className="absolute z-30 pointer-events-none bg-neutral-900/95 border border-neutral-700/80 rounded-xl p-3 shadow-2xl text-xs text-neutral-100 w-64 backdrop-blur-md transition-all duration-75"
            style={{
              left: `${Math.min(tooltip.x + 15, (containerRef.current?.clientWidth || 700) - 270)}px`,
              top: `${Math.max(10, tooltip.y - 70)}px`
            }}
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-neutral-800">
              <span className="font-bold text-neutral-100 truncate">{tooltip.log.recipeName}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold ${
                tooltip.log.status === 'sweet-spot' ? 'bg-emerald-950 text-emerald-300' :
                tooltip.log.status === 'under-extracted' ? 'bg-amber-950 text-amber-300' :
                tooltip.log.status === 'over-extracted' ? 'bg-rose-950 text-rose-300' :
                'bg-purple-950 text-purple-300'
              }`}>
                {tooltip.log.status.toUpperCase()}
              </span>
            </div>

            <div className="mt-2 space-y-1 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-neutral-400">Extraction Yield (EY):</span>
                <span className="font-bold text-emerald-400">{tooltip.log.extractionYieldPercent}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Refractometer TDS:</span>
                <span className="font-bold text-amber-300">{tooltip.log.tdsPercent}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Dose → Liquid Yield:</span>
                <span className="text-neutral-200">{tooltip.log.doseIn}g → {tooltip.log.yieldOut}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Contact Time:</span>
                <span className="text-neutral-200">{tooltip.log.timeSeconds}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Sensory Cup Score:</span>
                <span className="text-amber-400 font-bold">{tooltip.log.sensoryScores.overallScore}/100</span>
              </div>
            </div>

            <div className="mt-2 pt-1.5 border-t border-neutral-800 text-[10px] text-neutral-400 font-sans">
              <div>Barista: <strong className="text-neutral-200">{tooltip.log.baristaName}</strong></div>
              <div className="truncate mt-0.5 text-neutral-400 italic">"{tooltip.log.tastingNotes}"</div>
              <div className="mt-1 flex items-center justify-between text-neutral-500">
                <span>{tooltip.log.timestamp}</span>
                {tooltip.log.approvedForShift && (
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 inline" /> Approved
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend & Guide Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs text-neutral-400">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-sm" />
            <span>Sweet Spot (18–22% EY)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block shadow-sm" />
            <span>Under-Extracted (&lt;18%)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block shadow-sm" />
            <span>Over-Extracted (&gt;22%)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-purple-400 inline-block shadow-sm" />
            <span>Puck Channeling</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border-2 border-white bg-neutral-900 inline-block" />
            <span>Shift Approved</span>
          </div>
        </div>

        <div className="text-[11px] text-neutral-500 font-mono">
          Click any data point to inspect full calibration record
        </div>
      </div>

      {/* Selected Data Point Inspector Card */}
      {selectedLog && (
        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm text-neutral-200">
                Selected QC Extraction Calibration: {selectedLog.recipeName}
              </h3>
            </div>
            <button
              onClick={() => setSelectedLog(null)}
              className="text-xs text-neutral-400 hover:text-neutral-200 px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-800"
            >
              Dismiss
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800/80">
              <span className="text-[10px] text-neutral-500 block">EXTRACTION YIELD</span>
              <span className="text-base font-bold text-emerald-400">{selectedLog.extractionYieldPercent}%</span>
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800/80">
              <span className="text-[10px] text-neutral-500 block">TDS PERCENT</span>
              <span className="text-base font-bold text-amber-300">{selectedLog.tdsPercent}%</span>
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800/80">
              <span className="text-[10px] text-neutral-500 block">RATIO & DOSE</span>
              <span className="text-base font-bold text-neutral-200">{selectedLog.doseIn}g → {selectedLog.yieldOut}g</span>
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800/80">
              <span className="text-[10px] text-neutral-500 block">TIME & PRESSURE</span>
              <span className="text-base font-bold text-neutral-200">{selectedLog.timeSeconds}s @ {selectedLog.pressureBar} bar</span>
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800/80">
              <span className="text-[10px] text-neutral-500 block">SENSORY CUP SCORE</span>
              <span className="text-base font-bold text-amber-400">{selectedLog.sensoryScores.overallScore} / 100</span>
            </div>
          </div>

          <div className="text-xs text-neutral-300 bg-neutral-900/60 p-3 rounded-lg border border-neutral-800/60 space-y-1 font-sans">
            <div>
              <strong className="text-neutral-400 font-mono text-[11px]">Barista:</strong>{' '}
              <span className="text-neutral-200">{selectedLog.baristaName}</span>{' '}
              <span className="text-neutral-500">· Logged at {selectedLog.timestamp}</span>
            </div>
            <div>
              <strong className="text-neutral-400 font-mono text-[11px]">Tasting Notes:</strong>{' '}
              <span className="text-neutral-300 italic">{selectedLog.tastingNotes}</span>
            </div>
            <div>
              <strong className="text-neutral-400 font-mono text-[11px]">Adjustments Made:</strong>{' '}
              <span className="text-neutral-300">{selectedLog.adjustmentsMade}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
