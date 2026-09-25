import React, { useEffect, useState } from 'react';
import { StockItem } from '../../types';
import QRCode from 'qrcode';
import { 
  X, 
  Printer, 
  Download, 
  QrCode, 
  Coffee, 
  Sparkles, 
  Tag, 
  CheckCircle2, 
  Search,
  ExternalLink
} from 'lucide-react';

interface PrintableQRCodesModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: StockItem[];
  onSelectForSimulatedScan?: (item: StockItem) => void;
}

interface ItemWithQrImage {
  item: StockItem;
  qrDataUrl: string;
}

export const PrintableQRCodesModal: React.FC<PrintableQRCodesModalProps> = ({
  isOpen,
  onClose,
  items,
  onSelectForSimulatedScan
}) => {
  const [filterCat, setFilterCat] = useState<'all' | 'coffee' | 'syrup'>('all');
  const [search, setSearch] = useState<string>('');
  const [qrItems, setQrItems] = useState<ItemWithQrImage[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Generate QR data URLs
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const generateAll = async () => {
      const results: ItemWithQrImage[] = [];
      for (const item of items) {
        const payload = JSON.stringify({
          app: 'BaristaOS',
          type: 'inventory-stock',
          id: item.id,
          sku: item.sku || item.id,
          name: item.name,
          category: item.category
        });

        try {
          const url = await QRCode.toDataURL(payload, {
            errorCorrectionLevel: 'M',
            margin: 1,
            width: 240,
            color: {
              dark: '#171717',
              light: '#ffffff'
            }
          });
          results.push({ item, qrDataUrl: url });
        } catch (e) {
          console.error('Failed to generate QR for item', item.id, e);
        }
      }
      if (isMounted) {
        setQrItems(results);
      }
    };

    generateAll();
    return () => {
      isMounted = false;
    };
  }, [isOpen, items]);

  if (!isOpen) return null;

  const filtered = qrItems.filter(({ item }) => {
    const isCoffee = item.category === 'Roasted Coffee';
    const isSyrup = item.category === 'Syrups & Ingredients';

    if (filterCat === 'coffee' && !isCoffee) return false;
    if (filterCat === 'syrup' && !isSyrup) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        (item.sku && item.sku.toLowerCase().includes(q)) ||
        item.supplier.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadSingle = (qrDataUrl: string, itemName: string) => {
    const link = document.createElement('a');
    link.download = `QR_${itemName.replace(/\s+/g, '_')}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const copyPayload = (item: StockItem) => {
    const code = item.qrCode || item.sku || item.id;
    navigator.clipboard?.writeText(code);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                Coffee Bag & Syrup QR Codes
                <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30">
                  Physical Shelf Tags
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Scan with any camera or print tags for espresso hoppers, retail bags & syrup bottles
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl transition-colors"
              title="Print all tags"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Print Shelf Tags</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="p-4 border-b border-neutral-800/80 bg-neutral-900/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilterCat('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
                filterCat === 'all'
                  ? 'bg-amber-400 text-neutral-950 font-bold'
                  : 'bg-neutral-950 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
              }`}
            >
              All Labels ({qrItems.length})
            </button>
            <button
              onClick={() => setFilterCat('coffee')}
              className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
                filterCat === 'coffee'
                  ? 'bg-amber-400 text-neutral-950 font-bold'
                  : 'bg-neutral-950 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
              }`}
            >
              Coffee Bags Only
            </button>
            <button
              onClick={() => setFilterCat('syrup')}
              className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
                filterCat === 'syrup'
                  ? 'bg-amber-400 text-neutral-950 font-bold'
                  : 'bg-neutral-950 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
              }`}
            >
              Craft Syrups Only
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-500" />
            <input
              type="text"
              placeholder="Search labels by name, SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-neutral-200 text-xs focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Labels Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-neutral-500 text-xs">
              No QR tags matched your filter criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filtered.map(({ item, qrDataUrl }) => {
                const isCoffee = item.category === 'Roasted Coffee';
                const isSyrup = item.category === 'Syrups & Ingredients';

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col justify-between hover:border-neutral-700 transition-all shadow-sm group"
                  >
                    <div>
                      {/* Badge & Category */}
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold uppercase ${
                          isCoffee 
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                            : isSyrup
                            ? 'bg-purple-950/80 text-purple-300 border border-purple-800/60'
                            : 'bg-neutral-800 text-neutral-300'
                        }`}>
                          {item.category}
                        </span>

                        <span className="text-[10px] font-mono text-neutral-500">
                          {item.sku || item.id}
                        </span>
                      </div>

                      {/* Item Name */}
                      <h4 className="font-bold text-sm text-neutral-100 leading-tight">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        {item.packageType || item.unit} · Current: {item.currentStock} {item.unit}
                      </p>

                      {/* White QR Code Sticker Box */}
                      <div className="mt-3 bg-white p-2.5 rounded-xl border border-neutral-300 flex items-center justify-center shadow-inner">
                        {qrDataUrl ? (
                          <img
                            src={qrDataUrl}
                            alt={`QR for ${item.name}`}
                            className="w-36 h-36 object-contain"
                          />
                        ) : (
                          <div className="w-36 h-36 flex items-center justify-center text-neutral-400 text-xs">
                            Generating...
                          </div>
                        )}
                      </div>

                      <div className="mt-2 text-center">
                        <span className="text-[10px] font-mono text-neutral-500">
                          Payload: {item.qrCode || item.sku || item.id}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="mt-3 pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-2 text-xs">
                      {onSelectForSimulatedScan && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectForSimulatedScan(item);
                            onClose();
                          }}
                          className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Simulate Scan</span>
                        </button>
                      )}

                      <div className="flex items-center gap-2 ml-auto">
                        <button
                          type="button"
                          onClick={() => copyPayload(item)}
                          className="text-[11px] text-neutral-400 hover:text-neutral-200 transition-colors"
                          title="Copy Code"
                        >
                          {copiedId === item.id ? (
                            <span className="text-emerald-400 flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" /> Copied
                            </span>
                          ) : (
                            'Copy ID'
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDownloadSingle(qrDataUrl, item.name)}
                          className="p-1 text-neutral-400 hover:text-neutral-100 rounded hover:bg-neutral-800 transition-colors"
                          title="Download PNG sticker"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950/70 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-amber-400" />
            <span>Labels adhere to Barista OS Inventory QR 2.0 Specification</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium rounded-lg text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
