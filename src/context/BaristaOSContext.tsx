import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  TabType, 
  EspressoRecipe, 
  DialInLog, 
  TrainingModule, 
  BaristaExam, 
  ExamCertificate, 
  EquipmentItem, 
  ServiceAlert, 
  StockItem, 
  StaffMember, 
  CafeBranch, 
  SubscriptionTier,
  ShotTimerSession,
  OfflineSyncItem,
  OfflineStorageStats,
  ChecklistTaskDefinition,
  ShiftChecklistRecord,
  ShiftType,
  ShotDeviationAlert,
  DeviationToleranceSettings
} from '../types';
import { 
  TOLERANCE_PRESETS,
  analyzeShotDeviation,
  playDeviationAlertAudio
} from '../utils/deviationAnalyzer';
import { 
  INITIAL_BRANCHES, 
  INITIAL_RECIPES, 
  INITIAL_DIAL_IN_LOGS, 
  INITIAL_TRAINING_MODULES, 
  INITIAL_EXAMS, 
  INITIAL_EQUIPMENT, 
  INITIAL_SERVICE_ALERTS, 
  INITIAL_STOCK, 
  INITIAL_STAFF, 
  SUBSCRIPTION_TIERS,
  INITIAL_CHECKLIST_TASKS,
  INITIAL_CHECKLIST_RECORDS
} from '../data/initialData';
import { 
  getOfflineDB,
  idbGetAllDialInLogs,
  idbSaveDialInLog,
  idbBulkSaveDialInLogs,
  idbGetAllRecipes,
  idbSaveRecipe,
  idbBulkSaveRecipes,
  idbSaveTimerSession,
  idbGetAllTimerSessions,
  idbGetPendingSyncQueue,
  idbProcessSyncQueue,
  idbGetStorageStats,
  idbSetSystemState
} from '../services/offlineDB';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface BaristaOSContextType {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  activeBranch: CafeBranch;
  branches: CafeBranch[];
  setActiveBranch: (branch: CafeBranch) => void;
  activeBarista: StaffMember;
  staffList: StaffMember[];
  setActiveBarista: (staff: StaffMember) => void;
  recipes: EspressoRecipe[];
  addRecipe: (recipe: Omit<EspressoRecipe, 'id'>) => void;
  updateRecipe: (recipe: EspressoRecipe) => void;
  deleteRecipe: (id: string) => void;
  dialInLogs: DialInLog[];
  addDialInLog: (log: Omit<DialInLog, 'id' | 'timestamp' | 'extractionYieldPercent'>) => DialInLog;
  trainingModules: TrainingModule[];
  markLessonComplete: (moduleId: string, baristaId: string) => void;
  exams: BaristaExam[];
  certificates: ExamCertificate[];
  submitExamAttempt: (examId: string, answers: Record<string, number>, baristaName: string) => { scorePercent: number; passed: boolean; certificate?: ExamCertificate };
  equipment: EquipmentItem[];
  toggleDailyChecklistTask: (equipmentId: string, taskIndex: number) => void;
  logEquipmentService: (equipmentId: string, log: { notes: string; technician: string; costKSh: number }) => void;
  serviceAlerts: ServiceAlert[];
  resolveAlert: (alertId: string) => void;
  dismissAlert: (alertId: string) => void;
  stock: StockItem[];
  updateStockQuantity: (stockId: string, newStock: number) => void;
  restockItem: (stockId: string, addQuantity: number, totalCostKSh: number) => void;
  updateStaffStatus: (staffId: string, status: 'on-shift' | 'off-duty' | 'break') => void;
  subscriptionTiers: SubscriptionTier[];
  currentTier: SubscriptionTier;
  billingCycle: 'monthly' | 'annual';
  setBillingCycle: (cycle: 'monthly' | 'annual') => void;
  upgradeSubscription: (tierId: string, paymentMethod: 'mpesa' | 'card', phoneOrCard: string) => void;
  showSubscriptionModal: boolean;
  setShowSubscriptionModal: (show: boolean) => void;
  quickShotTimerOpen: boolean;
  setQuickShotTimerOpen: (open: boolean) => void;

  // Daily Opening/Closing Checklists
  checklistTasks: ChecklistTaskDefinition[];
  checklistRecords: ShiftChecklistRecord[];
  addCustomChecklistTask: (task: Omit<ChecklistTaskDefinition, 'id' | 'order' | 'createdAt'>) => void;
  updateChecklistTask: (task: ChecklistTaskDefinition) => void;
  deleteChecklistTask: (taskId: string) => void;
  toggleChecklistTaskExecution: (taskId: string, shiftDate: string, shiftType: ShiftType, baristaName?: string, notes?: string) => void;
  updateChecklistTaskNotes: (taskId: string, shiftDate: string, shiftType: ShiftType, notes: string) => void;
  signOffShiftChecklist: (shiftDate: string, shiftType: ShiftType, supervisorName: string, managerNotes?: string) => { success: boolean; error?: string };
  resetShiftChecklist: (shiftDate: string, shiftType: ShiftType) => void;
  restoreDefaultChecklistTasks: () => void;

  // Shot Recipe Deviation Alerts System
  deviationAlerts: ShotDeviationAlert[];
  tolerancePreset: DeviationToleranceSettings;
  setTolerancePreset: (preset: DeviationToleranceSettings) => void;
  addDeviationAlert: (alert: ShotDeviationAlert) => void;
  acknowledgeDeviationAlert: (alertId: string) => void;
  dismissDeviationAlert: (alertId: string) => void;
  clearAllDeviationAlerts: () => void;
  soundAlertsEnabled: boolean;
  setSoundAlertsEnabled: (enabled: boolean) => void;

  // Offline & IndexedDB state
  isOnline: boolean;
  browserOnline: boolean;
  simulatedOffline: boolean;
  toggleSimulatedOffline: () => void;
  pendingSyncQueue: OfflineSyncItem[];
  storageStats: OfflineStorageStats | null;
  isSyncing: boolean;
  syncOfflineQueue: () => Promise<{ syncedCount: number; errors: number }>;
  refreshOfflineStats: () => Promise<void>;
  showOfflineSyncModal: boolean;
  setShowOfflineSyncModal: (show: boolean) => void;
  saveShotTimerRun: (sessionData: {
    recipeId?: string;
    recipeName?: string;
    totalTimeSeconds: number;
    preInfusionSeconds: number;
    yieldGrams: number;
    flowRateGramsPerSec: number;
    targetTimeSeconds: number;
    targetYieldGrams: number;
    notes?: string;
  }) => Promise<ShotTimerSession>;
  timerSessions: ShotTimerSession[];
}

