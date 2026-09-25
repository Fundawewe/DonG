import React, { useState } from 'react';
import { ShiftChecklistRecord, ChecklistTaskDefinition, ShiftType } from '../../types';
import { 
  X, 
  History, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  Printer, 
  ChevronRight,
  Filter,
  User,
  Coffee,
  Sparkles
} from 'lucide-react';

interface ChecklistHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: ShiftChecklistRecord[];
  tasks: ChecklistTaskDefinition[];
  onSelectDateAndShift: (date: string, shiftType: ShiftType) => void;
}

export const ChecklistHistoryModal: React.FC<ChecklistHistoryModalProps> = ({
  isOpen,
  onClose,
  records,
  tasks,
  onSelectDateAndShift
}) => {
  const [filterShift, setFilterShift] = useState<'all' | ShiftType>('all');
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(
    records.length > 0 ? records[0].id : null
  );

  if (!isOpen) return null;

  const filteredRecords = records.filter(r => {
    if (filterShift !== 'all' && r.shiftType !== filterShift) return false;
    return true;
  }).sort((a, b) => b.date.localeCompare(a.date));

  const selectedRecord = records.find(r => r.id === selectedRecordId) || filteredRecords[0];

  const getRecordStats = (rec: ShiftChecklistRecord) => {
    const shiftTasks = tasks.filter(t => t.shiftType === rec.shiftType && t.isActive !== false);
    const criticalTasks = shiftTasks.filter(t => t.isRequired);
    const completedTasks = shiftTasks.filter(t => rec.executions[t.id]?.completed);
    const completedCritical = criticalTasks.filter(t => rec.executions[t.id]?.completed);

    const total = shiftTasks.length;
    const completed = completedTasks.length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    const allCriticalPassed = criticalTasks.length > 0 && completedCritical.length === criticalTasks.length;

    return { total, completed, percent, allCriticalPassed, criticalTotal: criticalTasks.length, criticalCompleted: completedCritical.length };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                Shift Protocol Audit & Historical Logbook
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30">
                  {records.length} Recorded Shifts
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Track compliance timestamps, staff execution consistency & supervisor sign-offs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl transition-colors"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Print Audit</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="px-6 py-3 border-b border-neutral-800 bg-neutral-950/40 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-500 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" /> Shift:
            </span>
            {(['all', 'opening', 'closing', 'handover'] as const).map(type => (
              <button
                key={type}
                onClick={() => setFilterShift(type)}
                className={`px-3 py-1 rounded-lg capitalize transition-colors font-medium ${
                  filterShift === type
                    ? 'bg-amber-400 text-neutral-950 font-bold'
                    : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
                }`}
              >
                {type === 'all' ? 'All Shifts' : type}
              </button>
            ))}
          </div>

          <span className="text-[11px] text-neutral-500 font-mono">
            Showing {filteredRecords.length} records
          </span>
        </div>

        {/* Content Master-Detail Layout */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* Left Column: Records List */}
          <div className="md:col-span-5 border-r border-neutral-800 overflow-y-auto p-4 space-y-2">
            {filteredRecords.length === 0 ? (
              <div className="py-12 text-center text-xs text-neutral-500">
                No shift history records match this filter.
              </div>
            ) : (
              filteredRecords.map(rec => {
                const stats = getRecordStats(rec);
                const isSelected = selectedRecord?.id === rec.id;
                const shiftTitle = 
                  rec.shiftType === 'opening' ? '🌅 Opening Shift' :
                  rec.shiftType === 'closing' ? '🌙 Closing Shift' : '🔄 Handover';

                return (
                  <button
                    key={rec.id}
                    onClick={() => setSelectedRecordId(rec.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-neutral-800/90 border-amber-400/80 shadow-md'
                        : 'bg-neutral-950/70 border-neutral-800/80 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-100">{shiftTitle}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-800">
                        {rec.date}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[11px] font-mono font-bold ${
                          stats.percent === 100 ? 'text-emerald-400' : 'text-amber-400'
                        }`}>
                          {stats.completed}/{stats.total} ({stats.percent}%)
                        </span>
                      </div>

                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        rec.isSignedOff 
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {rec.isSignedOff ? '✓ SIGNED OFF' : 'PENDING'}
                      </span>
                    </div>

                    {rec.signedOffBy && (
                      <div className="mt-1 text-[11px] text-neutral-400 truncate">
                        Signed: {rec.signedOffBy}
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Right Column: Selected Record Detail & Audit Timestamps */}
          <div className="md:col-span-7 overflow-y-auto p-5 bg-neutral-950/40">
            {selectedRecord ? (
              <div className="space-y-4">
                {/* Detail Header */}
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase font-bold text-amber-400 tracking-wider">
                        {selectedRecord.shiftType.toUpperCase()} PROTOCOL AUDIT
                      </span>
                      <h3 className="text-base font-bold text-neutral-100 mt-0.5">
                        Shift on {selectedRecord.date}
                      </h3>
                      <p className="text-xs text-neutral-400">
                        ID: <span className="font-mono">{selectedRecord.id}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        onSelectDateAndShift(selectedRecord.date, selectedRecord.shiftType);
                        onClose();
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold rounded-xl transition-all shadow-sm"
                    >
                      <span>Open Live Shift</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Sign-off badge */}
                  <div className="mt-3 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                    <span className="text-neutral-400">Sign-Off Status:</span>
                    {selectedRecord.isSignedOff ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Signed by {selectedRecord.signedOffBy} ({selectedRecord.signedOffAt ? new Date(selectedRecord.signedOffAt).toLocaleTimeString() : ''})
                      </span>
                    ) : (
                      <span className="text-amber-400 font-medium">Awaiting Manager Sign-Off</span>
                    )}
                  </div>

                  {selectedRecord.managerNotes && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-neutral-900 border border-neutral-800/80 text-xs text-neutral-300 italic">
                      "{selectedRecord.managerNotes}"
                    </div>
                  )}
                </div>

                {/* Audit Task Breakdown with Precise Timestamps */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-neutral-300 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Protocol Checkpoint Timestamps:
                  </h4>

                  {tasks
                    .filter(t => t.shiftType === selectedRecord.shiftType && t.isActive !== false)
                    .map(task => {
                      const execution = selectedRecord.executions[task.id];
                      const isDone = execution?.completed;

                      return (
                        <div
                          key={task.id}
                          className={`p-3 rounded-xl border transition-all ${
                            isDone 
                              ? 'bg-neutral-950 border-neutral-800/80' 
                              : 'bg-neutral-950/50 border-neutral-900 opacity-60'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2.5">
                              <span className={`p-1 rounded mt-0.5 ${isDone ? 'bg-emerald-400/20 text-emerald-400' : 'bg-neutral-800 text-neutral-500'}`}>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </span>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-xs text-neutral-200">
                                    {task.title}
                                  </span>
                                  {task.isRequired && (
                                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800">
                                      CRITICAL
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-neutral-400 mt-0.5">{task.station}</p>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              {isDone ? (
                                <div>
                                  <span className="text-[11px] font-mono text-emerald-400 font-bold block">
                                    {execution.completedAt 
                                      ? new Date(execution.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                                      : 'Completed'}
                                  </span>
                                  <span className="text-[10px] text-neutral-500 block truncate max-w-[120px]">
                                    {execution.completedBy || 'Staff'}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[11px] text-neutral-500 font-mono italic">
                                  Incomplete
                                </span>
                              )}
                            </div>
                          </div>

                          {execution?.notes && (
                            <div className="mt-2 pt-2 border-t border-neutral-800/60 text-[11px] text-neutral-300">
                              <span className="text-amber-400 font-medium">Note:</span> {execution.notes}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-xs text-neutral-500">
                Select a shift from the left list to view its audit trail.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950/80 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Shift checklist records comply with ISO Specialty Café QA Protocols</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium rounded-lg text-xs transition-colors"
          >
            Close Logbook
          </button>
        </div>
      </div>
    </div>
  );
};
