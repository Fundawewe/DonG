import React, { useState } from 'react';
import { useBaristaOS } from '../../context/BaristaOSContext';
import { EquipmentItem, ServiceAlert } from '../../types';
import { MaintenanceModal } from './MaintenanceModal';
import { 
  Wrench, 
  AlertTriangle, 
  CheckCircle2, 
  Bell, 
  Sliders, 
  Calendar, 
  FileText, 
  Check, 
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';

export const EquipmentView: React.FC = () => {
  const { 
    equipment, 
    serviceAlerts, 
    resolveAlert, 
    dismissAlert, 
    toggleDailyChecklistTask, 
    logEquipmentService 
  } = useBaristaOS();

  const [selectedEquipmentForService, setSelectedEquipmentForService] = useState<EquipmentItem | null>(null);
  const [activeTab, setActiveTab] = useState<'fleet' | 'alerts' | 'checklists'>('fleet');

  const unresolvedAlerts = serviceAlerts.filter(a => !a.resolved);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-400" />
            Equipment Maintenance & Preventative Engineering
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Fleet monitoring, burr wear tracking, daily backflush SOPs, and service telemetry
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-lg text-xs self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('fleet')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeTab === 'fleet' ? 'bg-neutral-800 text-neutral-100 font-semibold' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Machine Fleet ({equipment.length})
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 ${
              activeTab === 'alerts' ? 'bg-neutral-800 text-neutral-100 font-semibold' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <span>Alerts Center</span>
            {unresolvedAlerts.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('checklists')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeTab === 'checklists' ? 'bg-neutral-800 text-neutral-100 font-semibold' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Daily Checklists
          </button>
        </div>
      </div>

      {/* Critical Alerts Banner if any unresolved */}
      {unresolvedAlerts.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>{unresolvedAlerts.length} Action Required on Service Line</span>
            </div>
            <button
              onClick={() => setActiveTab('alerts')}
              className="text-[11px] text-amber-400 hover:underline flex items-center gap-0.5"
            >
              <span>Manage in Alert Center</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-1.5">
            {unresolvedAlerts.slice(0, 2).map(alert => (
              <div key={alert.id} className="flex items-center justify-between text-xs text-neutral-300 bg-neutral-950/60 p-2 rounded-lg border border-neutral-800/80">
                <span className="truncate"><strong>{alert.equipmentName}:</strong> {alert.title}</span>
                <button
                  onClick={() => resolveAlert(alert.id)}
                  className="px-2.5 py-1 text-[11px] bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded shrink-0 transition-colors ml-2"
                >
                  Mark Done
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Fleet View */}
      {activeTab === 'fleet' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {equipment.map(item => {
            const hasBurrTracker = !!item.burrHoursOrThroughputKg;
            const burrPercent = hasBurrTracker 
              ? Math.round((item.burrHoursOrThroughputKg!.currentKg / item.burrHoursOrThroughputKg!.maxKg) * 100) 
              : 0;
            const isDue = item.status === 'maintenance-due' || burrPercent >= 95;

            return (
              <div 
                key={item.id}
                className={`p-5 rounded-2xl bg-neutral-900 border transition-all ${
                  isDue ? 'border-amber-500/40 shadow-sm' : 'border-neutral-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[10px] font-mono text-amber-400 uppercase">
                      {item.category} · {item.station}
                    </div>
                    <h3 className="font-bold text-base text-neutral-100 mt-0.5">{item.name}</h3>
                    <div className="text-xs text-neutral-400">{item.model}</div>
                  </div>

                  <span className={`text-[11px] px-2 py-0.5 rounded font-mono ${
                    item.status === 'operational' 
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}>
                    {item.status === 'operational' ? 'Nominal' : 'Service Due'}
                  </span>
                </div>

                {/* Burr Life Tracker Gauge if applicable */}
                {hasBurrTracker && (
                  <div className="mt-4 p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-neutral-400">Burr Lifespan Throughput</span>
                      <span className={`font-mono font-bold ${burrPercent >= 90 ? 'text-amber-400' : 'text-neutral-200'}`}>
                        {item.burrHoursOrThroughputKg!.currentKg} / {item.burrHoursOrThroughputKg!.maxKg} kg ({burrPercent}%)
                      </span>
                    </div>
                    <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${burrPercent >= 95 ? 'bg-rose-500' : burrPercent >= 80 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                        style={{ width: `${burrPercent}%` }}
                      />
                    </div>
                    {burrPercent >= 95 && (
                      <div className="text-[10px] text-rose-400 mt-1.5 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Burrs require replacement to prevent extraction channeling</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Maintenance Schedule & Dates */}
                <div className="mt-3.5 space-y-1.5 text-xs text-neutral-300">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Last Serviced:</span>
                    <span className="font-mono text-neutral-200">{item.lastMaintenanceDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Next Service Target:</span>
                    <span className="font-mono text-amber-400">{item.nextMaintenanceDate}</span>
                  </div>
                  <div className="text-[11px] text-neutral-400 pt-1">
                    {item.maintenanceSchedule}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between">
                  <div className="text-[11px] text-neutral-500 font-mono">
                    SN: {item.serialNumber}
                  </div>

                  <button
                    onClick={() => setSelectedEquipmentForService(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-200 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
                  >
                    <Wrench className="w-3.5 h-3.5 text-amber-400" />
                    <span>Log Service</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab: Alerts Center */}
      {activeTab === 'alerts' && (
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-neutral-100 flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              Machine & Water Quality Service Alerts
            </h2>
          </div>

          <div className="divide-y divide-neutral-800">
            {serviceAlerts.map(alert => (
              <div key={alert.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                      alert.severity === 'critical' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                      alert.severity === 'warning' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                      'bg-neutral-800 text-neutral-300'
                    }`}>
                      {alert.severity.toUpperCase()}
                    </span>
                    <span className="font-semibold text-neutral-200 text-sm">{alert.title}</span>
                    <span className="text-neutral-500 font-mono text-[11px]">· {alert.timestamp}</span>
                  </div>
                  <p className="text-neutral-400 text-xs">{alert.detail}</p>
                  <div className="text-[11px] text-amber-400">
                    Action: <strong>{alert.actionRequired}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  {!alert.resolved ? (
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      className="px-3 py-1.5 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Resolve</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Resolved
                    </span>
                  )}
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="px-2 py-1.5 text-xs text-neutral-500 hover:text-neutral-300"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Checklists */}
      {activeTab === 'checklists' && (
        <div className="space-y-4">
          {equipment.map(item => (
            <div key={item.id} className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-neutral-100">{item.name}</h3>
                  <p className="text-[11px] text-neutral-500">{item.station}</p>
                </div>
                <span className="text-xs font-mono text-neutral-400">
                  {item.dailyChecklist.filter(t => t.completed).length}/{item.dailyChecklist.length} Complete
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {item.dailyChecklist.map((task, idx) => (
                  <div 
                    key={idx}
                    onClick={() => toggleDailyChecklistTask(item.id, idx)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                      task.completed 
                        ? 'bg-emerald-950/20 border-emerald-800/60 text-neutral-200' 
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:bg-neutral-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        task.completed ? 'bg-emerald-500 border-emerald-500 text-neutral-950' : 'border-neutral-600'
                      }`}>
                        {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className={task.completed ? 'line-through text-neutral-400' : 'text-neutral-200'}>
                        {task.task}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono text-neutral-500">
                      {task.requiredTime}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedEquipmentForService && (
        <MaintenanceModal
          isOpen={!!selectedEquipmentForService}
          onClose={() => setSelectedEquipmentForService(null)}
          equipment={selectedEquipmentForService}
          onLogService={logEquipmentService}
        />
      )}
    </div>
  );
};
