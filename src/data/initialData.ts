import { 
  EspressoRecipe, 
  DialInLog, 
  TrainingModule, 
  BaristaExam, 
  EquipmentItem, 
  ServiceAlert, 
  StockItem, 
  StaffMember, 
  CafeBranch, 
  SubscriptionTier,
  ChecklistTaskDefinition,
  ShiftChecklistRecord
} from '../types';

export const INITIAL_BRANCHES: CafeBranch[] = [
  {
    id: 'branch-westlands',
    name: 'Westlands Flagship Café & Roastery',
    location: 'Woodvale Grove, Westlands, Nairobi',
    manager: 'Samuel Kinyanjui',
    licenseTier: 'Specialty Pro',
    licenseStatus: 'Active',
    licenseExpiry: '2026-12-31',
    licenseKey: 'BOS-PRO-NRB-8942-X7',
  },
  {
    id: 'branch-karen',
    name: 'The Hub Karen Espresso Bar',
    location: 'Dagoretti Road, Karen, Nairobi',
    manager: 'Brenda Wanjiru',
    licenseTier: 'Specialty Pro',
    licenseStatus: 'Active',
    licenseExpiry: '2026-12-31',
    licenseKey: 'BOS-PRO-KRN-4412-M1',
  },
  {
    id: 'branch-kilimani',
    name: 'Kilimani Brew Lab',
    location: 'Argwings Kodhek Rd, Kilimani, Nairobi',
    manager: 'Kevin Mwangi',
    licenseTier: 'Specialty Pro',
    licenseStatus: 'Active',
    licenseExpiry: '2026-12-31',
    licenseKey: 'BOS-PRO-KLM-1029-B9',
  }
];

export const INITIAL_RECIPES: EspressoRecipe[] = [
  {
    id: 'rec-house-blend',
    name: 'Ngong Peak House Espresso',
    beanOrigin: 'Kenya & Ethiopia Blend',
    region: 'Nyeri 60% / Yirgacheffe 40%',
    elevation: '1,750m - 2,100m',
    process: 'Washed',
    variety: 'SL28, SL34, Heirloom',
    roastDate: '2026-09-17',
    roaster: 'Barista OS Roasting Lab',
    recommendedDose: 18.5,
    targetYield: 38.0,
    targetTimeSeconds: 28,
    tempCelsius: 93.5,
    grindSetting: 'Mythos II: 2.35',
    brewRatio: '1:2.05',
    waterProfile: 'BWT Bestmax (70 ppm TDS, 3.2° dKH)',
    tastingNotes: ['Blackcurrant', 'Meyer Lemon', 'Brown Sugar', 'Dark Chocolate Finish'],
    recommendedDrinks: ['Espresso', 'Cortado', 'Flat White', 'Cappuccino'],
    isHouseDefault: true,
  },
  {
    id: 'rec-nyeri-sl28',
    name: 'Nyeri Karindundu AA Single Origin',
    beanOrigin: 'Kenya Central Highlands',
    region: 'Mathira, Nyeri County',
    elevation: '1,850m',
    process: 'Washed',
    variety: '100% SL28 & SL34',
    roastDate: '2026-09-19',
    roaster: 'Barista OS Roasting Lab',
    recommendedDose: 19.0,
    targetYield: 44.0,
    targetTimeSeconds: 31,
    tempCelsius: 94.0,
    grindSetting: 'EK43S: 2.15',
    brewRatio: '1:2.32',
    waterProfile: '75 ppm TDS, 93.5°C',
    tastingNotes: ['Grapefruit', 'Juicy Plum', 'Phosphoric Acidity', 'Black Tea'],
    recommendedDrinks: ['Double Shot Neat', 'Long Black', 'Tonic Espresso'],
  },
  {
    id: 'rec-kirinyaga-natural',
    name: 'Kirinyaga Kii Microlot Natural',
    beanOrigin: 'Kenya Mount Kenya Slopes',
    region: 'Kirinyaga County',
    elevation: '1,920m',
    process: 'Natural',
    variety: 'SL28 & Ruiru 11',
    roastDate: '2026-09-15',
    roaster: 'Barista OS Roasting Lab',
    recommendedDose: 18.0,
    targetYield: 38.0,
    targetTimeSeconds: 27,
    tempCelsius: 92.5,
    grindSetting: 'Mythos II: 2.50',
    brewRatio: '1:2.11',
    waterProfile: '65 ppm TDS, 3° dKH',
    tastingNotes: ['Ripe Strawberry', 'Hibiscus', 'Tropical Guava', 'Silky Honey Body'],
    recommendedDrinks: ['Single Origin Espresso', 'Cortado', 'Affogato'],
  },
  {
    id: 'rec-ethiopia-guji',
    name: 'Guji Hambela Natural Anaerobic',
    beanOrigin: 'Ethiopia Oromia',
    region: 'Guji Zone',
    elevation: '2,150m',
    process: 'Anaerobic',
    variety: 'Ethiopian Heirloom 74112',
    roastDate: '2026-09-16',
    roaster: 'Barista OS Roasting Lab',
    recommendedDose: 18.0,
    targetYield: 40.0,
    targetTimeSeconds: 26,
    tempCelsius: 92.0,
    grindSetting: 'EK43S: 2.6',
    brewRatio: '1:2.22',
    waterProfile: '60 ppm TDS, 92°C',
    tastingNotes: ['Blueberry Compote', 'Jasmine Blossom', 'Bergamot', 'Candy Sweetness'],
    recommendedDrinks: ['Filter-style Espresso', 'Americano', 'Iced Latte'],
  }
];

