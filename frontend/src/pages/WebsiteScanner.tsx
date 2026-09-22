import React, { useState } from 'react';
import { useAnalysis } from '../hooks/useAnalysis';
import { AnalysisProgress } from '../components/AnalysisProgress';
import { Globe, AlertCircle, ShieldAlert, Sparkles } from 'lucide-react';

export const WebsiteScanner: React.FC = () => {
  const [url, setUrl] = useState('');
  const { loading, error, analyzeWebsite } = useAnalysis();

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    let target = url.trim();
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = `https://${target}`;
    }
    analyzeWebsite(target);
  };

  const sampleSites = [
    'https://example-deal.com/checkout-promo',
    'https://instant-loan-approval-verify.net',
    'https://my-utility-bill-pay-quick.org',
  ];

  if (loading) {
    return <AnalysisProgress title="Scanning website structure & pricing terms…" />;
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 py-4 animate-in fade-in duration-200">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
          <Globe className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          Check a Website
        </h1>
        <p className="text-sm text-stone-500 max-w-md mx-auto">
          We'll look for potentially deceptive patterns and things you should review before trusting or paying.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-xs text-rose-800">
          <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* URL Input Form */}
      <form onSubmit={handleScan} className="rounded-3xl bg-white border border-stone-200 p-6 space-y-4 shadow-xs">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
            Website address
          </label>
          <div className="relative">
            <span className="absolute left-4 top-3.5 text-stone-400 font-mono text-sm select-none">
              https://
            </span>
            <input
              type="text"
              value={url.replace(/^https?:\/\//, '')}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="example.com/checkout"
              className="w-full pl-22 pr-4 py-3.5 rounded-2xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-sm font-mono"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!url.trim()}
          className="w-full py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-sm transition shadow-sm"
        >
          Check Website
        </button>

        <p className="text-center text-xs text-stone-400">
          Detects hidden fees, recurring charges, fake urgency, and cancellation hurdles.
        </p>
      </form>

      {/* Try with an example */}
      <div className="rounded-2xl bg-stone-100/70 p-4 border border-stone-200 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700">
          <Sparkles className="w-3.5 h-3.5 text-amber-700" />
          <span>Quick test with common patterns</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {sampleSites.map((site) => (
            <button
              key={site}
              type="button"
              onClick={() => {
                setUrl(site);
                analyzeWebsite(site);
              }}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-xs font-mono text-stone-600 truncate max-w-full text-left"
            >
              {site.replace('https://', '')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
