import React, { useState, useEffect } from 'react';
import { ChecklistTaskDefinition, ShiftType, TaskCategory } from '../../types';
import { 
  X, 
  Plus, 
  Check, 
  ShieldAlert, 
  Clock, 
  Layers, 
  Sparkles,
  Edit3,
  Coffee,
  Droplets,
  Milk,
  CreditCard,
  Sparkle,
  Lock
} from 'lucide-react';

interface DefineTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTask: (task: Omit<ChecklistTaskDefinition, 'id' | 'order' | 'createdAt'>, existingId?: string) => void;
  initialTask?: ChecklistTaskDefinition | null;
  defaultShiftType?: ShiftType;
}

export const DefineTaskModal: React.FC<DefineTaskModalProps> = ({
  isOpen,
  onClose,
  onSaveTask,
  initialTask,
  defaultShiftType = 'opening'
}) => {
  const [shiftType, setShiftType] = useState<ShiftType>(defaultShiftType);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('espresso-grinder');
  const [station, setStation] = useState('Main Espresso Bar');
  const [isRequired, setIsRequired] = useState(true);
  const [estimatedMinutes, setEstimatedMinutes] = useState(5);
  const [timeTarget, setTimeTarget] = useState('06:30 AM');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialTask) {
      setShiftType(initialTask.shiftType);
      setTitle(initialTask.title);
      setDescription(initialTask.description);
      setCategory(initialTask.category);
      setStation(initialTask.station);
      setIsRequired(initialTask.isRequired);
      setEstimatedMinutes(initialTask.estimatedMinutes);
      setTimeTarget(initialTask.timeTarget || '');
    } else {
      setShiftType(defaultShiftType);
      setTitle('');
      setDescription('');
      setCategory('espresso-grinder');
      setStation(defaultShiftType === 'opening' ? 'Main Espresso Bar' : 'Closing Wash Station');
      setIsRequired(true);
      setEstimatedMinutes(5);
      setTimeTarget(defaultShiftType === 'opening' ? '06:30 AM' : defaultShiftType === 'closing' ? '18:30 PM' : '13:00 PM');
    }
    setError('');
  }, [initialTask, defaultShiftType, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a descriptive task title.');
      return;
    }
    if (!description.trim()) {
      setError('Please provide standard operating instructions for staff.');
      return;
    }

    onSaveTask({
      shiftType,
      title: title.trim(),
      description: description.trim(),
      category,
      station: station.trim() || 'General Bar',
      isRequired,
      estimatedMinutes: Number(estimatedMinutes) || 5,
      timeTarget: timeTarget.trim() || undefined,
      isCustom: true,
      isActive: true
    }, initialTask?.id);

    onClose();
  };

  const categories: { id: TaskCategory; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'espresso-grinder', label: 'Espresso & Grinders', icon: Coffee },
    { id: 'water-filtration', label: 'Water & Boilers', icon: Droplets },
    { id: 'milk-syrups', label: 'Milk, Syrups & Food', icon: Milk },
    { id: 'pos-cash', label: 'POS & Cash Float', icon: CreditCard },
    { id: 'sanitation-station', label: 'Sanitation & Bar Clean', icon: Sparkle },
    { id: 'facility-security', label: 'Facility & Security', icon: Lock }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
              {initialTask ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                {initialTask ? 'Edit Shift Task' : 'Define Custom Shift Task'}
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30">
                  Manager Protocol
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Configure operational SOP, validation requirements & target timestamps
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Shift Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Target Shift Protocol:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setShiftType('opening')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  shiftType === 'opening'
                    ? 'bg-amber-400 text-neutral-950 border-amber-400 font-bold shadow-sm'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                🌅 Opening Shift
              </button>

              <button
                type="button"
                onClick={() => setShiftType('closing')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  shiftType === 'closing'
                    ? 'bg-amber-400 text-neutral-950 border-amber-400 font-bold shadow-sm'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                🌙 Closing Shift
              </button>

              <button
                type="button"
                onClick={() => setShiftType('handover')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  shiftType === 'handover'
                    ? 'bg-amber-400 text-neutral-950 border-amber-400 font-bold shadow-sm'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                🔄 Mid-Day / Handover
              </button>
            </div>
          </div>

          {/* Task Title */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Task Title / Action Item: <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Inspect Puqpress Automatic Tamper Pressure & Depth"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-400"
              required
            />
          </div>

          {/* Task Description / SOP */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Standard Operating Procedure (SOP) Instructions: <span className="text-amber-400">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail step-by-step instructions, parameters, acceptable ranges (e.g. Steam boiler 1.5-1.8 bar, fridge < 4°C)..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-400 resize-none leading-relaxed"
              required
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Station Category:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'bg-amber-400/10 border-amber-400 text-amber-300 font-semibold'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-xs truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Station and Target Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Bar Station / Location:
              </label>
              <input
                type="text"
                value={station}
                onChange={(e) => setStation(e.target.value)}
                placeholder="e.g. Grinder Station, POS Till, Milk Bar"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>Target Completion Time:</span>
              </label>
              <input
                type="text"
                value={timeTarget}
                onChange={(e) => setTimeTarget(e.target.value)}
                placeholder="e.g. 06:45 AM or Within 30m of close"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Duration & Critical Switch */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-neutral-100 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  Critical Task Validation Rule
                </span>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  When enabled, the shift cannot be officially signed off by a manager until this protocol is checked off.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRequired}
                  onChange={(e) => setIsRequired(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-400"></div>
              </label>
            </div>

            <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-xs">
              <span className="text-neutral-400">Estimated Duration:</span>
              <div className="flex items-center gap-2">
                {[3, 5, 8, 12, 15].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setEstimatedMinutes(mins)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                      estimatedMinutes === mins
                        ? 'bg-amber-400 text-neutral-950 font-bold'
                        : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Modal Footer Controls */}
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
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold rounded-xl transition-all shadow-md shadow-amber-400/10"
            >
              <Check className="w-4 h-4" />
              <span>{initialTask ? 'Update Protocol' : 'Save Shift Protocol'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
