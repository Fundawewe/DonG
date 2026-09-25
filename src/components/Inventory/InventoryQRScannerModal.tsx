import React, { useEffect, useRef, useState, useCallback } from 'react';
import jsQR from 'jsqr';
import { useBaristaOS } from '../../context/BaristaOSContext';
import { StockItem } from '../../types';
import { playScanBeep } from '../../utils/audioFeedback';
import { 
  Camera, 
  X, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Minus, 
  Upload, 
  Sparkles, 
  Zap, 
  ZapOff,
  Package,
  Coffee,
  Check,
  Search,
  ArrowRight,
  RotateCcw
} from 'lucide-react';

interface InventoryQRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedItem?: StockItem | null;
}

type ScanStatus = 'idle' | 'requesting' | 'scanning' | 'detected' | 'error' | 'permission-denied';
type UpdateAction = 'consume' | 'restock' | 'set-exact';

export const InventoryQRScannerModal: React.FC<InventoryQRScannerModalProps> = ({
  isOpen,
  onClose,
  preselectedItem
}) => {
  const { stock, updateStockQuantity, restockItem } = useBaristaOS();

  // Camera & Scanning States
  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [rawScannedData, setRawScannedData] = useState<string>('');

  // Matched Item & Update State
  const [matchedItem, setMatchedItem] = useState<StockItem | null>(null);
  const [unrecognizedCode, setUnrecognizedCode] = useState<string | null>(null);
  const [updateAction, setUpdateAction] = useState<UpdateAction>('consume');
  const [deltaQuantity, setDeltaQuantity] = useState<number>(1);
  const [exactQuantity, setExactQuantity] = useState<number>(0);
  const [actionReason, setActionReason] = useState<string>('Opened on active espresso bar');
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // References
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize or handle preselected item
  useEffect(() => {
    if (preselectedItem) {
      setMatchedItem(preselectedItem);
      setExactQuantity(preselectedItem.currentStock);
      setDeltaQuantity(1);
      setScanStatus('detected');
    }
  }, [preselectedItem]);

  // Clean stop for camera stream
  const stopCamera = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Match scanned text to stock item
  const resolveStockItem = useCallback((scannedText: string): StockItem | null => {
    const text = scannedText.trim();
    if (!text) return null;

    // 1. Try JSON parsing
    try {
      if (text.startsWith('{') && text.endsWith('}')) {
        const parsed = JSON.parse(text);
        if (parsed.id) {
          const item = stock.find(s => s.id === parsed.id);
          if (item) return item;
        }
        if (parsed.sku) {
          const item = stock.find(s => s.sku?.toLowerCase() === parsed.sku.toLowerCase());
          if (item) return item;
        }
      }
    } catch {
      // not JSON, proceed
    }

    // 2. Exact or partial match with ID, QR Code, SKU, Barcode
    const lower = text.toLowerCase();
    const directMatch = stock.find(s => 
      s.id.toLowerCase() === lower ||
      s.qrCode?.toLowerCase() === lower ||
      s.sku?.toLowerCase() === lower ||
      s.barcodeNumber === text
    );
    if (directMatch) return directMatch;

    // 3. Match if string contains product ID or SKU
    const subMatch = stock.find(s => 
      lower.includes(s.id.toLowerCase()) || 
      (s.sku && lower.includes(s.sku.toLowerCase())) ||
      (s.qrCode && lower.includes(s.qrCode.toLowerCase()))
    );
    if (subMatch) return subMatch;

    // 4. Fuzzy match against item name keywords (e.g. "vanilla", "nyeri", "caramel", "house")
    const words = lower.split(/[-_\s/]+/).filter(w => w.length > 3);
    for (const word of words) {
      const nameMatch = stock.find(s => s.name.toLowerCase().includes(word));
      if (nameMatch) return nameMatch;
    }

    return null;
  }, [stock]);

  // Handle successful detection
  const handleQrDetected = useCallback((data: string) => {
    playScanBeep(true);
    navigator.vibrate?.([60, 40, 60]);

    setRawScannedData(data);
    const item = resolveStockItem(data);

    if (item) {
      setMatchedItem(item);
      setExactQuantity(item.currentStock);
      setDeltaQuantity(1);
      setUnrecognizedCode(null);
      setScanStatus('detected');
      stopCamera();
    } else {
      setUnrecognizedCode(data);
      playScanBeep(false);
    }
  }, [resolveStockItem, stopCamera]);

  // Scan frame loop using jsQR
  const scanFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationFrameId.current = requestAnimationFrame(scanFrame);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      });

      if (code && code.data) {
        handleQrDetected(code.data);
        return; // stop scanning loop on hit
      }
    }

    animationFrameId.current = requestAnimationFrame(scanFrame);
  }, [handleQrDetected]);

  // Start camera stream
  const startCamera = useCallback(async () => {
    stopCamera();
    setScanStatus('requesting');
    setErrorMessage('');
    setUnrecognizedCode(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access API is not supported in this browser environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      streamRef.current = stream;

      // Check torch capability
      const videoTrack = stream.getVideoTracks()[0];
      const capabilities = (videoTrack.getCapabilities ? videoTrack.getCapabilities() : {}) as any;
      setHasTorch(Boolean(capabilities.torch));

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setScanStatus('scanning');
        animationFrameId.current = requestAnimationFrame(scanFrame);
      }
    } catch (err: any) {
      console.warn('Camera initiation failed:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setScanStatus('permission-denied');
        setErrorMessage('Camera permission was denied. Please allow camera permissions or upload an image.');
      } else {
        setScanStatus('error');
        setErrorMessage(err.message || 'Unable to initialize device video camera.');
      }
    }
  }, [facingMode, scanFrame, stopCamera]);

  // Manage start/stop on modal open/close
  useEffect(() => {
    if (isOpen && !matchedItem) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, matchedItem, startCamera, stopCamera]);

  // Torch toggle
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const videoTrack = streamRef.current.getVideoTracks()[0];
    try {
      const nextTorch = !torchOn;
      await (videoTrack as any).applyConstraints({
        advanced: [{ torch: nextTorch }]
      });
      setTorchOn(nextTorch);
    } catch (e) {
      console.error('Torch error:', e);
    }
  };

  // Flip camera
  const toggleCameraFacing = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  // File upload scan fallback
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imgData.data, imgData.width, imgData.height);
          if (code && code.data) {
            handleQrDetected(code.data);
          } else {
            setErrorMessage('No valid QR code or barcode found in the uploaded image.');
            playScanBeep(false);
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Quick Simulator Scan for bar testing
  const handleSimulateScan = (item: StockItem) => {
    handleQrDetected(item.qrCode || item.sku || item.id);
  };

  // Confirm stock update
  const handleApplyUpdate = (scanNext = false) => {
    if (!matchedItem) return;

    let newStockLevel = matchedItem.currentStock;

    if (updateAction === 'consume') {
      newStockLevel = Math.max(0, Number((matchedItem.currentStock - deltaQuantity).toFixed(1)));
      updateStockQuantity(matchedItem.id, newStockLevel);
    } else if (updateAction === 'restock') {
      newStockLevel = Number((matchedItem.currentStock + deltaQuantity).toFixed(1));
      restockItem(matchedItem.id, deltaQuantity, deltaQuantity * matchedItem.costPerUnitKSh);
    } else if (updateAction === 'set-exact') {
      newStockLevel = Math.max(0, Number(exactQuantity.toFixed(1)));
      updateStockQuantity(matchedItem.id, newStockLevel);
    }

    setSaveToast(`Updated ${matchedItem.name}: now ${newStockLevel} ${matchedItem.unit}`);

    if (scanNext) {
      setTimeout(() => {
        setSaveToast(null);
        setMatchedItem(null);
        setRawScannedData('');
        setUnrecognizedCode(null);
        startCamera();
      }, 700);
    } else {
      setTimeout(() => {
        setSaveToast(null);
        onClose();
      }, 600);
    }
  };

  if (!isOpen) return null;

  // Calculated Preview
  let projectedStock = matchedItem ? matchedItem.currentStock : 0;
  if (matchedItem) {
    if (updateAction === 'consume') {
      projectedStock = Math.max(0, Number((matchedItem.currentStock - deltaQuantity).toFixed(1)));
    } else if (updateAction === 'restock') {
      projectedStock = Number((matchedItem.currentStock + deltaQuantity).toFixed(1));
    } else if (updateAction === 'set-exact') {
      projectedStock = Math.max(0, Number(exactQuantity.toFixed(1)));
    }
  }

  const isLowProjected = matchedItem && projectedStock <= matchedItem.minThreshold;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="px-5 py-3.5 border-b border-neutral-800 bg-neutral-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                Barcode & QR Inventory Scanner
                {matchedItem && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Product Identified
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-neutral-400">
                Point camera at coffee valve bag or syrup bottle to log consumption & deliveries
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {saveToast && (
            <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold">{saveToast}</span>
            </div>
          )}

          {/* VIEW A: CAMERA SCANNER (When no item matched yet) */}
          {!matchedItem ? (
            <div className="space-y-4">
              {/* Viewfinder Window */}
              <div className="relative aspect-[4/3] sm:aspect-video rounded-2xl overflow-hidden bg-black border border-neutral-800 flex items-center justify-center">
                {/* Live Video Feed */}
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Overlaid Viewfinder Target Reticle */}
                {scanStatus === 'scanning' && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    {/* Darkened corner mask */}
                    <div className="relative w-56 h-56 sm:w-64 sm:h-64 border-2 border-amber-400/80 rounded-2xl shadow-[0_0_20px_rgba(251,191,36,0.3)]">
                      {/* Laser scanner animated sweep line */}
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-amber-400 shadow-[0_0_8px_#fbbf24] animate-pulse transition-all duration-700" 
                           style={{ animation: 'bounce 2s infinite ease-in-out' }} />

                      {/* Targeting Corner Brackets */}
                      <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-amber-400 rounded-tl" />
                      <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-amber-400 rounded-tr" />
                      <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-amber-400 rounded-bl" />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-amber-400 rounded-br" />

                      <div className="absolute -bottom-7 inset-x-0 text-center">
                        <span className="px-2 py-0.5 rounded bg-black/75 text-[10px] font-mono text-amber-300">
                          Align QR code inside box
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Status Overlays */}
                {scanStatus === 'requesting' && (
                  <div className="absolute inset-0 bg-neutral-950/90 flex flex-col items-center justify-center text-center p-4">
                    <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mb-2" />
                    <p className="text-xs text-neutral-200 font-semibold">Initializing Camera Feed...</p>
                    <p className="text-[11px] text-neutral-400 mt-1">Please accept camera permissions if prompted</p>
                  </div>
                )}

                {(scanStatus === 'permission-denied' || scanStatus === 'error') && (
                  <div className="absolute inset-0 bg-neutral-950/95 flex flex-col items-center justify-center text-center p-6 space-y-3">
                    <div className="p-3 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
                      <AlertTriangle className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-neutral-100">Camera Unavailable</h3>
                      <p className="text-[11px] text-neutral-400 mt-1 max-w-xs">{errorMessage}</p>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={startCamera}
                        className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs rounded-xl font-medium flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Retry Camera
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs rounded-xl font-bold flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" /> Upload QR Image
                      </button>
                    </div>
                  </div>
                )}

                {/* Top Camera Controls Overlay */}
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  {hasTorch && (
                    <button
                      onClick={toggleTorch}
                      className={`p-2 rounded-xl backdrop-blur-md transition-colors ${
                        torchOn ? 'bg-amber-400 text-neutral-950' : 'bg-black/60 text-neutral-300 hover:bg-black/80'
                      }`}
                      title={torchOn ? 'Turn off flashlight' : 'Turn on flashlight'}
                    >
                      {torchOn ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
                    </button>
                  )}

                  <button
                    onClick={toggleCameraFacing}
                    className="p-2 rounded-xl bg-black/60 backdrop-blur-md text-neutral-300 hover:bg-black/80 hover:text-white transition-colors"
                    title="Flip Camera (Front/Back)"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Unrecognized scan error pill */}
              {unrecognizedCode && (
                <div className="p-3 rounded-xl bg-amber-950/80 border border-amber-800 text-xs text-amber-200 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-bold">Unrecognized Tag:</span>
                    <span className="font-mono ml-1 text-neutral-300 truncate block">{unrecognizedCode}</span>
                    <p className="text-[10px] text-neutral-400 mt-0.5">
                      This QR code does not match any current stock SKU. Select an item manually below or test using the simulator.
                    </p>
                  </div>
                </div>
              )}

              {/* Upload & Manual Fallback Bar */}
              <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
                <span>Or scan from file:</span>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-200 text-xs transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>Choose Photo / QR File</span>
                </button>
              </div>

              {/* Quick Barista Simulator Chips */}
              <div className="pt-2 border-t border-neutral-800">
                <div className="flex items-center gap-1.5 mb-2 text-[11px] font-semibold text-neutral-400">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Quick Test Simulators (Tap to Simulate Scanner Hit):</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {stock.slice(0, 6).map(item => {
                    const isCoffee = item.category === 'Roasted Coffee';
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSimulateScan(item)}
                        className="p-2 rounded-xl bg-neutral-950 hover:bg-neutral-800/80 border border-neutral-800/80 text-left transition-all group"
                      >
                        <div className="text-[10px] font-mono text-amber-400/90 truncate">
                          {isCoffee ? '☕ Coffee' : '🍯 Syrup/Supply'}
                        </div>
                        <div className="text-xs font-bold text-neutral-200 truncate group-hover:text-amber-300">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-neutral-500 font-mono">
                          {item.currentStock} {item.unit}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* VIEW B: STOCK UPDATE STAGE (Item Successfully Matched!) */
            <div className="space-y-4">
              {/* Product Profile Card */}
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700/80 flex items-center justify-center text-amber-300 shrink-0">
                    {matchedItem.category === 'Roasted Coffee' ? (
                      <Coffee className="w-6 h-6" />
                    ) : (
                      <Package className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold bg-neutral-900 text-amber-400 border border-neutral-800">
                        {matchedItem.category}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-500">
                        SKU: {matchedItem.sku || matchedItem.id}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-neutral-100 mt-1">
                      {matchedItem.name}
                    </h3>
                    <p className="text-xs text-neutral-400">
                      {matchedItem.packageType || matchedItem.unit} · Supplier: {matchedItem.supplier}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMatchedItem(null);
                    setRawScannedData('');
                    startCamera();
                  }}
                  className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-200 bg-neutral-900 px-2 py-1 rounded-lg border border-neutral-800 transition-colors"
                  title="Rescan"
                >
                  <RotateCcw className="w-3 h-3 text-amber-400" />
                  <span>Rescan</span>
                </button>
              </div>

              {/* Action Mode Toggle */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-2">
                  Select Inventory Operation:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUpdateAction('consume');
                      setActionReason('Opened on active espresso bar');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                      updateAction === 'consume'
                        ? 'bg-amber-400 text-neutral-950 border-amber-400 shadow-md'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    Deduct / Open on Bar
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUpdateAction('restock');
                      setActionReason('Received restock shipment');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                      updateAction === 'restock'
                        ? 'bg-amber-400 text-neutral-950 border-amber-400 shadow-md'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    Add / Restock
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUpdateAction('set-exact');
                      setActionReason('Physical shelf count audit');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                      updateAction === 'set-exact'
                        ? 'bg-amber-400 text-neutral-950 border-amber-400 shadow-md'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    Set Exact Count
                  </button>
                </div>
              </div>

              {/* Quantity Adjustment Controls */}
              <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span>Current On-Hand Stock:</span>
                  <span className="font-mono text-base font-bold text-neutral-100">
                    {matchedItem.currentStock} {matchedItem.unit}
                  </span>
                </div>

                {updateAction !== 'set-exact' ? (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-neutral-300 font-medium">
                        {updateAction === 'consume' ? 'Quantity to Deduct:' : 'Quantity to Add:'}
                      </span>
                      <span className="text-sm font-bold font-mono text-amber-400">
                        {updateAction === 'consume' ? `-${deltaQuantity}` : `+${deltaQuantity}`} {matchedItem.unit}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setDeltaQuantity(prev => Math.max(1, prev - 1))}
                        className="p-2.5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-200 rounded-xl"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <input
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={deltaQuantity}
                        onChange={(e) => setDeltaQuantity(Math.max(0.5, parseFloat(e.target.value) || 1))}
                        className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl py-2 px-3 text-center font-mono font-bold text-base text-neutral-100 focus:outline-none focus:border-amber-400"
                      />

                      <button
                        type="button"
                        onClick={() => setDeltaQuantity(prev => prev + 1)}
                        className="p-2.5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-200 rounded-xl"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Quick Stepper Chips */}
                    <div className="flex items-center gap-1.5 mt-2.5">
                      {[1, 2, 5, 10].map(amt => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setDeltaQuantity(amt)}
                          className={`flex-1 py-1 text-xs font-mono font-medium rounded-lg border transition-colors ${
                            deltaQuantity === amt
                              ? 'bg-neutral-800 text-amber-300 border-amber-400/50'
                              : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                          }`}
                        >
                          {amt} {matchedItem.unit === 'kg' ? 'kg' : amt === 1 ? 'unit' : 'units'}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs text-neutral-300 font-medium mb-1.5">
                      Audited Exact Quantity ({matchedItem.unit}):
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={exactQuantity}
                      onChange={(e) => setExactQuantity(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-2 px-3 text-center font-mono font-bold text-base text-neutral-100 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                )}

                {/* Calculation Summary Bar */}
                <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Resulting Stock Level:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-neutral-400 line-through">
                      {matchedItem.currentStock} {matchedItem.unit}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
                    <span className={`font-mono font-bold text-sm ${isLowProjected ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {projectedStock} {matchedItem.unit}
                    </span>
                  </div>
                </div>

                {isLowProjected && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>Warning: Projected stock drops to/below minimum safety threshold ({matchedItem.minThreshold} {matchedItem.unit}).</span>
                  </div>
                )}
              </div>

              {/* Notes / Reason */}
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Inventory Log Reason / Station Note:
                </label>
                <input
                  type="text"
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="e.g. Unsealed for morning espresso hopper #1..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2 px-3 text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-5 py-3.5 border-t border-neutral-800 bg-neutral-950/80 flex items-center justify-between">
          <div className="text-[11px] text-neutral-500">
            {matchedItem ? (
              <span>Barista OS Inventory Sync</span>
            ) : (
              <span>Camera auto-detects standard QR labels</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              Cancel
            </button>

            {matchedItem && (
              <>
                <button
                  type="button"
                  onClick={() => handleApplyUpdate(true)}
                  className="px-3.5 py-2 text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl border border-neutral-700 transition-colors"
                >
                  Save & Scan Next
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyUpdate(false)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-xl transition-all shadow-md"
                >
                  <Check className="w-4 h-4" />
                  <span>Update Stock Level</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
