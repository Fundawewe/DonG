import React, { useState } from 'react';
import { ChecklistTaskDefinition, ShiftChecklistRecord, ShiftType, StaffMember } from '../../types';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  FileText, 
  PenTool, 
  Coffee,
  Sparkles,
  Award
} from 'lucide-react';

interface ShiftSignOffModalProps {
  isOpen: boolean;
  onClose: () => void;
  shiftDate: string;
  shiftType: ShiftType;
  tasks: ChecklistTaskDefinition[];
  record?: ShiftChecklistRecord;
  staffList: StaffMember[];
  activeBarista: StaffMember;
  onConfirmSignOff: (supervisorName: string, managerNotes: string) => { success: boolean; error?: string };
}

export const ShiftSignOffModal: React.FC<ShiftSignOffModalProps> = ({
  isOpen,
  onClose,
  shiftDate,
  shiftType,
  tasks,
  record,
  staffList,
  activeBarista,
  onConfirmSignOff
}) => {
  const [supervisorName, setSupervisorName] = useState(
    record?.signedOffBy || `${activeBarista.name} (${activeBarista.role})`
  );
  const [managerNotes, setManagerNotes] = useState(record?.managerNotes || '');
  const [validationError, setValidationError] = useState('');

  if (!isOpen) return null;

  const executions = record?.executions || {};
  const activeTasks = tasks.filter(t => t.shiftType === shiftType && t.isActive !== false);
  const criticalTasks = activeTasks.filter(t => t.isRequired);
  
  const completedCritical = criticalTasks.filter(t => executions[t.id]?.completed);
  const missingCritical = criticalTasks.filter(t => !executions[t.id]?.completed);
  
  const allCompleted = activeTasks.filter(t => executions[t.id]?.completed);
  const totalCount = activeTasks.length;
  const completedCount = allCompleted.length;
  const isCriticalPassed = missingCritical.length === 0;

  const shiftLabel = 
    shiftType === 'opening' ? 'Opening Shift Protocol' :
    shiftType === 'closing' ? 'Closing Shift Protocol' : 'Mid-Day Handover Protocol';

  const handleSignOff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCriticalPassed) {
      setValidationError(`Cannot sign off shift: ${missingCritical.length} critical protocols are still incomplete.`);
      return;
    }

    if (!supervisorName.trim()) {
      setValidationError('Please specify the supervisor or head barista name.');
      return;
    }

    const res = onConfirmSignOff(supervisorName.trim(), managerNotes.trim());
    if (!res.success) {
      setValidationError(res.error || 'Failed to sign off shift.');
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${
              isCriticalPassed 
                ? 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400' 
                : 'bg-amber-400/10 border-amber-400/20 text-amber-400'
            }`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                Shift Supervisor Sign-Off
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30">
                  {shiftDate}
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Official validation seal for {shiftLabel}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSignOff} className="flex-1 overflow-y-auto p-6 space-y-4">
          {validationError && (
            <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Validation Incomplete:</span>
                <p className="mt-0.5">{validationError}</p>
              </div>
            </div>
          )}

          {/* Validation Metrics Status Banner */}
          <div className={`p-4 rounded-2xl border ${
            isCriticalPassed 
              ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
              : 'bg-amber-950/40 border-amber-800/80 text-amber-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isCriticalPassed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                )}
                <div>
                  <h3 className="font-bold text-sm text-neutral-100">
                    {isCriticalPassed 
                      ? 'All Critical Protocols Validated' 
                      : `${missingCritical.length} Critical Protocols Pending`}
                  </h3>
                  <p className="text-xs opacity-80 mt-0.5">
                    {isCriticalPassed 
                      ? 'Ready for official manager sign-off and shift handover.' 
                      : 'All required safety & quality protocols must be checked off before sign-off.'}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="font-mono text-base font-bold text-neutral-100">
                  {completedCount}/{totalCount}
                </span>
                <span className="text-[10px] block opacity-70">
                  {Math.round((completedCount / (totalCount || 1)) * 100)}% Complete
                </span>
              </div>
            </div>

            {/* List missing critical tasks if any */}
            {!isCriticalPassed && (
              <div className="mt-3 pt-3 border-t border-amber-800/60 space-y-1">
                <span className="text-[11px] font-semibold text-amber-300 block mb-1">
                  Required protocols that must be completed:
                </span>
                {missingCritical.map(task => (
                  <div key={task.id} className="text-xs flex items-center gap-2 text-neutral-300 bg-black/30 px-2.5 py-1 rounded-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                    <span className="font-medium text-rose-300">[{task.station}]</span>
                    <span className="truncate">{task.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Supervisor Signature Identity */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5 flex items-center gap-1.5">
              <PenTool className="w-3.5 h-3.5 text-amber-400" />
              <span>Supervisor / Shift Lead Name:</span>
            </label>
            <input
              type="text"
              value={supervisorName}
              onChange={(e) => setSupervisorName(e.target.value)}
              placeholder="e.g. Samuel Kinyanjui (Head Barista)"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-400"
              required
            />
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] text-neutral-500">Quick Select:</span>
              {staffList.slice(0, 3).map(staff => (
                <button
                  key={staff.id}
                  type="button"
                  onClick={() => setSupervisorName(`${staff.name} (${staff.role})`)}
                  className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-[10px] text-neutral-300 transition-colors"
                >
                  {staff.name}
                </button>
              ))}
            </div>
          </div>

          {/* Handover & Quality Notes */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Shift Handover Observations & Quality Notes:</span>
            </label>
            <textarea
              rows={4}
              value={managerNotes}
              onChange={(e) => setManagerNotes(e.target.value)}
              placeholder="Record any grinder drift adjustments, inventory deliveries received, equipment quirks, customer rushes, or instructions for the next crew..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-400 resize-none leading-relaxed"
            />
          </div>

          {/* Digital Signature & Timestamp Notice */}
          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center gap-3">
            <Award className="w-6 h-6 text-amber-400 shrink-0" />
            <div className="text-[11px] text-neutral-400 leading-snug">
              Sign-off locks the shift record into the permanent quality ledger with an indelible ISO timestamp and supervisor credentials to guarantee operational consistency.
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!isCriticalPassed}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                isCriticalPassed
                  ? 'bg-amber-400 hover:bg-amber-300 text-neutral-950 shadow-amber-400/10 cursor-pointer'
                  : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Validate & Sign Off Shift</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
