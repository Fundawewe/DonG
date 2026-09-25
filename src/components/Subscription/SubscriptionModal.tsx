import React, { useState } from 'react';
import { useBaristaOS } from '../../context/BaristaOSContext';
import { SubscriptionTier } from '../../types';
import { 
  X, 
  Check, 
  ShieldCheck, 
  CreditCard, 
  Smartphone, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Flame,
  Building
} from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
  const { 
    subscriptionTiers, 
    currentTier, 
    billingCycle, 
    setBillingCycle, 
    upgradeSubscription,
    activeBranch 
  } = useBaristaOS();

  const [selectedTierId, setSelectedTierId] = useState<string>(currentTier.id);
  const [paymentStep, setPaymentStep] = useState<'tiers' | 'checkout' | 'success'>('tiers');
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card'>('mpesa');
  const [mpesaPhone, setMpesaPhone] = useState<string>('0712 345 678');
  const [cardNumber, setCardNumber] = useState<string>('4242 •••• •••• 4242');
  const [processing, setProcessing] = useState<boolean>(false);

  if (!isOpen) return null;

  const chosenTier = subscriptionTiers.find(t => t.id === selectedTierId) || currentTier;
  const price = billingCycle === 'monthly' ? chosenTier.priceMonthlyKSh : chosenTier.priceAnnualMonthlyKSh;

  const handleProceedToCheckout = (tier: SubscriptionTier) => {
    setSelectedTierId(tier.id);
    setPaymentStep('checkout');
  };

  const handleSimulatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setTimeout(() => {
      upgradeSubscription(selectedTierId, paymentMethod, paymentMethod === 'mpesa' ? mpesaPhone : cardNumber);
      setProcessing(false);
      setPaymentStep('success');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-4xl my-8 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-neutral-100">
                Barista OS Café Licenses & Subscriptions
              </h2>
              <p className="text-xs text-neutral-400">
                Operating licenses for cafés, coffee roasters, and barista teams in Kenya
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {paymentStep === 'tiers' ? (
          <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Active License Details Badge */}
            <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <div className="text-neutral-400">Current License Assigned to:</div>
                <div className="text-sm font-bold text-neutral-100">{activeBranch.name}</div>
                <div className="text-[11px] font-mono text-amber-400">Key: {activeBranch.licenseKey}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-medium">
                  {activeBranch.licenseTier} · Valid through {activeBranch.licenseExpiry}
                </span>
              </div>
            </div>

            {/* Monthly vs Annual Toggle */}
            <div className="flex justify-center">
              <div className="bg-neutral-950 p-1 rounded-xl border border-neutral-800 flex items-center gap-1 text-xs">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    billingCycle === 'monthly' ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  Monthly Billing
                </button>
                <button
                  onClick={() => setBillingCycle('annual')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                    billingCycle === 'annual' ? 'bg-amber-400 text-neutral-950 font-semibold' : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <span>Annual Billing</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono">
                    Save 18%
                  </span>
                </button>
              </div>
            </div>

            {/* Pricing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {subscriptionTiers.map(tier => {
                const isCurrent = tier.id === currentTier.id;
                const monthlyPrice = billingCycle === 'monthly' ? tier.priceMonthlyKSh : tier.priceAnnualMonthlyKSh;

                return (
                  <div
                    key={tier.id}
                    className={`p-6 rounded-2xl bg-neutral-950 border flex flex-col justify-between transition-all ${
                      tier.highlighted 
                        ? 'border-amber-400 shadow-xl shadow-amber-400/5 relative' 
                        : isCurrent 
                        ? 'border-emerald-500/50' 
                        : 'border-neutral-800'
                    }`}
                  >
                    {tier.highlighted && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-neutral-950 text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                        Most Popular for Cafés
                      </div>
                    )}

                    <div>
                      <div className="text-xs font-mono text-neutral-400">{tier.audience}</div>
                      <h3 className="text-lg font-bold text-neutral-100 mt-1">{tier.name}</h3>
                      <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{tier.description}</p>

                      <div className="mt-4 pt-4 border-t border-neutral-800">
                        <div className="flex items-baseline gap-1">
                          <span className="text-xs text-neutral-400 font-mono">KSh</span>
                          <span className="text-3xl font-bold font-mono text-neutral-100">
                            {monthlyPrice.toLocaleString()}
                          </span>
                          <span className="text-xs text-neutral-400">/mo</span>
                        </div>
                        <div className="text-[11px] text-neutral-500 mt-0.5">
                          {tier.caféLicensesCount} · {tier.baristasAllowed}
                        </div>
                      </div>

                      {/* Feature checkmarks */}
                      <ul className="mt-5 space-y-2 text-xs text-neutral-300">
                        {tier.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2 leading-tight">
                            <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-6 pt-4 border-t border-neutral-800">
                      <button
                        onClick={() => handleProceedToCheckout(tier)}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                          tier.highlighted 
                            ? 'bg-amber-400 hover:bg-amber-300 text-neutral-950 shadow-md' 
                            : isCurrent 
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                            : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                        }`}
                      >
                        <span>{isCurrent ? 'Current Plan (Renew / Manage)' : `Switch to ${tier.name}`}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : paymentStep === 'checkout' ? (
          /* Step 2: Instant M-Pesa / Card Checkout */
          <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div>
                <span className="text-xs text-neutral-400 font-mono">SELECTED TIER</span>
                <h3 className="text-lg font-bold text-neutral-100">{chosenTier.name} License</h3>
                <p className="text-xs text-neutral-400">For {activeBranch.name}</p>
              </div>

              <div className="text-right">
                <span className="text-xs text-neutral-400 font-mono">BILLING AMOUNT</span>
                <div className="text-2xl font-bold font-mono text-emerald-400">
                  KSh {price.toLocaleString()}
                  <span className="text-xs text-neutral-400 font-normal"> / month</span>
                </div>
              </div>
            </div>

            {/* Payment Method Switcher */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-2">
                Select Payment Channel (Kenya)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('mpesa')}
                  className={`p-4 rounded-xl border flex items-center gap-3 transition-colors ${
                    paymentMethod === 'mpesa' 
                      ? 'bg-emerald-950/20 border-emerald-500 text-emerald-300' 
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-emerald-400" />
                  <div className="text-left">
                    <div className="font-bold text-xs">M-Pesa STK Push</div>
                    <div className="text-[10px] text-neutral-400">Safaricom Instant Prompt</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-xl border flex items-center gap-3 transition-colors ${
                    paymentMethod === 'card' 
                      ? 'bg-amber-500/10 border-amber-400 text-amber-300' 
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-amber-400" />
                  <div className="text-left">
                    <div className="font-bold text-xs">Visa / Mastercard</div>
                    <div className="text-[10px] text-neutral-400">Corporate & Debit Cards</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Input Details */}
            <form onSubmit={handleSimulatePayment} className="space-y-4 text-xs">
              {paymentMethod === 'mpesa' ? (
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">
                    M-Pesa Registered Mobile Number
                  </label>
                  <input
                    type="text"
                    required
                    value={mpesaPhone}
                    onChange={e => setMpesaPhone(e.target.value)}
                    placeholder="0712 345 678"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 font-mono text-sm text-neutral-100 focus:outline-none focus:border-emerald-400"
                  />
                  <p className="text-[11px] text-neutral-500 mt-1">
                    An instant STK PIN prompt will be sent directly to your handset.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">Card Number</label>
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 font-mono text-sm text-neutral-100 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-neutral-400 mb-1">Expiry MM/YY</label>
                      <input
                        type="text"
                        defaultValue="12/28"
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 font-mono text-neutral-100"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-400 mb-1">CVV Security Code</label>
                      <input
                        type="password"
                        defaultValue="894"
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 font-mono text-neutral-100"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 flex items-center justify-between border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setPaymentStep('tiers')}
                  className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-neutral-200"
                >
                  Back to Plans
                </button>

                <button
                  type="submit"
                  disabled={processing}
                  className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded-xl transition-colors shadow"
                >
                  {processing ? (
                    <span>Verifying with Safaricom / Bank...</span>
                  ) : (
                    <>
                      <span>Authorize Payment of KSh {price.toLocaleString()}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Step 3: Success & Activated License Key */
          <div className="p-8 sm:p-12 text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>

            <div>
              <div className="text-xs uppercase font-mono text-neutral-400 tracking-wider">
                TRANSACTION CONFIRMED
              </div>
              <h3 className="text-2xl font-bold text-neutral-100 mt-1">
                {chosenTier.name} License Activated!
              </h3>
              <p className="text-xs text-neutral-300 max-w-md mx-auto mt-2">
                Your café branch ({activeBranch.name}) is now fully unlocked with premium TDS/EY refractometry, equipment burr alerts, and certification exams.
              </p>
            </div>

            <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 max-w-sm mx-auto font-mono text-xs">
              <div className="text-[10px] text-neutral-500 uppercase">Licensed Key Code</div>
              <div className="text-base font-bold text-amber-300 mt-0.5">{activeBranch.licenseKey}</div>
              <div className="text-[10px] text-emerald-400 mt-1">Subscription Active until Dec 31, 2027</div>
            </div>

            <div className="pt-2">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-100 rounded-xl transition-colors"
              >
                Back to Barista Station
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