export const INITIAL_DIAL_IN_LOGS: DialInLog[] = [
  {
    id: 'log-101',
    timestamp: '2026-09-23 07:15',
    recipeId: 'rec-house-blend',
    recipeName: 'Ngong Peak House Espresso',
    baristaName: 'Samuel Kinyanjui (Head Barista)',
    doseIn: 18.5,
    yieldOut: 38.2,
    timeSeconds: 28,
    grindSetting: 'Mythos II: 2.35',
    brewTemp: 93.5,
    pressureBar: 9.0,
    tdsPercent: 9.9,
    extractionYieldPercent: 20.44, // (38.2 * 9.9) / 18.5
    status: 'sweet-spot',
    sensoryScores: {
      acidity: 4.8,
      sweetness: 4.9,
      body: 4.5,
      balance: 4.8,
      cleanliness: 5.0,
      overallScore: 94,
    },
    tastingNotes: 'Crisp blackcurrant acidity immediately dissolving into deep brown sugar sweetness. Very clean finish with zero astringency.',
    adjustmentsMade: 'First morning calibration: tight distribution with WDT tool; dial-in approved for morning bar rush.',
    approvedForShift: true,
  },
  {
    id: 'log-102',
    timestamp: '2026-09-23 07:35',
    recipeId: 'rec-nyeri-sl28',
    recipeName: 'Nyeri Karindundu AA Single Origin',
    baristaName: 'Brenda Wanjiru',
    doseIn: 19.0,
    yieldOut: 43.8,
    timeSeconds: 31,
    grindSetting: 'EK43S: 2.15',
    brewTemp: 94.0,
    pressureBar: 9.0,
    tdsPercent: 9.1,
    extractionYieldPercent: 20.98, // (43.8 * 9.1) / 19.0
    status: 'sweet-spot',
    sensoryScores: {
      acidity: 4.9,
      sweetness: 4.6,
      body: 4.2,
      balance: 4.7,
      cleanliness: 4.9,
      overallScore: 92,
    },
    tastingNotes: 'Distinctive Kenyan SL phosphor acidity, intense black tea and juicy grapefruit notes. High clarity cup.',
    adjustmentsMade: 'Adjusted Mahlkönig zero point by +0.1 to ease flow rate; settled exactly at 31s target.',
    approvedForShift: true,
  },
  {
    id: 'log-103',
    timestamp: '2026-09-22 14:10',
    recipeId: 'rec-kirinyaga-natural',
    recipeName: 'Kirinyaga Kii Microlot Natural',
    baristaName: 'Kevin Mwangi',
    doseIn: 18.0,
    yieldOut: 36.5,
    timeSeconds: 23,
    grindSetting: 'Mythos II: 2.70',
    brewTemp: 92.5,
    pressureBar: 8.8,
    tdsPercent: 8.4,
    extractionYieldPercent: 17.03, // (36.5 * 8.4) / 18.0
    status: 'under-extracted',
    sensoryScores: {
      acidity: 4.2,
      sweetness: 2.5,
      body: 2.8,
      balance: 2.9,
      cleanliness: 3.5,
      overallScore: 68,
    },
    tastingNotes: 'Sharp sour green apple, lacking sweetness and tactile body. Water channeled on outer perimeter.',
    adjustmentsMade: 'Grind was too coarse. Adjusted collar down 0.20 clicks and enforced needle WDT.',
    approvedForShift: false,
  },
  {
    id: 'log-104',
    timestamp: '2026-09-22 14:45',
    recipeId: 'rec-kirinyaga-natural',
    recipeName: 'Kirinyaga Kii Microlot Natural',
    baristaName: 'Kevin Mwangi',
    doseIn: 18.0,
    yieldOut: 38.0,
    timeSeconds: 27,
    grindSetting: 'Mythos II: 2.50',
    brewTemp: 92.5,
    pressureBar: 9.0,
    tdsPercent: 9.4,
    extractionYieldPercent: 19.84, // (38.0 * 9.4) / 18.0
    status: 'sweet-spot',
    sensoryScores: {
      acidity: 4.7,
      sweetness: 4.8,
      body: 4.4,
      balance: 4.8,
      cleanliness: 4.9,
      overallScore: 93,
    },
    tastingNotes: 'Re-calibrated: rich wild strawberry, floral hibiscus, silky honey tactile. Exceptional sweetness balance.',
    adjustmentsMade: 'Collar tightened -0.20 clicks. Flow stabilized to 27s. Approved for afternoon rush.',
    approvedForShift: true,
  },
  {
    id: 'log-105',
    timestamp: '2026-09-21 07:20',
    recipeId: 'rec-house-blend',
    recipeName: 'Ngong Peak House Espresso',
    baristaName: 'Faith Chebet',
    doseIn: 18.5,
    yieldOut: 41.5,
    timeSeconds: 34,
    grindSetting: 'Mythos II: 2.20',
    brewTemp: 94.0,
    pressureBar: 9.0,
    tdsPercent: 10.2,
    extractionYieldPercent: 22.88, // (41.5 * 10.2) / 18.5
    status: 'over-extracted',
    sensoryScores: {
      acidity: 3.8,
      sweetness: 3.9,
      body: 4.6,
      balance: 3.4,
      cleanliness: 3.8,
      overallScore: 74,
    },
    tastingNotes: 'Heavy dark baker chocolate and roasty tones, but with chalky astringent dryness on the back palate.',
    adjustmentsMade: 'Too fine; shot dragged to 34s. Opened collar +0.15 notches to hit 28s target.',
    approvedForShift: false,
  },
  {
    id: 'log-106',
    timestamp: '2026-09-21 07:45',
    recipeId: 'rec-house-blend',
    recipeName: 'Ngong Peak House Espresso',
    baristaName: 'Faith Chebet',
    doseIn: 18.5,
    yieldOut: 38.0,
    timeSeconds: 28,
    grindSetting: 'Mythos II: 2.35',
    brewTemp: 93.5,
    pressureBar: 9.0,
    tdsPercent: 9.8,
    extractionYieldPercent: 20.13, // (38.0 * 9.8) / 18.5
    status: 'sweet-spot',
    sensoryScores: {
      acidity: 4.8,
      sweetness: 4.9,
      body: 4.6,
      balance: 4.9,
      cleanliness: 4.9,
      overallScore: 95,
    },
    tastingNotes: 'Perfect second pull: vibrant blackberry, velvety caramel, zero bitter astringency. Approved for shift.',
    adjustmentsMade: 'Grind setting adjusted +0.15 notches. Contact time locked at 28 seconds.',
    approvedForShift: true,
  },
  {
    id: 'log-107',
    timestamp: '2026-09-20 08:00',
    recipeId: 'rec-ethiopia-guji',
    recipeName: 'Guji Hambela Natural Anaerobic',
    baristaName: 'Samuel Kinyanjui (Head Barista)',
    doseIn: 18.0,
    yieldOut: 40.2,
    timeSeconds: 26,
    grindSetting: 'EK43S: 2.60',
    brewTemp: 92.0,
    pressureBar: 8.5,
    tdsPercent: 9.5,
    extractionYieldPercent: 21.22, // (40.2 * 9.5) / 18.0
    status: 'sweet-spot',
    sensoryScores: {
      acidity: 4.9,
      sweetness: 4.8,
      body: 4.3,
      balance: 4.8,
      cleanliness: 5.0,
      overallScore: 96,
    },
    tastingNotes: 'Explosive blueberry compote, jasmine blossom, and bergamot tea. Exceptional clarity and elegance.',
    adjustmentsMade: 'Lowered group pressure to 8.5 bar to preserve delicate anaerobic floral aromatics.',
    approvedForShift: true,
  },
  {
    id: 'log-108',
    timestamp: '2026-09-19 11:30',
    recipeId: 'rec-ethiopia-guji',
    recipeName: 'Guji Hambela Natural Anaerobic',
    baristaName: 'Brenda Wanjiru',
    doseIn: 18.0,
    yieldOut: 35.0,
    timeSeconds: 20,
    grindSetting: 'EK43S: 2.85',
    brewTemp: 92.0,
    pressureBar: 8.5,
    tdsPercent: 8.3,
    extractionYieldPercent: 16.14, // (35.0 * 8.3) / 18.0
    status: 'under-extracted',
    sensoryScores: {
      acidity: 4.4,
      sweetness: 2.8,
      body: 2.9,
      balance: 3.1,
      cleanliness: 4.0,
      overallScore: 71,
    },
    tastingNotes: 'Sharp citric acidity without fruit sweetness. Thin and watery finish.',
    adjustmentsMade: 'Grinder setting was too coarse after filter batch grinding. Dialed back to 2.60.',
    approvedForShift: false,
  },
  {
    id: 'log-109',
    timestamp: '2026-09-18 07:10',
    recipeId: 'rec-nyeri-sl28',
    recipeName: 'Nyeri Karindundu AA Single Origin',
    baristaName: 'Samuel Kinyanjui (Head Barista)',
    doseIn: 19.0,
    yieldOut: 43.5,
    timeSeconds: 30,
    grindSetting: 'EK43S: 2.15',
    brewTemp: 94.0,
    pressureBar: 9.0,
    tdsPercent: 9.0,
    extractionYieldPercent: 20.61, // (43.5 * 9.0) / 19.0
    status: 'sweet-spot',
    sensoryScores: {
      acidity: 4.9,
      sweetness: 4.7,
      body: 4.3,
      balance: 4.8,
      cleanliness: 5.0,
      overallScore: 94,
    },
    tastingNotes: 'Classic Nyeri SL profile: sparkling phosphoric acidity, ripe black plum, cane sugar.',
    adjustmentsMade: 'Water boiler PID calibrated to 94.0°C. Peak extraction.',
    approvedForShift: true,
  },
  {
    id: 'log-110',
    timestamp: '2026-09-17 15:20',
    recipeId: 'rec-house-blend',
    recipeName: 'Ngong Peak House Espresso',
    baristaName: 'Kevin Mwangi',
    doseIn: 18.5,
    yieldOut: 39.0,
    timeSeconds: 24,
    grindSetting: 'Mythos II: 2.35',
    brewTemp: 93.5,
    pressureBar: 9.0,
    tdsPercent: 8.6,
    extractionYieldPercent: 18.13, // (39.0 * 8.6) / 18.5
    status: 'channeling',
    sensoryScores: {
      acidity: 4.3,
      sweetness: 3.2,
      body: 3.6,
      balance: 3.0,
      cleanliness: 3.2,
      overallScore: 70,
    },
    tastingNotes: 'Uneven taste: simultaneously sour and bitter with hollow body. Clear spurting channeling on bottomless portafilter.',
    adjustmentsMade: 'Puck prep corrected: replaced worn distribution needle and retamped level with calibrated press.',
    approvedForShift: false,
  },
  {
    id: 'log-111',
    timestamp: '2026-09-16 07:15',
    recipeId: 'rec-house-blend',
    recipeName: 'Ngong Peak House Espresso',
    baristaName: 'Faith Chebet',
    doseIn: 18.5,
    yieldOut: 38.5,
    timeSeconds: 28,
    grindSetting: 'Mythos II: 2.35',
    brewTemp: 93.5,
    pressureBar: 9.0,
    tdsPercent: 10.0,
    extractionYieldPercent: 20.81, // (38.5 * 10.0) / 18.5
    status: 'sweet-spot',
    sensoryScores: {
      acidity: 4.7,
      sweetness: 4.9,
      body: 4.7,
      balance: 4.9,
      cleanliness: 4.9,
      overallScore: 95,
    },
    tastingNotes: 'Rich syrupy mouthfeel, dark chocolate, toffee caramel, clean lingering finish.',
    adjustmentsMade: 'Morning opening dial-in approved for morning shift.',
    approvedForShift: true,
  }
];

