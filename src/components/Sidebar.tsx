import React from 'react';
import { useBaristaOS } from '../context/BaristaOSContext';
import { TabType } from '../types';
import { 
  SlidersHorizontal, 
  Coffee, 
  GraduationCap, 
  FileCheck2, 
  Wrench, 
  Package, 
  Users, 
  TrendingUp, 
  CreditCard,
  AlertTriangle,
  Flame,
  Award,
  ClipboardCheck
} from 'lucide-react';

interface NavItem {
  id: TabType;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeType?: 'alert' | 'count' | 'neutral';
}

export const Sidebar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    serviceAlerts, 
    stock, 
    exams,
    activeBarista,
    isOnline,
    pendingSyncQueue,
    setShowOfflineSyncModal,
    checklistTasks,
    checklistRecords,
    deviationAlerts
  } = useBaristaOS();

  const unresolvedAlerts = serviceAlerts.filter(a => !a.resolved).length;
  const lowStockCount = stock.filter(s => s.currentStock <= s.minThreshold).length;
  const activeDeviationCount = deviationAlerts.filter(a => !a.isAcknowledged && !a.isDismissed).length;

  // Calculate pending checklist tasks for today's opening shift
  const todayStr = '2026-09-23';
  const openingTasks = checklistTasks.filter(t => t.shiftType === 'opening' && t.isActive !== false);
  const todayOpeningRecord = checklistRecords.find(r => r.date === todayStr && r.shiftType === 'opening');
  const openingCompletedCount = openingTasks.filter(t => todayOpeningRecord?.executions[t.id]?.completed).length;
  const pendingOpeningCount = openingTasks.length - openingCompletedCount;

  const navItems: NavItem[] = [
    {
      id: 'qc-dialin',
      label: 'Daily QC & Dial-In',
      sublabel: 'TDS / EY & extraction telemetry',
      icon: SlidersHorizontal,
      badge: activeDeviationCount > 0 ? `${activeDeviationCount} Drift` : undefined,
      badgeType: 'alert'
    },
    {
      id: 'checklists',
      label: 'Shift Checklists',
      sublabel: 'Opening & closing protocols',
      icon: ClipboardCheck,
      badge: pendingOpeningCount > 0 ? `${pendingOpeningCount} Pending` : 'Signed',
      badgeType: pendingOpeningCount > 0 ? 'count' : 'neutral'
    },
    {
      id: 'recipes',
      label: 'Espresso Recipes',
      sublabel: 'Origins, ratios & parameters',
      icon: Coffee,
    },
    {
      id: 'training',
      label: 'Staff Training',
      sublabel: 'SCA modules & extraction science',
      icon: GraduationCap,
    },
    {
      id: 'exams',
      label: 'Barista Exams',
      sublabel: '3-tier certifications & testing',
      icon: FileCheck2,
      badge: `${exams.length} Tiers`,
      badgeType: 'neutral'
    },
    {
      id: 'equipment',
      label: 'Equipment & Alerts',
      sublabel: 'Preventative care & burr life',
      icon: Wrench,
      badge: unresolvedAlerts > 0 ? `${unresolvedAlerts} Alert${unresolvedAlerts > 1 ? 's' : ''}` : undefined,
      badgeType: unresolvedAlerts > 0 ? 'alert' : 'neutral'
    },
    {
      id: 'inventory',
      label: 'Stock & Inventory',
      sublabel: 'Beans, milks, cups & chemicals',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount} Low` : undefined,
      badgeType: lowStockCount > 0 ? 'alert' : 'neutral'
    },
    {
      id: 'staff',
      label: 'Staff Performance & KPI',
      sublabel: '5-pillar report, roster & streaks',
      icon: Users,
      badge: 'KPI Report',
      badgeType: 'neutral'
    },
    {
      id: 'productivity',
      label: 'Sales & Productivity',
      sublabel: 'Throughput & waste reduction',
      icon: TrendingUp,
    },
    {
      id: 'subscription',
      label: 'Café Licenses & Billing',
      sublabel: 'KSh 1,500 – 5,000/mo plans',
      icon: CreditCard,
    }
  ];

  return (
    <aside className="w-64 lg:w-72 bg-neutral-900 border-r border-neutral-800 flex flex-col shrink-0">
      {/* Active Barista Mini-Card in Sidebar */}
      <div className="p-3.5 mx-3 mt-3 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-400">Station Active</span>
          <span className="flex items-center gap-1 text-[11px] text-amber-400 font-medium font-mono">
            <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
            {activeBarista.dialInStreakDays}d streak
          </span>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <div className="font-semibold text-sm text-neutral-200 truncate">
            {activeBarista.name}
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
            {activeBarista.role.replace('Barista', '').trim() || 'Barista'}
          </span>
        </div>
        <div className="mt-2 pt-2 border-t border-neutral-800/60 flex items-center justify-between text-[11px] text-neutral-400">
          <span>{activeBarista.totalShotsLogged.toLocaleString()} shots logged</span>
          <span className="text-emerald-400 font-mono font-medium">{activeBarista.averageExtractionScore}% QC avg</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <div className="px-2 py-1 text-[11px] font-semibold text-neutral-500 tracking-wider">
          OPERATING MODULES
        </div>

        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between transition-colors group ${
                isActive 
                  ? 'bg-amber-400/10 text-amber-300 font-medium border border-amber-400/20' 
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-amber-400' : 'text-neutral-500 group-hover:text-neutral-300'
                }`} />
                <div className="truncate text-left">
                  <div className={`text-xs truncate ${isActive ? 'text-neutral-100 font-medium' : 'text-neutral-300'}`}>
                    {item.label}
                  </div>
                  <div className="text-[10px] text-neutral-500 truncate">
                    {item.sublabel}
                  </div>
                </div>
              </div>

              {item.badge && (
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
                  item.badgeType === 'alert' 
                    ? 'bg-rose-950 text-rose-300 border border-rose-800' 
                    : 'bg-neutral-800 text-neutral-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Help / License Status & Offline Telemetry */}
      <div className="p-3 border-t border-neutral-800 text-xs text-neutral-500 space-y-2">
        <button
          onClick={() => setShowOfflineSyncModal(true)}
          className="w-full text-left p-2 rounded-lg bg-neutral-950 border border-neutral-800/80 hover:border-neutral-700 transition-colors group flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
            <div className="text-[11px] text-neutral-300 font-mono">
              {isOnline ? 'IDB Storage: Synced' : `Offline (${pendingSyncQueue.length} queued)`}
            </div>
          </div>
          <span className="text-[10px] text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
            Inspect →
          </span>
        </button>

        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] text-neutral-500">Barista OS PWA</span>
          <span className="text-[11px] font-mono text-neutral-400">v2.4.1 (Offline)</span>
        </div>
      </div>
    </aside>
  );
};
