import React, { useState } from 'react';
import { api } from '../services/api';
import { CheckoutDiffResult } from '../types';
import { ArrowRight, Upload, AlertTriangle, CheckCircle, ShieldAlert, Sparkles, Loader2, Vault } from 'lucide-react';
import toast from 'react-hot-toast';

export const CheckoutDiff: React.FC = () => {
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [previewA, setPreviewA] = useState<string | null>(null);
  const [previewB, setPreviewB] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckoutDiffResult | null>(null);
  const [saving, setSaving] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, which: 'A' | 'B') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      if (which === 'A') {
        setFileA(file);
        setPreviewA(previewUrl);
      } else {
        setFileB(file);
        setPreviewB(previewUrl);
      }
    }
  };

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileA || !fileB) {
      toast.error('Please upload both Screenshot A (Product Page) and Screenshot B (Checkout Page)');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('screenshotA', fileA);
      formData.append('screenshotB', fileB);
      formData.append('language', 'en');

      const res = await api.compareCheckouts(formData);
      setResult(res);
      toast.success('Multimodal checkout diff analysis complete!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not complete comparison.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEvidence = async () => {
    if (!result) return;
    try {
      setSaving(true);
      const formData = new FormData();
      const textBlob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
      formData.append('file', textBlob, `checkout_diff_${result.analysisId}.json`);
      formData.append('title', `Checkout Price Difference (${result.advertisedPrice} → ${result.checkoutPrice})`);
      formData.append('category', 'hidden_fee');
      formData.append('description', result.summary);

      await api.uploadEvidence(formData);
      toast.success('Difference report saved to Evidence Vault!');
    } catch {
      toast.error('Could not save evidence.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>MULTIMODAL GEMINI VISION</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          Checkout Difference Detector
        </h1>
        <p className="text-sm text-stone-600 max-w-xl">
          Did the price sneakily rise during checkout? Upload the initial product page and final payment screen. COOKIES compares both images to detect drip pricing, pre-ticked add-ons, and hidden recurring fees.
        </p>
      </div>

      {/* Dual Upload Form */}
      <form onSubmit={handleCompare} className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Screenshot A */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
              1. Product / Ad Page (Advertised Price)
            </span>
            <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-stone-300 hover:border-amber-400 rounded-2xl cursor-pointer bg-stone-50 hover:bg-amber-50/30 transition overflow-hidden relative">
              {previewA ? (
                <img src={previewA} alt="Screenshot A" className="w-full h-full object-contain p-2" />
              ) : (
                <div className="text-center p-4 space-y-2">
                  <Upload className="w-8 h-8 text-stone-400 mx-auto" />
                  <span className="text-xs font-semibold text-stone-700 block">Select Screenshot A</span>
                  <span className="text-[11px] text-stone-400 block">Product page showing initial price</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'A')}
                className="hidden"
              />
            </label>
          </div>

          {/* Screenshot B */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
              2. Final Checkout / Payment Screen
            </span>
            <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-stone-300 hover:border-amber-400 rounded-2xl cursor-pointer bg-stone-50 hover:bg-amber-50/30 transition overflow-hidden relative">
              {previewB ? (
                <img src={previewB} alt="Screenshot B" className="w-full h-full object-contain p-2" />
              ) : (
                <div className="text-center p-4 space-y-2">
                  <Upload className="w-8 h-8 text-stone-400 mx-auto" />
                  <span className="text-xs font-semibold text-stone-700 block">Select Screenshot B</span>
                  <span className="text-[11px] text-stone-400 block">Checkout screen showing final total</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'B')}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !fileA || !fileB}
          className="w-full py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 transition shadow-xs"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing Visual Discrepancies with Gemini…</span>
            </>
          ) : (
            <>
              <span>Compare Prices & Detect Added Fees</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Comparison Results */}
      {result && (
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-5 animate-in fade-in duration-200">
          {/* Header Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block">
                Visual Comparison Summary
              </span>
              <h3 className="text-lg font-bold text-stone-900 mt-0.5">
                {result.summary}
              </h3>
            </div>

            {result.detectedPriceChange ? (
              <div className="px-3.5 py-1.5 rounded-2xl bg-rose-100 text-rose-900 border border-rose-200 text-xs font-extrabold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-700" />
                <span>Price Shift: {result.advertisedPrice} → {result.checkoutPrice}</span>
              </div>
            ) : (
              <div className="px-3.5 py-1.5 rounded-2xl bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-700" />
                <span>Consistent Pricing Observed</span>
              </div>
            )}
          </div>

          {/* Observable Dark Patterns */}
          {result.observedDarkPatterns.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
                Observed Dark Pattern Types
              </span>
              <div className="flex flex-wrap gap-2">
                {result.observedDarkPatterns.map((pat, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs"
                  >
                    ⚠ {pat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Itemized Difference Breakdown */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
              Itemized Line Items & Differences
            </span>
            <div className="space-y-2">
              {result.differences.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-wrap items-center justify-between gap-2 text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-stone-900 block">{item.label}</span>
                    <span className="text-stone-500 block">{item.differenceNote}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-stone-800 text-sm">
                      {item.amountB || item.amountA || 'Added'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Verification Advice */}
          <div className="p-4 rounded-2xl bg-stone-100/70 border border-stone-200 text-xs space-y-1">
            <span className="font-bold text-stone-900 block">What you can verify:</span>
            <ul className="text-stone-600 list-disc list-inside space-y-1">
              {result.verificationSteps.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSaveEvidence}
              disabled={saving}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
            >
              <Vault className="w-4 h-4" />
              <span>Save Difference to Evidence Vault</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