export const INITIAL_TRAINING_MODULES: TrainingModule[] = [
  {
    id: 'mod-espresso-foundations',
    title: 'Espresso Science & Extraction Dynamics',
    code: 'ESP-101',
    level: 'Foundation',
    category: 'Espresso Science',
    summary: 'Master dry dose precision, liquid yield target ratios, grind distribution physics, and extraction stages.',
    badgeName: 'Espresso Extraction Scholar',
    completedBaristaIds: ['staff-samuel', 'staff-brenda', 'staff-faith'],
    lessons: [
      {
        id: 'les-1',
        title: 'The Anatomy of an Espresso Extraction',
        durationMinutes: 12,
        content: `Espresso extraction is a multi-phase solvent process. Water at 90–96°C under 6–9 bar pressure dissolves soluble organic compounds from finely pulverized roasted coffee seeds.

Extraction happens in distinct temporal phases:
1. Fast-dissolving fruit acids and salts emerge in the first 0–8 seconds (intense sourness, crema initiation).
2. Caramelized sugars and aromatic middle notes follow during seconds 9–22 (peak sweetness, balanced acidity).
3. Heavy lipids and heavier bitter chlorogenic acid derivatives dissolve last from 22–32+ seconds (body, tannins, finish).

Understanding this sequence allows the barista to manipulate contact time and liquid mass to isolate target sensory balances.`,
        keyTakeaways: [
          'Sour compounds dissolve first; sweet sugars dissolve in the middle; astringent and bitter compounds dissolve last.',
          'Dose consistency must be accurate to within ±0.1g on an Ohaus or Acaia lunar scale.',
          'Channeling causes simultaneous under-extraction and over-extraction in the exact same puck.'
        ],
        proTips: [
          'Always purge 2 seconds of water from the group head prior to inserting the portafilter to stabilize temperature.'
        ],
        checkpointQuestion: {
          question: 'If an espresso shot tastes unpleasantly sour, thin, and finishes quickly with no sweetness, which extraction fault is most likely?',
          options: [
            'Over-extraction caused by too fine a grind',
            'Under-extraction caused by too coarse a grind or insufficient contact time',
            'Water temperature is too high (>96°C)',
            'Puck channeling leading to excessive bitterness'
          ],
          correctAnswer: 1,
          explanation: 'Under-extraction occurs when water flows too fast or grind is too coarse, failing to dissolve the sweet sugars that balance the early sharp acids.'
        }
      },
      {
        id: 'les-2',
        title: 'Puck Prep: WDT, Leveling, and Tamping Physics',
        durationMinutes: 15,
        content: `Modern specialty coffee extraction eliminates puck channeling through micro-needle Weiss Distribution Technique (WDT) and precision level tamping.

Key physical steps:
- Use 0.25mm - 0.35mm acupuncture needles to de-clump compressed coffee grounds straight from the grinder chute.
- Distribute in deep concentric circles starting from the basket floor and rising to the surface.
- Tamp horizontally flat. The force applied only needs to be sufficient to evacuate air gaps between particles (typically 15-20 kg of force; excessive force does NOT slow down water flow significantly once grounds reach full compaction).`,
        keyTakeaways: [
          'Needle WDT eliminates internal high-density clumps that cause water bypass.',
          'Uneven tamping leads to water rushing through the thin side, ruining cup extraction.',
          'Never tap the side of the portafilter basket with the tamper after tamping, as it fractures the puck seal.'
        ],
        proTips: [
          'Spinning leveler distributors can compress the top 2mm while leaving clumps underneath. Deep WDT is always mandatory.'
        ],
        checkpointQuestion: {
          question: 'Why is tapping the metal portafilter basket with a tamper after tamping strictly banned in specialty cafes?',
          options: [
            'It damages the chrome coating of the tamper base',
            'It breaks the adhesion seal between the compressed puck and basket wall, inducing perimeter channeling',
            'It makes too much acoustic noise on the service counter',
            'It increases the dry dose weight'
          ],
          correctAnswer: 1,
          explanation: 'Tapping breaks the compact seal between puck and metal basket, allowing pressurized water to shoot down the edges unhindered.'
        }
      }
    ]
  },
  {
    id: 'mod-tds-refractometry',
    title: 'TDS Refractometry & Extraction Yield Math',
    code: 'TDS-201',
    level: 'Intermediate',
    category: 'Espresso Science',
    summary: 'Demystify digital refractometers, Brix to TDS conversions, and calculating exact Extraction Yield % (EY%).',
    badgeName: 'Certified Refractometry Pro',
    completedBaristaIds: ['staff-samuel', 'staff-brenda'],
    lessons: [
      {
        id: 'les-tds-1',
        title: 'Mastering the Extraction Yield Formula',
        durationMinutes: 18,
        content: `Refractometry measures Total Dissolved Solids (TDS %) by calculating the refractive index of light passing through filtered coffee liquid.

The universal specialty coffee formula:
$$\\text{Extraction Yield (EY \\%)} = \\frac{\\text{Liquid Yield (g)} \\times \\text{TDS \\%}}{\\text{Dry Dose (g)}}$$

Example:
- Dry Dose: 18.0 g
- Beverage Liquid Weight: 38.0 g
- Refractometer TDS: 9.8%
$$\\text{EY \\%} = \\frac{38.0 \\times 9.8}{18.0} = \\frac{372.4}{18.0} = 20.69\\%$$

The SCA Golden Cup target extraction window for espresso sits between 18.0% and 22.0% Extraction Yield. Below 18% is under-extracted (sour, raw, unbalanced). Above 22% often exhibits dryness, bitterness, and astringency unless high-uniformity SSP flat burrs are utilized.`,
        keyTakeaways: [
          'TDS measures cup concentration (strength); Extraction Yield measures how much coffee mass was dissolved from the dry dose.',
          'Always filter espresso samples through an VST syringe filter or allow crema lipids to settle to avoid optical distortion.',
          'Cool the sample to room temperature before taking refractive readings to avoid thermal drift.'
        ],
        proTips: [
          'Clean the sapphire refractometer prism with distilled water and optical microfiber between every single calibration.'
        ],
        checkpointQuestion: {
          question: 'With a 20.0g dry dose, 42.0g liquid yield, and a measured TDS of 9.5%, what is the exact Extraction Yield (EY%)?',
          options: [
            '17.45%',
            '19.95%',
            '22.10%',
            '24.50%'
          ],
          correctAnswer: 1,
          explanation: '(42.0g × 9.5%) / 20.0g = 399 / 20 = 19.95% EY, comfortably in the specialty sweet spot.'
        }
      }
    ]
  },
  {
    id: 'mod-milk-chemistry',
    title: 'Milk Chemistry, Microfoam & Latte Art Physics',
    code: 'MLK-102',
    level: 'Foundation',
    category: 'Milk & Latte Art',
    summary: 'Protein denaturation, whey/casein stability, whirlpool vortex mechanics, and pouring hearts, rosettas, & swans.',
    badgeName: 'Master Foam Artisan',
    completedBaristaIds: ['staff-samuel', 'staff-faith', 'staff-kevin'],
    lessons: [
      {
        id: 'les-milk-1',
        title: 'Microfoam Physics & Temperature Thresholds',
        durationMinutes: 14,
        content: `Creating silky microfoam requires balancing two fundamental phases: stretching (aeration) and texturing (vortex folding).

Aeration must happen cold:
- Introduce air immediately between 4°C and 35°C. Air incorporates best when milk fats are semi-solid.
- Submerge the steam tip 5mm deeper once milk reaches body temperature (~37°C) to spin an aggressive vortex. This shears large bubbles down to sub-millimeter micro-bubbles.
- Shut off steam at 58–62°C. At temperatures >65°C, milk proteins permanently denature and coagulate, whey proteins release sulfurous aromas, and natural lactose sweetness degrades.`,
        keyTakeaways: [
          'Never stretch milk above 38°C; all air must be incorporated during the cold phase.',
          'Target temperature: 60°C - 63°C for maximum perceived sweetness and stable velvety shine.',
          'Never re-steam leftover milk; protein denaturation and lipid breakdown make re-foaming impossible and ruin texture.'
        ],
        proTips: [
          'Always purge and wipe steam wands with a dedicated damp microfiber immediately after removing the pitcher.'
        ],
        checkpointQuestion: {
          question: 'What happens to whole milk when heated above 68°C–70°C?',
          options: [
            'Lactose doubles in sweetness and foam becomes firmer',
            'Whey proteins degrade, milk loses sweetness, and develops scalded sulfurous flavor with dry, stiff foam',
            'Caffeine absorption is significantly heightened',
            'The milk becomes impossible to pour into a ceramic cup'
          ],
          correctAnswer: 1,
          explanation: 'Overheating breaks down delicate whey proteins and destabilizes lipid emulsions, causing scalded off-flavors and chalky texture.'
        }
      }
    ]
  },
  {
    id: 'mod-water-chemistry',
    title: 'Water Chemistry & Extraction Minerals',
    code: 'WTR-301',
    level: 'Advanced',
    category: 'Water Chemistry',
    summary: 'Calcium, Magnesium, Bicarbonate alkalinity, Total Dissolved Solids, and protecting boiler metal from scale.',
    badgeName: 'Hydrology Coffee Specialist',
    completedBaristaIds: ['staff-samuel'],
    lessons: [
      {
        id: 'les-water-1',
        title: 'Alkalinity, Buffer Capacity & Flavor Extraction',
        durationMinutes: 16,
        content: `Water comprises 90–92% of an espresso and 98.5% of a filter brew. The chemical composition dictates both flavor solubility and machine boiler longevity.

Key mineral roles:
- **Magnesium (Mg²⁺)**: Highly electronegative; bonds strongly to delicate oxygen-rich fruit flavor compounds (acids, floral aromatics). Ideal for showcasing Kenyan washed coffees.
- **Calcium (Ca²⁺)**: Bonds well to heavier creamy and chocolate compounds, but forms insoluble calcium carbonate (scale) inside steam boilers above 60°C.
- **Bicarbonate Alkalinity (KH)**: The acid buffer. If alkalinity is too high (>80 ppm as CaCO3), it neutralizes all vibrant fruit acids, making high-end coffees taste flat and chalky. If too low (<25 ppm), coffee tastes aggressively sour and corrosive acid pits copper boilers.`,
        keyTakeaways: [
          'Ideal SCA water spec: Total Hardness 50–120 ppm, Alkalinity 40–70 ppm, pH 6.8–7.4.',
          'BWT Bestmax water softeners balance scale protection with flavor extraction through ion-exchange resin.',
          'Check water hardness daily using drop titration or TDS probes.'
        ],
        proTips: [
          'If your single-origin Kenyan espresso tastes muted and like cardboard despite fresh roast, test your water alkalinity immediately.'
        ],
        checkpointQuestion: {
          question: 'What is the primary effect of excessively high water alkalinity (>100 ppm CaCO3) on specialty coffee flavor?',
          options: [
            'It intensifies pleasant citric and malic acidity',
            'It neutralizes and mutes natural coffee acids, producing a flat, chalky, lifeless cup',
            'It causes instant puck channeling during espresso extraction',
            'It prevents milk from frothing properly'
          ],
          correctAnswer: 1,
          explanation: 'High bicarbonate alkalinity acts as a chemical buffer that neutralizes the delicate fruit acids that give Kenyan and Ethiopian coffees their complexity.'
        }
      }
    ]
  }
];

