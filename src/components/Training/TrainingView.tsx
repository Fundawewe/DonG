import React, { useState } from 'react';
import { useBaristaOS } from '../../context/BaristaOSContext';
import { TrainingModule, TrainingLesson } from '../../types';
import { LessonModal } from './LessonModal';
import { 
  GraduationCap, 
  BookOpen, 
  CheckCircle2, 
  Award, 
  Clock, 
  ArrowRight,
  Flame,
  Sparkles
} from 'lucide-react';

export const TrainingView: React.FC = () => {
  const { trainingModules, activeBarista, markLessonComplete } = useBaristaOS();
  const [selectedModule, setSelectedModule] = useState<TrainingModule | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<TrainingLesson | null>(null);
  const [lessonModalOpen, setLessonModalOpen] = useState<boolean>(false);

  const handleOpenLesson = (mod: TrainingModule, les: TrainingLesson) => {
    setSelectedModule(mod);
    setSelectedLesson(les);
    setLessonModalOpen(true);
  };

  const handleCompleteCurrentLesson = () => {
    if (selectedModule) {
      markLessonComplete(selectedModule.id, activeBarista.id);
    }
  };

  // Overall training stats
  const totalModules = trainingModules.length;
  const completedByBarista = trainingModules.filter(m => m.completedBaristaIds.includes(activeBarista.id)).length;
  const completionPercentage = Math.round((completedByBarista / totalModules) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-amber-400" />
            Barista Training Academy & Curriculum
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Specialty Coffee Association (SCA) extraction science, milk texturing, and hydrology modules
          </p>
        </div>

        <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg text-xs self-start sm:self-auto">
          <Award className="w-4 h-4 text-amber-400" />
          <span className="text-neutral-300">Staff Scholar: <strong>{activeBarista.name.split(' ')[0]}</strong></span>
          <span className="text-amber-400 font-mono font-bold">({completedByBarista}/{totalModules} Complete)</span>
        </div>
      </div>

      {/* Hero Visual Card with Generated Latte Art Photo */}
      <div className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900 h-48 md:h-52">
        <img
          src="/src/assets/images/latte_art_pour_1790183666442.jpg"
          alt="Barista pouring silky latte art microfoam"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent flex flex-col justify-end p-6">
          <div className="text-xs font-semibold text-amber-300 flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Structured Café Operations Apprenticeship</span>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-neutral-100">
            From Sensory Basics to Extraction Mastery
          </h2>
          <p className="text-xs text-neutral-300 max-w-xl mt-1">
            Standardize taste profiles, dial-in consistency, and customer experience across every barista on bar.
          </p>
        </div>
      </div>

      {/* Progress Bar Banner */}
      <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-neutral-200">
            Academy Completion Progress for {activeBarista.name}
          </div>
          <div className="text-xs text-neutral-400 mt-0.5">
            {completedByBarista} of {totalModules} modules mastered
          </div>
        </div>

        <div className="w-full sm:w-64">
          <div className="flex justify-between text-xs font-mono text-neutral-400 mb-1">
            <span>Overall Track</span>
            <span className="text-amber-400">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden border border-neutral-800">
            <div 
              className="bg-amber-400 h-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {trainingModules.map(module => {
          const isDone = module.completedBaristaIds.includes(activeBarista.id);

          return (
            <div 
              key={module.id}
              className={`p-5 rounded-2xl bg-neutral-900 border transition-all ${
                isDone 
                  ? 'border-emerald-500/30' 
                  : 'border-neutral-800 hover:border-neutral-700'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-amber-400">
                      {module.code}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-neutral-950 text-neutral-400 border border-neutral-800">
                      {module.level}
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      {module.category}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-neutral-100 mt-1.5">
                    {module.title}
                  </h3>
                </div>

                {isDone ? (
                  <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Mastered
                  </span>
                ) : (
                  <span className="text-[11px] text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded">
                    In Progress
                  </span>
                )}
              </div>

              <p className="text-xs text-neutral-300 mt-2 line-clamp-2">
                {module.summary}
              </p>

              {/* Badge awarded */}
              <div className="mt-3.5 flex items-center gap-2 text-xs bg-neutral-950 p-2.5 rounded-lg border border-neutral-800">
                <Award className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-neutral-400">Earns Badge:</span>
                <span className="font-semibold text-neutral-200">{module.badgeName}</span>
              </div>

              {/* Lessons List */}
              <div className="mt-4 pt-3 border-t border-neutral-800 space-y-2">
                <div className="text-[11px] font-semibold text-neutral-400">Module Lessons</div>
                {module.lessons.map((lesson, idx) => (
                  <button
                    key={lesson.id}
                    onClick={() => handleOpenLesson(module, lesson)}
                    className="w-full text-left p-2.5 rounded-lg bg-neutral-950/60 hover:bg-neutral-800 border border-neutral-800/80 flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-xs font-mono text-neutral-500">{idx + 1}.</span>
                      <span className="text-xs font-medium text-neutral-200 truncate group-hover:text-amber-300">
                        {lesson.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-neutral-400 shrink-0">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-neutral-500" />
                        {lesson.durationMinutes}m
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-amber-400 transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {selectedModule && selectedLesson && (
        <LessonModal
          isOpen={lessonModalOpen}
          onClose={() => setLessonModalOpen(false)}
          module={selectedModule}
          lesson={selectedLesson}
          onCompleteLesson={handleCompleteCurrentLesson}
          isAlreadyCompleted={selectedModule.completedBaristaIds.includes(activeBarista.id)}
        />
      )}
    </div>
  );
};
