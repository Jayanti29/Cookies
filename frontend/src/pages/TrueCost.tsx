import React, { useState, useMemo } from 'react';
import { Calculator, ArrowRight, DollarSign, Info, ShieldCheck } from 'lucide-react';

export const TrueCost: React.FC = () => {
  const [basePrice, setBasePrice] = useState<number | ''>(499);
  const [platformFee, setPlatformFee] = useState<number | ''>(49);
  const [serviceFee, setServiceFee] = useState<number | ''>('');
  const [tax, setTax] = useState<number | ''>(98);
  const [setupFee, setSetupFee] = useState<number | ''>('');
  const [renewalFee, setRenewalFee] = useState<number | ''>(199);
  const [billingFrequency, setBillingFrequency] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');

  const calculations = useMemo(() => {
    const base = Number(basePrice) || 0;
    const platform = Number(platformFee) || 0;
    const service = Number(serviceFee) || 0;
    const taxAmt = Number(tax) || 0;
    const setup = Number(setupFee) || 0;
    const renewal = Number(renewalFee) || 0;

    // First payment = Base + Platform + Service + Tax + Setup
    const firstPayment = base + platform + service + taxAmt + setup;

    // Annual calculation based on frequency
    let recurringAnnual = 0;
    let monthlyEquivalent = 0;

    if (renewal > 0) {
      if (billingFrequency === 'monthly') {
        recurringAnnual = renewal * 12;
        monthlyEquivalent = renewal;
      } else if (billingFrequency === 'quarterly') {
        recurringAnnual = renewal * 4;
        monthlyEquivalent = Math.round(renewal / 3);
      } else if (billingFrequency === 'annual') {
        recurringAnnual = renewal;
        monthlyEquivalent = Math.round(renewal / 12);
      }
    }

    const totalFirstYear = firstPayment + recurringAnnual;

    return {
      firstPayment,
      monthlyEquivalent,
      recurringAnnual,
      totalFirstYear,
      hiddenFeeTotal: platform + service + setup,
    };
  }, [basePrice, platformFee, serviceFee, tax, setupFee, renewalFee, billingFrequency]);

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
          <Calculator className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          True Cost Calculator
        </h1>
        <p className="text-sm text-stone-500 max-w-md mx-auto">
          Unmask deceptive checkout markups. Calculate initial out-of-pocket payment and true recurring annual commitments.
        </p>
      </div>

      {/* Visual Calculations Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* First Payment */}
        <div className="p-5 rounded-3xl bg-amber-600 text-white shadow-md space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-200">First Payment Today</p>
          <p className="text-3xl font-black">₹{calculations.firstPayment.toLocaleString()}</p>
          <p className="text-[11px] text-amber-100">Item price + immediate fees</p>
        </div>

        {/* Monthly Cost */}
        <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Monthly Equivalent</p>
          <p className="text-3xl font-black text-stone-900">
            {calculations.monthlyEquivalent > 0 ? `₹${calculations.monthlyEquivalent.toLocaleString()}` : 'None'}
          </p>
          <p className="text-[11px] text-stone-500">
            {calculations.monthlyEquivalent > 0 ? 'Per month commitment' : 'No recurring fee entered'}
          </p>
        </div>

        {/* Annual Recurring Cost */}
        <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-stone-400">1-Year True Total</p>
          <p className="text-3xl font-black text-stone-900">₹{calculations.totalFirstYear.toLocaleString()}</p>
          <p className="text-[11px] text-stone-500">Initial + 12 mo renewals</p>
        </div>
      </div>

      {/* Inputs Form */}
      <div className="rounded-3xl bg-white border border-stone-200 p-6 sm:p-8 space-y-6 shadow-xs">
        <h3 className="text-base font-bold text-stone-900 border-b border-stone-150 pb-3">
          Enter Itemized Pricing From Checkout Screen
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
              Base Advertised Price (₹)
            </label>
            <input
              type="number"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="499"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
              Platform / Convenience Fee (₹)
            </label>
            <input
              type="number"
              value={platformFee}
              onChange={(e) => setPlatformFee(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g. 49"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
              Taxes / GST (₹)
            </label>
            <input
              type="number"
              value={tax}
              onChange={(e) => setTax(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g. 98"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
              Setup / Delivery Fee (₹)
            </label>
            <input
              type="number"
              value={setupFee}
              onChange={(e) => setSetupFee(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Optional"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
              Recurring / Renewal Charge (₹)
            </label>
            <input
              type="number"
              value={renewalFee}
              onChange={(e) => setRenewalFee(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g. 199"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
              Billing Frequency
            </label>
            <select
              value={billingFrequency}
              onChange={(e) => setBillingFrequency(e.target.value as any)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm bg-white focus:ring-2 focus:ring-amber-500"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annual">Annual</option>
            </select>
          </div>
        </div>

        {/* Hidden Fee Callout */}
        {calculations.hiddenFeeTotal > 0 && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <span className="font-bold">Hidden surcharge warning: </span>
              An extra <span className="font-bold">₹{calculations.hiddenFeeTotal}</span> in platform, convenience, and setup fees is added to the advertised base price today.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