export const INITIAL_EXAMS: BaristaExam[] = [
  {
    id: 'exam-level-1',
    title: 'Level 1: Certified Junior Barista',
    tier: 'Level 1: Certified Junior Barista',
    timeLimitMinutes: 15,
    passingScorePercent: 80,
    description: 'Essential assessment covering dose accuracy, grind adjustments, milk texturing hygiene, and basic bar workflow.',
    questions: [
      {
        id: 'q1',
        question: 'What is the standard acceptable variance in dry coffee dose weight for specialty espresso?',
        options: ['± 0.1 g', '± 1.0 g', '± 2.5 g', 'Weight does not matter as long as the basket looks full'],
        correctIndex: 0,
        explanation: 'Specialty coffee dosing requires precision within ±0.1g to ensure consistent resistance across shots.',
        topic: 'Dosing'
      },
      {
        id: 'q2',
        question: 'If morning espresso is running too fast (18s instead of target 28s) and tastes thin and sour, what immediate correction should the barista make?',
        options: [
          'Adjust grinder collar to a finer setting',
          'Adjust grinder collar to a coarser setting',
          'Increase milk temperature to 75°C',
          'Tamp twice with extreme body weight'
        ],
        correctIndex: 0,
        explanation: 'Finer particles create higher resistance, restricting water flow and slowing down extraction time to the 28s target.',
        topic: 'Grinder Adjustment'
      },
      {
        id: 'q3',
        question: 'What is the ideal steaming temperature range for whole milk latte and flat white beverages?',
        options: ['40°C - 45°C', '58°C - 63°C', '75°C - 85°C', '95°C - 100°C (Boiling)'],
        correctIndex: 1,
        explanation: '58°C–63°C provides peak perceived sweetness, stable protein texture, and ideal beverage drinking comfort.',
        topic: 'Milk Chemistry'
      },
      {
        id: 'q4',
        question: 'Why must steam wands be purged and wiped immediately after steaming milk?',
        options: [
          'To prevent cooling milk vacuum from sucking rancid milk back into the steam boiler and harboring bacteria',
          'It is only an aesthetic recommendation with no functional purpose',
          'To cool down the barista’s hands',
          'To empty the steam boiler completely'
        ],
        correctIndex: 0,
        explanation: 'As the wand cools, a partial vacuum forms that can suck bacteria-laden milk into the boiler, creating severe contamination.',
        topic: 'Hygiene & Machine Care'
      },
      {
        id: 'q5',
        question: 'What is the primary function of the Weiss Distribution Technique (WDT)?',
        options: [
          'To pack coffee grounds down tightly into the basket',
          'To break up grinder clumps and homogenize particle density to prevent water channeling',
          'To polish the top of the dry coffee puck',
          'To add aroma into the espresso chamber'
        ],
        correctIndex: 1,
        explanation: 'WDT de-clumps grounds with thin acupuncture needles, ensuring uniform density and eliminating channeling channels.',
        topic: 'Puck Prep'
      }
    ]
  },
  {
    id: 'exam-level-2',
    title: 'Level 2: Senior Barista & Dial-In Master',
    tier: 'Level 2: Senior Barista & Dial-In Master',
    timeLimitMinutes: 20,
    passingScorePercent: 85,
    description: 'Advanced evaluation covering refractometry formulas, TDS calculations, brew ratios, channeling diagnostics, and origin flavor profiles.',
    questions: [
      {
        id: 'q2-1',
        question: 'Calculate the Extraction Yield (EY%) for: Dry Dose = 18.0g, Liquid Yield = 36.0g, Refractometer TDS = 10.0%.',
        options: ['16.0%', '18.0%', '20.0%', '22.5%'],
        correctIndex: 2,
        explanation: 'EY% = (Yield × TDS%) / Dose = (36.0 × 10.0%) / 18.0 = 360 / 18 = 20.0%.',
        topic: 'Extraction Math'
      },
      {
        id: 'q2-2',
        question: 'A barista notes an espresso shot with a fast onset flow, blonding at 14s, high bitterness on the tongue tip, and astringency on the palate. Bottomless portafilter showed spurting jets. What is the diagnosis?',
        options: [
          'Clean extraction with ideal balanced yield',
          'Severe puck channeling, causing localized over-extraction in cracks and under-extraction in unpenetrated dry pockets',
          'The coffee beans are roasted too dark',
          'The water boiler pressure is too low (3 bar)'
        ],
        correctIndex: 1,
        explanation: 'Spurting and astringency with rapid blonding are classic signatures of catastrophic channeling.',
        topic: 'Sensory & Diagnostics'
      },
      {
        id: 'q2-3',
        question: 'Kenyan SL28 and SL34 washed varieties are renowned worldwide for which sensory acid profile?',
        options: [
          'Low acidity with earthy leather notes',
          'Vibrant phosphoric and complex citric/malic acidity with blackcurrant and grapefruit notes',
          'Vinegary acetic acid with salty finish',
          'Pure lactic milky sweetness with no fruit character'
        ],
        correctIndex: 1,
        explanation: 'Kenyan high-altitude volcanic soils produce distinctive phosphoric and citric acid vibrancy with signature blackcurrant.',
        topic: 'Coffee Origins'
      },
      {
        id: 'q2-4',
        question: 'How does increasing brew water temperature from 90°C to 95°C impact espresso extraction rate?',
        options: [
          'It slows down extraction and reduces yield',
          'It increases solubility of heavier, slower-dissolving compounds, elevating extraction yield',
          'It decreases TDS by destroying coffee solids',
          'It has zero physical effect on extraction'
        ],
        correctIndex: 1,
        explanation: 'Higher water temperature increases thermal energy and solubility, pulling more compounds into solution faster.',
        topic: 'Thermodynamics'
      },
      {
        id: 'q2-5',
        question: 'When calibrating burrs, what does "chirp point" or "true zero" signify on a commercial grinder?',
        options: [
          'The maximum coarse setting for French press',
          'The point where rotating and stationary burr teeth first physically touch and make a light metal chirp sound',
          'The motor overload safety cutoff setting',
          'The ideal setting for filter drip brewing'
        ],
        correctIndex: 1,
        explanation: 'True zero is the baseline where burrs touch. All espresso micro-adjustments are measured relative to this reference point.',
        topic: 'Equipment Calibration'
      }
    ]
  },
  {
    id: 'exam-level-3',
    title: 'Level 3: Head Barista & Sensory Specialist',
    tier: 'Level 3: Head Barista & Sensory Specialist',
    timeLimitMinutes: 25,
    passingScorePercent: 90,
    description: 'Elite master-level exam covering multi-unit quality control, water buffer chemistry, sensory cupping protocols, and machine preventative engineering.',
    questions: [
      {
        id: 'q3-1',
        question: 'Which water mineral species is most effective at binding to oxygen-containing flavor volatiles like linalool and fruit esters?',
        options: ['Calcium (Ca²⁺)', 'Magnesium (Mg²⁺)', 'Sodium (Na⁺)', 'Chloride (Cl⁻)'],
        correctIndex: 1,
        explanation: 'Magnesium has a higher charge density and smaller ionic radius than Calcium, providing superior affinity for polar flavor molecules.',
        topic: 'Water Science'
      },
      {
        id: 'q3-2',
        question: 'Under SCA cupping protocol, what is the mandatory brewing ratio of coffee grinds to water mass?',
        options: ['55 g / 1,000 ml (± 2g)', '75 g / 1,000 ml', '35 g / 1,000 ml', '100 g / 1,000 ml'],
        correctIndex: 0,
        explanation: 'SCA cupping standard specifies 8.25 grams of whole bean coffee per 150 ml of water (approx. 55g/L).',
        topic: 'SCA Cupping Protocol'
      },
      {
        id: 'q3-3',
        question: 'What is the standard burr lifespan before burr geometry wear degrades particle size distribution on a Mahlkönig EK43 (Cast Steel)?',
        options: ['Approx. 100 kg', 'Approx. 500 kg', 'Approx. 1,200 - 1,500 kg', 'Burrs never need replacing'],
        correctIndex: 2,
        explanation: 'EK43 cast steel burrs deliver peak uniformity for ~1,200 to 1,500 kg of coffee before fines spike and micro-chipping occurs.',
        topic: 'Equipment Maintenance'
      },
      {
        id: 'q3-4',
        question: 'In espresso dial-in, if a barista extends the brew ratio from 1:2.0 to 1:2.5 while holding dry dose constant, what happens to TDS and Extraction Yield?',
        options: [
          'TDS increases, EY decreases',
          'TDS decreases, EY increases',
          'Both TDS and EY decrease',
          'Both TDS and EY increase'
        ],
        correctIndex: 1,
        explanation: 'More water through the bed extracts more total grams of soluble material (higher EY%), but dilutes the final concentration (lower TDS%).',
        topic: 'Extraction Dynamics'
      },
      {
        id: 'q3-5',
        question: 'What chemical compound forms when espresso machines are backflushed with Cafiza (Sodium Percarbonate)?',
        options: [
          'Hydrogen peroxide and soda ash that safely saponify and dissolve oxidized coffee oils',
          'Hydrochloric acid that corrodes brass valves',
          'Sulfuric acid crystals',
          'Chlorine bleach gas'
        ],
        correctIndex: 0,
        explanation: 'Sodium percarbonate in hot water releases sodium carbonate and hydrogen peroxide, lifting coffee oil resins without harming food contact surfaces.',
        topic: 'Chemical Sanitation'
      }
    ]
  }
];

