import React, { useState } from 'react';
import { useBaristaOS } from '../../context/BaristaOSContext';
import { BaristaExam, ExamCertificate } from '../../types';
import { TakeExamModal } from './TakeExamModal';
import { CertificateModal } from './CertificateModal';
import { 
  FileCheck2, 
  Award, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Printer
} from 'lucide-react';

export const ExamsView: React.FC = () => {
  const { exams, certificates, activeBarista } = useBaristaOS();
  const [selectedExam, setSelectedExam] = useState<BaristaExam | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<ExamCertificate | null>(null);
  const [takeExamOpen, setTakeExamOpen] = useState<boolean>(false);
  const [certModalOpen, setCertModalOpen] = useState<boolean>(false);

  const handleStartExam = (exam: BaristaExam) => {
    setSelectedExam(exam);
    setTakeExamOpen(true);
  };

  const handleExamSuccess = (cert: ExamCertificate) => {
    setSelectedCertificate(cert);
    setTakeExamOpen(false);
    setCertModalOpen(true);
  };

  const handleViewCert = (cert: ExamCertificate) => {
    setSelectedCertificate(cert);
    setCertModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-amber-400" />
            Barista Certification Exams & Credentials
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            SCA-aligned theoretical and extraction assessments for career progression
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-neutral-300">Vault: <strong className="text-neutral-100 font-mono">{certificates.length}</strong> Issued</span>
        </div>
      </div>

      {/* Available Exams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {exams.map(exam => {
          const hasPassed = activeBarista.examCertifications.includes(exam.title);

          return (
            <div 
              key={exam.id}
              className={`p-5 rounded-2xl bg-neutral-900 border flex flex-col justify-between transition-all ${
                hasPassed ? 'border-emerald-500/40' : 'border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-neutral-950 text-amber-400 border border-neutral-800">
                    {exam.tier.split(':')[0]}
                  </span>
                  {hasPassed && (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Certified
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-base text-neutral-100 mt-2">
                  {exam.title}
                </h3>
                <p className="text-xs text-neutral-400 mt-1 line-clamp-3">
                  {exam.description}
                </p>

                <div className="mt-4 pt-3 border-t border-neutral-800/80 space-y-1.5 text-xs text-neutral-400">
                  <div className="flex items-center justify-between">
                    <span>Questions:</span>
                    <span className="font-mono text-neutral-200">{exam.questions.length} Scenario Items</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Passing Score:</span>
                    <span className="font-mono text-emerald-400">{exam.passingScorePercent}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Time Allowance:</span>
                    <span className="font-mono text-neutral-200">{exam.timeLimitMinutes} Minutes</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-neutral-800">
                <button
                  onClick={() => handleStartExam(exam)}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    hasPassed 
                      ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200' 
                      : 'bg-amber-400 hover:bg-amber-300 text-neutral-950 shadow'
                  }`}
                >
                  <span>{hasPassed ? 'Retake to Improve Score' : 'Begin Examination'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Issued Certificates Vault */}
      <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-neutral-100 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Verified Certificate Registry
            </h2>
            <p className="text-xs text-neutral-400">
              Cryptographically timestamped credentials for café compliance and barista resumes
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {certificates.map(cert => (
            <div 
              key={cert.id}
              onClick={() => handleViewCert(cert)}
              className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-amber-500/40 transition-colors cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="font-semibold text-xs text-neutral-200 group-hover:text-amber-300 transition-colors">
                    {cert.examTitle}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    Awarded to <strong className="text-neutral-300 font-medium">{cert.baristaName}</strong> · {cert.dateAwarded}
                  </div>
                  <div className="text-[10px] font-mono text-neutral-500 mt-0.5">
                    {cert.credentialCode} · {cert.certificateGrade} ({cert.scorePercent}%)
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs text-neutral-400 group-hover:text-neutral-200">
                <span>View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedExam && (
        <TakeExamModal
          isOpen={takeExamOpen}
          onClose={() => setTakeExamOpen(false)}
          exam={selectedExam}
          onSuccess={handleExamSuccess}
        />
      )}

      {selectedCertificate && (
        <CertificateModal
          isOpen={certModalOpen}
          onClose={() => setCertModalOpen(false)}
          certificate={selectedCertificate}
        />
      )}
    </div>
  );
};
