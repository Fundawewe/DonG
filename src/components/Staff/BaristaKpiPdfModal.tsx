import React from 'react';
import { BaristaKPIReport } from '../../types';
import { 
  X, 
  Printer, 
  Download, 
  Award, 
  CheckCircle2, 
  TrendingUp, 
  Coffee, 
  ClipboardCheck, 
  GraduationCap, 
  FileCheck2,
  Calendar,
  Building,
  User,
  ShieldCheck
} from 'lucide-react';

interface BaristaKpiPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: BaristaKPIReport;
  branchName: string;
  managerName: string;
}

export const BaristaKpiPdfModal: React.FC<BaristaKpiPdfModalProps> = ({
  isOpen,
  onClose,
  report,
  branchName,
  managerName
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 80) return 'text-amber-400';
    return 'text-blue-400';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return 'bg-emerald-950 text-emerald-300 border-emerald-800';
    if (score >= 80) return 'bg-amber-950 text-amber-300 border-amber-800';
    return 'bg-blue-950 text-blue-300 border-blue-800';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-8 print:border-none print:shadow-none print:m-0 print:bg-white print:text-neutral-900">
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950 print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-neutral-100">
              Official Barista KPI Performance Scorecard & Review
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-100 rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Body (Formatted for Screen & Print) */}
        <div className="p-8 space-y-6 text-neutral-100 print:text-neutral-900 print:p-6 bg-neutral-900 print:bg-white text-sm">
          
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-neutral-800 print:border-neutral-300 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 print:text-amber-700 bg-amber-950/60 print:bg-amber-50 px-2.5 py-0.5 rounded border border-amber-800/60 print:border-amber-200">
                  BARISTA OS · OPERATIONAL KPI REPORT
                </span>
                <span className="text-xs text-neutral-400 print:text-neutral-500 font-mono">
                  REF: KPI-{report.baristaId.toUpperCase()}-{report.generatedDate.replace(/-/g, '')}
                </span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-neutral-100 print:text-neutral-950 mt-2">
                Barista Performance Evaluation
              </h1>
              <p className="text-xs text-neutral-400 print:text-neutral-600 mt-0.5">
                Specialty Coffee Quality Control, Technical Examination, Speed of Service & Shift Protocol Audit
              </p>
            </div>

            {/* Overall Score Badge */}
            <div className="text-right flex items-center gap-4">
              <div className="text-right">
                <div className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 print:text-neutral-500">
                  Overall Composite Index
                </div>
                <div className="text-3xl font-black font-mono text-amber-400 print:text-neutral-900">
                  {report.overallScore}<span className="text-lg text-neutral-500 font-normal">/100</span>
                </div>
                <div className="text-xs font-semibold text-emerald-400 print:text-emerald-700">
                  {report.gradeTier}
                </div>
              </div>
            </div>
          </div>

          {/* Barista & Evaluation Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-neutral-950 print:bg-neutral-100 border border-neutral-800 print:border-neutral-200 font-mono text-xs">
            <div>
              <span className="text-neutral-500 block text-[10px] uppercase font-sans">Barista Name</span>
              <strong className="text-neutral-200 print:text-neutral-900 font-sans text-sm">{report.baristaName}</strong>
              <div className="text-[11px] text-amber-400 print:text-amber-800 mt-0.5">{report.baristaRole}</div>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px] uppercase font-sans">Branch & Station</span>
              <strong className="text-neutral-200 print:text-neutral-900 font-sans">{branchName}</strong>
              <div className="text-[11px] text-neutral-400 print:text-neutral-600 mt-0.5">Espresso Bar 1</div>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px] uppercase font-sans">Evaluation Period</span>
              <strong className="text-neutral-200 print:text-neutral-900">{report.timeframe.toUpperCase()} (Sep 2026)</strong>
              <div className="text-[11px] text-neutral-400 print:text-neutral-600 mt-0.5">Date: {report.generatedDate}</div>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px] uppercase font-sans">Team Rank</span>
              <strong className="text-emerald-400 print:text-emerald-700 text-sm">#{report.teamRank} of {report.totalTeamMembers}</strong>
              <div className="text-[11px] text-neutral-400 print:text-neutral-600 mt-0.5">Top Quartile Performer</div>
            </div>
          </div>

          {/* 5-Pillar Scorecard Table */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 print:text-neutral-700 mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400 print:text-amber-700" />
              <span>5 Core Performance Pillars Assessment</span>
            </h3>

            <div className="overflow-x-auto border border-neutral-800 print:border-neutral-300 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-950 print:bg-neutral-100 text-neutral-400 print:text-neutral-700 font-mono text-[11px] border-b border-neutral-800 print:border-neutral-300">
                  <tr>
                    <th className="py-2.5 px-3">Performance Pillar</th>
                    <th className="py-2.5 px-3 text-center">Weight</th>
                    <th className="py-2.5 px-3">Primary Metric</th>
                    <th className="py-2.5 px-3 text-center">Target</th>
                    <th className="py-2.5 px-3 text-right">Score</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800 print:divide-neutral-200 font-mono">
                  {/* Daily QC */}
                  <tr className="hover:bg-neutral-800/30 print:hover:bg-transparent">
                    <td className="py-3 px-3 font-sans">
                      <div className="font-bold text-neutral-200 print:text-neutral-900 flex items-center gap-1.5">
                        <Coffee className="w-3.5 h-3.5 text-amber-400 print:text-amber-700" />
                        <span>Daily QC & Dial-In</span>
                      </div>
                      <div className="text-[10px] text-neutral-500 font-sans mt-0.5">
                        Extraction EY% window, sweet-spot accuracy & streak
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center text-neutral-400 print:text-neutral-600">25%</td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-neutral-200 print:text-neutral-900">{report.pillars.dailyQc.primaryMetric.value}</span>
                      <span className="text-[10px] text-neutral-500 block font-sans">{report.pillars.dailyQc.primaryMetric.sublabel}</span>
                    </td>
                    <td className="py-3 px-3 text-center text-neutral-400 print:text-neutral-600">85</td>
                    <td className="py-3 px-3 text-right font-bold text-neutral-100 print:text-neutral-900 text-sm">
                      {report.pillars.dailyQc.score}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 text-[10px] rounded font-bold uppercase bg-emerald-950 print:bg-emerald-100 text-emerald-400 print:text-emerald-800 border border-emerald-800/60 print:border-emerald-300">
                        {report.pillars.dailyQc.status}
                      </span>
                    </td>
                  </tr>

                  {/* Sales & Productivity */}
                  <tr className="hover:bg-neutral-800/30 print:hover:bg-transparent">
                    <td className="py-3 px-3 font-sans">
                      <div className="font-bold text-neutral-200 print:text-neutral-900 flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400 print:text-emerald-700" />
                        <span>Sales & Productivity</span>
                      </div>
                      <div className="text-[10px] text-neutral-500 font-sans mt-0.5">
                        Hourly throughput pace, speed of service & waste saved
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center text-neutral-400 print:text-neutral-600">25%</td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-neutral-200 print:text-neutral-900">{report.pillars.salesProductivity.primaryMetric.value}</span>
                      <span className="text-[10px] text-neutral-500 block font-sans">{report.pillars.salesProductivity.primaryMetric.sublabel}</span>
                    </td>
                    <td className="py-3 px-3 text-center text-neutral-400 print:text-neutral-600">85</td>
                    <td className="py-3 px-3 text-right font-bold text-neutral-100 print:text-neutral-900 text-sm">
                      {report.pillars.salesProductivity.score}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 text-[10px] rounded font-bold uppercase bg-emerald-950 print:bg-emerald-100 text-emerald-400 print:text-emerald-800 border border-emerald-800/60 print:border-emerald-300">
                        {report.pillars.salesProductivity.status}
                      </span>
                    </td>
                  </tr>

                  {/* Shift Checklists */}
                  <tr className="hover:bg-neutral-800/30 print:hover:bg-transparent">
                    <td className="py-3 px-3 font-sans">
                      <div className="font-bold text-neutral-200 print:text-neutral-900 flex items-center gap-1.5">
                        <ClipboardCheck className="w-3.5 h-3.5 text-blue-400 print:text-blue-700" />
                        <span>Shift Checklists & Compliance</span>
                      </div>
                      <div className="text-[10px] text-neutral-500 font-sans mt-0.5">
                        Opening, closing & handover sanitary checklist adherence
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center text-neutral-400 print:text-neutral-600">20%</td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-neutral-200 print:text-neutral-900">{report.pillars.shiftChecklists.primaryMetric.value}</span>
                      <span className="text-[10px] text-neutral-500 block font-sans">{report.pillars.shiftChecklists.primaryMetric.sublabel}</span>
                    </td>
                    <td className="py-3 px-3 text-center text-neutral-400 print:text-neutral-600">85</td>
                    <td className="py-3 px-3 text-right font-bold text-neutral-100 print:text-neutral-900 text-sm">
                      {report.pillars.shiftChecklists.score}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 text-[10px] rounded font-bold uppercase bg-emerald-950 print:bg-emerald-100 text-emerald-400 print:text-emerald-800 border border-emerald-800/60 print:border-emerald-300">
                        {report.pillars.shiftChecklists.status}
                      </span>
                    </td>
                  </tr>

                  {/* Trainings */}
                  <tr className="hover:bg-neutral-800/30 print:hover:bg-transparent">
                    <td className="py-3 px-3 font-sans">
                      <div className="font-bold text-neutral-200 print:text-neutral-900 flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-purple-400 print:text-purple-700" />
                        <span>Staff Training & SCA Science</span>
                      </div>
                      <div className="text-[10px] text-neutral-500 font-sans mt-0.5">
                        Vocational modules, milk physics & sensory cupping
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center text-neutral-400 print:text-neutral-600">15%</td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-neutral-200 print:text-neutral-900">{report.pillars.trainings.primaryMetric.value}</span>
                      <span className="text-[10px] text-neutral-500 block font-sans">{report.pillars.trainings.primaryMetric.sublabel}</span>
                    </td>
                    <td className="py-3 px-3 text-center text-neutral-400 print:text-neutral-600">80</td>
                    <td className="py-3 px-3 text-right font-bold text-neutral-100 print:text-neutral-900 text-sm">
                      {report.pillars.trainings.score}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 text-[10px] rounded font-bold uppercase bg-emerald-950 print:bg-emerald-100 text-emerald-400 print:text-emerald-800 border border-emerald-800/60 print:border-emerald-300">
                        {report.pillars.trainings.status}
                      </span>
                    </td>
                  </tr>

                  {/* Exams */}
                  <tr className="hover:bg-neutral-800/30 print:hover:bg-transparent">
                    <td className="py-3 px-3 font-sans">
                      <div className="font-bold text-neutral-200 print:text-neutral-900 flex items-center gap-1.5">
                        <FileCheck2 className="w-3.5 h-3.5 text-amber-400 print:text-amber-700" />
                        <span>Exams & Accreditations</span>
                      </div>
                      <div className="text-[10px] text-neutral-500 font-sans mt-0.5">
                        3-tier technical testing & distinction credentials
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center text-neutral-400 print:text-neutral-600">15%</td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-neutral-200 print:text-neutral-900">{report.pillars.exams.primaryMetric.value}</span>
                      <span className="text-[10px] text-neutral-500 block font-sans">{report.pillars.exams.primaryMetric.sublabel}</span>
                    </td>
                    <td className="py-3 px-3 text-center text-neutral-400 print:text-neutral-600">80</td>
                    <td className="py-3 px-3 text-right font-bold text-neutral-100 print:text-neutral-900 text-sm">
                      {report.pillars.exams.score}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 text-[10px] rounded font-bold uppercase bg-emerald-950 print:bg-emerald-100 text-emerald-400 print:text-emerald-800 border border-emerald-800/60 print:border-emerald-300">
                        {report.pillars.exams.status}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Key Strengths & Growth Areas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-neutral-950 print:bg-neutral-50 border border-neutral-800 print:border-neutral-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 print:text-emerald-800 flex items-center gap-1.5 mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Demonstrated Strengths</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-neutral-300 print:text-neutral-700">
                {report.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950 print:bg-neutral-50 border border-neutral-800 print:border-neutral-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 print:text-amber-800 flex items-center gap-1.5 mb-2">
                <TrendingUp className="w-4 h-4" />
                <span>Coaching & Actionable Goals</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-neutral-300 print:text-neutral-700">
                {report.areasForImprovement.map((area, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Manager Assessment & Review Notes */}
          <div className="p-4 rounded-xl bg-neutral-950 print:bg-neutral-50 border border-neutral-800 print:border-neutral-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 print:text-neutral-700 mb-1.5">
              Head Barista / Operations Manager Sign-off & Notes
            </h4>
            <p className="text-xs text-neutral-300 print:text-neutral-800 italic leading-relaxed">
              "{report.managerCoachingNotes || 'Consistently meets specialty espresso standards, exemplary recipe adherence and hygiene on bar.'}"
            </p>
          </div>

          {/* Signature Block (For Official Physical or Digital Sign-off) */}
          <div className="pt-6 border-t border-neutral-800 print:border-neutral-300 grid grid-cols-2 gap-8 text-xs font-mono">
            <div>
              <div className="h-10 border-b border-neutral-700 print:border-neutral-400 mb-1"></div>
              <div className="text-neutral-400 print:text-neutral-600">Barista Signature: {report.baristaName}</div>
              <div className="text-[10px] text-neutral-500">Date: ________________________</div>
            </div>
            <div>
              <div className="h-10 border-b border-neutral-700 print:border-neutral-400 mb-1"></div>
              <div className="text-neutral-400 print:text-neutral-600">Supervisor Signature: {managerName}</div>
              <div className="text-[10px] text-neutral-500">Date: ________________________</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
