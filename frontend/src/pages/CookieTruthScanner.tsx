import React, { useState } from 'react';
import { api } from '../services/api';
import { CookieTruthResult, ConsentReceipt } from '../types';
import { ConsentReceiptModal } from '../components/ConsentReceiptModal';
import { ShieldCheck, Cookie, AlertTriangle, CheckCircle, Info, ExternalLink, ArrowRight, Loader2, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export const CookieTruthScanner: React.FC = () => {
  const [url, setUrl] = useState('');
  const [bannerText, setBannerText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CookieTruthResult | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<ConsentReceipt | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() && !bannerText.trim()) {
      toast.error('Please enter a website URL or paste a cookie banner notice.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.analyzeCookieConsent(
        bannerText.trim() || `Cookie consent banner for ${url.trim()}`,
        url.trim() || undefined
      );
      setResult(res);
      toast.success('Cookie consent analysis complete!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not analyze cookie consent.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSample = (sampleType: 'asymmetric' | 'standard' | 'marketing') => {
    if (sampleType === 'asymmetric') {
      setUrl('https://example-shopping.com');
      setBannerText(
        'We and our 842 marketing partners use cookies to personalize ads, build interest profiles, and measure performance. Click "ACCEPT ALL" to continue browsing with personalized deals, or click settings to customize.'
      );
    } else if (sampleType === 'standard') {
      setUrl('https://gov-portal.org');
      setBannerText(
        'This site uses essential session cookies to function securely. Optional anonymous analytics help us improve accessibility. You may accept all or reject non-essential cookies.'
      );
    } else {
      setUrl('https://news-aggregator.live');
      setBannerText(
        'By clicking Accept All, you consent to third-party tracking, cross-device measurement, social media plugins, and advertising cookies enabled by default.'
      );
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
          <Cookie className="w-3.5 h-3.5" />
          <span>SIGNATURE FEATURE</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          Cookie Truth Scanner
        </h1>
        <p className="text-sm text-stone-600 max-w-xl">
          People routinely click <span className="font-semibold text-stone-900">“Accept All Cookies”</span> without understanding what they are agreeing to. COOKIES examines observable consent interfaces and tracking categories before you accept.
        </p>
      </div>

      {/* Input Card */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-4">
        <form onSubmit={handleScan} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
              Website URL (Optional)
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g. store.brand.com"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
              Cookie Banner Notice / Privacy Prompt
            </label>
            <textarea
              rows={3}
              value={bannerText}
              onChange={(e) => setBannerText(e.target.value)}
              placeholder="Paste the text from the cookie banner or consent pop-up (e.g. 'We and our partners use cookies to...')"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-1.5 text-xs text-stone-500">
              <span className="font-semibold">Try sample:</span>
              <button
                type="button"
                onClick={() => handleLoadSample('asymmetric')}
                className="text-amber-800 hover:underline font-medium"
              >
                Prominent Accept
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => handleLoadSample('marketing')}
                className="text-amber-800 hover:underline font-medium"
              >
                Marketing Partners
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-sm flex items-center gap-2 transition shadow-xs"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Auditing Consent Notice…</span>
                </>
              ) : (
                <>
                  <span>Audit Cookie Consent</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Analysis Results */}
      {result && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Summary Card */}
          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  Observable Consent Assessment
                </span>
                <h3 className="text-xl font-bold text-stone-900 mt-1">
                  {result.summary}
                </h3>
              </div>
              {result.receipt && (
                <button
                  onClick={() => setSelectedReceipt(result.receipt!)}
                  className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs flex items-center gap-1.5 transition border border-amber-200 shrink-0"
                >
                  <FileText className="w-4 h-4" />
                  <span>View Consent Receipt</span>
                </button>
              )}
            </div>

            {/* Category Status Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {result.categories.map((cat, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900 capitalize">
                      {cat.name.replace('_', ' ')} Cookies
                    </span>
                    {cat.status === 'detected' ? (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                        Essential
                      </span>
                    ) : cat.status === 'review' ? (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Review
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-stone-200 text-stone-600">
                        Not detected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    {cat.observableDetails}
                  </p>
                </div>
              ))}
            </div>

            {/* Observable Interface Biases */}
            {result.consentFlags.length > 0 && (
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Observable Interface Design Flags
                </h4>
                <div className="space-y-2">
                  {result.consentFlags.map((flag, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-xs space-y-1"
                    >
                      <div className="flex items-center gap-2 font-bold text-amber-900">
                        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>{flag.description}</span>
                      </div>
                      <p className="text-stone-600 pl-6">
                        <span className="font-semibold text-stone-800">Observed: </span>
                        {flag.observedEvidence}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Why does this matter? */}
            <div className="p-4 rounded-2xl bg-stone-100/70 border border-stone-200 text-xs space-y-1">
              <span className="font-bold text-stone-900 block flex items-center gap-1.5">
                <Info className="w-4 h-4 text-stone-600" />
                Why does this matter?
              </span>
              <p className="text-stone-600 leading-relaxed">
                {result.whyItMatters}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Digital Consent Receipt Modal */}
      {selectedReceipt && (
        <ConsentReceiptModal
          receipt={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
};
