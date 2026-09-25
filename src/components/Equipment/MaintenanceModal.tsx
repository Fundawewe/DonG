import React, { useState } from 'react';
import { EquipmentItem } from '../../types';
import { X, Check, Wrench } from 'lucide-react';

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: EquipmentItem;
  onLogService: (equipmentId: string, log: { technician: string; notes: string; costKSh: number }) => void;
}

export const MaintenanceModal: React.FC<MaintenanceModalProps> = ({
  isOpen,
  onClose,
  equipment,
  onLogService
}) => {
  const [technician, setTechnician] = useState('');
  const [notes, setNotes] = useState('');
  const [costKSh, setCostKSh] = useState<number>(0);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogService(equipment.id, {
      technician: technician || 'Internal Head Barista',
      notes,
      costKSh
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-neutral-100">Log Equipment Maintenance</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded text-neutral-400 hover:text-neutral-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <div className="text-neutral-400 text-[11px]">Machine Fleet Unit</div>
            <div className="font-semibold text-neutral-200 text-sm mt-0.5">{equipment.name}</div>
            <div className="text-[10px] text-neutral-500 font-mono">SN: {equipment.serialNumber}</div>
          </div>

          <div>
            <label className="block text-neutral-300 font-semibold mb-1">Technician / Barista Name</label>
            <input
              type="text"
              required
              value={technician}
              onChange={e => setTechnician(e.target.value)}
              placeholder="e.g. Samuel Kinyanjui or Nairobi Tech Services"
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-200 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-neutral-300 font-semibold mb-1">Service & Replacement Notes</label>
            <textarea
              required
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Disassembled burr carrier, vacuumed grinds, replaced 8.5mm silicone group gaskets..."
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-200 focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-neutral-300 font-semibold mb-1">Service Cost (KSh)</label>
            <input
              type="number"
              min="0"
              value={costKSh}
              onChange={e => setCostKSh(parseFloat(e.target.value) || 0)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-200 font-mono focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-neutral-400 hover:text-neutral-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-1.5 font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Record Service</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