export const INITIAL_EQUIPMENT: EquipmentItem[] = [
  {
    id: 'eq-lamarzocco-1',
    name: 'La Marzocco Linea PB 2-Group AV',
    category: 'Espresso Machine',
    model: 'Linea PB Auto-Volumetric Dual Boiler',
    serialNumber: 'LM-PB-2024-88412',
    station: 'Bar 1 - Main Service Station',
    status: 'operational',
    lastMaintenanceDate: '2026-09-01',
    nextMaintenanceDate: '2026-10-01',
    maintenanceSchedule: 'Daily group backflush, monthly gasket inspection, quarterly steam wand rebuild.',
    dailyChecklist: [
      { task: 'Morning group head flush & screen check', completed: true, requiredTime: '06:45' },
      { task: 'Midday portafilter basket soak & rinse', completed: true, requiredTime: '13:00' },
      { task: 'Evening chemical backflush with Cafiza', completed: false, requiredTime: '17:30' },
      { task: 'Steam wand vacuum purge & tip soak', completed: false, requiredTime: '17:45' }
    ],
    serviceLogs: [
      { date: '2026-09-01', technician: 'Nairobi Espresso Services', notes: 'Replaced silicone 8.5mm group gaskets, installed IMS competition shower screens, calibrated dual boilers.', costKSh: 14500 },
      { date: '2026-06-12', technician: 'Nairobi Espresso Services', notes: 'Replaced vacuum breaker valve and expansion safety valve.', costKSh: 8200 }
    ]
  },
  {
    id: 'eq-mythos-1',
    name: 'Victoria Arduino Mythos II Gravimetric',
    category: 'Grinder',
    model: 'Mythos II Titanium 85mm Clima Pro',
    serialNumber: 'VA-M2-9901-KE',
    station: 'Bar 1 - Main House Grinder',
    status: 'operational',
    burrHoursOrThroughputKg: {
      currentKg: 420,
      maxKg: 1200
    },
    lastMaintenanceDate: '2026-08-15',
    nextMaintenanceDate: '2026-11-15',
    maintenanceSchedule: 'Weekly clump crusher cleaning, monthly chamber vacuum, burr replacement at 1,200kg.',
    dailyChecklist: [
      { task: 'Hopper wash with warm soapy water', completed: true, requiredTime: '06:30' },
      { task: 'Purge 15g stale grinds before morning dial-in', completed: true, requiredTime: '06:50' },
      { task: 'Chamber brush out & clump crusher inspection', completed: false, requiredTime: '17:30' }
    ],
    serviceLogs: [
      { date: '2026-08-15', technician: 'Samuel Kinyanjui', notes: 'Deep ultrasonic clean of burr carrier, checked motor alignment, zero point recalibration.', costKSh: 0 }
    ]
  },
  {
    id: 'eq-ek43-1',
    name: 'Mahlkönig EK43S Single-Dose',
    category: 'Grinder',
    model: 'EK43S 98mm Cast Steel Burrs',
    serialNumber: 'MK-EK-3410-NA',
    station: 'Bar 2 - Single Origin & Cupping Station',
    status: 'maintenance-due',
    burrHoursOrThroughputKg: {
      currentKg: 1180,
      maxKg: 1200
    },
    lastMaintenanceDate: '2026-07-10',
    nextMaintenanceDate: '2026-09-25',
    maintenanceSchedule: 'Burrs approaching 1,200kg throughput limit! Schedule precision alignment & replacement.',
    dailyChecklist: [
      { task: 'Shear plate alignment check', completed: true, requiredTime: '07:00' },
      { task: 'Knocker spring tension inspection', completed: true, requiredTime: '07:05' },
      { task: 'Vacuum chute & exit spout', completed: false, requiredTime: '17:30' }
    ],
    serviceLogs: [
      { date: '2026-07-10', technician: 'Artisan Tech Nairobi', notes: 'Sanded burr carrier face for Titus zero-tolerance alignment.', costKSh: 18000 }
    ]
  },
  {
    id: 'eq-bwt-water',
    name: 'BWT Bestmax Premium V Water Filtration',
    category: 'Water Filtration',
    model: 'Bestmax V with Magnesium Mineralizer',
    serialNumber: 'BWT-BM-8831',
    station: 'Main Water Line - Kitchen Utility Bay',
    status: 'operational',
    lastMaintenanceDate: '2026-08-01',
    nextMaintenanceDate: '2026-11-01',
    maintenanceSchedule: 'Replace cartridge every 6 months or 3,000L. Test effluent TDS and dKH weekly.',
    dailyChecklist: [
      { task: 'Water line pressure gauge check (target 3.5 bar)', completed: true, requiredTime: '07:00' },
      { task: 'Effluent TDS check using digital probe', completed: true, requiredTime: '07:15' }
    ],
    serviceLogs: [
      { date: '2026-08-01', technician: 'Pure Water East Africa', notes: 'New Bestmax V cartridge installed, bypass set to 2.5 for optimal 70ppm TDS.', costKSh: 16500 }
    ]
  }
];

export const INITIAL_SERVICE_ALERTS: ServiceAlert[] = [
  {
    id: 'alt-1',
    equipmentId: 'eq-ek43-1',
    equipmentName: 'Mahlkönig EK43S Single-Dose',
    severity: 'warning',
    title: 'Burr Lifespan Reaching 98% (1,180 / 1,200 kg)',
    detail: 'Total throughput is at 1,180kg. Particle distribution variance will widen and fines production will increase. Order replacement 98mm SSP or Cast Steel burrs.',
    timestamp: '2026-09-23 06:00',
    actionRequired: 'Order burr set & schedule technician alignment',
    resolved: false,
  },
  {
    id: 'alt-2',
    equipmentId: 'eq-lamarzocco-1',
    equipmentName: 'La Marzocco Linea PB 2-Group AV',
    severity: 'info',
    title: 'Evening Cafiza Backflush Pending',
    detail: 'Daily chemical backflush scheduled for 17:30. Ensure blind basket and 3g Cafiza powder are used across Group 1 and Group 2.',
    timestamp: '2026-09-23 08:30',
    actionRequired: 'Execute 5x 10-second chemical cycles at close',
    resolved: false,
  }
];

