import React, { useState } from 'react';
import { useAnalysis } from '../hooks/useAnalysis';
import { AnalysisProgress } from '../components/AnalysisProgress';
import { FileDropzone } from '../components/FileDropzone';
import { CreditCard, ShieldAlert, Sparkles } from 'lucide-react';

export const PaymentAnalyzer: React.FC = () => {
  const { loading, analyzePayment, analyzeFile } = useAnalysis();
  const [text, setText] = useState('');
  const [tab, setTab] = useState<'text' | 'screenshot'>('text');

  const samplePayment = "Pay ₹5,000 immediately to Indian Customs clearance account 98210458129 IFSC SBIN0012345 or your seized package will be destroyed within 2 hours.";

  if (loading) {
    return <AnalysisProgress title="Analyzing payment request authenticity & pressure patterns…" />;
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 py-4 animate-in fade-in duration-200">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
          <CreditCard className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          Check a Payment Request
        </h1>
        <p className="text-sm text-stone-500 max-w-md mx-auto">
          Received a sudden payment demand or UPI link? Check for urgency traps, fake fees, and impersonation.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-stone-200/60 p-1 rounded-2xl">
        <button
          onClick={() => setTab('text')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition ${
            tab === 'text' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          💬 Paste Message / UPI Link
        </button>
        <button
          onClick={() => setTab('screenshot')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition ${
            tab === 'screenshot' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          📷 Payment Screenshot / QR
        </button>
      </div>

      {tab === 'text' ? (
        <div className="rounded-3xl bg-white border border-stone-200 p-6 space-y-4 shadow-xs">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            placeholder="Paste text like: 'Pay ₹2,000 registration fee to UPI id...', electricity disconnection threats, or parcel clearance demands..."
            className="w-full px-4 py-3 rounded-2xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-sm"
          />

          <button
            onClick={() => analyzePayment(text)}
            disabled={!text.trim()}
            className="w-full py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-sm transition shadow-sm"
          >
            💳 Analyze Payment Request
          </button>
        </div>
      ) : (
        <FileDropzone
          onFileSelect={(file) => analyzeFile(file, 'payment_request')}
          label="Drop your payment screenshot or QR code"
          sublabel="UPI screenshot, checkout page, or SMS demand"
        />
      )}

      {/* Sample Test */}
      <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700">
          <Sparkles className="w-3.5 h-3.5 text-amber-700" />
          <span>Test with suspicious customs demand</span>
        </div>
        <button
          type="button"
          onClick={() => {
            setText(samplePayment);
            setTab('text');
            analyzePayment(samplePayment);
          }}
          className="text-left w-full p-2.5 rounded-xl bg-white hover:bg-amber-50/50 border border-stone-200 text-xs text-stone-600 transition font-mono line-clamp-2"
        >
          {samplePayment}
        </button>
      </div>

      {/* Safety Note */}
      <div className="rounded-2xl bg-amber-50/60 p-4 border border-amber-200/60 text-xs text-amber-900 space-y-1">
        <p className="font-bold">Important Privacy Guarantee:</p>
        <p>
          COOKIES never connects to your bank account or asks for your OTP, ATM PIN, or password.
        </p>
      </div>
    </div>
  );
};
