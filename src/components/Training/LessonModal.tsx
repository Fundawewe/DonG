import React, { useState } from 'react';
import { TrainingLesson, TrainingModule } from '../../types';
import { X, CheckCircle2, AlertCircle, ArrowRight, Sparkles, BookOpen } from 'lucide-react';

interface LessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  module: TrainingModule;
  lesson: TrainingLesson;
  onCompleteLesson: () => void;
  isAlreadyCompleted: boolean;
}

export const LessonModal: React.FC<LessonModalProps> = ({
  isOpen,
  onClose,
  module,
  lesson,
  onCompleteLesson,
  isAlreadyCompleted
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submittedQuiz, setSubmittedQuiz] = useState<boolean>(false);

  if (!isOpen) return null;

  const isCorrect = selectedOption === lesson.checkpointQuestion.correctAnswer;

  const handleQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedQuiz(true);
    if (isCorrect) {
      onCompleteLesson();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl my-8 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div>
            <div className="text-[11px] text-amber-400 font-mono font-medium">
              {module.code} · {module.title}
            </div>
            <h2 className="text-base font-bold text-neutral-100 mt-0.5">
              {lesson.title}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-sm">
          {/* Main Lesson Body */}
          <div className="text-neutral-200 leading-relaxed whitespace-pre-line bg-neutral-950/40 p-4 rounded-xl border border-neutral-800/80">
            {lesson.content}
          </div>

          {/* Key Takeaways */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
            <div className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Core Operational Rules</span>
            </div>
            <ul className="space-y-1.5 text-xs text-neutral-300 list-disc list-inside">
              {lesson.keyTakeaways.map((takeaway, idx) => (
                <li key={idx} className="leading-snug">{takeaway}</li>
              ))}
            </ul>
          </div>

          {/* Pro Tips */}
          {lesson.proTips.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block text-amber-300 mb-0.5">Head Barista Tip:</strong>
                {lesson.proTips.map((tip, idx) => (
                  <p key={idx}>{tip}</p>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Checkpoint Quiz */}
          <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-200 uppercase tracking-wide">
                Knowledge Checkpoint
              </span>
              {isAlreadyCompleted && (
                <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Lesson Completed
                </span>
              )}
            </div>

            <p className="text-xs font-medium text-neutral-100">
              {lesson.checkpointQuestion.question}
            </p>

            <form onSubmit={handleQuizSubmit} className="space-y-2 pt-1">
              {lesson.checkpointQuestion.options.map((option, idx) => (
                <label
                  key={idx}
                  className={`flex items-start gap-2.5 p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                    selectedOption === idx 
                      ? 'bg-amber-500/10 border-amber-500/50 text-neutral-100' 
                      : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800/60'
                  }`}
                >
                  <input
                    type="radio"
                    name="quizOption"
                    value={idx}
                    checked={selectedOption === idx}
                    onChange={() => setSelectedOption(idx)}
                    className="mt-0.5 accent-amber-400"
                  />
                  <span>{option}</span>
                </label>
              ))}

              {submittedQuiz && (
                <div className={`p-3 rounded-lg text-xs mt-2 flex items-start gap-2 ${
                  isCorrect 
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800' 
                    : 'bg-rose-950/60 text-rose-300 border border-rose-800'
                }`}>
                  {isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-semibold">{isCorrect ? 'Correct!' : 'Incorrect Answer'}</div>
                    <div className="mt-0.5 text-neutral-300">{lesson.checkpointQuestion.explanation}</div>
                  </div>
                </div>
              )}

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={selectedOption === null}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 rounded-lg transition-colors"
                >
                  <span>Submit & Complete</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
