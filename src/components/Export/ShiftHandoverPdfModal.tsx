import React, { useState } from 'react';
import { useBaristaOS } from '../../context/BaristaOSContext';
import { exportDailyQCToPDF, exportStaffPerformanceToPDF } from '../../services/pdfExportService';
import { 
  FileText, 
  Download, 
  X, 
  CheckCircle2, 
  Printer, 
  Calendar, 
  Building2, 
  User, 
  Sparkles,
  ClipboardList
} from 'lucide-react';

interface ShiftHandoverPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'qc' | 'staff';
}

export const ShiftHandoverPdfModal: React.FC<ShiftHandoverPdfModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'qc'
}) => {
  const { activeBranch, dialInLogs, staffList, activeBarista } = useBaristaOS();

  const [reportType, setReportType] = useState<'qc' | 'staff'>(defaultType);
  const [filterPeriod, setFilterPeriod] = useState<'today' | 'all'>('today');
  const [shiftNotes, setShiftNotes] = useState<string>(
    'All group heads purged and backflushed with Cafiza. Grinder zero-points verified. Incoming shift may proceed with active recipes.'
  );
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  // Filter logs if 'today' is selected
  const now = new Date();
  const todayDatePrefix = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const logsToExport = filterPeriod === 'today'
    ? dialInLogs.filter(l => l.timestamp.startsWith(todayDatePrefix) || dialInLogs.length <= 5)
    : dialInLogs;

  const handleExport = () => {
    setIsExporting(true);
    setExportSuccess(false);

    try {
      if (reportType === 'qc') {
        exportDailyQCToPDF({
          branch: activeBranch,
          logs: logsToExport.length > 0 ? logsToExport : dialInLogs,
          generatedBy: activeBarista.name,
          notes: shiftNotes
        });
      } else {
        exportStaffPerformanceToPDF({
          branch: activeBranch,
          staffList,
          generatedBy: activeBarista.name,
          notes: shiftNotes
        });
      }

      setExportSuccess(true);
      setTimeout(() => {
        setIsExporting(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error('PDF Export Error:', err);
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-100">
                Export Shift Handover PDF Report
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Physical printable documentation for store binders & manager sign-off
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Report Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-2">
              Select Report Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setReportType('qc')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  reportType === 'qc'
                    ? 'bg-amber-400/15 border-amber-400/60 text-neutral-100'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-amber-300">Daily Espresso QC</span>
                  {reportType === 'qc' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                </div>
                <p className="text-[11px] text-neutral-400 leading-tight">
                  TDS/EY refractometry, calibration records & recipe sign-off
                </p>
              </button>

              <button
                type="button"
                onClick={() => setReportType('staff')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  reportType === 'staff'
                    ? 'bg-amber-400/15 border-amber-400/60 text-neutral-100'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-amber-300">Staff & Roster Handover</span>
                  {reportType === 'staff' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                </div>
                <p className="text-[11px] text-neutral-400 leading-tight">
                  Shift duty statuses, dial-in streaks & barista certifications
                </p>
              </button>
            </div>
          </div>

          {/* Context Metadata Info */}
          <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800/80 space-y-2 text-xs">
            <div className="flex items-center justify-between text-neutral-300">
              <span className="flex items-center gap-1.5 text-neutral-400">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                Branch Location:
              </span>
              <span className="font-semibold text-neutral-100">{activeBranch.name}</span>
            </div>

            <div className="flex items-center justify-between text-neutral-300">
              <span className="flex items-center gap-1.5 text-neutral-400">
                <User className="w-3.5 h-3.5 text-amber-400" />
                Shift Supervisor:
              </span>
              <span className="font-semibold text-neutral-100">{activeBarista.name}</span>
            </div>

            <div className="flex items-center justify-between text-neutral-300">
              <span className="flex items-center gap-1.5 text-neutral-400">
                <ClipboardList className="w-3.5 h-3.5 text-amber-400" />
                Records Included:
              </span>
              <span className="font-mono text-neutral-100">
                {reportType === 'qc' ? `${logsToExport.length} Dial-In Pulls` : `${staffList.length} Team Members`}
              </span>
            </div>
          </div>

          {/* Scope Filter for QC logs */}
          {reportType === 'qc' && (
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Log Timeline Scope
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFilterPeriod('today')}
                  className={`flex-1 py-1.5 text-xs rounded-lg border font-medium transition-colors ${
                    filterPeriod === 'today'
                      ? 'bg-neutral-800 text-neutral-100 border-neutral-600'
                      : 'bg-neutral-950 text-neutral-400 border-neutral-800'
                  }`}
                >
                  Current Shift / Today
                </button>
                <button
                  type="button"
                  onClick={() => setFilterPeriod('all')}
                  className={`flex-1 py-1.5 text-xs rounded-lg border font-medium transition-colors ${
                    filterPeriod === 'all'
                      ? 'bg-neutral-800 text-neutral-100 border-neutral-600'
                      : 'bg-neutral-950 text-neutral-400 border-neutral-800'
                  }`}
                >
                  Complete QC History ({dialInLogs.length} logs)
                </button>
              </div>
            </div>
          )}

          {/* Manager Shift Notes */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Shift Handover Instructions & Equipment Notes
            </label>
            <textarea
              rows={3}
              value={shiftNotes}
              onChange={(e) => setShiftNotes(e.target.value)}
              placeholder="e.g. Group 2 steam wand purged and soaked. Hoppers replenished. EK43 calibration verified..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-200 focus:outline-none focus:border-amber-400 resize-none"
            />
            <p className="text-[10px] text-neutral-500 mt-1">
              Printed on the bottom handover sign-off block for outgoing and incoming supervisors.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-950/70 flex items-center justify-between">
          <div className="text-[11px] text-neutral-500 flex items-center gap-1">
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span>Format: A4 Print-Ready PDF</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isExporting}
              onClick={handleExport}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-md ${
                exportSuccess
                  ? 'bg-emerald-500 text-neutral-950'
                  : 'bg-amber-400 hover:bg-amber-300 text-neutral-950'
              }`}
            >
              {exportSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>PDF Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>{isExporting ? 'Generating...' : 'Download Shift PDF'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