export const INITIAL_STOCK: StockItem[] = [
  {
    id: 'stk-beans-house',
    name: 'Ngong Peak House Espresso Beans',
    category: 'Roasted Coffee',
    currentStock: 18.5,
    unit: 'kg',
    minThreshold: 10.0,
    costPerUnitKSh: 2200,
    supplier: 'Barista OS Roasting Works',
    supplierPhone: '+254 712 345 678',
    lastRestocked: '2026-09-20',
    dailyBurnRate: 4.5,
    sku: 'COF-NGONG-1KG',
    qrCode: 'BOS-COF-NGONG-1KG',
    packageType: '1kg Degassing Valve Bag',
    barcodeNumber: '616110022301'
  },
  {
    id: 'stk-beans-nyeri',
    name: 'Nyeri Karindundu AA Microlot',
    category: 'Roasted Coffee',
    currentStock: 6.2,
    unit: 'kg',
    minThreshold: 4.0,
    costPerUnitKSh: 3100,
    supplier: 'Central Kenya Coffee Growers Co-op',
    supplierPhone: '+254 722 987 654',
    lastRestocked: '2026-09-18',
    dailyBurnRate: 1.2,
    sku: 'COF-NYERI-1KG',
    qrCode: 'BOS-COF-NYERI-1KG',
    packageType: '1kg Degassing Valve Bag',
    barcodeNumber: '616110022302'
  },
  {
    id: 'stk-beans-yirgacheffe',
    name: 'Yirgacheffe Kochere Natural Microlot',
    category: 'Roasted Coffee',
    currentStock: 8.0,
    unit: 'kg',
    minThreshold: 3.0,
    costPerUnitKSh: 3400,
    supplier: 'Addis Specialty Coffee Exporters',
    supplierPhone: '+254 722 101 202',
    lastRestocked: '2026-09-21',
    dailyBurnRate: 1.0,
    sku: 'COF-YIRG-1KG',
    qrCode: 'BOS-COF-YIRG-1KG',
    packageType: '1kg Degassing Valve Bag',
    barcodeNumber: '616110022303'
  },
  {
    id: 'stk-syrup-vanilla',
    name: 'Madagascar Bourbon Vanilla Craft Syrup',
    category: 'Syrups & Ingredients',
    currentStock: 9,
    unit: 'Bottles (750ml)',
    minThreshold: 4,
    costPerUnitKSh: 1850,
    supplier: 'Maison Artisan Syrups Nairobi',
    supplierPhone: '+254 711 400 500',
    lastRestocked: '2026-09-17',
    dailyBurnRate: 1.2,
    sku: 'SYR-VANILLA-750',
    qrCode: 'BOS-SYR-VANILLA-750',
    packageType: '750ml Glass Pump Bottle',
    barcodeNumber: '616220033101'
  },
  {
    id: 'stk-syrup-caramel',
    name: 'Artisanal Salted Caramel Cane Syrup',
    category: 'Syrups & Ingredients',
    currentStock: 7,
    unit: 'Bottles (750ml)',
    minThreshold: 3,
    costPerUnitKSh: 1850,
    supplier: 'Maison Artisan Syrups Nairobi',
    supplierPhone: '+254 711 400 500',
    lastRestocked: '2026-09-17',
    dailyBurnRate: 0.9,
    sku: 'SYR-CARAMEL-750',
    qrCode: 'BOS-SYR-CARAMEL-750',
    packageType: '750ml Glass Pump Bottle',
    barcodeNumber: '616220033102'
  },
  {
    id: 'stk-syrup-hazelnut',
    name: 'Roasted Hazelnut Botanical Syrup',
    category: 'Syrups & Ingredients',
    currentStock: 3,
    unit: 'Bottles (750ml)',
    minThreshold: 4,
    costPerUnitKSh: 1950,
    supplier: 'Maison Artisan Syrups Nairobi',
    supplierPhone: '+254 711 400 500',
    lastRestocked: '2026-09-10',
    dailyBurnRate: 0.6,
    sku: 'SYR-HAZEL-750',
    qrCode: 'BOS-SYR-HAZEL-750',
    packageType: '750ml Glass Pump Bottle',
    barcodeNumber: '616220033103'
  },
  {
    id: 'stk-syrup-chai',
    name: 'Organic Masala Spiced Chai Concentrate',
    category: 'Syrups & Ingredients',
    currentStock: 11,
    unit: 'Bottles (1L)',
    minThreshold: 5,
    costPerUnitKSh: 2100,
    supplier: 'Nandi Hills Chai Blends',
    supplierPhone: '+254 722 887 766',
    lastRestocked: '2026-09-19',
    dailyBurnRate: 2.0,
    sku: 'SYR-CHAI-1L',
    qrCode: 'BOS-SYR-CHAI-1L',
    packageType: '1000ml Glass Bottle',
    barcodeNumber: '616220033104'
  },
  {
    id: 'stk-syrup-lavender',
    name: 'Wild Mountain Lavender Floral Infusion',
    category: 'Syrups & Ingredients',
    currentStock: 2,
    unit: 'Bottles (500ml)',
    minThreshold: 3,
    costPerUnitKSh: 2250,
    supplier: 'Botanical Extracts Kenya',
    supplierPhone: '+254 733 998 811',
    lastRestocked: '2026-09-08',
    dailyBurnRate: 0.4,
    sku: 'SYR-LAVENDER-500',
    qrCode: 'BOS-SYR-LAVENDER-500',
    packageType: '500ml Apothecary Bottle',
    barcodeNumber: '616220033105'
  },
  {
    id: 'stk-milk-whole',
    name: 'Bio Gourmet Whole Barista Milk (3.8% fat)',
    category: 'Dairy & Plant Milk',
    currentStock: 42,
    unit: 'Liters',
    minThreshold: 24,
    costPerUnitKSh: 135,
    supplier: 'Bio Foods Kenya Ltd',
    supplierPhone: '+254 700 111 222',
    lastRestocked: '2026-09-22',
    dailyBurnRate: 28,
    sku: 'MLK-WHOLE-1L',
    qrCode: 'BOS-MLK-WHOLE-1L',
    packageType: '1L Tetra Pak'
  },
  {
    id: 'stk-milk-oat',
    name: 'Oatly Barista Edition Oat Milk',
    category: 'Dairy & Plant Milk',
    currentStock: 14,
    unit: 'Liters',
    minThreshold: 12,
    costPerUnitKSh: 420,
    supplier: 'Specialty Beverage Dist. Kenya',
    supplierPhone: '+254 733 445 566',
    lastRestocked: '2026-09-19',
    dailyBurnRate: 6,
    sku: 'MLK-OAT-1L',
    qrCode: 'BOS-MLK-OAT-1L',
    packageType: '1L Tetra Pak'
  },
  {
    id: 'stk-cups-8oz',
    name: 'Compostable 8oz Takeaway Cups & Lids',
    category: 'Packaging & Cups',
    currentStock: 480,
    unit: 'Cups',
    minThreshold: 300,
    costPerUnitKSh: 18,
    supplier: 'EcoCup East Africa',
    supplierPhone: '+254 711 889 900',
    lastRestocked: '2026-09-15',
    dailyBurnRate: 120,
    sku: 'PKG-CUPS-8OZ',
    qrCode: 'BOS-PKG-CUPS-8OZ',
    packageType: 'Sleeve of 50'
  },
  {
    id: 'stk-cafiza',
    name: 'Urnex Cafiza Espresso Machine Cleaner (900g)',
    category: 'Machine Chemicals',
    currentStock: 2.5,
    unit: 'Tubs',
    minThreshold: 1.0,
    costPerUnitKSh: 3400,
    supplier: 'Barista Hardware Nairobi',
    supplierPhone: '+254 720 000 111',
    lastRestocked: '2026-09-05',
    dailyBurnRate: 0.05,
    sku: 'CHM-CAFIZA-900',
    qrCode: 'BOS-CHM-CAFIZA-900',
    packageType: '900g Jar'
  }
];

export const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'staff-samuel',
    name: 'Samuel Kinyanjui',
    role: 'Head Barista',
    email: 'samuel.k@baristaos.cafe',
    phone: '+254 712 001 002',
    status: 'on-shift',
    dialInStreakDays: 48,
    totalShotsLogged: 3420,
    examCertifications: ['Level 1: Certified Junior Barista', 'Level 2: Senior Barista & Dial-In Master', 'Level 3: Head Barista & Sensory Specialist'],
    averageExtractionScore: 94.6,
    shiftHoursLogged: 168,
  },
  {
    id: 'staff-brenda',
    name: 'Brenda Wanjiru',
    role: 'Senior Barista',
    email: 'brenda.w@baristaos.cafe',
    phone: '+254 723 445 889',
    status: 'on-shift',
    dialInStreakDays: 32,
    totalShotsLogged: 2180,
    examCertifications: ['Level 1: Certified Junior Barista', 'Level 2: Senior Barista & Dial-In Master'],
    averageExtractionScore: 91.2,
    shiftHoursLogged: 152,
  },
  {
    id: 'staff-kevin',
    name: 'Kevin Mwangi',
    role: 'Barista',
    email: 'kevin.m@baristaos.cafe',
    phone: '+254 734 556 778',
    status: 'break',
    dialInStreakDays: 14,
    totalShotsLogged: 940,
    examCertifications: ['Level 1: Certified Junior Barista'],
    averageExtractionScore: 86.8,
    shiftHoursLogged: 136,
  },
  {
    id: 'staff-faith',
    name: 'Faith Achieng',
    role: 'Barista Apprentice',
    email: 'faith.a@baristaos.cafe',
    phone: '+254 715 667 889',
    status: 'off-duty',
    dialInStreakDays: 5,
    totalShotsLogged: 210,
    examCertifications: ['Level 1: Certified Junior Barista'],
    averageExtractionScore: 83.5,
    shiftHoursLogged: 96,
  }
];

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: 'tier-starter',
    name: 'Barista Starter',
    priceMonthlyKSh: 1500,
    priceAnnualMonthlyKSh: 1250,
    description: 'Perfect for independent coffee shops, neighborhood espresso carts, and boutique roastery bars.',
    audience: 'Single Café Locations',
    caféLicensesCount: '1 Café Location',
    baristasAllowed: 'Up to 4 Active Baristas',
    features: [
      'Core Espresso Recipe Library (Unlimited)',
      'Daily Morning & Shift Espresso QC Logging',
      'Basic Extraction Ratio & Flow Timer',
      'Foundation Staff Training Modules (ESP-101, MLK-102)',
      'Level 1 Certified Junior Barista Exam & Badges',
      'Daily Equipment Backflush Checklists',
      'Inventory Stock & Reorder Alerts',
      'Export Monthly Quality Log (PDF/CSV)'
    ],
    highlighted: false,
  },
  {
    id: 'tier-pro',
    name: 'Specialty Pro',
    priceMonthlyKSh: 3200,
    priceAnnualMonthlyKSh: 2650,
    description: 'The standard for high-volume specialty coffee bars, roasteries, and progressive café teams.',
    audience: 'Specialty Cafés & Multi-Station Bars',
    caféLicensesCount: 'Up to 3 Café Branches',
    baristasAllowed: 'Unlimited Baristas',
    features: [
      'Everything in Barista Starter, plus:',
      'Refractometer TDS & Extraction Yield (EY%) Real-time Engine',
      'SCA Brewing Control Chart Target Mapping',
      'Level 2 Senior Barista & Dial-In Master Exam + Digital Certificates',
      'Equipment Burr Throughput Lifespan Telemetry & Alerts',
      'Automated Spoilage & Milk-to-Shot Waste Tracker',
      'Live Shift Productivity & Hourly Speed Diagnostics',
      'Multi-Branch Quality Control Benchmarking',
      'Priority 24/7 Barista Support via WhatsApp & Phone'
    ],
    highlighted: true,
  },
  {
    id: 'tier-enterprise',
    name: 'Café Chain & Roastery Enterprise',
    priceMonthlyKSh: 5000,
    priceAnnualMonthlyKSh: 4150,
    description: 'Engineered for multi-unit café chains, franchise operations, and commercial wholesale roasteries.',
    audience: 'Café Chains & Commercial Roasteries',
    caféLicensesCount: 'Unlimited Café Branches',
    baristasAllowed: 'Unlimited Staff & Roastery Lab Accounts',
    features: [
      'Everything in Specialty Pro, plus:',
      'Level 3 Head Barista & Sensory Specialist Master Exam',
      'Custom Training Curriculum Builder (Upload Video/SOPs)',
      'Roastery Batch Profile Sync directly to Barista Station Grinders',
      'Multi-Unit Executive Dashboard & P&L Extraction Yield Analytics',
      'Supplier Electronic Purchase Order Generation (M-Pesa/Bank)',
      'Quarterly In-Person Sensory Calibration with Master Roaster',
      'Custom Whitelabel Domain & Café Branding',
      'Dedicated Coffee Quality Account Manager'
    ],
    highlighted: false,
  }
];

