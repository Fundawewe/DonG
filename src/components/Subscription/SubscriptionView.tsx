import React, { useState } from 'react';
import { useBaristaOS } from '../../context/BaristaOSContext';
import { SubscriptionModal } from './SubscriptionModal';
import { 
  CreditCard, 
  ShieldCheck, 
  Check, 
  Sparkles, 
  Building, 
  FileText, 
  Download, 
  HelpCircle,
  ArrowRight
} from 'lucide-react';

export const SubscriptionView: React.FC = () => {
  const { currentTier, activeBranch, subscriptionTiers, billingCycle } = useBaristaOS();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-400" />
            Café Licenses & Subscriptions
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Tiered monthly café operating system licenses (KSh 1,500 – 5,000 / month)
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors self-start sm:self-auto shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Change / Upgrade License</span>
        </button>
      </div>

      {/* Active License Details Card */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-mono text-amber-400 uppercase tracking-wider">
              ACTIVE PRODUCTION LICENSE
            </div>
            <h2 className="text-xl font-bold text-neutral-100 mt-1">
              {currentTier.name} License
            </h2>
            <div className="text-xs text-neutral-400 mt-1 flex items-center gap-2">
              <Building className="w-3.5 h-3.5" />
              <span>Assigned Location: <strong>{activeBranch.name}</strong></span>
              <span>· {activeBranch.location}</span>
            </div>
          </div>

          <div className="text-left sm:text-right font-mono">
            <div className="text-xs text-neutral-500 uppercase">MONTHLY INVESTMENT</div>
            <div className="text-2xl font-bold text-emerald-400">
              KSh {currentTier.priceMonthlyKSh.toLocaleString()}
              <span className="text-xs text-neutral-400 font-sans font-normal"> / month</span>
            </div>
            <div className="text-[11px] text-neutral-400 mt-0.5 font-sans">
              Status: <span className="text-emerald-400 font-medium">Active (Autopay M-Pesa / Card)</span>
            </div>
          </div>
        </div>

        {/* Key code & branch quota */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-neutral-950 p-4 rounded-xl border border-neutral-800 text-xs">
          <div>
            <div className="text-neutral-500 font-mono text-[10px] uppercase">LICENSE KEY</div>
            <div className="font-mono font-bold text-neutral-200 mt-0.5">{activeBranch.licenseKey}</div>
          </div>
          <div>
            <div className="text-neutral-500 font-mono text-[10px] uppercase">INCLUDED LOCATIONS</div>
            <div className="font-medium text-neutral-200 mt-0.5">{currentTier.caféLicensesCount}</div>
          </div>
          <div>
            <div className="text-neutral-500 font-mono text-[10px] uppercase">STAFF BARISTAS</div>
            <div className="font-medium text-neutral-200 mt-0.5">{currentTier.baristasAllowed}</div>
          </div>
        </div>
      </div>

      {/* Tier Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {subscriptionTiers.map(tier => {
          const isSelected = tier.id === currentTier.id;

          return (
            <div
              key={tier.id}
              className={`p-5 rounded-2xl bg-neutral-900 border flex flex-col justify-between transition-all ${
                isSelected 
                  ? 'border-amber-400 shadow-md shadow-amber-400/5' 
                  : 'border-neutral-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-neutral-400">{tier.audience}</span>
                  {isSelected && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono border border-emerald-800">
                      CURRENT
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-base text-neutral-100 mt-1">{tier.name}</h3>
                <p className="text-xs text-neutral-400 mt-1">{tier.description}</p>

                <div className="mt-4 pt-3 border-t border-neutral-800/80">
                  <div className="text-2xl font-bold font-mono text-neutral-100">
                    KSh {tier.priceMonthlyKSh.toLocaleString()}
                    <span className="text-xs text-neutral-500 font-sans font-normal"> /mo</span>
                  </div>
                </div>

                <ul className="mt-4 space-y-1.5 text-xs text-neutral-300">
                  {tier.features.slice(0, 5).map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 pt-3 border-t border-neutral-800">
                <button
                  onClick={() => setModalOpen(true)}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    isSelected 
                      ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200' 
                      : 'bg-amber-400 hover:bg-amber-300 text-neutral-950'
                  }`}
                >
                  <span>{isSelected ? 'Manage Plan' : 'Select Plan'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Billing Invoices & Receipts History */}
      <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
        <h3 className="font-bold text-sm text-neutral-100 flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-400" />
          Billing History & VAT Invoices
        </h3>

        <div className="divide-y divide-neutral-800 text-xs">
          <div className="py-3 flex items-center justify-between">
            <div>
              <div className="font-semibold text-neutral-200">Invoice #BOS-2026-0901</div>
              <div className="text-neutral-500 text-[11px]">Paid via M-Pesa STK (0712•••678) · Sep 01, 2026</div>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-mono font-bold text-neutral-100">KSh 3,200</span>
              <span className="text-emerald-400 text-[11px] font-mono">PAID</span>
            </div>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <div className="font-semibold text-neutral-200">Invoice #BOS-2026-0801</div>
              <div className="text-neutral-500 text-[11px]">Paid via M-Pesa STK (0712•••678) · Aug 01, 2026</div>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-mono font-bold text-neutral-100">KSh 3,200</span>
              <span className="text-emerald-400 text-[11px] font-mono">PAID</span>
            </div>
          </div>
        </div>
      </div>

      <SubscriptionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};
