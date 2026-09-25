import React, { useState } from 'react';
import { useBaristaOS } from '../../context/BaristaOSContext';
import { StaffMember } from '../../types';
import { ShiftHandoverPdfModal } from '../Export/ShiftHandoverPdfModal';
import { BaristaKpiReportView } from './BaristaKpiReportView';
import { 
  Users, 
  Flame, 
  Award, 
  Clock, 
  Coffee, 
  CheckCircle2, 
  ShieldCheck, 
  TrendingUp,
  UserCheck,
  FileText,
  BarChart3,
  Star,
  ChevronRight
} from 'lucide-react';

export const StaffPerformanceView: React.FC = () => {
  const { 
    staffList, 
    updateStaffStatus, 
    activeBarista, 
    setActiveBarista,
    activeBranch 
  } = useBaristaOS();

  const [activeViewMode, setActiveViewMode] = useState<'kpi-report' | 'roster' | 'leaderboard'>('kpi-report');
  const [pdfModalOpen, setPdfModalOpen] = useState<boolean>(false);

  // Quick KPI calculation for staff cards
  const getStaffKpiQuick = (staff: StaffMember) => {
    if (staff.role === 'Head Barista') return { score: 96, tier: 'Master Specialist' };
    if (staff.role === 'Senior Barista') return { score: 91, tier: 'Senior Professional' };
    if (staff.role === 'Barista') return { score: 82, tier: 'Senior Professional' };
    return { score: 74, tier: 'Proficient Practitioner' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            Barista Performance & KPI Intelligence Hub
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            5-pillar evaluation across Trainings, Exams, Sales & Speed, Daily QC & Dial-In, and Shift Checklists
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-2 text-xs bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-xl font-mono">
            <span className="text-neutral-400">Active On Bar:</span>
            <span className="text-emerald-400 font-bold">{staffList.filter(s => s.status === 'on-shift').length} Baristas</span>
          </div>

          <button
            onClick={() => setPdfModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-200 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl transition-colors whitespace-nowrap"
            title="Export Staff Roster & Shift Handover Handout to PDF"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Shift Handover PDF</span>
          </button>
        </div>
      </div>

      {/* Primary Sub-Nav View Mode Toggle */}
      <div className="flex items-center gap-2 p-1 bg-neutral-900 border border-neutral-800 rounded-2xl w-fit">
        <button
          onClick={() => setActiveViewMode('kpi-report')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeViewMode === 'kpi-report'
              ? 'bg-amber-400 text-neutral-950 shadow-md shadow-amber-400/10'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Barista KPI Scorecard Report</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
            activeViewMode === 'kpi-report' ? 'bg-neutral-950/20 text-neutral-950' : 'bg-amber-950 text-amber-400'
          }`}>
            5 Pillars
          </span>
        </button>

        <button
          onClick={() => setActiveViewMode('roster')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeViewMode === 'roster'
              ? 'bg-amber-400 text-neutral-950 shadow-md shadow-amber-400/10'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Team Roster & Shift Status</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
            activeViewMode === 'roster' ? 'bg-neutral-950/20 text-neutral-950' : 'bg-neutral-800 text-neutral-400'
          }`}>
            {staffList.length} Staff
          </span>
        </button>
      </div>

      {/* MAIN VIEWPORT BODY */}
      {activeViewMode === 'kpi-report' ? (
        <BaristaKpiReportView />
      ) : (
        /* Staff Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {staffList.map(staff => {
            const isSelected = staff.id === activeBarista.id;
            const kpiQuick = getStaffKpiQuick(staff);

            return (
              <div 
                key={staff.id}
                className={`p-5 rounded-2xl bg-neutral-900 border transition-all ${
                  isSelected ? 'border-amber-500/50 shadow-md shadow-amber-500/5' : 'border-neutral-800'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-950 border border-neutral-700/80 flex items-center justify-center font-bold text-base text-amber-300">
                      {staff.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-neutral-100">{staff.name}</h3>
                        {isSelected && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400 text-neutral-950 font-bold">
                            ACTIVE BAR
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-neutral-400 mt-0.5">
                        {staff.role} · {staff.email}
                      </div>
                    </div>
                  </div>

                  {/* Shift Status Selector */}
                  <select
                    value={staff.status}
                    onChange={(e) => updateStaffStatus(staff.id, e.target.value as StaffMember['status'])}
                    className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold border focus:outline-none ${
                      staff.status === 'on-shift' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                      staff.status === 'break' ? 'bg-amber-950 text-amber-300 border-amber-800' :
                      'bg-neutral-800 text-neutral-400 border-neutral-700'
                    }`}
                  >
                    <option value="on-shift">On Shift</option>
                    <option value="break">On Break</option>
                    <option value="off-duty">Off Duty</option>
                  </select>
                </div>

                {/* KPI Index Quick Badge */}
                <div className="mt-3 flex items-center justify-between bg-neutral-950/80 px-3 py-2 rounded-xl border border-neutral-800 text-xs">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span className="text-neutral-400">KPI Rating:</span>
                    <strong className="text-neutral-200">{kpiQuick.tier}</strong>
                  </div>
                  <div className="font-mono font-bold text-amber-400">
                    {kpiQuick.score}<span className="text-[10px] text-neutral-500">/100</span>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="mt-3 grid grid-cols-4 gap-2 bg-neutral-950 p-3 rounded-xl border border-neutral-800 text-center font-mono">
                  <div>
                    <div className="text-[10px] text-neutral-500 uppercase font-sans">Streak</div>
                    <div className="text-sm font-bold text-amber-400 flex items-center justify-center gap-0.5 mt-0.5">
                      <Flame className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{staff.dialInStreakDays}d</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-neutral-500 uppercase font-sans">Shots</div>
                    <div className="text-sm font-bold text-neutral-200 mt-0.5">
                      {staff.totalShotsLogged.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-neutral-500 uppercase font-sans">QC Avg</div>
                    <div className="text-sm font-bold text-emerald-400 mt-0.5">
                      {staff.averageExtractionScore}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-neutral-500 uppercase font-sans">Hours</div>
                    <div className="text-sm font-bold text-neutral-300 mt-0.5">
                      {staff.shiftHoursLogged}h
                    </div>
                  </div>
                </div>

                {/* Certifications Badges */}
                <div className="mt-3 pt-3 border-t border-neutral-800">
                  <div className="text-[11px] font-semibold text-neutral-400 mb-1.5 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>Accreditations & Certificates ({staff.examCertifications.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {staff.examCertifications.map((cert, idx) => (
                      <span 
                        key={idx}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-neutral-950 text-neutral-300 border border-neutral-800 flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>{cert.split(':')[0]}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Switch CTA & View KPI CTA */}
                <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setActiveBarista(staff);
                      setActiveViewMode('kpi-report');
                    }}
                    className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                  >
                    <span>View 5-Pillar KPI Report</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  {!isSelected && (
                    <button
                      onClick={() => setActiveBarista(staff)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-200 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span>Set as Active on Bar</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Shift Handover PDF Export Modal */}
      <ShiftHandoverPdfModal 
        isOpen={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
        defaultType="staff"
      />
    </div>
  );
};