const BaristaOSContext = createContext<BaristaOSContextType | undefined>(undefined);

export const BaristaOSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<TabType>('qc-dialin');
  
  // Online / Offline connectivity hook
  const { isOnline, browserOnline, simulatedOffline, toggleSimulatedOffline } = useOnlineStatus();
  const [pendingSyncQueue, setPendingSyncQueue] = useState<OfflineSyncItem[]>([]);
  const [storageStats, setStorageStats] = useState<OfflineStorageStats | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [showOfflineSyncModal, setShowOfflineSyncModal] = useState<boolean>(false);
  const [timerSessions, setTimerSessions] = useState<ShotTimerSession[]>([]);

  // Branches
  const [branches, setBranches] = useState<CafeBranch[]>(() => {
    const saved = localStorage.getItem('barista_os_branches');
    return saved ? JSON.parse(saved) : INITIAL_BRANCHES;
  });
  const [activeBranch, setActiveBranch] = useState<CafeBranch>(branches[0]);

  // Staff
  const [staffList, setStaffList] = useState<StaffMember[]>(() => {
    const saved = localStorage.getItem('barista_os_staff');
    return saved ? JSON.parse(saved) : INITIAL_STAFF;
  });
  const [activeBarista, setActiveBarista] = useState<StaffMember>(staffList[0]);

  // Recipes
  const [recipes, setRecipes] = useState<EspressoRecipe[]>(() => {
    const saved = localStorage.getItem('barista_os_recipes');
    return saved ? JSON.parse(saved) : INITIAL_RECIPES;
  });

  // Dial-in logs
  const [dialInLogs, setDialInLogs] = useState<DialInLog[]>(() => {
    const saved = localStorage.getItem('barista_os_dialin');
    return saved ? JSON.parse(saved) : INITIAL_DIAL_IN_LOGS;
  });

  // Training
  const [trainingModules, setTrainingModules] = useState<TrainingModule[]>(() => {
    const saved = localStorage.getItem('barista_os_training');
    return saved ? JSON.parse(saved) : INITIAL_TRAINING_MODULES;
  });

  // Exams & Certificates
  const [exams] = useState<BaristaExam[]>(INITIAL_EXAMS);
  const [certificates, setCertificates] = useState<ExamCertificate[]>(() => {
    const saved = localStorage.getItem('barista_os_certificates');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'cert-101',
        examId: 'exam-level-1',
        examTitle: 'Level 1: Certified Junior Barista',
        baristaName: 'Samuel Kinyanjui',
        scorePercent: 100,
        dateAwarded: '2026-08-10',
        credentialCode: 'BOS-CERT-LVL1-8841',
        certificateGrade: 'Pass with Distinction'
      },
      {
        id: 'cert-102',
        examId: 'exam-level-2',
        examTitle: 'Level 2: Senior Barista & Dial-In Master',
        baristaName: 'Samuel Kinyanjui',
        scorePercent: 96,
        dateAwarded: '2026-09-02',
        credentialCode: 'BOS-CERT-LVL2-9932',
        certificateGrade: 'Pass with Distinction'
      }
    ];
  });

  // Equipment & Alerts
  const [equipment, setEquipment] = useState<EquipmentItem[]>(() => {
    const saved = localStorage.getItem('barista_os_equipment');
    return saved ? JSON.parse(saved) : INITIAL_EQUIPMENT;
  });

  const [serviceAlerts, setServiceAlerts] = useState<ServiceAlert[]>(() => {
    const saved = localStorage.getItem('barista_os_alerts');
    return saved ? JSON.parse(saved) : INITIAL_SERVICE_ALERTS;
  });

  // Stock
  const [stock, setStock] = useState<StockItem[]>(() => {
    const saved = localStorage.getItem('barista_os_stock');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((p: any) => p.id));
          const missing = INITIAL_STOCK.filter(s => !existingIds.has(s.id));
          // Also enrich any existing items with new qrCode/sku/packageType if missing
          const enriched = parsed.map((item: any) => {
            const initial = INITIAL_STOCK.find(s => s.id === item.id);
            if (initial) {
              return {
                ...initial,
                ...item,
                qrCode: item.qrCode || initial.qrCode,
                sku: item.sku || initial.sku,
                packageType: item.packageType || initial.packageType,
                barcodeNumber: item.barcodeNumber || initial.barcodeNumber
              };
            }
            return item;
          });
          return [...enriched, ...missing];
        }
      } catch (err) {
        console.error('Error parsing saved stock:', err);
      }
    }
    return INITIAL_STOCK;
  });

  // Daily Opening/Closing Checklists State
  const [checklistTasks, setChecklistTasks] = useState<ChecklistTaskDefinition[]>(() => {
    try {
      const saved = localStorage.getItem('barista_os_checklist_tasks');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error reading saved checklist tasks:', e);
    }
    return INITIAL_CHECKLIST_TASKS;
  });

  const [checklistRecords, setChecklistRecords] = useState<ShiftChecklistRecord[]>(() => {
    try {
      const saved = localStorage.getItem('barista_os_checklist_records');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error reading saved checklist records:', e);
    }
    return INITIAL_CHECKLIST_RECORDS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('barista_os_checklist_tasks', JSON.stringify(checklistTasks));
    } catch (e) {
      console.error('Error saving checklist tasks:', e);
    }
  }, [checklistTasks]);

  useEffect(() => {
    try {
      localStorage.setItem('barista_os_checklist_records', JSON.stringify(checklistRecords));
    } catch (e) {
      console.error('Error saving checklist records:', e);
    }
  }, [checklistRecords]);

  const addCustomChecklistTask = (task: Omit<ChecklistTaskDefinition, 'id' | 'order' | 'createdAt'>) => {
    const id = `custom-task-${Date.now()}`;
    const highestOrder = checklistTasks
      .filter(t => t.shiftType === task.shiftType)
      .reduce((max, t) => Math.max(max, t.order || 0), 0);

    const newTask: ChecklistTaskDefinition = {
      ...task,
      id,
      order: highestOrder + 1,
      isCustom: true,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    setChecklistTasks(prev => [...prev, newTask]);
  };

  const updateChecklistTask = (updatedTask: ChecklistTaskDefinition) => {
    setChecklistTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const deleteChecklistTask = (taskId: string) => {
    setChecklistTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const restoreDefaultChecklistTasks = () => {
    setChecklistTasks(INITIAL_CHECKLIST_TASKS);
  };

  const toggleChecklistTaskExecution = (
    taskId: string, 
    shiftDate: string, 
    shiftType: ShiftType, 
    baristaName?: string, 
    notes?: string
  ) => {
    setChecklistRecords(prev => {
      const recordId = `chk-${shiftType}-${shiftDate}`;
      const existingRecordIndex = prev.findIndex(r => r.date === shiftDate && r.shiftType === shiftType);
      
      const record: ShiftChecklistRecord = existingRecordIndex >= 0 
        ? { ...prev[existingRecordIndex], executions: { ...prev[existingRecordIndex].executions } }
        : {
            id: recordId,
            date: shiftDate,
            shiftType,
            executions: {},
            isSignedOff: false
          };

      const currentExecution = record.executions[taskId];
      const isCurrentlyCompleted = currentExecution?.completed;

      if (isCurrentlyCompleted) {
        // Toggle OFF
        record.executions[taskId] = {
          taskId,
          completed: false,
          completedAt: undefined,
          completedBy: undefined,
          notes: currentExecution.notes
        };
        // If it was signed off, invalidate sign-off since critical task changed
        if (record.isSignedOff) {
          record.isSignedOff = false;
          record.signedOffAt = undefined;
          record.signedOffBy = undefined;
        }
      } else {
        // Toggle ON with exact timestamp
        const nowIso = new Date().toISOString();
        record.executions[taskId] = {
          taskId,
          completed: true,
          completedAt: nowIso,
          completedBy: baristaName || activeBarista.name,
          notes: notes !== undefined ? notes : (currentExecution?.notes || '')
        };
      }

      if (existingRecordIndex >= 0) {
        const updated = [...prev];
        updated[existingRecordIndex] = record;
        return updated;
      } else {
        return [record, ...prev];
      }
    });
  };

  const updateChecklistTaskNotes = (
    taskId: string, 
    shiftDate: string, 
    shiftType: ShiftType, 
    notes: string
  ) => {
    setChecklistRecords(prev => {
      const recordId = `chk-${shiftType}-${shiftDate}`;
      const existingRecordIndex = prev.findIndex(r => r.date === shiftDate && r.shiftType === shiftType);

      const record: ShiftChecklistRecord = existingRecordIndex >= 0 
        ? { ...prev[existingRecordIndex], executions: { ...prev[existingRecordIndex].executions } }
        : {
            id: recordId,
            date: shiftDate,
            shiftType,
            executions: {},
            isSignedOff: false
          };

      const curr = record.executions[taskId] || { taskId, completed: false };
      record.executions[taskId] = {
        ...curr,
        notes
      };

      if (existingRecordIndex >= 0) {
        const updated = [...prev];
        updated[existingRecordIndex] = record;
        return updated;
      } else {
        return [record, ...prev];
      }
    });
  };

  const signOffShiftChecklist = (
    shiftDate: string, 
    shiftType: ShiftType, 
    supervisorName: string, 
    managerNotes?: string
  ): { success: boolean; error?: string } => {
    // 1. Check all required tasks for this shiftType
    const requiredTasks = checklistTasks.filter(t => t.shiftType === shiftType && t.isRequired && t.isActive !== false);
    
    // Find record
    const record = checklistRecords.find(r => r.date === shiftDate && r.shiftType === shiftType);
    const executions = record?.executions || {};

    const missingRequired = requiredTasks.filter(t => !executions[t.id]?.completed);
    if (missingRequired.length > 0) {
      return {
        success: false,
        error: `Cannot sign off shift: ${missingRequired.length} required critical task${missingRequired.length > 1 ? 's are' : ' is'} incomplete (${missingRequired.map(m => m.title).slice(0, 2).join(', ')}${missingRequired.length > 2 ? '...' : ''}). All required protocols must be validated.`
      };
    }

    const nowIso = new Date().toISOString();
    setChecklistRecords(prev => {
      const recordId = `chk-${shiftType}-${shiftDate}`;
      const existingRecordIndex = prev.findIndex(r => r.date === shiftDate && r.shiftType === shiftType);

      const updatedRecord: ShiftChecklistRecord = existingRecordIndex >= 0
        ? {
            ...prev[existingRecordIndex],
            isSignedOff: true,
            signedOffAt: nowIso,
            signedOffBy: supervisorName,
            managerNotes: managerNotes || prev[existingRecordIndex].managerNotes || ''
          }
        : {
            id: recordId,
            date: shiftDate,
            shiftType,
            executions: {},
            isSignedOff: true,
            signedOffAt: nowIso,
            signedOffBy: supervisorName,
            managerNotes: managerNotes || ''
          };

      if (existingRecordIndex >= 0) {
        const copy = [...prev];
        copy[existingRecordIndex] = updatedRecord;
        return copy;
      } else {
        return [updatedRecord, ...prev];
      }
    });

    return { success: true };
  };

  const resetShiftChecklist = (shiftDate: string, shiftType: ShiftType) => {
    setChecklistRecords(prev => prev.filter(r => !(r.date === shiftDate && r.shiftType === shiftType)));
  };

  // Subscriptions
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>(SUBSCRIPTION_TIERS[1]); // Specialty Pro (3,200 KSh)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState<boolean>(false);
  const [quickShotTimerOpen, setQuickShotTimerOpen] = useState<boolean>(false);

  // Shot Recipe Deviation Alerts System
  const [tolerancePreset, setTolerancePreset] = useState<DeviationToleranceSettings>(TOLERANCE_PRESETS.standard);
  const [soundAlertsEnabled, setSoundAlertsEnabled] = useState<boolean>(true);
  const [deviationAlerts, setDeviationAlerts] = useState<ShotDeviationAlert[]>(() => {
    try {
      const saved = localStorage.getItem('barista_os_deviation_alerts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error reading saved deviation alerts:', e);
    }
    return [
      {
        id: 'dev-init-1',
        timestamp: '07:15:30 AM',
        recipeId: 'rec-1',
        recipeName: 'Kenya Ngong Peak SL28/SL34',
        baristaName: 'Amina Mwangi',
        actualTimeSeconds: 22.0,
        targetTimeSeconds: 27.0,
        timeDeltaSeconds: -5.0,
        actualYieldGrams: 38.0,
        targetYieldGrams: 38.0,
        yieldDeltaGrams: 0.0,
        doseIn: 18.5,
        severity: 'critical',
        deviationType: 'time-fast',
        title: 'Severe Under-Extraction Risk: Shot Ran 5.0s Too Fast',
        description: 'Water surged through coffee bed in 22.0s (Target: 27.0s). Flow was excessively fast (1.72 g/s vs 1.40 g/s). Cup will present astringent, sour, and thin body.',
        suggestedAction: 'Grind size is too coarse or micro-channeling occurred. Recommended: Adjust Mythos II grinder 1.0 to 1.5 notches FINER and perform needle WDT distribution.',
        isAcknowledged: false,
        isDismissed: false,
        source: 'dial-in'
      },
      {
        id: 'dev-init-2',
        timestamp: '08:42:15 AM',
        recipeId: 'rec-3',
        recipeName: 'Nyeri Hill Farm Peaberry',
        baristaName: 'Samuel Kinyanjui',
        actualTimeSeconds: 29.0,
        targetTimeSeconds: 26.0,
        timeDeltaSeconds: +3.0,
        actualYieldGrams: 45.0,
        targetYieldGrams: 38.0,
        yieldDeltaGrams: +7.0,
        doseIn: 19.0,
        severity: 'critical',
        deviationType: 'yield-high',
        title: 'High Yield Dilution Alert (+7.0g Over Target)',
        description: 'Cup yield reached 45.0g (Target: 38.0g). Brew ratio extended to 1:2.37. Beverage body is washed out.',
        suggestedAction: 'Volumetric flowmeter cutoff or scale auto-stop delayed. Recalibrate grouphead volumetric dose button or stop shot manually at 38g.',
        isAcknowledged: false,
        isDismissed: false,
        source: 'dial-in'
      },
      {
        id: 'dev-init-3',
        timestamp: '09:20:00 AM',
        recipeId: 'rec-2',
        recipeName: 'Kirinyaga Gakuyu-ini Washed',
        baristaName: 'David Ochieng',
        actualTimeSeconds: 34.0,
        targetTimeSeconds: 28.0,
        timeDeltaSeconds: +6.0,
        actualYieldGrams: 32.0,
        targetYieldGrams: 36.0,
        yieldDeltaGrams: -4.0,
        doseIn: 18.0,
        severity: 'critical',
        deviationType: 'compound',
        title: 'Critical Dial-In Drift: Choked Time (+6.0s) & Restricted Yield (-4.0g)',
        description: 'Actual: 34.0s / 32.0g vs Target: 28.0s / 36.0g. Bitter polyphenols and harsh finish from restricted contact.',
        suggestedAction: 'Adjust grinder 1.5 notches COARSER, reduce tamp compression, and wipe shower screen.',
        isAcknowledged: false,
        isDismissed: false,
        source: 'dial-in'
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('barista_os_deviation_alerts', JSON.stringify(deviationAlerts));
    } catch (e) {
      console.error('Error saving deviation alerts:', e);
    }
  }, [deviationAlerts]);

  const addDeviationAlert = useCallback((alert: ShotDeviationAlert) => {
    setDeviationAlerts(prev => [alert, ...prev.filter(a => a.id !== alert.id)]);
    if (soundAlertsEnabled && alert.severity !== 'optimal') {
      playDeviationAlertAudio(alert.severity);
    }
  }, [soundAlertsEnabled]);

  const acknowledgeDeviationAlert = (alertId: string) => {
    setDeviationAlerts(prev => prev.map(a => a.id === alertId ? { ...a, isAcknowledged: true } : a));
  };

  const dismissDeviationAlert = (alertId: string) => {
    setDeviationAlerts(prev => prev.map(a => a.id === alertId ? { ...a, isDismissed: true } : a));
  };

  const clearAllDeviationAlerts = () => {
    setDeviationAlerts(prev => prev.filter(a => !a.isAcknowledged && !a.isDismissed));
  };

  // Refresh offline stats from IndexedDB
  const refreshOfflineStats = useCallback(async () => {
    try {
      const [stats, queue, sessions] = await Promise.all([
        idbGetStorageStats(),
        idbGetPendingSyncQueue(),
        idbGetAllTimerSessions()
      ]);
      setStorageStats(stats);
      setPendingSyncQueue(queue);
      setTimerSessions(sessions);
    } catch (err) {
      console.warn('[BaristaOS IndexedDB] Could not refresh offline stats:', err);
    }
  }, []);

  // Initialize IndexedDB on startup & hydrate / seed
  useEffect(() => {
    let isMounted = true;

    async function initDB() {
      try {
        await getOfflineDB();
        
        // 1. Dial-in logs
        const idbLogs = await idbGetAllDialInLogs();
        if (idbLogs && idbLogs.length > 0) {
          if (isMounted) setDialInLogs(idbLogs);
        } else {
          // Seed IndexedDB with initial logs
          await idbBulkSaveDialInLogs(INITIAL_DIAL_IN_LOGS);
        }

        // 2. Recipes
        const idbRecipes = await idbGetAllRecipes();
        if (idbRecipes && idbRecipes.length > 0) {
          if (isMounted) setRecipes(idbRecipes);
        } else {
          // Seed IndexedDB with initial recipes
          await idbBulkSaveRecipes(INITIAL_RECIPES);
        }

        // 3. Timer sessions
        const idbSessions = await idbGetAllTimerSessions();
        if (isMounted && idbSessions) {
          setTimerSessions(idbSessions);
        }

        // Cache system state for instant offline boot
        await idbSetSystemState('active_branch', activeBranch);
        await idbSetSystemState('active_barista', activeBarista);

        if (isMounted) {
          await refreshOfflineStats();
        }
      } catch (err) {
        console.error('[BaristaOS] IndexedDB initialization error:', err);
      }
    }

    initDB();

    return () => {
      isMounted = false;
    };
  }, [activeBranch, activeBarista, refreshOfflineStats]);

  // Sync offline queue to simulated backend/cloud
  const syncOfflineQueue = useCallback(async () => {
    setIsSyncing(true);
    try {
      // Small simulated latency representing network handshake
      await new Promise(r => setTimeout(r, 600));
      const result = await idbProcessSyncQueue();
      await refreshOfflineStats();
      return result;
    } catch (err) {
      console.error('[BaristaOS] Sync execution failed:', err);
      return { syncedCount: 0, errors: 1 };
    } finally {
      setIsSyncing(false);
    }
  }, [refreshOfflineStats]);

  // Sync to LocalStorage as fallback secondary backup
  useEffect(() => {
    localStorage.setItem('barista_os_branches', JSON.stringify(branches));
  }, [branches]);
  useEffect(() => {
    localStorage.setItem('barista_os_staff', JSON.stringify(staffList));
  }, [staffList]);
  useEffect(() => {
    localStorage.setItem('barista_os_recipes', JSON.stringify(recipes));
  }, [recipes]);
  useEffect(() => {
    localStorage.setItem('barista_os_dialin', JSON.stringify(dialInLogs));
  }, [dialInLogs]);
  useEffect(() => {
    localStorage.setItem('barista_os_training', JSON.stringify(trainingModules));
  }, [trainingModules]);
  useEffect(() => {
    localStorage.setItem('barista_os_certificates', JSON.stringify(certificates));
  }, [certificates]);
  useEffect(() => {
    localStorage.setItem('barista_os_equipment', JSON.stringify(equipment));
  }, [equipment]);
  useEffect(() => {
    localStorage.setItem('barista_os_alerts', JSON.stringify(serviceAlerts));
  }, [serviceAlerts]);
  useEffect(() => {
    localStorage.setItem('barista_os_stock', JSON.stringify(stock));
  }, [stock]);

  // Actions
  const addRecipe = (newRecipe: Omit<EspressoRecipe, 'id'>) => {
    const recipe: EspressoRecipe = {
      ...newRecipe,
      id: `rec-${Date.now()}`,
      syncStatus: isOnline ? 'synced' : 'pending'
    };
    setRecipes(prev => [recipe, ...prev]);

    // Asynchronously commit to IndexedDB
    idbSaveRecipe(recipe, !isOnline)
      .then(() => refreshOfflineStats())
      .catch(err => console.error('[IndexedDB] addRecipe error:', err));
  };

  const updateRecipe = (updated: EspressoRecipe) => {
    const enriched = {
      ...updated,
      syncStatus: isOnline ? ('synced' as const) : ('pending' as const)
    };
    setRecipes(prev => prev.map(r => r.id === updated.id ? enriched : r));

    idbSaveRecipe(enriched, !isOnline)
      .then(() => refreshOfflineStats())
      .catch(err => console.error('[IndexedDB] updateRecipe error:', err));
  };

  const deleteRecipe = (id: string) => {
    setRecipes(prev => prev.filter(r => r.id !== id));
  };

  const addDialInLog = (logData: Omit<DialInLog, 'id' | 'timestamp' | 'extractionYieldPercent'>): DialInLog => {
    // Formula: (Yield * TDS) / Dose
    const eyCalc = Number(((logData.yieldOut * logData.tdsPercent) / logData.doseIn).toFixed(2));
    
    // Determine status automatically if not manually set
    let computedStatus: DialInLog['status'] = logData.status;
    if (eyCalc < 18.0) {
      computedStatus = 'under-extracted';
    } else if (eyCalc > 22.0) {
      computedStatus = 'over-extracted';
    } else {
      computedStatus = 'sweet-spot';
    }

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10) + ' ' + now.toTimeString().slice(0, 5);

    const newLog: DialInLog = {
      ...logData,
      id: `log-${Date.now()}`,
      timestamp: dateStr,
      extractionYieldPercent: eyCalc,
      status: computedStatus,
      syncStatus: isOnline ? 'synced' : 'pending'
    };

    setDialInLogs(prev => [newLog, ...prev]);

    // Recipe Target Deviation Check: Alert barista if shot deviates significantly
    const matchedRecipe = recipes.find(r => r.id === logData.recipeId);
    if (matchedRecipe) {
      const alert = analyzeShotDeviation({
        timeSeconds: logData.timeSeconds,
        yieldGrams: logData.yieldOut,
        doseIn: logData.doseIn,
        recipe: matchedRecipe,
        baristaName: logData.baristaName,
        source: 'dial-in',
        tolerance: tolerancePreset
      });
      if (alert.severity !== 'optimal') {
        addDeviationAlert(alert);
      }
    }

    // Save directly into IndexedDB (and into offline sync queue if offline)
    idbSaveDialInLog(newLog, !isOnline)
      .then(() => refreshOfflineStats())
      .catch(err => console.error('[IndexedDB] addDialInLog error:', err));

    // Update barista stats
    setStaffList(prev => prev.map(s => {
      if (s.name.includes(logData.baristaName.split(' ')[0])) {
        return {
          ...s,
          totalShotsLogged: s.totalShotsLogged + 1,
          dialInStreakDays: s.dialInStreakDays + 1
        };
      }
      return s;
    }));

    return newLog;
  };

  // Save shot timer telemetry session directly into IndexedDB
  const saveShotTimerRun = async (sessionData: {
    recipeId?: string;
    recipeName?: string;
    totalTimeSeconds: number;
    preInfusionSeconds: number;
    yieldGrams: number;
    flowRateGramsPerSec: number;
    targetTimeSeconds: number;
    targetYieldGrams: number;
    notes?: string;
  }): Promise<ShotTimerSession> => {
    const session: ShotTimerSession = {
      id: `session-${Date.now()}`,
      timestamp: new Date().toISOString(),
      recipeId: sessionData.recipeId,
      recipeName: sessionData.recipeName || 'Manual Profile',
      baristaName: activeBarista.name,
      totalTimeSeconds: sessionData.totalTimeSeconds,
      preInfusionSeconds: sessionData.preInfusionSeconds,
      yieldGrams: sessionData.yieldGrams,
      flowRateGramsPerSec: sessionData.flowRateGramsPerSec,
      targetTimeSeconds: sessionData.targetTimeSeconds,
      targetYieldGrams: sessionData.targetYieldGrams,
      timeVarianceSeconds: Number((sessionData.totalTimeSeconds - sessionData.targetTimeSeconds).toFixed(1)),
      yieldVarianceGrams: Number((sessionData.yieldGrams - sessionData.targetYieldGrams).toFixed(1)),
      exportedToQC: false,
      syncStatus: isOnline ? 'synced' : 'pending',
      notes: sessionData.notes
    };

    await idbSaveTimerSession(session, !isOnline);
    setTimerSessions(prev => [session, ...prev]);
    await refreshOfflineStats();

    // Check recipe target deviation from timer run
    if (sessionData.recipeId) {
      const matchedRecipe = recipes.find(r => r.id === sessionData.recipeId);
      if (matchedRecipe) {
        const alert = analyzeShotDeviation({
          timeSeconds: sessionData.totalTimeSeconds,
          yieldGrams: sessionData.yieldGrams,
          recipe: matchedRecipe,
          baristaName: activeBarista.name,
          source: 'shot-timer',
          tolerance: tolerancePreset
        });
        if (alert.severity !== 'optimal') {
          addDeviationAlert(alert);
        }
      }
    }

    return session;
  };

  const markLessonComplete = (moduleId: string, baristaId: string) => {
    setTrainingModules(prev => prev.map(mod => {
      if (mod.id === moduleId) {
        const completed = mod.completedBaristaIds.includes(baristaId)
          ? mod.completedBaristaIds
          : [...mod.completedBaristaIds, baristaId];
        return { ...mod, completedBaristaIds: completed };
      }
      return mod;
    }));
  };

  const submitExamAttempt = (examId: string, answers: Record<string, number>, baristaName: string) => {
    const exam = exams.find(e => e.id === examId);
    if (!exam) return { scorePercent: 0, passed: false };

    let correctCount = 0;
    exam.questions.forEach(q => {
      if (answers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });

    const scorePercent = Math.round((correctCount / exam.questions.length) * 100);
    const passed = scorePercent >= exam.passingScorePercent;

    let cert: ExamCertificate | undefined = undefined;

    if (passed) {
      const grade = scorePercent >= 95 
        ? 'Pass with Distinction' 
        : scorePercent >= 85 
        ? 'Certified Professional' 
        : 'Pass';
      
      const codeSuffix = Math.floor(1000 + Math.random() * 9000);
      cert = {
        id: `cert-${Date.now()}`,
        examId: exam.id,
        examTitle: exam.title,
        baristaName,
        scorePercent,
        dateAwarded: new Date().toISOString().slice(0, 10),
        credentialCode: `BOS-${exam.id.toUpperCase()}-${codeSuffix}`,
        certificateGrade: grade
      };

      setCertificates(prev => [cert!, ...prev]);

      // Update staff member certification
      setStaffList(prev => prev.map(staff => {
        if (staff.name.includes(baristaName.split(' ')[0])) {
          const currentCerts = staff.examCertifications.includes(exam.title)
            ? staff.examCertifications
            : [...staff.examCertifications, exam.title];
          return { ...staff, examCertifications: currentCerts };
        }
        return staff;
      }));
    }

    return { scorePercent, passed, certificate: cert };
  };

  const toggleDailyChecklistTask = (equipmentId: string, taskIndex: number) => {
    setEquipment(prev => prev.map(eq => {
      if (eq.id === equipmentId) {
        const updatedList = eq.dailyChecklist.map((task, i) => {
          if (i === taskIndex) {
            return { ...task, completed: !task.completed };
          }
          return task;
        });
        return { ...eq, dailyChecklist: updatedList };
      }
      return eq;
    }));
  };

  const logEquipmentService = (equipmentId: string, log: { notes: string; technician: string; costKSh: number }) => {
    const today = new Date().toISOString().slice(0, 10);
    setEquipment(prev => prev.map(eq => {
      if (eq.id === equipmentId) {
        return {
          ...eq,
          status: 'operational',
          lastMaintenanceDate: today,
          serviceLogs: [{ date: today, ...log }, ...eq.serviceLogs]
        };
      }
      return eq;
    }));
  };

  const resolveAlert = (alertId: string) => {
    setServiceAlerts(prev => prev.map(a => a.id === alertId ? { ...a, resolved: true } : a));
  };

  const dismissAlert = (alertId: string) => {
    setServiceAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  const updateStockQuantity = (stockId: string, newStock: number) => {
    setStock(prev => prev.map(s => s.id === stockId ? { ...s, currentStock: Math.max(0, Number(newStock.toFixed(1))) } : s));
  };

  const restockItem = (stockId: string, addQuantity: number, _totalCostKSh: number) => {
    const today = new Date().toISOString().slice(0, 10);
    setStock(prev => prev.map(s => {
      if (s.id === stockId) {
        return {
          ...s,
          currentStock: Number((s.currentStock + addQuantity).toFixed(1)),
          lastRestocked: today
        };
      }
      return s;
    }));
  };

  const updateStaffStatus = (staffId: string, status: 'on-shift' | 'off-duty' | 'break') => {
    setStaffList(prev => prev.map(s => s.id === staffId ? { ...s, status } : s));
  };

  const upgradeSubscription = (tierId: string, _paymentMethod: 'mpesa' | 'card', _phoneOrCard: string) => {
    const target = SUBSCRIPTION_TIERS.find(t => t.id === tierId);
    if (target) {
      setCurrentTier(target);
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const newLicenseKey = `BOS-${target.id.toUpperCase()}-NRB-${randomSuffix}-OK`;
      
      // Update active branch license
      setBranches(prev => prev.map(b => {
        if (b.id === activeBranch.id) {
          return {
            ...b,
            licenseTier: target.name as CafeBranch['licenseTier'],
            licenseStatus: 'Active',
            licenseKey: newLicenseKey,
            licenseExpiry: '2027-12-31'
          };
        }
        return b;
      }));

      setShowSubscriptionModal(false);
    }
  };

  return (
    <BaristaOSContext.Provider
      value={{
        activeTab,
        setActiveTab,
        activeBranch,
        branches,
        setActiveBranch,
        activeBarista,
        staffList,
        setActiveBarista,
        recipes,
        addRecipe,
        updateRecipe,
        deleteRecipe,
        dialInLogs,
        addDialInLog,
        trainingModules,
        markLessonComplete,
        exams,
        certificates,
        submitExamAttempt,
        equipment,
        toggleDailyChecklistTask,
        logEquipmentService,
        serviceAlerts,
        resolveAlert,
        dismissAlert,
        stock,
        updateStockQuantity,
        restockItem,
        updateStaffStatus,
        subscriptionTiers: SUBSCRIPTION_TIERS,
        currentTier,
        billingCycle,
        setBillingCycle,
        upgradeSubscription,
        showSubscriptionModal,
        setShowSubscriptionModal,
        quickShotTimerOpen,
        setQuickShotTimerOpen,

        // Daily Opening/Closing Checklists
        checklistTasks,
        checklistRecords,
        addCustomChecklistTask,
        updateChecklistTask,
        deleteChecklistTask,
        toggleChecklistTaskExecution,
        updateChecklistTaskNotes,
        signOffShiftChecklist,
        resetShiftChecklist,
        restoreDefaultChecklistTasks,

        // Shot Recipe Deviation Alerts System
        deviationAlerts,
        tolerancePreset,
        setTolerancePreset,
        addDeviationAlert,
        acknowledgeDeviationAlert,
        dismissDeviationAlert,
        clearAllDeviationAlerts,
        soundAlertsEnabled,
        setSoundAlertsEnabled,

        // Offline & IndexedDB
        isOnline,
        browserOnline,
        simulatedOffline,
        toggleSimulatedOffline,
        pendingSyncQueue,
        storageStats,
        isSyncing,
        syncOfflineQueue,
        refreshOfflineStats,
        showOfflineSyncModal,
        setShowOfflineSyncModal,
        saveShotTimerRun,
        timerSessions
      }}
    >
      {children}
    </BaristaOSContext.Provider>
  );
};

export const useBaristaOS = () => {
  const context = useContext(BaristaOSContext);
  if (!context) {
    throw new Error('useBaristaOS must be used within a BaristaOSProvider');
  }
  return context;
};
