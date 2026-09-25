export type TabType = 
  | 'qc-dialin'
  | 'recipes'
  | 'training'
  | 'exams'
  | 'equipment'
  | 'inventory'
  | 'checklists'
  | 'staff'
  | 'productivity'
  | 'subscription';

export interface EspressoRecipe {
  id: string;
  name: string;
  beanOrigin: string;
  region: string;
  elevation: string;
  process: 'Washed' | 'Natural' | 'Honey' | 'Anaerobic';
  variety: string;
  roastDate: string;
  roaster: string;
  recommendedDose: number; // in grams e.g. 18.5
  targetYield: number; // in grams e.g. 38.0
  targetTimeSeconds: number; // e.g. 28
  tempCelsius: number; // e.g. 93.5
  grindSetting: string; // e.g. "Mahlkönig EK43S: 2.4"
  brewRatio: string; // e.g. "1:2.05"
  waterProfile: string; // e.g. "BWT Bestmax 70ppm, 3° dKH"
  tastingNotes: string[];
  recommendedDrinks: string[];
  isHouseDefault?: boolean;
  syncStatus?: 'synced' | 'pending';
}

export interface DialInLog {
  id: string;
  timestamp: string;
  recipeId: string;
  recipeName: string;
  baristaName: string;
  doseIn: number; // grams
  yieldOut: number; // grams
  timeSeconds: number; // extraction time
  grindSetting: string;
  brewTemp: number; // celsius
  pressureBar: number; // bar, e.g. 9.0
  tdsPercent: number; // e.g. 9.6%
  extractionYieldPercent: number; // EY % = (yieldOut * tdsPercent) / doseIn
  status: 'under-extracted' | 'sweet-spot' | 'over-extracted' | 'channeling';
  sensoryScores: {
    acidity: number; // 1-5
    sweetness: number; // 1-5
    body: number; // 1-5
    balance: number; // 1-5
    cleanliness: number; // 1-5
    overallScore: number; // 1-100
  };
  tastingNotes: string;
  adjustmentsMade: string;
  approvedForShift: boolean;
  syncStatus?: 'synced' | 'pending';
}

export interface ShotTimerSession {
  id: string;
  timestamp: string;
  recipeId?: string;
  recipeName?: string;
  baristaName?: string;
  totalTimeSeconds: number;
  preInfusionSeconds: number;
  yieldGrams: number;
  flowRateGramsPerSec: number;
  targetTimeSeconds: number;
  targetYieldGrams: number;
  timeVarianceSeconds: number;
  yieldVarianceGrams: number;
  exportedToQC: boolean;
  syncStatus: 'synced' | 'pending';
  notes?: string;
}

export interface OfflineSyncItem {
  id: string;
  entityType: 'dial-in' | 'recipe' | 'timer-session';
  action: 'create' | 'update' | 'delete';
  payload: any;
  timestamp: string;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  error?: string;
}

export interface OfflineStorageStats {
  dialInCount: number;
  recipeCount: number;
  timerSessionCount: number;
  pendingSyncCount: number;
  lastSyncTimestamp: string | null;
  dbSizeBytes?: number;
}

export interface TrainingLesson {
  id: string;
  title: string;
  durationMinutes: number;
  content: string;
  keyTakeaways: string[];
  proTips: string[];
  checkpointQuestion: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  };
}

export interface TrainingModule {
  id: string;
  title: string;
  code: string;
  level: 'Foundation' | 'Intermediate' | 'Advanced' | 'Master';
  category: 'Espresso Science' | 'Milk & Latte Art' | 'Sensory & Cupping' | 'Water Chemistry' | 'Workflow & Bar Speed';
  summary: string;
  lessons: TrainingLesson[];
  completedBaristaIds: string[];
  badgeName: string;
}

export interface ExamQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic: string;
}

export interface BaristaExam {
  id: string;
  title: string;
  tier: 'Level 1: Certified Junior Barista' | 'Level 2: Senior Barista & Dial-In Master' | 'Level 3: Head Barista & Sensory Specialist';
  timeLimitMinutes: number;
  passingScorePercent: number;
  description: string;
  questions: ExamQuestion[];
}

export interface ExamCertificate {
  id: string;
  examId: string;
  examTitle: string;
  baristaName: string;
  scorePercent: number;
  dateAwarded: string;
  credentialCode: string;
  certificateGrade: 'Pass with Distinction' | 'Certified Professional' | 'Pass';
}

export interface EquipmentItem {
  id: string;
  name: string;
  category: 'Espresso Machine' | 'Grinder' | 'Water Filtration' | 'Water Boiler' | 'Refractometer';
  model: string;
  serialNumber: string;
  station: string;
  status: 'operational' | 'maintenance-due' | 'critical-service' | 'calibrating';
  burrHoursOrThroughputKg?: {
    currentKg: number;
    maxKg: number;
  };
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  maintenanceSchedule: string;
  dailyChecklist: Array<{ task: string; completed: boolean; requiredTime: string }>;
  serviceLogs: Array<{ date: string; technician: string; notes: string; costKSh: number }>;
}

export interface ServiceAlert {
  id: string;
  equipmentId: string;
  equipmentName: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  detail: string;
  timestamp: string;
  actionRequired: string;
  resolved: boolean;
}

