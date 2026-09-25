import { EspressoRecipe, ShotDeviationAlert, DeviationSeverity, DeviationType, DeviationToleranceSettings } from '../types';

export const TOLERANCE_PRESETS: Record<'strict' | 'standard' | 'lenient', DeviationToleranceSettings> = {
  strict: {
    mode: 'strict',
    label: 'Competition / Geisha Mode (±1.5s / ±1.5g)',
    timeToleranceWarning: 1.5,
    timeToleranceCritical: 3.0,
    yieldToleranceWarning: 1.5,
    yieldToleranceCritical: 2.5
  },
  standard: {
    mode: 'standard',
    label: 'Specialty Standard (±2.5s / ±2.0g)',
    timeToleranceWarning: 2.5,
    timeToleranceCritical: 4.0,
    yieldToleranceWarning: 2.0,
    yieldToleranceCritical: 3.5
  },
  lenient: {
    mode: 'lenient',
    label: 'High-Volume Rush Mode (±4.0s / ±3.5g)',
    timeToleranceWarning: 4.0,
    timeToleranceCritical: 6.0,
    yieldToleranceWarning: 3.5,
    yieldToleranceCritical: 5.0
  }
};

export interface AnalyzeShotParams {
  timeSeconds: number;
  yieldGrams: number;
  doseIn?: number;
  recipe: EspressoRecipe;
  baristaName?: string;
  source?: 'dial-in' | 'shot-timer' | 'manual-test';
  tolerance?: DeviationToleranceSettings;
}

