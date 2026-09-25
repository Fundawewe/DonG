import React, { useState, useMemo } from 'react';
import { useBaristaOS } from '../../context/BaristaOSContext';
import { StaffMember, KpiPillarType } from '../../types';
import { calculateBaristaKPI, calculateTeamKpiBenchmark } from '../../utils/baristaKpiCalculator';
import { BaristaKpiPdfModal } from './BaristaKpiPdfModal';
import { 
  Award, 
  TrendingUp, 
  Coffee, 
  ClipboardCheck, 
  GraduationCap, 
  FileCheck2, 
  Flame, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Printer, 
  ChevronRight, 
  UserCheck, 
  Calendar, 
  Star, 
  Target, 
  ShieldCheck, 
  ArrowUpRight, 
  Clock, 
  DollarSign, 
  Zap,
  Edit3,
  Save,
  Check,
  BarChart3
} from 'lucide-react';

interface BaristaKpiReportViewProps {
  onSelectBaristaForRoster?: (staff: StaffMember) => void;
}

export const BaristaKpiReportView: React.FC<BaristaKpiReportViewProps> = () => {
  const { 
    staffList, 
    activeBarista, 
    setActiveBarista, 
    trainingModules, 
    exams, 
    certificates, 
    dialInLogs, 
    checklistTasks, 
    checklistRecords,
    activeBranch,
    deviationAlerts
  } = useBaristaOS();

  const [selectedStaffId, setSelectedStaffId] = useState<string>(activeBarista.id);
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month' | 'quarter' | 'all-time'>('month');
  const [selectedPillar, setSelectedPillar] = useState<KpiPillarType>('daily-qc');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [isEditingNotes, setIsEditingNotes] = useState<boolean>(false);
  const [managerNotesDraft, setManagerNotesDraft] = useState<string>('');
  const [savedNotesOverride, setSavedNotesOverride] = useState<Record<string, string>>({});

  // Active barista for the report
  const currentStaff = useMemo(() => {
    return staffList.find(s => s.id === selectedStaffId) || staffList[0] || activeBarista;
  }, [staffList, selectedStaffId, activeBarista]);

  // Compute KPI report for current barista
  const kpiReport = useMemo(() => {
    const report = calculateBaristaKPI({
      barista: currentStaff,
      staffList,
      trainingModules,
      exams,
      certificates,
      dialInLogs,
      checklistTasks,
      checklistRecords,
      deviationAlerts,
      timeframe
    });

    if (savedNotesOverride[currentStaff.id]) {
      report.managerCoachingNotes = savedNotesOverride[currentStaff.id];
    }

    return report;
  }, [
    currentStaff, 
    staffList, 
    trainingModules, 
    exams, 
    certificates, 
    dialInLogs, 
    checklistTasks, 
    checklistRecords, 
    deviationAlerts, 
    timeframe,
    savedNotesOverride
  ]);

  // Compute team benchmark
  const teamBenchmark = useMemo(() => {
    return calculateTeamKpiBenchmark(
      staffList,
      trainingModules,
      exams,
      certificates,
      dialInLogs,
      checklistTasks,
      checklistRecords
    );
  }, [staffList, trainingModules, exams, certificates, dialInLogs, checklistTasks, checklistRecords]);

  const handleSaveNotes = () => {
    setSavedNotesOverride(prev => ({
      ...prev,
      [currentStaff.id]: managerNotesDraft
    }));
    setIsEditingNotes(false);
  };

  const handleStartEditNotes = () => {
    setManagerNotesDraft(kpiReport.managerCoachingNotes || '');
    setIsEditingNotes(true);
  };

  const getPillarIcon = (type: KpiPillarType) => {
    switch (type) {
      case 'daily-qc':
        return Coffee;
      case 'sales-productivity':
        return TrendingUp;
      case 'shift-checklists':
        return ClipboardCheck;
      case 'trainings':
        return GraduationCap;
      case 'exams':
        return FileCheck2;
    }
  };

  const getPillarColor = (type: KpiPillarType) => {
    switch (type) {
      case 'daily-qc':
        return { text: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' };
      case 'sales-productivity':
        return { text: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' };
      case 'shift-checklists':
        return { text: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' };
      case 'trainings':
        return { text: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' };
      case 'exams':
        return { text: 'text-amber-300', bg: 'bg-amber-300/10', border: 'border-amber-300/20' };
    }
  };

  const pillarsList = [
    kpiReport.pillars.dailyQc,
    kpiReport.pillars.salesProductivity,
    kpiReport.pillars.shiftChecklists,
    kpiReport.pillars.trainings,
    kpiReport.pillars.exams
  ];

  const activePillarData = pillarsList.find(p => p.pillar === selectedPillar) || kpiReport.pillars.dailyQc;

  return (
    <div className="space-y-6">
      {/* Top Controls: Barista Switcher & Evaluation Period */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-neutral-900 border border-neutral-800 p-4 rounded-2xl">
        {/* Barista Selector Pill Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mr-1">
            Barista:
          </span>
          {staffList.map(staff => {
            const isSelected = staff.id === currentStaff.id;
            return (
              <button
                key={staff.id}
                onClick={() => setSelectedStaffId(staff.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-neutral-950 shadow-md font-bold'
                    : 'bg-neutral-950 text-neutral-300 hover:bg-neutral-800 border border-neutral-800'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isSelected ? 'bg-neutral-950 text-amber-400' : 'bg-neutral-800 text-neutral-300'
                }`}>
                  {staff.name.split(' ').map(n => n[0]).join('')}
                </span>
                <span>{staff.name.split(' ')[0]}</span>
                {staff.id === activeBarista.id && (
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-neutral-950' : 'bg-emerald-400'}`} title="Active on Bar" />
                )}
              </button>
            );
          })}
        </div>

        {/* Timeframe & Export CTAs */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          {/* Period Filter */}
          <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-xl p-0.5 text-xs font-medium">
            {(['today', 'week', 'month', 'quarter', 'all-time'] as const).map(period => (
              <button
                key={period}
                onClick={() => setTimeframe(period)}
                className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                  timeframe === period
                    ? 'bg-neutral-800 text-neutral-100 font-semibold shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {period === 'all-time' ? 'All Time' : period}
              </button>
            ))}
          </div>

          {/* Export PDF Button */}
          <button
            onClick={() => setIsPdfModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Report Card</span>
          </button>
        </div>
      </div>

      {/* Hero Executive Scorecard Banner */}
      <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-900/90 to-neutral-950 border border-neutral-800 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Left: Barista Profile Summary */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-950 border border-amber-500/30 flex items-center justify-center font-bold text-xl text-amber-400 shadow-inner">
              {currentStaff.name.split(' ').map(n => n[0]).join('')}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-black text-neutral-100 tracking-tight">
                  {currentStaff.name}
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded-md font-semibold bg-amber-950 text-amber-300 border border-amber-800/80">
                  {currentStaff.role}
                </span>
                {currentStaff.id === activeBarista.id && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    ACTIVE ON BAR
                  </span>
                )}
              </div>

              <p className="text-xs text-neutral-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>Branch: <strong className="text-neutral-300">{activeBranch.name}</strong></span>
                <span>·</span>
                <span>Shift Status: <strong className="text-emerald-400 uppercase font-mono">{currentStaff.status}</strong></span>
                <span>·</span>
                <span>Evaluated: <strong className="text-neutral-300">{timeframe.toUpperCase()} (Sep 2026)</strong></span>
              </p>

              {/* Set Active CTA if not active */}
              {currentStaff.id !== activeBarista.id && (
                <button
                  onClick={() => setActiveBarista(currentStaff)}
                  className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-neutral-300 bg-neutral-800 hover:bg-neutral-700 transition-colors"
                >
                  <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Set as Active Barista on Bar</span>
                </button>
              )}
            </div>
          </div>

          {/* Right: Composite KPI Index Radial / Stat */}
          <div className="flex items-center gap-6 self-stretch md:self-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-neutral-800">
            {/* Rank & Trend */}
            <div className="text-right">
              <div className="text-[10px] uppercase font-mono tracking-wider text-neutral-400">
                Team Ranking
              </div>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5 flex items-center justify-end gap-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Rank #{kpiReport.teamRank}</span>
                <span className="text-xs text-neutral-500 font-sans">/ {kpiReport.totalTeamMembers}</span>
              </div>
              <div className="text-[11px] text-emerald-400 flex items-center justify-end gap-0.5 mt-0.5 font-mono">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+{kpiReport.trendVsPrevious}% vs last cycle</span>
              </div>
            </div>

            {/* Main Score Box */}
            <div className="flex items-center gap-3 bg-neutral-950/80 p-3.5 rounded-2xl border border-neutral-800/90 shadow-lg">
              <div className="text-right">
                <div className="text-[10px] font-mono uppercase text-neutral-400 tracking-wider">
                  Composite KPI Index
                </div>
                <div className="text-3xl font-black font-mono text-amber-400 flex items-baseline justify-end gap-1">
                  <span>{kpiReport.overallScore}</span>
                  <span className="text-sm font-normal text-neutral-500">/100</span>
                </div>
                <div className="text-xs font-bold text-neutral-200">
                  {kpiReport.gradeTier}
                </div>
              </div>

              {/* Progress Bar Ring Indicator */}
              <div className="w-14 h-14 rounded-full border-4 border-neutral-800 flex items-center justify-center relative">
                <div 
                  className="absolute inset-0 rounded-full border-4 border-amber-400"
                  style={{
                    clipPath: `polygon(50% 50%, -50% -50%, ${kpiReport.overallScore}% -50%, ${kpiReport.overallScore}% ${kpiReport.overallScore}%)`
                  }}
                />
                <ShieldCheck className="w-6 h-6 text-amber-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Core Performance Pillars: Interactive Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              <span>5 Core Performance Pillars</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Select any pillar below to drill into granular telemetry, metrics, and coaching insights
            </p>
          </div>
          <span className="text-xs text-neutral-500 font-mono">
            Weighted Target: 85+ Points
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {pillarsList.map((pillar) => {
            const isSelected = selectedPillar === pillar.pillar;
            const Icon = getPillarIcon(pillar.pillar);
            const style = getPillarColor(pillar.pillar);

            return (
              <button
                key={pillar.pillar}
                onClick={() => setSelectedPillar(pillar.pillar)}
                className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-neutral-900 border-amber-500/60 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/40'
                    : 'bg-neutral-900/70 hover:bg-neutral-900 border-neutral-800'
                }`}
              >
                <div>
                  {/* Top Bar: Icon & Weight */}
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-xl ${style.bg} ${style.border} border`}>
                      <Icon className={`w-4 h-4 ${style.text}`} />
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400 bg-neutral-950 px-2 py-0.5 rounded-full border border-neutral-800">
                      {Math.round(pillar.weight * 100)}% Weight
                    </span>
                  </div>

                  {/* Title & Score */}
                  <div className="mt-3">
                    <div className="text-xs font-bold text-neutral-200 line-clamp-1">
                      {pillar.title}
                    </div>
                    <div className="mt-1 flex items-baseline gap-2 font-mono">
                      <span className="text-2xl font-black text-neutral-100">
                        {pillar.score}
                      </span>
                      <span className="text-xs text-neutral-500">
                        tgt {pillar.benchmarkTarget}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3 w-full bg-neutral-950 h-1.5 rounded-full overflow-hidden border border-neutral-800">
                    <div
                      className={`h-full rounded-full ${
                        pillar.score >= 90 ? 'bg-emerald-400' :
                        pillar.score >= 80 ? 'bg-amber-400' : 'bg-blue-400'
                      }`}
                      style={{ width: `${Math.min(100, pillar.score)}%` }}
                    />
                  </div>

                  {/* Primary Metric Preview */}
                  <div className="mt-3 pt-2.5 border-t border-neutral-800/80">
                    <div className="text-[10px] text-neutral-400 truncate">
                      {pillar.primaryMetric.label}
                    </div>
                    <div className="text-xs font-bold text-neutral-200 font-mono mt-0.5 truncate">
                      {pillar.primaryMetric.value}
                    </div>
                  </div>
                </div>

                {/* Status Chip */}
                <div className="mt-3 flex items-center justify-between text-[10px] font-semibold">
                  <span className={`px-2 py-0.5 rounded uppercase ${
                    pillar.status === 'exceptional' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                    pillar.status === 'on-target' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                    'bg-neutral-800 text-neutral-300'
                  }`}>
                    {pillar.status}
                  </span>
                  <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-neutral-600'}`} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Pillar Deep-Dive Drilldown */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-6">
        {/* Drilldown Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-800 gap-3">
          <div className="flex items-center gap-3">
            {React.createElement(getPillarIcon(activePillarData.pillar), {
              className: `w-6 h-6 ${getPillarColor(activePillarData.pillar).text}`
            })}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-neutral-100">
                  {activePillarData.title} Deep Dive
                </h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                  Score: {activePillarData.score}/100
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Audit breakdown, telemetry records, and pro calibration standards
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="bg-neutral-950 border border-neutral-800 px-3 py-1.5 rounded-lg">
              <span className="text-neutral-500">Weight: </span>
              <strong className="text-amber-400">{Math.round(activePillarData.weight * 100)}%</strong>
            </div>
            <div className="bg-neutral-950 border border-neutral-800 px-3 py-1.5 rounded-lg">
              <span className="text-neutral-500">Target: </span>
              <strong className="text-neutral-200">{activePillarData.benchmarkTarget} pts</strong>
            </div>
          </div>
        </div>

        {/* 4 Metric Telemetry Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {activePillarData.metrics.map((metric, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
              <div className="text-xs text-neutral-400">{metric.label}</div>
              <div className="text-lg font-bold font-mono text-neutral-100 mt-1">
                {metric.value}
              </div>
              <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Metric</span>
              </div>
            </div>
          ))}
        </div>

        {/* Highlights & Specific Coaching Tips */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Key Achievements */}
          <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-3">
              <CheckCircle2 className="w-4 h-4" />
              <span>Demonstrated Competencies & Log Highlights</span>
            </h4>
            <ul className="space-y-2 text-xs text-neutral-300">
              {activePillarData.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold mt-0.5">•</span>
                  <span className="leading-relaxed">{h}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Coaching & Growth Tips */}
          <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-3">
              <Target className="w-4 h-4" />
              <span>Coaching & Next Step Milestones</span>
            </h4>
            <ul className="space-y-2 text-xs text-neutral-300">
              {activePillarData.growthTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold mt-0.5">•</span>
                  <span className="leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Performance Review & Manager Coaching Notes */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-neutral-100">
              Performance Review & Supervisor Sign-off
            </h3>
          </div>

          {!isEditingNotes ? (
            <button
              onClick={handleStartEditNotes}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              <span>Edit Coaching Notes</span>
            </button>
          ) : (
            <button
              onClick={handleSaveNotes}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Review</span>
            </button>
          )}
        </div>

        {/* Notes Container */}
        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
          {isEditingNotes ? (
            <div className="space-y-3">
              <label className="text-xs font-semibold text-neutral-400 block">
                Official Head Barista / Shift Supervisor Feedback:
              </label>
              <textarea
                value={managerNotesDraft}
                onChange={(e) => setManagerNotesDraft(e.target.value)}
                rows={4}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-xs text-neutral-100 focus:outline-none focus:border-amber-400 resize-none font-sans leading-relaxed"
                placeholder="Enter feedback on extraction consistency, speed of service, checklist diligence, and growth opportunities..."
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEditingNotes(false)}
                  className="px-3 py-1 text-xs text-neutral-400 hover:text-neutral-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNotes}
                  className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-neutral-950 bg-amber-400 rounded-lg"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Feedback</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center font-bold text-xs text-amber-400 shrink-0">
                MGR
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-neutral-200">{activeBranch.manager} (Operations Lead)</span>
                  <span className="text-neutral-500 font-mono text-[11px]">{kpiReport.generatedDate}</span>
                </div>
                <p className="text-xs text-neutral-300 mt-1 italic leading-relaxed">
                  "{kpiReport.managerCoachingNotes}"
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Strengths & Growth Areas Chips */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Recognized Strengths</span>
            </h4>
            <div className="space-y-1.5">
              {kpiReport.strengths.map((str, idx) => (
                <div key={idx} className="text-xs text-neutral-300 flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{str}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-2">
              <Target className="w-4 h-4" />
              <span>Priorities for Next Review</span>
            </h4>
            <div className="space-y-1.5">
              {kpiReport.areasForImprovement.map((area, idx) => (
                <div key={idx} className="text-xs text-neutral-300 flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{area}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Team Benchmark Comparison Table */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" />
              <span>Café Team KPI Benchmark & Leaderboard</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Comparative overview across all 5 evaluation pillars for {activeBranch.name}
            </p>
          </div>

          <div className="text-xs text-neutral-400 font-mono bg-neutral-950 px-3 py-1.5 rounded-lg border border-neutral-800">
            Café Average KPI: <strong className="text-amber-400">{teamBenchmark.teamAverage.overall}/100</strong>
          </div>
        </div>

        <div className="overflow-x-auto border border-neutral-800 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950 text-neutral-400 font-mono text-[11px] border-b border-neutral-800">
              <tr>
                <th className="py-3 px-4">Rank & Barista</th>
                <th className="py-3 px-3 text-center">Daily QC (25%)</th>
                <th className="py-3 px-3 text-center">Sales & Speed (25%)</th>
                <th className="py-3 px-3 text-center">Checklists (20%)</th>
                <th className="py-3 px-3 text-center">Trainings (15%)</th>
                <th className="py-3 px-3 text-center">Exams (15%)</th>
                <th className="py-3 px-4 text-right">Composite Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 font-mono">
              {teamBenchmark.reports
                .sort((a, b) => b.overallScore - a.overallScore)
                .map((r, index) => {
                  const isCurrent = r.baristaId === currentStaff.id;
                  return (
                    <tr
                      key={r.baristaId}
                      onClick={() => setSelectedStaffId(r.baristaId)}
                      className={`cursor-pointer transition-colors ${
                        isCurrent ? 'bg-amber-500/10 hover:bg-amber-500/15' : 'hover:bg-neutral-800/40'
                      }`}
                    >
                      <td className="py-3 px-4 font-sans">
                        <div className="flex items-center gap-3">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono ${
                            index === 0 ? 'bg-amber-400 text-neutral-950' :
                            index === 1 ? 'bg-neutral-300 text-neutral-950' :
                            index === 2 ? 'bg-amber-700 text-neutral-100' :
                            'bg-neutral-800 text-neutral-400'
                          }`}>
                            {index + 1}
                          </span>
                          <div>
                            <div className="font-bold text-neutral-200 flex items-center gap-1.5">
                              <span>{r.baristaName}</span>
                              {isCurrent && (
                                <span className="text-[9px] px-1 rounded bg-amber-400 text-neutral-950 font-bold">
                                  VIEWING
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-neutral-500">{r.baristaRole}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className={`font-bold ${r.pillars.dailyQc.score >= 90 ? 'text-emerald-400' : 'text-neutral-300'}`}>
                          {r.pillars.dailyQc.score}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className={`font-bold ${r.pillars.salesProductivity.score >= 90 ? 'text-emerald-400' : 'text-neutral-300'}`}>
                          {r.pillars.salesProductivity.score}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className={`font-bold ${r.pillars.shiftChecklists.score >= 90 ? 'text-emerald-400' : 'text-neutral-300'}`}>
                          {r.pillars.shiftChecklists.score}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className={`font-bold ${r.pillars.trainings.score >= 90 ? 'text-emerald-400' : 'text-neutral-300'}`}>
                          {r.pillars.trainings.score}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className={`font-bold ${r.pillars.exams.score >= 90 ? 'text-emerald-400' : 'text-neutral-300'}`}>
                          {r.pillars.exams.score}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <span className="text-base font-black text-amber-400">
                          {r.overallScore}
                        </span>
                        <span className="text-[10px] text-neutral-500 block">
                          {r.gradeTier.split(' ')[0]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* PDF / Printable Modal */}
      <BaristaKpiPdfModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        report={kpiReport}
        branchName={activeBranch.name}
        managerName={activeBranch.manager}
      />
    </div>
  );
};
