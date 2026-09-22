import React, { useState, useMemo } from 'react';
import { Calculator, ArrowDown, ArrowRight, DollarSign, Info, ShieldAlert, CheckCircle2, HelpCircle } from 'lucide-react';

export const TrueCost: React.FC = () => {
  const [advertisedPrice, setAdvertisedPrice] = useState<number | ''>(299);
  const [basePrice, setBasePrice] = useState<number | ''>(299);
  const [addonPrice, setAddonPrice] = useState<number | ''>(99);
  const [platformFee, setPlatformFee] = useState<number | ''>(49);
  const [serviceFee, setServiceFee] = useState<number | ''>('');
  const [tax, setTax] = useState<number | ''>(62);
  const [renewalFee, setRenewalFee] = useState<number | ''>(799);
  const [billingFrequency, setBillingFrequency] = useState<'monthly' | 'quarterly' | 'annual'>('annual');

  const calculations = useMemo(() => {
    const adv = advertisedPrice !== '' ? Number(advertisedPrice) : null;
    const base = basePrice !== '' ? Number(basePrice) : null;
    const addon = addonPrice !== '' ? Number(addonPrice) : 0;
    const platform = platformFee !== '' ? Number(platformFee) : 0;
    const service = serviceFee !== '' ? Number(serviceFee) : 0;
    const taxAmt = tax !== '' ? Number(tax) : 0;
    const renewal = renewalFee !== '' ? Number(renewalFee) : null;

    // Final checkout payment
    const totalFees = addon + platform + service + taxAmt;
    const finalPayment = (base ?? 0) + totalFees;

    let recurringAnnual = 0;
    if (renewal !== null && renewal > 0) {
      if (billingFrequency === 'monthly') recurringAnnual = renewal * 12;
      else if (billingFrequency === 'quarterly') recurringAnnual = renewal * 4;
      else if (billingFrequency === 'annual') recurringAnnual = renewal;
    }

    return {
      advertised: adv,
      base,
      addon,
      platform,
      service,
      tax: taxAmt,
      totalFees,
      finalPayment,
      renewal,
      recurringAnnual,
      totalFirstYear: finalPayment + recurringAnnual,
      priceHike: adv !== null ? finalPayment - adv : null,
    };
  }, [advertisedPrice, basePrice, addonPrice, platformFee, serviceFee, tax, renewalFee, billingFrequency]);

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
          <Calculator className="w-3.5 h-3.5" />
          <span>FINANCIAL TRANSPARENCY</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          Price Journey & True Cost
        </h1>
        <p className="text-sm text-stone-600 max-w-md mx-auto">
          Trace the exact step-by-step path from the advertised teaser to the final payment and auto-renewals.
        </p>
      </div>

      {/* Visual Price Journey Flow */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
          The Purchase Price Journey
        </h3>

        <div className="space-y-2 font-mono text-xs">
          {/* Step 1: Advertised Price */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-stone-700 font-sans block">1. Advertised Teaser Price</span>
              <span className="text-[11px] text-stone-400 font-sans block">What the advertisement showed you</span>
            </div>
            <span className="text-stone-900 font-bold text-sm">
              {calculations.advertised !== null ? `₹${calculations.advertised}` : 'Not provided'}
            </span>
          </div>

          <div className="flex justify-center text-stone-400">
            <ArrowDown className="w-4 h-4" />
          </div>

          {/* Step 2: Product Price */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-stone-700 font-sans block">2. Base Product Price</span>
              <span className="text-[11px] text-stone-400 font-sans block">Item price on store page</span>
            </div>
            <span className="text-stone-900 font-bold text-sm">
              {calculations.base !== null ? `₹${calculations.base}` : 'Could not be verified'}
            </span>
          </div>

          <div className="flex justify-center text-stone-400">
            <ArrowDown className="w-4 h-4" />
          </div>

          {/* Step 3: Add-ons */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-amber-900 font-sans block">3. Pre-selected Add-ons</span>
              <span className="text-[11px] text-amber-700 font-sans block">Protection plans, priority delivery, tipping</span>
            </div>
            <span className="text-amber-950 font-bold text-sm">
              {calculations.addon > 0 ? `+ ₹${calculations.addon}` : 'None observed'}
            </span>
          </div>

          <div className="flex justify-center text-stone-400">
            <ArrowDown className="w-4 h-4" />
          </div>

          {/* Step 4: Fees */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-amber-900 font-sans block">4. Platform & Service Fees</span>
              <span className="text-[11px] text-amber-700 font-sans block">Drip convenience charges, payment processing</span>
            </div>
            <span className="text-amber-950 font-bold text-sm">
              {calculations.platform + calculations.service > 0
                ? `+ ₹${calculations.platform + calculations.service}`
                : 'None observed'}
            </span>
          </div>

          <div className="flex justify-center text-stone-400">
            <ArrowDown className="w-4 h-4" />
          </div>

          {/* Step 5: Taxes */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-stone-700 font-sans block">5. Estimated Taxes (GST)</span>
              <span className="text-[11px] text-stone-400 font-sans block">Mandatory regulatory taxation</span>
            </div>
            <span className="text-stone-900 font-bold text-sm">
              {calculations.tax > 0 ? `+ ₹${calculations.tax}` : 'Included / Not listed'}
            </span>
          </div>

          <div className="flex justify-center text-stone-400">
            <ArrowDown className="w-4 h-4" />
          </div>

          {/* Step 6: Final Payment */}
          <div className="p-4 rounded-2xl bg-amber-600 text-white shadow-sm flex items-center justify-between">
            <div>
              <span className="font-black text-sm font-sans block text-amber-100">6. Final Out-of-Pocket Payment</span>
              <span className="text-xs text-amber-200 font-sans">What you are charged at checkout today</span>
            </div>
            <div className="text-right">
              <span className="font-black text-xl block">₹{calculations.finalPayment.toLocaleString()}</span>
              {calculations.priceHike !== null && calculations.priceHike > 0 && (
                <span className="text-[11px] text-amber-200 font-sans font-bold">
                  (+₹{calculations.priceHike} over advertised)
                </span>
              )}
            </div>
          </div>

          <div className="flex justify-center text-stone-400">
            <ArrowDown className="w-4 h-4" />
          </div>

          {/* Step 7: Renewal Price */}
          <div className="p-3.5 rounded-2xl bg-stone-900 text-stone-100 border border-stone-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-white font-sans block">7. Recurring Renewal / Mandate Price</span>
              <span className="text-[11px] text-stone-400 font-sans block">Ongoing charge after initial period ends</span>
            </div>
            <span className="font-bold text-amber-400 text-sm">
              {calculations.renewal !== null && calculations.renewal > 0
                ? `₹${calculations.renewal} / ${billingFrequency}`
                : 'Not recurring / One-time'}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Input Form */}
      <div className="rounded-3xl bg-white border border-stone-200 p-6 space-y-4 shadow-xs">
        <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900">
          Customize Your Purchase Journey Values
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-bold text-stone-700 block mb-1">Advertised Price (₹)</label>
            <input
              type="number"
              value={advertisedPrice}
              onChange={(e) => setAdvertisedPrice(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
            />
          </div>

          <div>
            <label className="font-bold text-stone-700 block mb-1">Base Product Price (₹)</label>
            <input
              type="number"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
            />
          </div>

          <div>
            <label className="font-bold text-stone-700 block mb-1">Pre-selected Add-on (₹)</label>
            <input
              type="number"
              value={addonPrice}
              onChange={(e) => setAddonPrice(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g. 99"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
            />
          </div>

          <div>
            <label className="font-bold text-stone-700 block mb-1">Platform / Service Fee (₹)</label>
            <input
              type="number"
              value={platformFee}
              onChange={(e) => setPlatformFee(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g. 49"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
            />
          </div>

          <div>
            <label className="font-bold text-stone-700 block mb-1">Taxes / GST (₹)</label>
            <input
              type="number"
              value={tax}
              onChange={(e) => setTax(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
            />
          </div>

          <div>
            <label className="font-bold text-stone-700 block mb-1">Renewal Price (₹)</label>
            <input
              type="number"
              value={renewalFee}
              onChange={(e) => setRenewalFee(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g. 799"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
            />
          </div>
        </div>

        <div className="pt-2 flex items-center gap-3 text-xs text-stone-500">
          <Info className="w-4 h-4 text-amber-700 shrink-0" />
          <span>If any fee is not disclosed on checkout, leave it blank to mark as "Not provided".</span>
        </div>
      </div>
    </div>
  );
};
