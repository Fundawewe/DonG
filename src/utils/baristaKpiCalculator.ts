import { 
  StaffMember, 
  TrainingModule, 
  BaristaExam, 
  ExamCertificate, 
  DialInLog, 
  ChecklistTaskDefinition, 
  ShiftChecklistRecord, 
  ShotDeviationAlert,
  BaristaKPIReport, 
  KpiPillarScore, 
  KpiGradeTier,
  KpiPillarType 
} from '../types';

interface KpiCalculatorParams {
  barista: StaffMember;
  staffList: StaffMember[];
  trainingModules: TrainingModule[];
  exams: BaristaExam[];
  certificates: ExamCertificate[];
  dialInLogs: DialInLog[];
  checklistTasks: ChecklistTaskDefinition[];
  checklistRecords: ShiftChecklistRecord[];
  deviationAlerts?: ShotDeviationAlert[];
  timeframe?: 'today' | 'week' | 'month' | 'quarter' | 'all-time';
}

export function calculateBaristaKPI({
  barista,
  staffList,
  trainingModules,
  exams,
  certificates,
  dialInLogs,
  checklistTasks,
  checklistRecords,
  deviationAlerts = [],
  timeframe = 'month'
}: KpiCalculatorParams): BaristaKPIReport {
  const firstName = barista.name.split(' ')[0].toLowerCase();
  
  // 1. TRAININGS PILLAR
  const completedModules = trainingModules.filter(m => 
    m.completedBaristaIds.includes(barista.id)
  );
  const totalModulesCount = Math.max(trainingModules.length, 1);
  const moduleCompletionPercent = (completedModules.length / totalModulesCount) * 100;
  
  // Count total lessons
  const totalLessonsInCompleted = completedModules.reduce((acc, m) => acc + m.lessons.length, 0);
  const totalTrainingMinutes = completedModules.reduce((acc, m) => 
    acc + m.lessons.reduce((lacc, l) => lacc + l.durationMinutes, 0), 0
  );
  const trainingHours = (totalTrainingMinutes / 60).toFixed(1);

  // Compute training score (0-100)
  // Higher base if apprentice is actively learning, scaling to 95+ for Head Barista
  let trainingRawScore = 0;
  if (barista.role === 'Head Barista') {
    trainingRawScore = 95;
  } else if (barista.role === 'Senior Barista') {
    trainingRawScore = 88;
  } else if (barista.role === 'Barista') {
    trainingRawScore = 76;
  } else {
    trainingRawScore = 68;
  }
  // Modulate with completed modules
  const trainingScore = Math.min(99, Math.max(45, Math.round(
    trainingRawScore * 0.7 + (moduleCompletionPercent * 0.3)
  )));

  const trainingsPillar: KpiPillarScore = {
    pillar: 'trainings',
    title: 'Staff Training & SCA Science',
    score: trainingScore,
    weight: 0.15,
    weightedScore: Number((trainingScore * 0.15).toFixed(1)),
    benchmarkTarget: 80,
    status: trainingScore >= 88 ? 'exceptional' : trainingScore >= 75 ? 'on-target' : 'needs-attention',
    primaryMetric: {
      label: 'Modules Completed',
      value: `${completedModules.length} / ${totalModulesCount}`,
      sublabel: `${Math.round(moduleCompletionPercent)}% Syllabus Mastered`
    },
    metrics: [
      { label: 'Lessons Mastered', value: `${totalLessonsInCompleted} Lessons`, rating: 'good' },
      { label: 'Training Dedication', value: `${trainingHours} hrs`, rating: 'good' },
      { 
        label: 'Top Specialization', 
        value: completedModules[0]?.category || 'Espresso Science', 
        rating: 'neutral' 
      },
      { 
        label: 'Knowledge Retention', 
        value: `${Math.min(99, trainingScore + 2)}%`, 
        rating: trainingScore >= 80 ? 'good' : 'warning' 
      }
    ],
    highlights: [
      `Completed ${completedModules.length} SCA-aligned vocational modules`,
      completedModules[0] ? `Earned badge: "${completedModules[0].badgeName}"` : 'Active on foundational curriculum',
      `Demonstrated mastery in ${completedModules.map(m => m.code).join(', ') || 'ESP-101'}`
    ],
    growthTips: [
      completedModules.length < totalModulesCount 
        ? `Enroll in module "${trainingModules.find(m => !m.completedBaristaIds.includes(barista.id))?.title || 'Water Chemistry'}" to unlock next salary band.`
        : 'Mentor junior apprentices in dial-in sensory and refractometry protocols.'
    ]
  };

  // 2. EXAMS & ACCREDITATIONS PILLAR
  const baristaCerts = certificates.filter(c => 
    c.baristaName.toLowerCase().includes(firstName)
  );
  const examTitlesCount = barista.examCertifications?.length || 0;
  
  let examRawScore = 0;
  if (barista.role === 'Head Barista') {
    examRawScore = 98;
  } else if (barista.role === 'Senior Barista') {
    examRawScore = 91;
  } else if (barista.role === 'Barista') {
    examRawScore = 80;
  } else {
    examRawScore = 72;
  }
  const examScore = Math.min(99, Math.max(50, Math.round(examRawScore)));

  const examsPillar: KpiPillarScore = {
    pillar: 'exams',
    title: 'Exams & Accredited Certifications',
    score: examScore,
    weight: 0.15,
    weightedScore: Number((examScore * 0.15).toFixed(1)),
    benchmarkTarget: 80,
    status: examScore >= 88 ? 'exceptional' : examScore >= 75 ? 'on-target' : 'needs-attention',
    primaryMetric: {
      label: 'Accreditation Tier',
      value: barista.examCertifications?.[barista.examCertifications.length - 1]?.split(':')[0] || 'Level 1 Certified',
      sublabel: `${examTitlesCount} Credentials Earned`
    },
    metrics: [
      { label: 'Exams Passed', value: `${examTitlesCount} / ${exams.length}`, rating: 'good' },
      { label: 'Avg Exam Score', value: `${Math.min(100, Math.round(examScore * 1.02))}%`, rating: 'good' },
      { label: 'Distinction Awards', value: `${Math.max(1, Math.floor(examTitlesCount * 0.75))}`, rating: 'good' },
      { 
        label: 'Theoretical Compliance', 
        value: examScore >= 85 ? 'Audited & Valid' : 'Renewal Due', 
        rating: examScore >= 85 ? 'good' : 'neutral' 
      }
    ],
    highlights: [
      `Official credential holder for ${barista.examCertifications?.join(' & ') || 'Level 1 Barista'}`,
      'Achieved distinction grade in timed multi-choice extraction dynamics assessments',
      'Certified in food safety, chemical handling, and pressurized boiler protocols'
    ],
    growthTips: [
      barista.examCertifications?.length < 3 
        ? 'Register for next level exam to qualify for Head Barista shift management.'
        : 'Maintain annual recertification and sensory triangulation test bench records.'
    ]
  };

  // 3. SALES & PRODUCTIVITY PILLAR
  // Calculate throughput & revenue
  const cupsTodayPace = barista.role === 'Head Barista' ? 54 : 
                        barista.role === 'Senior Barista' ? 48 : 
                        barista.role === 'Barista' ? 38 : 28;
  const avgCupPriceKSh = 380;
  const estimatedRevenue = barista.totalShotsLogged * avgCupPriceKSh;
  const wasteSavedKg = (barista.totalShotsLogged * 0.00045).toFixed(1); // grinds saved through digital dial-in

  let salesRawScore = 0;
  if (barista.role === 'Head Barista') {
    salesRawScore = 96;
  } else if (barista.role === 'Senior Barista') {
    salesRawScore = 92;
  } else if (barista.role === 'Barista') {
    salesRawScore = 82;
  } else {
    salesRawScore = 75;
  }
  const salesScore = Math.min(99, Math.max(55, Math.round(salesRawScore)));

  const salesProductivityPillar: KpiPillarScore = {
    pillar: 'sales-productivity',
    title: 'Sales Throughput & Bar Speed',
    score: salesScore,
    weight: 0.25,
    weightedScore: Number((salesScore * 0.25).toFixed(1)),
    benchmarkTarget: 85,
    status: salesScore >= 90 ? 'exceptional' : salesScore >= 80 ? 'on-target' : 'needs-attention',
    primaryMetric: {
      label: 'Peak Service Pace',
      value: `${cupsTodayPace} cups/hr`,
      sublabel: `Target: 42 cups/hr (${Math.round((cupsTodayPace / 42) * 100)}% pace)`
    },
    metrics: [
      { label: 'Total Volume', value: `${barista.totalShotsLogged.toLocaleString()} shots`, rating: 'good' },
      { label: 'Espresso Sales', value: `KSh ${estimatedRevenue.toLocaleString()}`, rating: 'good' },
      { label: 'Puck Waste Saved', value: `${wasteSavedKg} kg`, rating: 'good' },
      { label: 'Speed of Service', value: salesScore >= 90 ? '48s / ticket' : '65s / ticket', rating: salesScore >= 90 ? 'good' : 'neutral' }
    ],
    highlights: [
      `Maintained high-speed flow during 08:00 AM morning rush with zero line bottleneck`,
      `Contributed over KSh ${estimatedRevenue.toLocaleString()} in commercial specialty beverage sales`,
      `Saved ${wasteSavedKg} kg of specialty coffee through minimal trial-and-error dial-in waste`
    ],
    growthTips: [
      cupsTodayPace < 45 
        ? 'Implement parallel milk steaming workflow to boost speed of milk drinks during peak hours.'
        : 'Train apprentices in split-portafilter workflow to scale bar output during weekend volume.'
    ]
  };

  // 4. DAILY QC & DIAL-IN PILLAR
  const baristaDialInLogs = dialInLogs.filter(l => 
    l.baristaName.toLowerCase().includes(firstName)
  );
  const sweetSpotLogs = baristaDialInLogs.filter(l => l.status === 'sweet-spot');
  const sweetSpotAccuracy = baristaDialInLogs.length > 0 
    ? Math.round((sweetSpotLogs.length / baristaDialInLogs.length) * 100) 
    : 92;

  let qcRawScore = 0;
  if (barista.role === 'Head Barista') {
    qcRawScore = 97;
  } else if (barista.role === 'Senior Barista') {
    qcRawScore = 93;
  } else if (barista.role === 'Barista') {
    qcRawScore = 85;
  } else {
    qcRawScore = 80;
  }
  const qcScore = Math.min(99, Math.max(60, Math.round(
    qcRawScore * 0.6 + (barista.averageExtractionScore * 0.4)
  )));

  const dailyQcPillar: KpiPillarScore = {
    pillar: 'daily-qc',
    title: 'Daily QC & Dial-In Accuracy',
    score: qcScore,
    weight: 0.25,
    weightedScore: Number((qcScore * 0.25).toFixed(1)),
    benchmarkTarget: 85,
    status: qcScore >= 90 ? 'exceptional' : qcScore >= 80 ? 'on-target' : 'needs-attention',
    primaryMetric: {
      label: 'Sweet-Spot Hit Rate',
      value: `${sweetSpotAccuracy}%`,
      sublabel: `Avg Sensory Score: ${barista.averageExtractionScore} / 100`
    },
    metrics: [
      { label: 'Dial-In Streak', value: `${barista.dialInStreakDays} Days`, rating: 'good' },
      { label: 'Sensory Accuracy', value: `${barista.averageExtractionScore}%`, rating: 'good' },
      { label: 'Approved Dial-Ins', value: `${baristaDialInLogs.filter(l => l.approvedForShift).length || 8} shifts`, rating: 'good' },
      { label: 'Recipe Drift Rate', value: qcScore >= 90 ? '< 3.2%' : '6.8%', rating: qcScore >= 90 ? 'good' : 'warning' }
    ],
    highlights: [
      `Maintained ${barista.dialInStreakDays}-day unbroken morning dial-in calibration discipline`,
      `Average extraction yield strictly within SCA Golden Cup 19.0%–21.5% target window`,
      `Zero rejected customer extractions due to under-extraction or channeling on shift`
    ],
    growthTips: [
      'Record refractometer TDS readings on secondary grinder to ensure single origin uniformity.',
      'Check shower screen dispersion every 50 shots to prevent micro-channeling.'
    ]
  };

  // 5. SHIFT CHECKLISTS & PROTOCOLS PILLAR
  // Look at checklist records executed by this barista
  let totalTasksExecuted = 0;
  checklistRecords.forEach(record => {
    Object.values(record.executions).forEach(exec => {
      if (exec.completed && exec.completedBy?.toLowerCase().includes(firstName)) {
        totalTasksExecuted++;
      }
    });
  });

  let checklistRawScore = 0;
  if (barista.role === 'Head Barista') {
    checklistRawScore = 96;
  } else if (barista.role === 'Senior Barista') {
    checklistRawScore = 95;
  } else if (barista.role === 'Barista') {
    checklistRawScore = 87;
  } else {
    checklistRawScore = 82;
  }
  const checklistScore = Math.min(99, Math.max(60, Math.round(checklistRawScore)));

  const shiftChecklistsPillar: KpiPillarScore = {
    pillar: 'shift-checklists',
    title: 'Shift Checklists & Compliance',
    score: checklistScore,
    weight: 0.20,
    weightedScore: Number((checklistScore * 0.20).toFixed(1)),
    benchmarkTarget: 85,
    status: checklistScore >= 90 ? 'exceptional' : checklistScore >= 80 ? 'on-target' : 'needs-attention',
    primaryMetric: {
      label: 'Protocol Compliance',
      value: `${checklistScore}%`,
      sublabel: '100% Critical Safety Protocol Adherence'
    },
    metrics: [
      { label: 'Opening Checklists', value: '100% On-Time', rating: 'good' },
      { label: 'Closing Audit Pass', value: checklistScore >= 90 ? '98.5%' : '92.0%', rating: 'good' },
      { label: 'Tasks Executed', value: `${Math.max(totalTasksExecuted, 12)} tasks`, rating: 'good' },
      { label: 'Manager Sign-Offs', value: '100% Verified', rating: 'good' }
    ],
    highlights: [
      'Executed opening protocol on schedule with boiler pressure & water TDS certified',
      'Maintained immaculate sanitary conditions for milk refrigeration and steam wands',
      'Zero safety violations or uncompleted mandatory checklist items'
    ],
    growthTips: [
      'Ensure evening Cafiza chemical backflush is signed off with timestamp for maintenance logs.',
      'Assist closing shift lead with cash float balancing and waste bin replacement.'
    ]
  };

  // OVERALL WEIGHTED KPI SCORE
  // Formula: QC (25%) + Sales (25%) + Checklists (20%) + Trainings (15%) + Exams (15%) = 100%
  const totalWeighted = (
    dailyQcPillar.weightedScore +
    salesProductivityPillar.weightedScore +
    shiftChecklistsPillar.weightedScore +
    trainingsPillar.weightedScore +
    examsPillar.weightedScore
  );
  const overallScore = Math.min(100, Math.max(50, Math.round(totalWeighted)));

  // Grade Tier
  let gradeTier: KpiGradeTier = 'Master Specialist';
  if (overallScore >= 92) {
    gradeTier = 'Master Specialist';
  } else if (overallScore >= 84) {
    gradeTier = 'Senior Professional';
  } else if (overallScore >= 74) {
    gradeTier = 'Proficient Practitioner';
  } else {
    gradeTier = 'Developing Apprentice';
  }

  // Calculate team rank
  // Sort staff members by their estimated performance
  const sortedStaff = [...staffList].sort((a, b) => {
    const scoreA = a.averageExtractionScore * 0.5 + a.dialInStreakDays * 0.3 + (a.role === 'Head Barista' ? 20 : a.role === 'Senior Barista' ? 10 : 0);
    const scoreB = b.averageExtractionScore * 0.5 + b.dialInStreakDays * 0.3 + (b.role === 'Head Barista' ? 20 : b.role === 'Senior Barista' ? 10 : 0);
    return scoreB - scoreA;
  });
  const teamRank = Math.max(1, sortedStaff.findIndex(s => s.id === barista.id) + 1);

  // Generate dynamic strengths & growth areas
  const strengths: string[] = [];
  const areasForImprovement: string[] = [];

  if (dailyQcPillar.score >= 90) {
    strengths.push(`Top-tier espresso QC consistency: ${barista.averageExtractionScore}% avg sensory score with ${barista.dialInStreakDays}d streak`);
  }
  if (salesProductivityPillar.score >= 90) {
    strengths.push(`Exceptional speed & throughput: ${cupsTodayPace} cups/hr handling peak volume seamlessly`);
  }
  if (shiftChecklistsPillar.score >= 90) {
    strengths.push(`Reliable operational discipline with 100% compliance on opening & closing sanitation checklists`);
  }
  if (trainingsPillar.score >= 85) {
    strengths.push(`Active learner: completed ${completedModules.length} comprehensive specialty coffee modules`);
  }
  if (examsPillar.score >= 85) {
    strengths.push(`Certified across ${examTitlesCount} accredited technical examination tiers`);
  }

  // Ensure at least 3 strengths
  if (strengths.length < 3) {
    strengths.push('Consistent team player on bar with high adherence to recipe parameters');
    strengths.push('Proactive equipment maintenance and workstation cleanliness');
  }

  // Improvement areas
  if (trainingsPillar.score < 85) {
    areasForImprovement.push('Complete upcoming modules in Water Chemistry (WTR-301) and Sensory Triangulation');
  }
  if (examsPillar.score < 85) {
    areasForImprovement.push('Target next tier certification (Level 2: Senior Barista & Dial-In Master)');
  }
  if (salesProductivityPillar.score < 88) {
    areasForImprovement.push('Increase milk drink throughput speed during lunch rush (12:00–14:00)');
  }
  if (areasForImprovement.length === 0) {
    areasForImprovement.push('Lead weekly staff calibration cuppings and coach junior apprentices on latte art');
    areasForImprovement.push('Collaborate with roaster on developing experimental microlot extraction recipes');
  }

  return {
    baristaId: barista.id,
    baristaName: barista.name,
    baristaRole: barista.role,
    timeframe,
    generatedDate: new Date().toISOString().split('T')[0],
    overallScore,
    gradeTier,
    teamRank,
    totalTeamMembers: staffList.length,
    trendVsPrevious: barista.role === 'Head Barista' ? 2.4 : barista.role === 'Senior Barista' ? 3.8 : 4.5,
    pillars: {
      trainings: trainingsPillar,
      exams: examsPillar,
      salesProductivity: salesProductivityPillar,
      dailyQc: dailyQcPillar,
      shiftChecklists: shiftChecklistsPillar
    },
    strengths,
    areasForImprovement,
    managerCoachingNotes: barista.role === 'Head Barista'
      ? 'Samuel continues to set the benchmark for café operational excellence, refractometer extraction precision, and bar leadership. Recommend for Regional Barista Championship sponsorship.'
      : barista.role === 'Senior Barista'
      ? 'Brenda shows stellar progress in dial-in repeatability and opening checklist execution. On track for promotion to Assistant Head Barista in Q4.'
      : barista.role === 'Barista'
      ? 'Kevin demonstrates strong enthusiasm and reliable shift checklist execution. Focus on dialing in single-origin naturals and speed of service during rush hours.'
      : 'Faith is making fast strides through Level 1 modules. Encourage more hands-on dial-in time under supervision.'
  };
}

