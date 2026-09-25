import React, { useState } from 'react';
import { EspressoRecipe } from '../../types';
import { X, Check } from 'lucide-react';

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recipe: Omit<EspressoRecipe, 'id'>) => void;
  initialRecipe?: EspressoRecipe | null;
}

export const RecipeModal: React.FC<RecipeModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialRecipe 
}) => {
  const [name, setName] = useState(initialRecipe?.name || '');
  const [beanOrigin, setBeanOrigin] = useState(initialRecipe?.beanOrigin || 'Kenya');
  const [region, setRegion] = useState(initialRecipe?.region || 'Nyeri County');
  const [elevation, setElevation] = useState(initialRecipe?.elevation || '1,800m');
  const [process, setProcess] = useState<EspressoRecipe['process']>(initialRecipe?.process || 'Washed');
  const [variety, setVariety] = useState(initialRecipe?.variety || 'SL28 & SL34');
  const [roaster, setRoaster] = useState(initialRecipe?.roaster || 'Barista OS Roasting Lab');
  const [recommendedDose, setRecommendedDose] = useState(initialRecipe?.recommendedDose || 18.5);
  const [targetYield, setTargetYield] = useState(initialRecipe?.targetYield || 38.0);
  const [targetTimeSeconds, setTargetTimeSeconds] = useState(initialRecipe?.targetTimeSeconds || 28);
  const [tempCelsius, setTempCelsius] = useState(initialRecipe?.tempCelsius || 93.5);
  const [grindSetting, setGrindSetting] = useState(initialRecipe?.grindSetting || 'Mythos II: 2.30');
  const [waterProfile, setWaterProfile] = useState(initialRecipe?.waterProfile || 'BWT Bestmax 70ppm TDS');
  const [tastingNotesStr, setTastingNotesStr] = useState(initialRecipe?.tastingNotes.join(', ') || 'Blackcurrant, Meyer Lemon, Dark Chocolate');
  const [recommendedDrinksStr, setRecommendedDrinksStr] = useState(initialRecipe?.recommendedDrinks.join(', ') || 'Espresso, Cortado, Flat White');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tastingNotes = tastingNotesStr.split(',').map(s => s.trim()).filter(Boolean);
    const recommendedDrinks = recommendedDrinksStr.split(',').map(s => s.trim()).filter(Boolean);
    const brewRatio = `1:${(targetYield / (recommendedDose || 1)).toFixed(2)}`;

    onSave({
      name,
      beanOrigin,
      region,
      elevation,
      process,
      variety,
      roastDate: new Date().toISOString().slice(0, 10),
      roaster,
      recommendedDose,
      targetYield,
      targetTimeSeconds,
      tempCelsius,
      grindSetting,
      brewRatio,
      waterProfile,
      tastingNotes,
      recommendedDrinks,
      isHouseDefault: initialRecipe?.isHouseDefault || false
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-xl my-8 overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/50">
          <h2 className="text-base font-bold text-neutral-100">
            {initialRecipe ? 'Edit Espresso Recipe' : 'Add New Espresso Recipe / Origin'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Recipe / Blend Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Nyeri Karindundu AA Microlot"
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-neutral-400 mb-1">Origin / Country</label>
              <input
                type="text"
                value={beanOrigin}
                onChange={e => setBeanOrigin(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-neutral-200"
              />
            </div>
            <div>
              <label className="block text-neutral-400 mb-1">Region / Farm</label>
              <input
                type="text"
                value={region}
                onChange={e => setRegion(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-neutral-200"
              />
            </div>
            <div>
              <label className="block text-neutral-400 mb-1">Process</label>
              <select
                value={process}
                onChange={e => setProcess(e.target.value as EspressoRecipe['process'])}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-neutral-200"
              >
                <option value="Washed">Washed</option>
                <option value="Natural">Natural</option>
                <option value="Honey">Honey</option>
                <option value="Anaerobic">Anaerobic</option>
              </select>
            </div>
            <div>
              <label className="block text-neutral-400 mb-1">Variety</label>
              <input
                type="text"
                value={variety}
                onChange={e => setVariety(e.target.value)}
                placeholder="e.g. SL28, SL34, Geisha"
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-neutral-200"
              />
            </div>
          </div>

          {/* Brewing Specs */}
          <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-3">
            <div className="text-xs font-semibold text-amber-400">Target Extraction Specs</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Dose In (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={recommendedDose}
                  onChange={e => setRecommendedDose(parseFloat(e.target.value) || 0)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1 text-neutral-100 font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Yield Out (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={targetYield}
                  onChange={e => setTargetYield(parseFloat(e.target.value) || 0)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1 text-neutral-100 font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Time (sec)</label>
                <input
                  type="number"
                  value={targetTimeSeconds}
                  onChange={e => setTargetTimeSeconds(parseInt(e.target.value) || 0)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1 text-neutral-100 font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Water Temp (°C)</label>
                <input
                  type="number"
                  step="0.5"
                  value={tempCelsius}
                  onChange={e => setTempCelsius(parseFloat(e.target.value) || 0)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1 text-neutral-100 font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Grinder & Setting</label>
                <input
                  type="text"
                  value={grindSetting}
                  onChange={e => setGrindSetting(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1 text-neutral-200"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Water Profile</label>
                <input
                  type="text"
                  value={waterProfile}
                  onChange={e => setWaterProfile(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1 text-neutral-200"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Tasting Notes (comma-separated)
            </label>
            <input
              type="text"
              value={tastingNotesStr}
              onChange={e => setTastingNotesStr(e.target.value)}
              placeholder="Blackcurrant, Meyer Lemon, Dark Chocolate"
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-neutral-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Recommended Drink Builds (comma-separated)
            </label>
            <input
              type="text"
              value={recommendedDrinksStr}
              onChange={e => setRecommendedDrinksStr(e.target.value)}
              placeholder="Espresso, Cortado, Flat White"
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-neutral-200"
            />
          </div>

          <div className="pt-3 border-t border-neutral-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-neutral-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow"
            >
              <Check className="w-4 h-4" />
              Save Recipe
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