export const INITIAL_CHECKLIST_TASKS: ChecklistTaskDefinition[] = [
  // OPENING SHIFT TASKS
  {
    id: 'chk-op-1',
    shiftType: 'opening',
    title: 'Power On Espresso Machine & Check Boiler Pressures',
    description: 'Ensure steam boiler reaches 1.5 - 1.8 bar and rotary pump brew pressure shows stable 9.0 bar. Check group head heating.',
    category: 'espresso-grinder',
    isRequired: true,
    estimatedMinutes: 5,
    timeTarget: '06:15 AM',
    station: 'La Marzocco Linea PB',
    order: 1
  },
  {
    id: 'chk-op-2',
    shiftType: 'opening',
    title: 'Inspect BWT Filtration & Water System Line Pressure',
    description: 'Check water pressure regulator gauge (3.5 bar). Run test drop on inline refractometer/TDS kit (< 70 ppm, 3-4 dKH).',
    category: 'water-filtration',
    isRequired: true,
    estimatedMinutes: 4,
    timeTarget: '06:20 AM',
    station: 'BWT Filtration Rack',
    order: 2
  },
  {
    id: 'chk-op-3',
    shiftType: 'opening',
    title: 'Fill Grinder Hoppers & Inspect Rested Coffee Bags',
    description: 'Check roast date on bags (minimum 7 days rested, maximum 28 days). Fill Mahlkönig hoppers with House and Single Origin beans.',
    category: 'espresso-grinder',
    isRequired: true,
    estimatedMinutes: 5,
    timeTarget: '06:25 AM',
    station: 'Grinder Station',
    order: 3
  },
  {
    id: 'chk-op-4',
    shiftType: 'opening',
    title: 'Morning Dial-In Calibration & Log to Daily QC',
    description: 'Pull test extractions until recipe meets target 18.5g in -> 38g out in 27-29s. Taste and record TDS/EY% in Daily QC module.',
    category: 'espresso-grinder',
    isRequired: true,
    estimatedMinutes: 12,
    timeTarget: '06:35 AM',
    station: 'Main Espresso Bar',
    order: 4
  },
  {
    id: 'chk-op-5',
    shiftType: 'opening',
    title: 'Restock Milk Under-Counter Fridge & Check Temperature',
    description: 'Restock whole milk, Oatly barista, and almond milk carafes. Confirm fridge internal temperature is strictly below 4°C.',
    category: 'milk-syrups',
    isRequired: true,
    estimatedMinutes: 6,
    timeTarget: '06:40 AM',
    station: 'Milk Station Fridge',
    order: 5
  },
  {
    id: 'chk-op-6',
    shiftType: 'opening',
    title: 'Count POS Cash Float Drawer & Check Safaricom Till',
    description: 'Verify cash drawer opening float (KSh 10,000 exact change breakdown). Verify Safaricom M-Pesa Merchant Till connectivity.',
    category: 'pos-cash',
    isRequired: true,
    estimatedMinutes: 5,
    timeTarget: '06:45 AM',
    station: 'POS Cash Register',
    order: 6
  },
  {
    id: 'chk-op-7',
    shiftType: 'opening',
    title: 'Sanitize Counters, Tamper Wells & Steam Towels',
    description: 'Wipe all food contact surfaces with food-safe sanitizer. Prepare color-coded microfiber towels: blue for steam wands, brown for bar.',
    category: 'sanitation-station',
    isRequired: true,
    estimatedMinutes: 5,
    timeTarget: '06:50 AM',
    station: 'Bar Prep Counter',
    order: 7
  },
  {
    id: 'chk-op-8',
    shiftType: 'opening',
    title: 'Inspect Syrup Pumps, Concentrates & Water Boiler',
    description: 'Prime pumps for vanilla, caramel, and hazelnut syrups. Check Marco water tower temperature is at 94°C for Americanos/Teas.',
    category: 'milk-syrups',
    isRequired: false,
    estimatedMinutes: 4,
    timeTarget: '06:52 AM',
    station: 'Syrup & Tea Tower',
    order: 8
  },
  {
    id: 'chk-op-9',
    shiftType: 'opening',
    title: 'Arrange Morning Pastry Display Case & Tongs',
    description: 'Inspect delivered viennoiserie, croissants, and artisan muffins. Label with allergen cards and position fresh sanitised tongs.',
    category: 'milk-syrups',
    isRequired: false,
    estimatedMinutes: 6,
    timeTarget: '06:55 AM',
    station: 'Bakery Display Showcase',
    order: 9
  },
  {
    id: 'chk-op-10',
    shiftType: 'opening',
    title: 'Turn On Café Music, Unlock Entrance & Set A-Frame Sign',
    description: 'Start café ambient soundtrack at 40% volume. Unlock front entrance doors at 07:00 AM sharp and position sidewalk chalkboard menu.',
    category: 'facility-security',
    isRequired: false,
    estimatedMinutes: 5,
    timeTarget: '07:00 AM',
    station: 'Store Entrance & Patio',
    order: 10
  },

  // CLOSING SHIFT TASKS
  {
    id: 'chk-cl-1',
    shiftType: 'closing',
    title: 'Chemical Cafiza Backflush All Espresso Group Heads',
    description: 'Insert blind baskets with 1 tsp Urnex Cafiza. Run 5x 10-second pump cycles per group, rinse thoroughly, and wipe shower screens.',
    category: 'espresso-grinder',
    isRequired: true,
    estimatedMinutes: 10,
    timeTarget: '18:15 PM',
    station: 'La Marzocco Linea PB',
    order: 1
  },
  {
    id: 'chk-cl-2',
    shiftType: 'closing',
    title: 'Soak Steam Wands in Alkaline Rinza Solution & Purge',
    description: 'Immerse steam wand tips in Rinza milk dissolver solution. Wipe thoroughly, unscrew tip if needed, and purge high-pressure steam.',
    category: 'espresso-grinder',
    isRequired: true,
    estimatedMinutes: 8,
    timeTarget: '18:25 PM',
    station: 'Steam Wands L & R',
    order: 2
  },
  {
    id: 'chk-cl-3',
    shiftType: 'closing',
    title: 'Empty Grinder Hoppers & Vacuum Burrs Chute',
    description: 'Pour remaining beans into airtight vacuum bins labeled with origin & date. Vacuum burr chamber and brush away all retained grinds.',
    category: 'espresso-grinder',
    isRequired: true,
    estimatedMinutes: 8,
    timeTarget: '18:35 PM',
    station: 'Mahlkönig Grinders',
    order: 3
  },
  {
    id: 'chk-cl-4',
    shiftType: 'closing',
    title: 'Disassemble Portafilters, Baskets & Soak Overnight',
    description: 'Remove spring clips, filter baskets, and brass spouts. Soak overnight in warm water with 1 scoop espresso detergent.',
    category: 'espresso-grinder',
    isRequired: true,
    estimatedMinutes: 7,
    timeTarget: '18:42 PM',
    station: 'Espresso Tool Washbasin',
    order: 4
  },
  {
    id: 'chk-cl-5',
    shiftType: 'closing',
    title: 'Deep Flush Drip Tray Basin & Clean Drainage Line',
    description: 'Lift out drip tray grate, wash with degreasing detergent, and pour 3 liters of boiling water down the drain hose to clear buildup.',
    category: 'sanitation-station',
    isRequired: true,
    estimatedMinutes: 8,
    timeTarget: '18:50 PM',
    station: 'Drainage & Drip Tray',
    order: 5
  },
  {
    id: 'chk-cl-6',
    shiftType: 'closing',
    title: 'Clean & Sanitize Knockboxes, Rinsers & Tamp Mats',
    description: 'Empty spent espresso pucks into organic compost bin. Scrub knockbox bar, disinfect stainless pitcher rinser wells, and dry mats.',
    category: 'sanitation-station',
    isRequired: false,
    estimatedMinutes: 6,
    timeTarget: '18:56 PM',
    station: 'Bar Countertops',
    order: 6
  },
  {
    id: 'chk-cl-7',
    shiftType: 'closing',
    title: 'End-Of-Day Milk & Food Inventory Waste Logging',
    description: 'Check expiration on opened milk cartons, toss expired perishables, and log any wasted espresso or pastries in inventory ledger.',
    category: 'milk-syrups',
    isRequired: true,
    estimatedMinutes: 7,
    timeTarget: '19:05 PM',
    station: 'Milk Refrigeration Unit',
    order: 7
  },
  {
    id: 'chk-cl-8',
    shiftType: 'closing',
    title: 'Print POS Z-Report, Reconcile Cash & Safaricom Till',
    description: 'Generate POS daily sales report. Count cash, verify M-Pesa statements, record discrepancy notes, and secure money in drop safe.',
    category: 'pos-cash',
    isRequired: true,
    estimatedMinutes: 10,
    timeTarget: '19:15 PM',
    station: 'POS System & Safe',
    order: 8
  },
  {
    id: 'chk-cl-9',
    shiftType: 'closing',
    title: 'Sweep, Mop Bar Floor Mats & Empty All Waste Bins',
    description: 'Roll up anti-fatigue rubber mats, sweep floor, and mop with sanitizer. Empty trash, recycle bags, and install fresh bin liners.',
    category: 'sanitation-station',
    isRequired: false,
    estimatedMinutes: 10,
    timeTarget: '19:25 PM',
    station: 'Behind-the-Bar Floors',
    order: 9
  },
  {
    id: 'chk-cl-10',
    shiftType: 'closing',
    title: 'Machine Eco Standby, Refrigerator Check & Arm Security',
    description: 'Set espresso machine to overnight Eco mode, double-check all fridge doors are sealed, lock rear delivery door, and arm alarm.',
    category: 'facility-security',
    isRequired: true,
    estimatedMinutes: 5,
    timeTarget: '19:30 PM',
    station: 'Facility & Alarm Panel',
    order: 10
  },

  // HANDOVER / MID-DAY SHIFT TASKS
  {
    id: 'chk-ho-1',
    shiftType: 'handover',
    title: 'Group Head Screen Purge & Clean Steam Wands',
    description: 'Flush 200ml through each group head with brush to remove coffee oils. Wipe and purge both steam wands.',
    category: 'espresso-grinder',
    isRequired: true,
    estimatedMinutes: 4,
    timeTarget: '13:00 PM',
    station: 'Main Espresso Bar',
    order: 1
  },
  {
    id: 'chk-ho-2',
    shiftType: 'handover',
    title: 'Mid-Day Espresso Extraction Calibration Check',
    description: 'Check extraction time on current grinder setting; adjust finer if afternoon ambient heat/humidity caused faster flow rates.',
    category: 'espresso-grinder',
    isRequired: true,
    estimatedMinutes: 6,
    timeTarget: '13:10 PM',
    station: 'Grinder Station',
    order: 2
  },
  {
    id: 'chk-ho-3',
    shiftType: 'handover',
    title: 'Restock Milk, Takeaway Cups & Syrups from Back Storage',
    description: 'Replenish oat milk, whole milk, takeaway cup sleeves (8oz & 12oz), lids, and napkins from dry storeroom.',
    category: 'milk-syrups',
    isRequired: false,
    estimatedMinutes: 8,
    timeTarget: '13:20 PM',
    station: 'Bar Stock & Cups',
    order: 3
  },
  {
    id: 'chk-ho-4',
    shiftType: 'handover',
    title: 'Mid-Shift POS Till Float Audit & Cash Drop',
    description: 'Perform mid-day cash audit with incoming shift lead, drop excess large bills to safe, and confirm till count matches.',
    category: 'pos-cash',
    isRequired: true,
    estimatedMinutes: 5,
    timeTarget: '13:30 PM',
    station: 'POS Cash Register',
    order: 4
  }
];

