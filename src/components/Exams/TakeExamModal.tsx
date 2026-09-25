import React, { useState } from 'react';
import { useBaristaOS } from '../../context/BaristaOSContext';
import { BaristaExam, ExamCertificate } from '../../types';
import { X, CheckCircle2, AlertTriangle, ArrowRight, Award, Clock } from 'lucide-react';

interface TakeExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: BaristaExam;
  onSuccess: (certificate: ExamCertificate) => void;
}

export const TakeExamModal: React.FC<TakeExamModalProps> = ({
  isOpen,
  onClose,
  exam,
  onSuccess
}) => {
  const { activeBarista, submitExamAttempt } = useBaristaOS();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<{ scorePercent: number; passed: boolean; certificate?: ExamCertificate } | null>(null);

  if (!isOpen) return null;

  const handleSelectAnswer = (qId: string, optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [qId]: optionIndex }));
  };

  const answeredCount = Object.keys(answers).length;
  const isAllAnswered = answeredCount === exam.questions.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = submitExamAttempt(exam.id, answers, activeBarista.name);
    setResult(res);
    if (res.passed && res.certificate) {
      onSuccess(res.certificate);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl my-8 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div>
            <div className="text-[11px] text-amber-400 font-mono font-medium">{exam.tier}</div>
            <h2 className="text-base font-bold text-neutral-100">{exam.title}</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!result ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-xs">
            {/* Exam Meta Banner */}
            <div className="flex items-center justify-between bg-neutral-950 p-3 rounded-xl border border-neutral-800">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="text-neutral-300">Candidate: <strong className="text-neutral-100">{activeBarista.name}</strong></span>
              </div>
              <div className="flex items-center gap-3 font-mono text-neutral-400">
                <span>Passing Grade: <strong className="text-emerald-400 font-normal">{exam.passingScorePercent}%</strong></span>
                <span>Answered: <strong className="text-amber-400 font-normal">{answeredCount}/{exam.questions.length}</strong></span>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-5">
              {exam.questions.map((q, idx) => (
                <div key={q.id} className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-neutral-100 text-sm">
                      {idx + 1}. {q.question}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 shrink-0">
                      {q.topic}
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = answers[q.id] === optIdx;
                      return (
                        <label
                          key={optIdx}
                          onClick={() => handleSelectAnswer(q.id, optIdx)}
                          className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                            isSelected 
                              ? 'bg-amber-500/10 border-amber-500/60 text-neutral-100' 
                              : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800/60'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${q.id}`}
                            checked={isSelected}
                            onChange={() => handleSelectAnswer(q.id, optIdx)}
                            className="mt-0.5 accent-amber-400"
                          />
                          <span>{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer submit */}
            <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
              <span className="text-neutral-500">
                {isAllAnswered ? 'All questions answered' : `Please answer all questions (${answeredCount}/${exam.questions.length})`}
              </span>
              <button
                type="submit"
                disabled={!isAllAnswered}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 rounded-lg transition-colors shadow"
              >
                <span>Grade Assessment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        ) : (
          /* Result Summary */
          <div className="p-8 text-center space-y-6">
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
              result.passed ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-rose-500/10 border border-rose-500/30'
            }`}>
              {result.passed ? (
                <Award className="w-8 h-8 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-rose-400" />
              )}
            </div>

            <div>
              <div className="text-xs uppercase font-mono tracking-wider text-neutral-400">
                Examination Outcome
              </div>
              <h3 className="text-2xl font-bold text-neutral-100 mt-1">
                {result.passed ? 'Certification Awarded!' : 'Assessment Not Passed'}
              </h3>
              <div className="mt-2 text-3xl font-mono font-bold text-amber-400">
                {result.scorePercent}%
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Passing threshold: {exam.passingScorePercent}%
              </p>
            </div>

            <div className="text-xs text-neutral-300 max-w-md mx-auto">
              {result.passed ? (
                <p>
                  Outstanding achievement! Your certificate has been securely registered to your barista profile and is now available in your accreditation vault.
                </p>
              ) : (
                <p>
                  You did not meet the {exam.passingScorePercent}% threshold on this attempt. We recommend reviewing the training modules before re-testing.
                </p>
              )}
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={onClose}
                className="px-5 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-200 rounded-lg transition-colors"
              >
                Close
              </button>
              {!result.passed && (
                <button
                  onClick={() => {
                    setResult(null);
                    setAnswers({});
                  }}
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-xs font-semibold text-neutral-950 rounded-lg transition-colors"
                >
                  Retry Exam
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
