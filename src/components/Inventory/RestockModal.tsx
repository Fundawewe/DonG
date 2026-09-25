import React, { useState } from 'react';
import { StockItem } from '../../types';
import { X, Check, PackagePlus, Phone } from 'lucide-react';

interface RestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: StockItem;
  onRestock: (stockId: string, addQuantity: number, totalCostKSh: number) => void;
}

export const RestockModal: React.FC<RestockModalProps> = ({
  isOpen,
  onClose,
  item,
  onRestock
}) => {
  const [quantity, setQuantity] = useState<number>(10);

  if (!isOpen) return null;

  const totalCost = quantity * item.costPerUnitKSh;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRestock(item.id, quantity, totalCost);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-2">
            <PackagePlus className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-neutral-100">Restock Inventory Item</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded text-neutral-400 hover:text-neutral-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <div className="text-[11px] text-neutral-400">Item Name</div>
            <div className="font-semibold text-neutral-100 text-sm mt-0.5">{item.name}</div>
            <div className="text-neutral-500 text-[11px]">
              Current Stock: <strong className="text-neutral-200 font-mono">{item.currentStock} {item.unit}</strong>
            </div>
          </div>

          <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1.5">
            <div className="flex items-center justify-between text-neutral-400">
              <span>Primary Supplier:</span>
              <span className="text-neutral-200 font-medium">{item.supplier}</span>
            </div>
            <div className="flex items-center justify-between text-neutral-400">
              <span>Direct Phone:</span>
              <a href={`tel:${item.supplierPhone}`} className="text-amber-400 hover:underline flex items-center gap-1 font-mono">
                <Phone className="w-3 h-3" />
                <span>{item.supplierPhone}</span>
              </a>
            </div>
            <div className="flex items-center justify-between text-neutral-400">
              <span>Unit Cost:</span>
              <span className="font-mono text-neutral-200">KSh {item.costPerUnitKSh.toLocaleString()} / {item.unit}</span>
            </div>
          </div>

          <div>
            <label className="block text-neutral-300 font-semibold mb-1">
              Add Quantity ({item.unit})
            </label>
            <input
              type="number"
              step="0.5"
              min="1"
              required
              value={quantity}
              onChange={e => setQuantity(parseFloat(e.target.value) || 0)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 font-mono text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800 flex items-center justify-between font-mono">
            <span className="text-neutral-400">Total Purchase Cost:</span>
            <span className="text-base font-bold text-emerald-400">KSh {totalCost.toLocaleString()}</span>
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
              <span>Confirm Restock</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