export const INITIAL_CHECKLIST_RECORDS: ShiftChecklistRecord[] = [
  // Today's opening checklist (partially completed to show live state!)
  {
    id: 'chk-opening-2026-09-23',
    date: '2026-09-23',
    shiftType: 'opening',
    executions: {
      'chk-op-1': {
        taskId: 'chk-op-1',
        completed: true,
        completedAt: '2026-09-23T06:14:22',
        completedBy: 'Samuel Kinyanjui',
        notes: 'Steam pressure at 1.65 bar, brew boiler holding steady at 93.5°C'
      },
      'chk-op-2': {
        taskId: 'chk-op-2',
        completed: true,
        completedAt: '2026-09-23T06:19:40',
        completedBy: 'Samuel Kinyanjui',
        notes: 'Water TDS tested at 68 ppm. Filter cartridge gauge at 3.5 bar.'
      },
      'chk-op-3': {
        taskId: 'chk-op-3',
        completed: true,
        completedAt: '2026-09-23T06:24:15',
        completedBy: 'Brenda Wanjiru',
        notes: 'Loaded Ngong Peak House (Roast date 2026-09-17, 6d rest).'
      },
      'chk-op-4': {
        taskId: 'chk-op-4',
        completed: true,
        completedAt: '2026-09-23T06:33:50',
        completedBy: 'Samuel Kinyanjui',
        notes: 'Dialed in at 18.5g -> 38.2g in 28.1s. TDS: 9.6%, EY: 19.8% (Sweet-spot).'
      },
      'chk-op-5': {
        taskId: 'chk-op-5',
        completed: true,
        completedAt: '2026-09-23T06:39:10',
        completedBy: 'Brenda Wanjiru',
        notes: 'Fridge temperature at 3.2°C. 12L whole milk & 6L Oatly restocked.'
      },
      'chk-op-6': {
        taskId: 'chk-op-6',
        completed: true,
        completedAt: '2026-09-23T06:44:05',
        completedBy: 'Brenda Wanjiru',
        notes: 'Opening float counted: KSh 10,000 exact. Safaricom till operational.'
      },
      'chk-op-7': {
        taskId: 'chk-op-7',
        completed: true,
        completedAt: '2026-09-23T06:48:30',
        completedBy: 'Kevin Mwangi',
        notes: 'Counters sanitized, 4 steam towels soaked in sanitizing bucket.'
      }
    },
    isSignedOff: false,
    managerNotes: 'Morning peak expected at 08:00 AM; Brenda on main bar, Kevin on milk steaming.'
  },
  // Yesterday's closing checklist (fully signed off)
  {
    id: 'chk-closing-2026-09-22',
    date: '2026-09-22',
    shiftType: 'closing',
    executions: {
      'chk-cl-1': {
        taskId: 'chk-cl-1',
        completed: true,
        completedAt: '2026-09-22T18:18:02',
        completedBy: 'Samuel Kinyanjui',
        notes: 'Backflushed with Cafiza powder, all 3 group heads clean.'
      },
      'chk-cl-2': {
        taskId: 'chk-cl-2',
        completed: true,
        completedAt: '2026-09-22T18:24:45',
        completedBy: 'Brenda Wanjiru',
        notes: 'Steam wands soaked in Rinza for 15 mins, flushed clear.'
      },
      'chk-cl-3': {
        taskId: 'chk-cl-3',
        completed: true,
        completedAt: '2026-09-22T18:32:10',
        completedBy: 'Brenda Wanjiru',
        notes: 'Hoppers emptied into airtight containers. Chutes vacuumed.'
      },
      'chk-cl-4': {
        taskId: 'chk-cl-4',
        completed: true,
        completedAt: '2026-09-22T18:40:00',
        completedBy: 'Kevin Mwangi',
        notes: 'Portafilters and shower screens left in soaking tub.'
      },
      'chk-cl-5': {
        taskId: 'chk-cl-5',
        completed: true,
        completedAt: '2026-09-22T18:49:15',
        completedBy: 'Kevin Mwangi',
        notes: 'Drip tray scrubbed, flushed with 3L hot water.'
      },
      'chk-cl-6': {
        taskId: 'chk-cl-6',
        completed: true,
        completedAt: '2026-09-22T18:54:20',
        completedBy: 'Brenda Wanjiru',
        notes: 'Knockboxes scrubbed, rinsers disinfected.'
      },
      'chk-cl-7': {
        taskId: 'chk-cl-7',
        completed: true,
        completedAt: '2026-09-22T19:03:10',
        completedBy: 'Samuel Kinyanjui',
        notes: 'Logged 1 opened whole milk discarded. Remaining stock verified.'
      },
      'chk-cl-8': {
        taskId: 'chk-cl-8',
        completed: true,
        completedAt: '2026-09-22T19:14:40',
        completedBy: 'Samuel Kinyanjui',
        notes: 'Z-Report printed. Day revenue KSh 74,500. Cash float secured in safe.'
      },
      'chk-cl-9': {
        taskId: 'chk-cl-9',
        completed: true,
        completedAt: '2026-09-22T19:23:05',
        completedBy: 'Kevin Mwangi',
        notes: 'Floors mopped with sanitizing wash, trash taken out.'
      },
      'chk-cl-10': {
        taskId: 'chk-cl-10',
        completed: true,
        completedAt: '2026-09-22T19:31:00',
        completedBy: 'Samuel Kinyanjui',
        notes: 'Machine in eco mode, back door locked, alarm active.'
      }
    },
    isSignedOff: true,
    signedOffAt: '2026-09-22T19:32:45',
    signedOffBy: 'Samuel Kinyanjui (Head Barista)',
    managerNotes: 'Smooth closing, no equipment defects noted. Prepped for morning shift.'
  }
];
