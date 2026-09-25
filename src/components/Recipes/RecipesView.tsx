import React, { useState } from 'react';
import { useBaristaOS } from '../../context/BaristaOSContext';
import { EspressoRecipe } from '../../types';
import { RecipeModal } from './RecipeModal';
import { 
  Coffee, 
  Plus, 
  Flame, 
  SlidersHorizontal, 
  Sparkles, 
  Edit3, 
  Trash2, 
  Droplet, 
  Thermometer, 
  Timer,
  CheckCircle2
} from 'lucide-react';

interface RecipesViewProps {
  onOpenDialInWithRecipe?: (recipe: EspressoRecipe) => void;
}

export const RecipesView: React.FC<RecipesViewProps> = ({ onOpenDialInWithRecipe }) => {
  const { recipes, addRecipe, updateRecipe, deleteRecipe } = useBaristaOS();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<EspressoRecipe | null>(null);

  const handleEdit = (recipe: EspressoRecipe) => {
    setEditingRecipe(recipe);
    setModalOpen(true);
  };

  const handleSave = (recipeData: Omit<EspressoRecipe, 'id'>) => {
    if (editingRecipe) {
      updateRecipe({ ...recipeData, id: editingRecipe.id });
    } else {
      addRecipe(recipeData);
    }
    setEditingRecipe(null);
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Add Recipe Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
            <Coffee className="w-5 h-5 text-amber-400" />
            Espresso Recipe Catalog & Origins
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Calibrated extraction specs for single origins, house blends, and batch profiles
          </p>
        </div>

        <button
          onClick={() => {
            setEditingRecipe(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Recipe</span>
        </button>
      </div>

      {/* Hero Banner with Generated Coffee Asset */}
      <div className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900 h-48 md:h-56">
        <img
          src="/src/assets/images/barista_espresso_bar_1790183648675.jpg"
          alt="Artisanal commercial espresso bar station"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent flex flex-col justify-end p-6">
          <div className="text-xs font-medium text-amber-300 flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Active Roastery Calibration</span>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-neutral-100">
            Precision Extraction Standards
          </h2>
          <p className="text-xs text-neutral-300 max-w-xl mt-1 line-clamp-2">
            Every coffee undergoes daily refractometric testing to balance solubility, tactile body, and origin sweetness.
          </p>
        </div>
      </div>

      {/* Recipe Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recipes.map(recipe => (
          <div 
            key={recipe.id}
            className={`p-5 rounded-2xl bg-neutral-900 border transition-all ${
              recipe.isHouseDefault 
                ? 'border-amber-500/40 shadow-sm shadow-amber-500/5' 
                : 'border-neutral-800 hover:border-neutral-700'
            }`}
          >
            {/* Top Bar of Card */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-neutral-100">{recipe.name}</h3>
                  {recipe.isHouseDefault && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400 text-neutral-950 font-bold tracking-tight">
                      HOUSE DEFAULT
                    </span>
                  )}
                </div>
                <div className="text-xs text-neutral-400 mt-0.5">
                  <span>{recipe.variety}</span>
                  <span className="mx-1.5" aria-hidden="true">·</span>
                  <span>{recipe.process}</span>
                  <span className="mx-1.5" aria-hidden="true">·</span>
                  <span>{recipe.region}</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEdit(recipe)}
                  className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors"
                  title="Edit Recipe Parameters"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                {!recipe.isHouseDefault && (
                  <button
                    onClick={() => deleteRecipe(recipe.id)}
                    className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded-lg transition-colors"
                    title="Delete Recipe"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Brewing Metric Indicators */}
            <div className="mt-4 grid grid-cols-4 gap-2 bg-neutral-950 p-3 rounded-xl border border-neutral-800/80 text-center font-mono">
              <div>
                <div className="text-[10px] text-neutral-500 uppercase font-sans">Dose</div>
                <div className="text-sm font-bold text-neutral-100 mt-0.5">{recipe.recommendedDose}g</div>
              </div>
              <div>
                <div className="text-[10px] text-neutral-500 uppercase font-sans">Yield</div>
                <div className="text-sm font-bold text-neutral-100 mt-0.5">{recipe.targetYield}g</div>
              </div>
              <div>
                <div className="text-[10px] text-neutral-500 uppercase font-sans">Time</div>
                <div className="text-sm font-bold text-amber-400 mt-0.5">{recipe.targetTimeSeconds}s</div>
              </div>
              <div>
                <div className="text-[10px] text-neutral-500 uppercase font-sans">Ratio</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">{recipe.brewRatio}</div>
              </div>
            </div>

            {/* Detailed Gear & Water specs */}
            <div className="mt-3.5 space-y-1.5 text-xs text-neutral-300">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Grinder Baseline:</span>
                <span className="font-mono text-neutral-200">{recipe.grindSetting}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Water Temp & Profile:</span>
                <span className="font-mono text-neutral-200">{recipe.tempCelsius}°C ({recipe.waterProfile})</span>
              </div>
            </div>

            {/* Tasting Notes */}
            <div className="mt-3 pt-3 border-t border-neutral-800/80">
              <div className="text-[11px] text-neutral-400 mb-1.5">Tasting Notes</div>
              <div className="flex flex-wrap gap-1.5">
                {recipe.tastingNotes.map((note, idx) => (
                  <span 
                    key={idx} 
                    className="text-[11px] text-neutral-300 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800"
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>

            {/* Recommended Drinks & Dial-in CTA */}
            <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between">
              <div className="text-[11px] text-neutral-400 truncate max-w-[200px]">
                Builds: {recipe.recommendedDrinks.join(', ')}
              </div>

              <button
                onClick={() => onOpenDialInWithRecipe && onOpenDialInWithRecipe(recipe)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>Dial In This</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <RecipeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initialRecipe={editingRecipe}
      />
    </div>
  );
};