export interface StockItem {
  id: string;
  name: string;
  category: 'Roasted Coffee' | 'Dairy & Plant Milk' | 'Packaging & Cups' | 'Syrups & Ingredients' | 'Machine Chemicals';
  currentStock: number;
  unit: string;
  minThreshold: number;
  costPerUnitKSh: number;
  supplier: string;
  supplierPhone: string;
  lastRestocked: string;
  dailyBurnRate: number;
  sku?: string;
  qrCode?: string;
  packageType?: string;
  barcodeNumber?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: 'Head Barista' | 'Senior Barista' | 'Barista' | 'Barista Apprentice';
  email: string;
  phone: string;
  avatarUrl?: string;
  status: 'on-shift' | 'off-duty' | 'break';
  dialInStreakDays: number;
  totalShotsLogged: number;
  examCertifications: string[];
  averageExtractionScore: number;
  shiftHoursLogged: number;
}

export interface CafeBranch {
  id: string;
  name: string;
  location: string;
  manager: string;
  licenseTier: 'Barista Starter' | 'Specialty Pro' | 'Café Chain Enterprise';
  licenseStatus: 'Active' | 'Trial' | 'Expiring Soon';
  licenseExpiry: string;
  licenseKey: string;
}

export interface SubscriptionTier {
  id: string;
  name: string;
  priceMonthlyKSh: number;
  priceAnnualMonthlyKSh: number;
  description: string;
  audience: string;
  caféLicensesCount: string;
  baristasAllowed: string;
  features: string[];
  highlighted: boolean;
}

export type ShiftType = 'opening' | 'closing' | 'handover';

export type TaskCategory = 
  | 'espresso-grinder'
  | 'water-filtration'
  | 'milk-syrups'
  | 'pos-cash'
  | 'sanitation-station'
  | 'facility-security';

export interface ChecklistTaskDefinition {
  id: string;
  shiftType: ShiftType;
  title: string;
  description: string;
  category: TaskCategory;
  isRequired: boolean; // Critical protocol required for shift sign-off validation
  estimatedMinutes: number;
  timeTarget?: string; // e.g. "06:30 AM" or "Within 45m of close"
  station: string; // e.g. "Main Espresso Bar", "Grinder Station", "POS Till"
  isCustom?: boolean; // Manager-defined custom task
  isActive?: boolean;
  order: number;
  createdAt?: string;
}

export interface ChecklistTaskExecution {
  taskId: string;
  completed: boolean;
  completedAt?: string; // ISO timestamp
  completedBy?: string; // Staff member name
  notes?: string;
  verifiedByManager?: boolean;
}

export interface ShiftChecklistRecord {
  id: string; // e.g. "chk-opening-2026-09-23"
  date: string; // YYYY-MM-DD
  shiftType: ShiftType;
  executions: Record<string, ChecklistTaskExecution>; // taskId -> execution
  isSignedOff: boolean;
  signedOffAt?: string;
  signedOffBy?: string;
  managerNotes?: string;
  weatherOrOperationalNotes?: string;
}

// Barista KPI & Performance Scorecard System
export type KpiPillarType = 
  | 'trainings' 
  | 'exams' 
  | 'sales-productivity' 
  | 'daily-qc' 
  | 'shift-checklists';

export type KpiGradeTier = 
  | 'Master Specialist' 
  | 'Senior Professional' 
  | 'Proficient Practitioner' 
  | 'Developing Apprentice';

export interface KpiPillarScore {
  pillar: KpiPillarType;
  title: string;
  score: number; // 0-100
  weight: number; // e.g. 0.20 for 20%
  weightedScore: number;
  benchmarkTarget: number; // e.g. 85
  status: 'exceptional' | 'on-target' | 'needs-attention';
  primaryMetric: {
    label: string;
    value: string | number;
    sublabel?: string;
  };
  metrics: Array<{
    label: string;
    value: string | number;
    unit?: string;
    rating?: 'good' | 'neutral' | 'warning';
  }>;
  highlights: string[];
  growthTips: string[];
}

export interface BaristaKPIReport {
  baristaId: string;
  baristaName: string;
  baristaRole: string;
  timeframe: 'today' | 'week' | 'month' | 'quarter' | 'all-time';
  generatedDate: string;
  overallScore: number; // 0-100 weighted
  gradeTier: KpiGradeTier;
  teamRank: number;
  totalTeamMembers: number;
  trendVsPrevious: number; // e.g. +2.8%
  pillars: {
    trainings: KpiPillarScore;
    exams: KpiPillarScore;
    salesProductivity: KpiPillarScore;
    dailyQc: KpiPillarScore;
    shiftChecklists: KpiPillarScore;
  };
  strengths: string[];
  areasForImprovement: string[];
  managerCoachingNotes?: string;
}

// Shot Recipe Deviation Alerts System
export type DeviationSeverity = 'critical' | 'warning' | 'optimal';
export type DeviationType = 'time-fast' | 'time-slow' | 'yield-high' | 'yield-low' | 'compound' | 'optimal';

export interface ShotDeviationAlert {
  id: string;
  timestamp: string;
  recipeId: string;
  recipeName: string;
  baristaName: string;
  actualTimeSeconds: number;
  targetTimeSeconds: number;
  timeDeltaSeconds: number; // actual - target
  actualYieldGrams: number;
  targetYieldGrams: number;
  yieldDeltaGrams: number; // actual - target
  doseIn: number;
  severity: DeviationSeverity;
  deviationType: DeviationType;
  title: string;
  description: string;
  suggestedAction: string;
  isAcknowledged: boolean;
  isDismissed: boolean;
  source: 'dial-in' | 'shot-timer' | 'manual-test';
}

export interface DeviationToleranceSettings {
  mode: 'strict' | 'standard' | 'lenient';
  label: string;
  timeToleranceWarning: number; // e.g. 2.5s
  timeToleranceCritical: number; // e.g. 4.0s
  yieldToleranceWarning: number; // e.g. 2.0g
  yieldToleranceCritical: number; // e.g. 3.5g
}

