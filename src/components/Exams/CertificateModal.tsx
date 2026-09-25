import React from 'react';
import { ExamCertificate } from '../../types';
import { X, Award, CheckCircle2, ShieldCheck, Printer } from 'lucide-react';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: ExamCertificate;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  certificate
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
        {/* Top Control Bar */}
        <div className="px-6 py-3 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
          <div className="text-xs text-neutral-400 font-mono flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>VERIFIED DIGITAL CREDENTIAL · {certificate.credentialCode}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 text-xs text-neutral-300 hover:text-neutral-100 bg-neutral-800 px-3 py-1 rounded transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button onClick={onClose} className="p-1 rounded text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Body (Pristine Award Certificate styling) */}
        <div className="p-8 sm:p-12 text-center bg-gradient-to-b from-neutral-900 to-neutral-950 relative overflow-hidden">
          {/* Subtle decorative gold border frame */}
          <div className="border-2 border-amber-500/30 rounded-2xl p-6 sm:p-10 relative">
            <div className="absolute top-2 left-2 text-amber-500/40 text-xs">❖</div>
            <div className="absolute top-2 right-2 text-amber-500/40 text-xs">❖</div>
            <div className="absolute bottom-2 left-2 text-amber-500/40 text-xs">❖</div>
            <div className="absolute bottom-2 right-2 text-amber-500/40 text-xs">❖</div>

            {/* Crest / Insignia */}
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mb-4">
              <Award className="w-8 h-8 text-amber-400" />
            </div>

            <div className="text-[11px] font-mono tracking-widest text-amber-400 uppercase">
              BARISTA OPERATING SYSTEM · SPECIALTY ACADEMY
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-neutral-100 mt-2 tracking-tight">
              Certificate of Professional Competency
            </h1>

            <p className="text-xs text-neutral-400 mt-2">
              This official certification confirms that
            </p>

            <div className="text-2xl sm:text-3xl font-bold text-amber-300 my-3 font-serif underline decoration-amber-500/30 underline-offset-8">
              {certificate.baristaName}
            </div>

            <p className="text-xs text-neutral-300 max-w-md mx-auto leading-relaxed">
              has successfully met all theoretical and practical standards in Specialty Coffee Association (SCA) extraction physics, refractometry, and sensory analysis for:
            </p>

            <div className="my-4 inline-block px-4 py-1.5 rounded-lg bg-neutral-900 border border-amber-500/40 text-sm font-semibold text-neutral-100">
              {certificate.examTitle}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-around gap-4 mt-6 pt-6 border-t border-neutral-800 text-xs">
              <div>
                <div className="text-neutral-500 text-[10px] uppercase font-mono">Examination Score</div>
                <div className="text-base font-bold font-mono text-emerald-400">{certificate.scorePercent}%</div>
                <div className="text-[10px] text-amber-400">{certificate.certificateGrade}</div>
              </div>

              <div>
                <div className="text-neutral-500 text-[10px] uppercase font-mono">Date Awarded</div>
                <div className="text-sm font-semibold text-neutral-200">{certificate.dateAwarded}</div>
                <div className="text-[10px] text-neutral-400">Nairobi, Kenya</div>
              </div>

              <div>
                <div className="text-neutral-500 text-[10px] uppercase font-mono">Verification Code</div>
                <div className="text-sm font-mono text-amber-300 font-semibold">{certificate.credentialCode}</div>
                <div className="text-[10px] text-emerald-400 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Authenticated</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
