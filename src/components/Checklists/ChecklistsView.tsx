import React, { useState, useMemo } from 'react';
import { useBaristaOS } from '../../context/BaristaOSContext';
import { ChecklistTaskDefinition, ShiftType, TaskCategory } from '../../types';
import { DefineTaskModal } from './DefineTaskModal';
import { ShiftSignOffModal } from './ShiftSignOffModal';
import { ChecklistHistoryModal } from './ChecklistHistoryModal';
import { 
  ClipboardCheck, 
  CheckSquare, 
  Square, 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  ShieldAlert, 
  ShieldCheck, 
  AlertCircle, 
  Printer, 
  RefreshCw, 
  Edit2, 
  Trash2, 
  History, 
  Coffee, 
  Droplets, 
  Milk, 
  CreditCard, 
  Sparkle, 
  Lock, 
  Filter, 
  CheckCircle2, 
  User, 
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Settings,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';

export const ChecklistsView: React.FC = () => {
  const {
    checklistTasks,
    checklistRecords,
    activeBarista,
    staffList,
    addCustomChecklistTask,
    updateChecklistTask,
    deleteChecklistTask,
    toggleChecklistTaskExecution,
    updateChecklistTaskNotes,
    signOffShiftChecklist,
    resetShiftChecklist,
    restoreDefaultChecklistTasks
  } = useBaristaOS();

  // Active view filters and controls
  const [selectedShiftType, setSelectedShiftType] = useState<ShiftType>('opening');
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-23');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'critical'>('all');
  const [isManagerMode, setIsManagerMode] = useState(false);

  // Modals state
  const [isDefineTaskModalOpen, setIsDefineTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<ChecklistTaskDefinition | null>(null);
  const [isSignOffModalOpen, setIsSignOffModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [expandedNotesTaskId, setExpandedNotesTaskId] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [bannerAlert, setBannerAlert] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Audio completion feedback
  const playCompletionSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch {
      // Audio not supported or blocked
    }
  };

  // Find record for currently selected date and shift
  const currentRecord = useMemo(() => {
    return checklistRecords.find(r => r.date === selectedDate && r.shiftType === selectedShiftType);
  }, [checklistRecords, selectedDate, selectedShiftType]);

  const executions = currentRecord?.executions || {};

  // Tasks belonging to this shift type
  const shiftTasks = useMemo(() => {
    return checklistTasks.filter(t => t.shiftType === selectedShiftType && t.isActive !== false);
  }, [checklistTasks, selectedShiftType]);

  // Filtered tasks
  const displayedTasks = useMemo(() => {
    return shiftTasks.filter(task => {
      // Category filter
      if (selectedCategory !== 'all' && task.category !== selectedCategory) {
        return false;
      }

      // Status filter
      const isDone = !!executions[task.id]?.completed;
      if (filterStatus === 'completed' && !isDone) return false;
      if (filterStatus === 'pending' && isDone) return false;
      if (filterStatus === 'critical' && !task.isRequired) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDesc = task.description.toLowerCase().includes(query);
        const matchesStation = task.station.toLowerCase().includes(query);
        return matchesTitle || matchesDesc || matchesStation;
      }

      return true;
    }).sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [shiftTasks, selectedCategory, filterStatus, searchQuery, executions]);

  // Metrics
  const metrics = useMemo(() => {
    const total = shiftTasks.length;
    const completed = shiftTasks.filter(t => executions[t.id]?.completed).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    const criticalTasks = shiftTasks.filter(t => t.isRequired);
    const criticalCompleted = criticalTasks.filter(t => executions[t.id]?.completed).length;
    const criticalMissing = criticalTasks.length - criticalCompleted;
    const allCriticalPassed = criticalTasks.length > 0 && criticalMissing === 0;

    // Estimated remaining minutes
    const pendingTasks = shiftTasks.filter(t => !executions[t.id]?.completed);
    const remainingMinutes = pendingTasks.reduce((sum, t) => sum + (t.estimatedMinutes || 5), 0);

    return {
      total,
      completed,
      percent,
      criticalTotal: criticalTasks.length,
      criticalCompleted,
      criticalMissing,
      allCriticalPassed,
      remainingMinutes
    };
  }, [shiftTasks, executions]);

  // Handlers
  const handleToggleTask = (task: ChecklistTaskDefinition) => {
    const currentlyDone = !!executions[task.id]?.completed;
    if (!currentlyDone) {
      playCompletionSound();
    }
    toggleChecklistTaskExecution(
      task.id,
      selectedDate,
      selectedShiftType,
      activeBarista.name,
      noteDrafts[task.id] || executions[task.id]?.notes
    );
  };

  const handleSaveNote = (taskId: string) => {
    const noteText = noteDrafts[taskId] ?? executions[taskId]?.notes ?? '';
    updateChecklistTaskNotes(taskId, selectedDate, selectedShiftType, noteText);
    setExpandedNotesTaskId(null);
    setBannerAlert({ message: 'Observation note updated successfully.', type: 'success' });
    setTimeout(() => setBannerAlert(null), 3000);
  };

  const handleSignOffClick = () => {
    if (!metrics.allCriticalPassed) {
      setBannerAlert({
        message: `Validation Error: ${metrics.criticalMissing} critical protocol(s) must be verified before official shift sign-off.`,
        type: 'error'
      });
      setTimeout(() => setBannerAlert(null), 5000);
      return;
    }
    setIsSignOffModalOpen(true);
  };

  const handleResetShift = () => {
    if (window.confirm(`Are you sure you want to reset all checked tasks for ${selectedShiftType.toUpperCase()} shift on ${selectedDate}?`)) {
      resetShiftChecklist(selectedDate, selectedShiftType);
      setBannerAlert({ message: `Shift checklist for ${selectedDate} has been reset.`, type: 'info' });
      setTimeout(() => setBannerAlert(null), 3000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const categories: { id: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'all', label: 'All Stations', icon: Layers },
    { id: 'espresso-grinder', label: 'Espresso & Grinders', icon: Coffee },
    { id: 'water-filtration', label: 'Water & Filtration', icon: Droplets },
    { id: 'milk-syrups', label: 'Milk & Food', icon: Milk },
    { id: 'pos-cash', label: 'POS & Float', icon: CreditCard },
    { id: 'sanitation-station', label: 'Sanitation', icon: Sparkle },
    { id: 'facility-security', label: 'Facility', icon: Lock }
  ];

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Top Banner Alert if active */}
      {bannerAlert && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between shadow-lg ${
          bannerAlert.type === 'error'
            ? 'bg-rose-950/90 border-rose-800 text-rose-200'
            : bannerAlert.type === 'success'
            ? 'bg-emerald-950/90 border-emerald-800 text-emerald-200'
            : 'bg-amber-950/90 border-amber-800 text-amber-200'
        }`}>
          <div className="flex items-center gap-2.5">
            {bannerAlert.type === 'error' ? (
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            ) : bannerAlert.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span className="font-semibold">{bannerAlert.message}</span>
          </div>
          <button 
            onClick={() => setBannerAlert(null)}
            className="text-neutral-400 hover:text-neutral-200 text-xs px-2 py-1 rounded"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header and Shift Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
              <ClipboardCheck className="w-5 h-5" />
            </span>
            <span className="text-xs font-mono font-bold tracking-wider text-amber-400 uppercase">
              Operational Quality Assurance
            </span>
          </div>
          <h1 className="text-2xl font-black text-neutral-100 tracking-tight">
            Daily Opening & Closing Checklists
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Standard operating procedures, timestamp verification & manager handover sign-off
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Audit History Logbook */}
          <button
            onClick={() => setIsHistoryModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-neutral-100 rounded-xl text-xs font-medium transition-all"
            title="View Historical Shift Records & Audit Logbook"
          >
            <History className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Audit Logbook</span>
          </button>

          {/* Export / Print PDF */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-neutral-100 rounded-xl text-xs font-medium transition-all"
            title="Print or Save PDF Shift Checklist"
          >
            <Printer className="w-4 h-4 text-neutral-400" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>

          {/* Manager Protocol Mode Toggle */}
          <button
            onClick={() => setIsManagerMode(!isManagerMode)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
              isManagerMode
                ? 'bg-amber-400 text-neutral-950 border-amber-400 shadow-md shadow-amber-400/10'
                : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-300 hover:text-neutral-100'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>{isManagerMode ? 'Done Editing Protocols' : 'Manager Protocols'}</span>
          </button>

          {/* Add Custom Task Button */}
          <button
            onClick={() => {
              setTaskToEdit(null);
              setIsDefineTaskModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold rounded-xl transition-all shadow-md shadow-amber-400/15"
          >
            <Plus className="w-4 h-4" />
            <span>Define Task</span>
          </button>
        </div>
      </div>

      {/* Date & Shift Selector Bar */}
      <div className="p-4 rounded-3xl bg-neutral-900/90 border border-neutral-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Shift Type Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-neutral-950 border border-neutral-800/80 overflow-x-auto">
          <button
            onClick={() => setSelectedShiftType('opening')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedShiftType === 'opening'
                ? 'bg-amber-400 text-neutral-950 shadow-md'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <span>🌅 Opening Protocol</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/20">
              06:00 - 07:00
            </span>
          </button>

          <button
            onClick={() => setSelectedShiftType('closing')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedShiftType === 'closing'
                ? 'bg-amber-400 text-neutral-950 shadow-md'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <span>🌙 Closing Protocol</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/20">
              18:00 - 19:30
            </span>
          </button>

          <button
            onClick={() => setSelectedShiftType('handover')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedShiftType === 'handover'
                ? 'bg-amber-400 text-neutral-950 shadow-md'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <span>🔄 Mid-Day Handover</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/20">
              13:00 - 14:00
            </span>
          </button>
        </div>

        {/* Date Selector Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSelectedDate('2026-09-23')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                selectedDate === '2026-09-23'
                  ? 'bg-neutral-800 border-amber-400/50 text-amber-300 font-bold'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Today (Sept 23)
            </button>

            <button
              onClick={() => setSelectedDate('2026-09-22')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                selectedDate === '2026-09-22'
                  ? 'bg-neutral-800 border-amber-400/50 text-amber-300 font-bold'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Yesterday
            </button>
          </div>

          <div className="relative flex items-center">
            <Calendar className="w-3.5 h-3.5 text-neutral-400 absolute left-3 pointer-events-none" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>

          <button
            onClick={handleResetShift}
            title="Reset this shift's checks"
            className="p-2 text-neutral-400 hover:text-rose-400 rounded-xl hover:bg-neutral-950 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Real-Time Shift Progress & Consistency Card */}
      <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-xl relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left: Overall Completion Progress */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                  SHIFT COMPLETION METRICS
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-black text-neutral-100 font-mono">
                    {metrics.percent}%
                  </span>
                  <span className="text-xs text-neutral-400 font-mono">
                    ({metrics.completed} of {metrics.total} verified)
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div>
                {currentRecord?.isSignedOff ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-400/10 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Shift Signed Off
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold">
                    <Clock className="w-4 h-4 text-amber-400" />
                    In Progress
                  </span>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-neutral-950 h-3 rounded-full overflow-hidden p-0.5 border border-neutral-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  metrics.percent === 100
                    ? 'bg-emerald-400 shadow-lg shadow-emerald-400/20'
                    : 'bg-gradient-to-r from-amber-500 to-amber-300'
                }`}
                style={{ width: `${metrics.percent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-neutral-400">
              <span>Station Target: {selectedShiftType === 'opening' ? 'Open at 07:00 AM' : 'Secured by 19:30 PM'}</span>
              <span>~{metrics.remainingMinutes} min work remaining</span>
            </div>
          </div>

          {/* Center: Critical Validation Status */}
          <div className="md:col-span-4 p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                Critical Protocols
              </span>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                metrics.allCriticalPassed 
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                  : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}>
                {metrics.criticalCompleted} / {metrics.criticalTotal}
              </span>
            </div>

            <p className="text-[11px] text-neutral-400 leading-relaxed">
              {metrics.allCriticalPassed ? (
                <span className="text-emerald-400 font-medium">
                  ✓ All critical safety, boiler, and cash protocols have been certified. Ready for manager handover.
                </span>
              ) : (
                <span className="text-amber-300">
                  {metrics.criticalMissing} critical protocol{metrics.criticalMissing > 1 ? 's' : ''} require immediate validation before shift sign-off.
                </span>
              )}
            </p>
          </div>

          {/* Right: Sign-Off Trigger */}
          <div className="md:col-span-3 flex flex-col justify-center space-y-2">
            {currentRecord?.isSignedOff ? (
              <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-800/80 text-center">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 block font-bold">
                  VERIFIED BY SUPERVISOR
                </span>
                <span className="text-xs font-bold text-neutral-100 block mt-0.5 truncate">
                  {currentRecord.signedOffBy}
                </span>
                <span className="text-[10px] text-neutral-400 block mt-0.5 font-mono">
                  {currentRecord.signedOffAt ? new Date(currentRecord.signedOffAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
                <button
                  onClick={() => setIsSignOffModalOpen(true)}
                  className="mt-2 text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold underline block w-full text-center"
                >
                  View Sign-off Seal & Notes
                </button>
              </div>
            ) : (
              <button
                onClick={handleSignOffClick}
                className={`w-full py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                  metrics.allCriticalPassed
                    ? 'bg-amber-400 hover:bg-amber-300 text-neutral-950 shadow-amber-400/20 cursor-pointer'
                    : 'bg-neutral-800 hover:bg-neutral-750 text-neutral-400 border border-neutral-700 cursor-pointer'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Sign-Off Shift</span>
              </button>
            )}

            {!currentRecord?.isSignedOff && (
              <span className="text-[10px] text-center text-neutral-500 block">
                {metrics.allCriticalPassed
                  ? 'All requirements satisfied. Click to lock shift.'
                  : 'Requires 100% critical protocol completion'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Search & Category Filter Navigation */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search checklist tasks by title, station, or keywords..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Filter Status Pills */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-neutral-500 text-[11px] mr-1 hidden sm:inline">Status:</span>
            {(['all', 'pending', 'completed', 'critical'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-xl capitalize font-medium transition-colors ${
                  filterStatus === st
                    ? 'bg-amber-400 text-neutral-950 font-bold'
                    : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
                }`}
              >
                {st === 'critical' ? '⚡ Critical Only' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-amber-400/10 border-amber-400 text-amber-300 font-bold'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Manager Protocol Builder Banner (if enabled) */}
      {isManagerMode && (
        <div className="p-4 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-xs text-amber-300 block">
                Manager Protocol Definition Mode Active
              </span>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                You can now customize SOP instructions, set critical requirements, edit timing, or add new store-specific tasks.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={restoreDefaultChecklistTasks}
              className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-neutral-100 text-xs font-semibold transition-colors"
            >
              Reset to Defaults
            </button>

            <button
              onClick={() => {
                setTaskToEdit(null);
                setIsDefineTaskModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold transition-colors"
            >
              + Add Custom SOP
            </button>
          </div>
        </div>
      )}

      {/* Task List Grid */}
      <div className="space-y-3">
        {displayedTasks.length === 0 ? (
          <div className="p-12 text-center bg-neutral-900 border border-neutral-800 rounded-3xl space-y-3">
            <ClipboardCheck className="w-8 h-8 text-neutral-600 mx-auto" />
            <h3 className="text-sm font-bold text-neutral-300">No Checklist Tasks Found</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              No tasks match your selected category, search filter, or status for this shift.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setFilterStatus('all');
              }}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          displayedTasks.map((task, idx) => {
            const execution = executions[task.id];
            const isCompleted = !!execution?.completed;
            const isNotesExpanded = expandedNotesTaskId === task.id;
            const draftNote = noteDrafts[task.id] ?? execution?.notes ?? '';

            return (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border transition-all duration-200 ${
                  isCompleted
                    ? 'bg-neutral-900/50 border-neutral-800/80 hover:border-neutral-700'
                    : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Checkbox + Title + Description */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={() => handleToggleTask(task)}
                      className={`mt-0.5 p-1 rounded-xl transition-all shrink-0 cursor-pointer ${
                        isCompleted
                          ? 'text-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/20'
                          : 'text-neutral-500 hover:text-amber-400 hover:bg-neutral-800'
                      }`}
                      aria-label={isCompleted ? `Mark ${task.title} incomplete` : `Mark ${task.title} complete`}
                    >
                      {isCompleted ? (
                        <CheckSquare className="w-5 h-5" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      {/* Title & Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-xs font-bold transition-all ${
                          isCompleted ? 'text-neutral-400 line-through' : 'text-neutral-100'
                        }`}>
                          {idx + 1}. {task.title}
                        </span>

                        {/* Critical Badge */}
                        {task.isRequired && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800/80">
                            <ShieldAlert className="w-2.5 h-2.5 text-rose-400" />
                            CRITICAL PROTOCOL
                          </span>
                        )}

                        {/* Custom Task Badge */}
                        {task.isCustom && (
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800">
                            Custom SOP
                          </span>
                        )}
                      </div>

                      {/* Description / Instructions */}
                      <p className={`text-xs mt-1 leading-relaxed ${
                        isCompleted ? 'text-neutral-500' : 'text-neutral-400'
                      }`}>
                        {task.description}
                      </p>

                      {/* Station, Time Target & Completion Timestamp */}
                      <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[11px] text-neutral-400">
                        {/* Station */}
                        <span className="flex items-center gap-1 font-mono text-neutral-300 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                          {task.station}
                        </span>

                        {/* Target Time */}
                        {task.timeTarget && (
                          <span className="flex items-center gap-1 font-mono text-amber-400/90">
                            <Clock className="w-3 h-3" />
                            Target: {task.timeTarget}
                          </span>
                        )}

                        {/* Estimated Minutes */}
                        <span className="font-mono text-neutral-500">
                          ⏱ {task.estimatedMinutes}m
                        </span>

                        {/* Timestamp Tracking */}
                        {isCompleted && execution?.completedAt && (
                          <span className="flex items-center gap-1 font-mono text-emerald-400 font-semibold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/60">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified at {new Date(execution.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} by {execution.completedBy || activeBarista.name}
                          </span>
                        )}
                      </div>

                      {/* Existing Note display if not editing */}
                      {execution?.notes && !isNotesExpanded && (
                        <div className="mt-2.5 p-2 rounded-xl bg-neutral-950 border border-neutral-800/80 text-xs text-neutral-300 flex items-start gap-2">
                          <MessageSquare className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[10px] font-mono uppercase text-amber-400/80 font-bold block">
                              Staff Observation:
                            </span>
                            <span>{execution.notes}</span>
                          </div>
                        </div>
                      )}

                      {/* Inline Note Editor (when expanded) */}
                      {isNotesExpanded && (
                        <div className="mt-3 p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 animate-fadeIn">
                          <label className="text-[11px] font-semibold text-neutral-300 flex items-center gap-1">
                            <MessageSquare className="w-3 h-3 text-amber-400" />
                            Log reading, calibration metrics or shift observation:
                          </label>
                          <textarea
                            rows={2}
                            value={draftNote}
                            onChange={(e) => setNoteDrafts({ ...noteDrafts, [task.id]: e.target.value })}
                            placeholder="e.g. Steam boiler 1.65 bar, TDS 68 ppm, Cash drawer balanced KSh 10,000..."
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-400 resize-none"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setExpandedNotesTaskId(null)}
                              className="px-2.5 py-1 text-xs text-neutral-400 hover:text-neutral-200"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveNote(task.id)}
                              className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs rounded-lg transition-colors"
                            >
                              Save Note
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Actions: Note toggle & Manager controls */}
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Add / Edit Note toggle */}
                    <button
                      type="button"
                      onClick={() => setExpandedNotesTaskId(isNotesExpanded ? null : task.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        execution?.notes
                          ? 'text-amber-400 hover:bg-neutral-800'
                          : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800'
                      }`}
                      title={execution?.notes ? 'Edit observation note' : 'Add observation note'}
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>

                    {/* Manager Edit & Delete (available in Manager Mode) */}
                    {isManagerMode && (
                      <div className="flex items-center gap-1 pl-2 border-l border-neutral-800">
                        <button
                          type="button"
                          onClick={() => {
                            setTaskToEdit(task);
                            setIsDefineTaskModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
                          title="Edit Task Definition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {task.isCustom && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Delete custom task "${task.title}"?`)) {
                                deleteChecklistTask(task.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
                            title="Delete Custom Task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Floating Shift Sign-Off Ribbon (when nearing 100%) */}
      <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${
            metrics.allCriticalPassed 
              ? 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400' 
              : 'bg-amber-400/10 border-amber-400/20 text-amber-400'
          }`}>
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-neutral-100 block">
              Shift Validation Status: {metrics.completed}/{metrics.total} Tasks Completed
            </span>
            <span className="text-[11px] text-neutral-400">
              {currentRecord?.isSignedOff ? (
                <span className="text-emerald-400 font-semibold">
                  Certified by {currentRecord.signedOffBy} at {currentRecord.signedOffAt ? new Date(currentRecord.signedOffAt).toLocaleTimeString() : ''}
                </span>
              ) : metrics.allCriticalPassed ? (
                'All critical protocols passed. Ready for official manager handover.'
              ) : (
                `${metrics.criticalMissing} critical protocol(s) pending verification.`
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!currentRecord?.isSignedOff ? (
            <button
              onClick={handleSignOffClick}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
                metrics.allCriticalPassed
                  ? 'bg-amber-400 hover:bg-amber-300 text-neutral-950 shadow-amber-400/20'
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Sign Off & Lock Shift</span>
            </button>
          ) : (
            <button
              onClick={() => setIsSignOffModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <span>View Sign-Off Certificate</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Define Task Modal */}
      <DefineTaskModal
        isOpen={isDefineTaskModalOpen}
        onClose={() => {
          setIsDefineTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        initialTask={taskToEdit}
        defaultShiftType={selectedShiftType}
        onSaveTask={(taskData, existingId) => {
          if (existingId) {
            updateChecklistTask({
              ...taskData,
              id: existingId,
              order: taskToEdit?.order || 1
            });
            setBannerAlert({ message: 'Task definition updated.', type: 'success' });
          } else {
            addCustomChecklistTask(taskData);
            setBannerAlert({ message: 'New custom protocol added to shift.', type: 'success' });
          }
          setTimeout(() => setBannerAlert(null), 3000);
        }}
      />

      {/* Shift Sign-Off Modal */}
      <ShiftSignOffModal
        isOpen={isSignOffModalOpen}
        onClose={() => setIsSignOffModalOpen(false)}
        shiftDate={selectedDate}
        shiftType={selectedShiftType}
        tasks={checklistTasks}
        record={currentRecord}
        staffList={staffList}
        activeBarista={activeBarista}
        onConfirmSignOff={(supervisorName, managerNotes) => {
          const res = signOffShiftChecklist(selectedDate, selectedShiftType, supervisorName, managerNotes);
          if (res.success) {
            setBannerAlert({ message: `Shift officially signed off by ${supervisorName}.`, type: 'success' });
            setTimeout(() => setBannerAlert(null), 4000);
          }
          return res;
        }}
      />

      {/* History Audit Modal */}
      <ChecklistHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        records={checklistRecords}
        tasks={checklistTasks}
        onSelectDateAndShift={(date, shift) => {
          setSelectedDate(date);
          setSelectedShiftType(shift);
        }}
      />
    </div>
  );
};