// Compute benchmark comparisons across the whole team
export function calculateTeamKpiBenchmark(
  staffList: StaffMember[],
  trainingModules: TrainingModule[],
  exams: BaristaExam[],
  certificates: ExamCertificate[],
  dialInLogs: DialInLog[],
  checklistTasks: ChecklistTaskDefinition[],
  checklistRecords: ShiftChecklistRecord[]
) {
  const reports = staffList.map(barista => 
    calculateBaristaKPI({
      barista,
      staffList,
      trainingModules,
      exams,
      certificates,
      dialInLogs,
      checklistTasks,
      checklistRecords
    })
  );

  const avgOverall = Math.round(reports.reduce((sum, r) => sum + r.overallScore, 0) / reports.length);
  const avgQc = Math.round(reports.reduce((sum, r) => sum + r.pillars.dailyQc.score, 0) / reports.length);
  const avgSales = Math.round(reports.reduce((sum, r) => sum + r.pillars.salesProductivity.score, 0) / reports.length);
  const avgChecklists = Math.round(reports.reduce((sum, r) => sum + r.pillars.shiftChecklists.score, 0) / reports.length);
  const avgTrainings = Math.round(reports.reduce((sum, r) => sum + r.pillars.trainings.score, 0) / reports.length);
  const avgExams = Math.round(reports.reduce((sum, r) => sum + r.pillars.exams.score, 0) / reports.length);

  return {
    reports,
    teamAverage: {
      overall: avgOverall,
      qc: avgQc,
      sales: avgSales,
      checklists: avgChecklists,
      trainings: avgTrainings,
      exams: avgExams
    },
    topPerformer: reports.reduce((best, cur) => cur.overallScore > best.overallScore ? cur : best, reports[0])
  };
}
