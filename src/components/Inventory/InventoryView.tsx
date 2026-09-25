import React, { useState } from 'react';
import { useBaristaOS } from '../../context/BaristaOSContext';
import { StockItem } from '../../types';
import { RestockModal } from './RestockModal';
import { InventoryQRScannerModal } from './InventoryQRScannerModal';
import { PrintableQRCodesModal } from './PrintableQRCodesModal';
import { 
  Package, 
  AlertTriangle, 
  Plus, 
  Minus, 
  Search,
  ShoppingCart,
  QrCode,
  Camera,
  Tag,
  Coffee,
  Sparkles
} from 'lucide-react';

export const InventoryView: React.FC = () => {
  const { stock, updateStockQuantity, restockItem } = useBaristaOS();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [restockItemTarget, setRestockItemTarget] = useState<StockItem | null>(null);
  const [scannerOpen, setScannerOpen] = useState<boolean>(false);
  const [preselectedItem, setPreselectedItem] = useState<StockItem | null>(null);
  const [qrTagsModalOpen, setQrTagsModalOpen] = useState<boolean>(false);

  const categories = [
    'all',
    'Roasted Coffee',
    'Syrups & Ingredients',
    'Dairy & Plant Milk',
    'Packaging & Cups',
    'Machine Chemicals'
  ];

  const filteredStock = stock.filter(item => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.sku && item.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const lowStockItems = stock.filter(s => s.currentStock <= s.minThreshold);
  const totalStockValuationKSh = stock.reduce((sum, item) => sum + (item.currentStock * item.costPerUnitKSh), 0);
  const coffeeCount = stock.filter(s => s.category === 'Roasted Coffee').length;
  const syrupCount = stock.filter(s => s.category === 'Syrups & Ingredients').length;

  const handleOpenScannerForSpecificItem = (item: StockItem) => {
    setPreselectedItem(item);
    setScannerOpen(true);
  };

  const handleOpenGeneralScanner = () => {
    setPreselectedItem(null);
    setScannerOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400" />
            Stock & Inventory Telemetry
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Roasted coffee bags, craft syrups, fresh milks, cups, and cleaning chemicals with QR camera tracking
          </p>
        </div>

        {/* Action Controls & Total Valuation */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setQrTagsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 rounded-xl transition-colors"
            title="Generate & print physical QR tags for bags and bottles"
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            <span>QR Shelf Tags</span>
          </button>

          <button
            onClick={handleOpenGeneralScanner}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-xl transition-all shadow-md shadow-amber-400/10"
            title="Scan coffee bags or syrups using device camera"
          >
            <Camera className="w-4 h-4" />
            <span>Scan QR / Barcode</span>
          </button>

          <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-3.5 py-2 rounded-xl text-xs font-mono">
            <span className="text-neutral-400">Total Valuation:</span>
            <span className="text-sm font-bold text-emerald-400">
              KSh {Math.round(totalStockValuationKSh).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Summary Pill Bar for Coffee & Syrups */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-neutral-400 uppercase font-mono">Coffee Origins</div>
            <div className="text-sm font-bold text-neutral-100 mt-0.5">{coffeeCount} Profiles Active</div>
          </div>
          <div className="p-2 rounded-lg bg-amber-400/10 text-amber-400">
            <Coffee className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-neutral-400 uppercase font-mono">Craft Syrups</div>
            <div className="text-sm font-bold text-neutral-100 mt-0.5">{syrupCount} Flavors On Bar</div>
          </div>
          <div className="p-2 rounded-lg bg-purple-400/10 text-purple-400">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-neutral-400 uppercase font-mono">QR Tracked Items</div>
            <div className="text-sm font-bold text-emerald-400 mt-0.5">{stock.length} Barcoded SKUs</div>
          </div>
          <div className="p-2 rounded-lg bg-emerald-400/10 text-emerald-400">
            <Tag className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-neutral-400 uppercase font-mono">Low Stock Alert</div>
            <div className={`text-sm font-bold mt-0.5 ${lowStockItems.length > 0 ? 'text-amber-400' : 'text-neutral-400'}`}>
              {lowStockItems.length} Needs Attention
            </div>
          </div>
          <div className={`p-2 rounded-lg ${lowStockItems.length > 0 ? 'bg-amber-400/10 text-amber-400' : 'bg-neutral-800 text-neutral-500'}`}>
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Low Stock Warning Banner */}
      {lowStockItems.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-amber-300">
                {lowStockItems.length} Critical Items Below Safety Threshold
              </div>
              <p className="text-xs text-neutral-300 mt-0.5">
                {lowStockItems.map(i => `${i.name} (${i.currentStock} ${i.unit})`).join(', ')} require prompt replenishment to avoid bar disruption.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-neutral-900/60 p-3 rounded-xl border border-neutral-800 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedCategory === cat 
                  ? 'bg-amber-400 text-neutral-950 font-semibold' 
                  : 'bg-neutral-950 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
              }`}
            >
              {cat === 'all' ? 'All Inventory' : cat}
            </button>
          ))}
        </div>

        <div className="relative sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-500" />
          <input
            type="text"
            placeholder="Search beans, syrup, SKU..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-neutral-200 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Stock Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStock.map(item => {
          const isLow = item.currentStock <= item.minThreshold;
          const daysRemaining = item.dailyBurnRate > 0 ? (item.currentStock / item.dailyBurnRate).toFixed(1) : '∞';
          const isCoffee = item.category === 'Roasted Coffee';
          const isSyrup = item.category === 'Syrups & Ingredients';

          return (
            <div 
              key={item.id}
              className={`p-5 rounded-2xl bg-neutral-900 border flex flex-col justify-between transition-all ${
                isLow ? 'border-amber-500/40' : 'border-neutral-800'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-mono uppercase font-bold px-1.5 py-0.2 rounded ${
                        isCoffee ? 'bg-amber-950 text-amber-300' :
                        isSyrup ? 'bg-purple-950 text-purple-300' :
                        'text-neutral-500 bg-neutral-950'
                      }`}>
                        {item.category}
                      </span>
                      {item.sku && (
                        <span className="text-[10px] font-mono text-neutral-500">
                          {item.sku}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-sm text-neutral-100 mt-1">{item.name}</h3>
                    {item.packageType && (
                      <p className="text-[11px] text-neutral-400 mt-0.5">{item.packageType}</p>
                    )}
                  </div>

                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold shrink-0 ${
                    isLow ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-emerald-950 text-emerald-300'
                  }`}>
                    {isLow ? 'LOW STOCK' : 'IN STOCK'}
                  </span>
                </div>

                {/* Big Stock Metric & Incrementer */}
                <div className="mt-4 p-3 bg-neutral-950 rounded-xl border border-neutral-800/80 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-neutral-500 uppercase font-mono">Current Quantity</div>
                    <div className="text-xl font-bold font-mono text-neutral-100 mt-0.5">
                      {item.currentStock} <span className="text-xs text-neutral-400 font-sans">{item.unit}</span>
                    </div>
                  </div>

                  {/* Manual Quick Adjust & QR Scan CTA */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenScannerForSpecificItem(item)}
                      className="p-1.5 bg-neutral-900 hover:bg-neutral-800 rounded-lg text-amber-400 border border-neutral-800 transition-colors"
                      title="Quick QR / Camera Log for this item"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-lg border border-neutral-800">
                      <button
                        onClick={() => updateStockQuantity(item.id, item.currentStock - 1)}
                        className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-neutral-100"
                        title="Consume 1 unit"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => updateStockQuantity(item.id, item.currentStock + 1)}
                        className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-neutral-100"
                        title="Add 1 unit"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Stock Telemetry */}
                <div className="mt-3 space-y-1.5 text-xs text-neutral-400">
                  <div className="flex items-center justify-between">
                    <span>Threshold Limit:</span>
                    <span className="font-mono text-neutral-300">{item.minThreshold} {item.unit}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Daily Burn Rate:</span>
                    <span className="font-mono text-neutral-300">~{item.dailyBurnRate} {item.unit}/day</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Est. Run-Out In:</span>
                    <span className={`font-mono font-bold ${isLow ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {daysRemaining} Days
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-neutral-800/60">
                    <span>Unit Valuation:</span>
                    <span className="font-mono text-neutral-200">KSh {item.costPerUnitKSh.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Restock & Barcode CTA */}
              <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between">
                <span className="text-[11px] text-neutral-500 truncate max-w-[130px]">
                  {item.supplier}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenScannerForSpecificItem(item)}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
                    title="Camera QR Log"
                  >
                    <QrCode className="w-3.5 h-3.5 text-amber-400" />
                    <span>Scan</span>
                  </button>

                  <button
                    onClick={() => setRestockItemTarget(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Restock</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual Restock Modal */}
      {restockItemTarget && (
        <RestockModal
          isOpen={!!restockItemTarget}
          onClose={() => setRestockItemTarget(null)}
          item={restockItemTarget}
          onRestock={restockItem}
        />
      )}

      {/* Live Device Camera QR Scanner Modal */}
      <InventoryQRScannerModal
        isOpen={scannerOpen}
        onClose={() => {
          setScannerOpen(false);
          setPreselectedItem(null);
        }}
        preselectedItem={preselectedItem}
      />

      {/* Physical Shelf QR Tags Generator & Print Modal */}
      <PrintableQRCodesModal
        isOpen={qrTagsModalOpen}
        onClose={() => setQrTagsModalOpen(false)}
        items={stock}
        onSelectForSimulatedScan={(item) => {
          setPreselectedItem(item);
          setScannerOpen(true);
        }}
      />
    </div>
  );
};