export function analyzeShotDeviation(params: AnalyzeShotParams): ShotDeviationAlert {
  const {
    timeSeconds,
    yieldGrams,
    doseIn = params.recipe.recommendedDose,
    recipe,
    baristaName = 'Station Barista',
    source = 'dial-in',
    tolerance = TOLERANCE_PRESETS.standard
  } = params;

  const targetTime = recipe.targetTimeSeconds;
  const targetYield = recipe.targetYield;

  const timeDelta = Number((timeSeconds - targetTime).toFixed(1));
  const yieldDelta = Number((yieldGrams - targetYield).toFixed(1));

  const absTimeDelta = Math.abs(timeDelta);
  const absYieldDelta = Math.abs(yieldDelta);

  const isTimeCritical = absTimeDelta >= tolerance.timeToleranceCritical;
  const isTimeWarning = absTimeDelta >= tolerance.timeToleranceWarning;

  const isYieldCritical = absYieldDelta >= tolerance.yieldToleranceCritical;
  const isYieldWarning = absYieldDelta >= tolerance.yieldToleranceWarning;

  let severity: DeviationSeverity = 'optimal';
  if (isTimeCritical || isYieldCritical) {
    severity = 'critical';
  } else if (isTimeWarning || isYieldWarning) {
    severity = 'warning';
  }

  // Determine deviation type
  let deviationType: DeviationType = 'optimal';
  if ((isTimeWarning || isTimeCritical) && (isYieldWarning || isYieldCritical)) {
    deviationType = 'compound';
  } else if (timeDelta <= -tolerance.timeToleranceWarning) {
    deviationType = 'time-fast';
  } else if (timeDelta >= tolerance.timeToleranceWarning) {
    deviationType = 'time-slow';
  } else if (yieldDelta >= tolerance.yieldToleranceWarning) {
    deviationType = 'yield-high';
  } else if (yieldDelta <= -tolerance.yieldToleranceWarning) {
    deviationType = 'yield-low';
  }

  // Generate Title, Diagnosis, and Action Recommendation
  let title = 'Optimal Target Match';
  let description = `Shot extracted within calibrated tolerances for ${recipe.name}. Flow and contact time match origin profile.`;
  let suggestedAction = 'Extraction is balanced in Golden Cup zone. Maintain current grind and puck prep.';

  if (severity === 'critical') {
    if (deviationType === 'compound') {
      title = `Critical Dial-In Drift: Time (${timeDelta > 0 ? '+' : ''}${timeDelta}s) & Yield (${yieldDelta > 0 ? '+' : ''}${yieldDelta}g)`;
      description = `Major variance detected on ${recipe.name}. Actual: ${timeSeconds}s / ${yieldGrams}g vs Target: ${targetTime}s / ${targetYield}g. Immediate recalibration required.`;
      if (timeDelta < 0 && yieldDelta > 0) {
        suggestedAction = `Severe gusher & over-yield. 1) Adjust grind 2.0 notches FINER. 2) Re-tare scale & check volumetric auto-stop. 3) Apply needle WDT to prevent catastrophic channeling.`;
      } else if (timeDelta > 0 && yieldDelta < 0) {
        suggestedAction = `Severe choking & restricted yield. 1) Adjust grind 1.5 notches COARSER. 2) Check pump pressure (target 9.0 bar). 3) Verify dry dose is exactly ${doseIn}g.`;
      } else {
        suggestedAction = `Recalibrate both grind particle size and volumetric cut-off switch for ${recipe.name}.`;
      }
    } else if (deviationType === 'time-fast') {
      title = `Severe Under-Extraction Risk: Shot Ran ${Math.abs(timeDelta)}s Too Fast`;
      description = `Water surged through coffee bed in ${timeSeconds}s (Target: ${targetTime}s). Yield was ${yieldGrams}g. Coffee will taste astringent, sour, and hollow.`;
      suggestedAction = `Grind size is too coarse or severe micro-channeling occurred. Recommended: Adjust grinder 1.0 to 1.5 notches FINER and perform thorough WDT distribution.`;
    } else if (deviationType === 'time-slow') {
      title = `Severe Over-Extraction Risk: Shot Choked (+${timeDelta}s Too Slow)`;
      description = `Water was restricted in coffee bed for ${timeSeconds}s (Target: ${targetTime}s). Heavy extraction of bitter polyphenols, dry ash, and astringency.`;
      suggestedAction = `Grind size is too fine or tamp was over-compressed. Recommended: Coarsen grinder by 1.0 step and wipe shower screen.`;
    } else if (deviationType === 'yield-high') {
      title = `High Yield Dilution Alert (+${yieldDelta}g Over Target)`;
      description = `Cup yield reached ${yieldGrams}g (Target: ${targetYield}g). Beverage is diluted beyond recommended brew ratio (1:${(yieldGrams / doseIn).toFixed(2)}).`;
      suggestedAction = `Volumetric sensor or scale shutoff delayed. Recalibrate grouphead volumetric dose button or stop shot manually at ${targetYield}g.`;
    } else if (deviationType === 'yield-low') {
      title = `Restricted Yield Alert (${yieldDelta}g Under Target)`;
      description = `Cup stopped short at ${yieldGrams}g (Target: ${targetYield}g). High concentration ristretto with underdeveloped sweetness.`;
      suggestedAction = `Pump flow restricted or premature button press. Verify 9-bar pump gauge and ensure dose does not exceed ${doseIn}g basket headroom.`;
    }
  } else if (severity === 'warning') {
    if (deviationType === 'time-fast') {
      title = `Fast Shot Warning (${Math.abs(timeDelta)}s below target)`;
      description = `Extraction was slightly accelerated (${timeSeconds}s vs target ${targetTime}s). Minor under-extraction possible.`;
      suggestedAction = `Micro-adjust grinder 0.5 notch finer or increase dose by +0.2g to increase resistance.`;
    } else if (deviationType === 'time-slow') {
      title = `Slow Shot Warning (+${timeDelta}s above target)`;
      description = `Contact time exceeded recipe target (${timeSeconds}s vs target ${targetTime}s). Dark roast or heavy body notes may dominate.`;
      suggestedAction = `Micro-adjust grinder 0.5 notch coarser or check if portafilter basket holes have fines buildup.`;
    } else if (deviationType === 'yield-high') {
      title = `Slight Over-Yield Warning (+${yieldDelta}g)`;
      description = `Liquid yield was ${yieldGrams}g (Target: ${targetYield}g). Brew ratio shifted slightly light.`;
      suggestedAction = `Cut shot 1 second earlier on manual scale or trim volumetric preset.`;
    } else if (deviationType === 'yield-low') {
      title = `Slight Under-Yield Warning (${yieldDelta}g)`;
      description = `Liquid yield was ${yieldGrams}g (Target: ${targetYield}g).`;
      suggestedAction = `Allow shot to run 1-2g longer to balance tart organic acids with caramelized sugars.`;
    } else if (deviationType === 'compound') {
      title = `Mild Deviation Warning: Time & Yield Drift`;
      description = `Shot was ${timeDelta > 0 ? '+' : ''}${timeDelta}s and ${yieldDelta > 0 ? '+' : ''}${yieldDelta}g off target.`;
      suggestedAction = `Monitor next shot closely. If variance repeats, dial in grinder.`;
    }
  }

  const alertId = `dev-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return {
    id: alertId,
    timestamp,
    recipeId: recipe.id,
    recipeName: recipe.name,
    baristaName,
    actualTimeSeconds: timeSeconds,
    targetTimeSeconds: targetTime,
    timeDeltaSeconds: timeDelta,
    actualYieldGrams: yieldGrams,
    targetYieldGrams: targetYield,
    yieldDeltaGrams: yieldDelta,
    doseIn,
    severity,
    deviationType,
    title,
    description,
    suggestedAction,
    isAcknowledged: false,
    isDismissed: false,
    source
  };
}

// Play notification chimes based on severity
export function playDeviationAlertAudio(severity: DeviationSeverity) {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();

    if (severity === 'critical') {
      // Double attention chime (High-low alert)
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(880, now); // A5
      osc1.frequency.setValueAtTime(587.33, now + 0.12); // D5
      gain1.gain.setValueAtTime(0.18, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.28);

      // Repeat second pulse for urgency
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(880, now + 0.32);
      osc2.frequency.setValueAtTime(587.33, now + 0.44);
      gain2.gain.setValueAtTime(0.20, now + 0.32);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.60);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.32);
      osc2.stop(now + 0.60);
    } else if (severity === 'warning') {
      // Gentle warning chime
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.15); // G5
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    }
  } catch {
    // Audio not available or autoplay blocked
  }
}
