import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnalysisResult } from '../types';
import { StatusBadge } from './StatusBadge';
import { FindingCard } from './FindingCard';
import { DemoLabel } from './DemoLabel';
import { useLanguage } from '../i18n';
import { api } from '../services/api';
import { Bookmark, AlertTriangle, RotateCcw, Check, Share2, FileText } from 'lucide-react';
import { ConsentReceiptModal } from './ConsentReceiptModal';
import { ConsentReceipt } from '../types';
import toast from 'react-hot-toast';

export const ResultsScreen: React.FC<{ result: AnalysisResult }> = ({ result }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [savingEvidence, setSavingEvidence] = useState(false);
  const [savedEvidence, setSavedEvidence] = useState(false);
  const [showConsentReceipt, setShowConsentReceipt] = useState(false);

  const handleSaveEvidence = async () => {
    try {
      setSavingEvidence(true);
      const formData = new FormData();
      formData.append('title', `Analysis: ${result.summary.slice(0, 40)}...`);
      formData.append('description', result.summary);
      formData.append('category', result.analysisType);
      await api.uploadEvidence(formData);
      setSavedEvidence(true);
      toast.success('Saved to Evidence Vault');
    } catch (err: any) {
      toast.error('Could not save evidence. Please sign in first.');
    } finally {
      setSavingEvidence(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'COOKIES Safety Check Result',
        text: `COOKIES safety check: ${result.summary}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Demo notice if demo */}
      {result.isDemo && <DemoLabel />}

      {/* Main Status Header */}
      <div className="rounded-3xl bg-white border border-stone-200/80 p-6 sm:p-8 text-center shadow-xs">
        <div className="flex justify-center mb-4">
          <StatusBadge status={result.status} size="lg" />
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-stone-900 mb-3 tracking-tight">
          {result.summary}
        </h2>

        <p className="text-sm font-semibold text-stone-500 mb-4">
          {result.totalFindings === 1
            ? t('result.foundOne') || 'We found 1 thing you should check.'
            : (t('result.foundItems', { count: result.totalFindings }) || `We found ${result.totalFindings} things you should check.`)}
        </p>

        {/* Tri-Dimensional Summary Card: Money, Data, Manipulation */}
        <div className="pt-4 border-t border-stone-100 text-left space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block text-center">
            What this website may ask from you
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/70">
              <span className="font-bold text-amber-950 flex items-center gap-1.5">
                <span>💰</span>
                <span>MONEY</span>
              </span>
              <p className="text-[11px] text-amber-900 mt-1">
                {result.triDimensionSummary?.money?.count || (result.findings.filter(f => f.dimension === 'money').length) || 0} items to review
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-200/70">
              <span className="font-bold text-blue-950 flex items-center gap-1.5">
                <span>🔐</span>
                <span>DATA</span>
              </span>
              <p className="text-[11px] text-blue-900 mt-1">
                {result.triDimensionSummary?.data?.count || (result.findings.filter(f => f.dimension === 'data').length) || 0} items to review
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-200/70">
              <span className="font-bold text-purple-950 flex items-center gap-1.5">
                <span>🧠</span>
                <span>MANIPULATION</span>
              </span>
              <p className="text-[11px] text-purple-900 mt-1">
                {result.triDimensionSummary?.manipulation?.count || (result.findings.filter(f => f.dimension === 'manipulation').length) || 0} items to review
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Consent Receipt Trigger Banner */}
      <div className="p-4 rounded-3xl bg-stone-900 text-white flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="text-xl">🧾</div>
          <div>
            <span className="text-xs font-bold block">Digital Consent Receipt</span>
            <span className="text-[11px] text-stone-400">Generate a human-readable summary of what you are asked to agree to</span>
          </div>
        </div>
        <button
          onClick={() => setShowConsentReceipt(true)}
          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition"
        >
          View Receipt
        </button>
      </div>

      {/* Findings List */}
      {result.findings && result.findings.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-stone-400 px-1">
            {t('result.whatWeFound') || 'Observed Indicators'}
          </h3>
          {result.findings.map((finding) => (
            <FindingCard key={finding.id} finding={finding} />
          ))}
        </div>
      )}

      {/* What Should You Do Next? */}
      <div className="rounded-3xl bg-amber-500/10 border border-amber-200/60 p-6 sm:p-7">
        <h3 className="text-base font-bold text-amber-950 mb-3 flex items-center gap-2">
          <span>🛡️</span>
          <span>{t('result.whatToDo') || 'What should you do now?'}</span>
        </h3>
        <ul className="space-y-2.5 text-sm text-amber-900 leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="font-bold text-amber-700">•</span>
            <span>Verify the domain and seller directly from official channels before sending money.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-amber-700">•</span>
            <span>Never share OTPs, passwords, or scan unknown QR codes to "receive" payments.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-amber-700">•</span>
            <span>Check for pre-selected checkboxes and recurring payment terms before checkout.</span>
          </li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <button
          onClick={handleSaveEvidence}
          disabled={savingEvidence || savedEvidence}
          className="flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-2xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 font-semibold text-xs transition shadow-xs disabled:opacity-60"
        >
          {savedEvidence ? <Check className="w-4 h-4 text-emerald-600" /> : <Bookmark className="w-4 h-4 text-stone-600" />}
          <span>{savedEvidence ? 'Saved' : (t('result.save') || 'Save Evidence')}</span>
        </button>

        <button
          onClick={() => navigate('/reports/new')}
          className="flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-2xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 font-semibold text-xs transition shadow-xs"
        >
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>{t('result.report') || 'Report'}</span>
        </button>

        <button
          onClick={handleShare}
          className="flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-2xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 font-semibold text-xs transition shadow-xs"
        >
          <Share2 className="w-4 h-4 text-stone-600" />
          <span>Share</span>
        </button>

        <button
          onClick={() => navigate('/check')}
          className="flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-2xl border border-stone-900 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition shadow-xs"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{t('result.checkAgain') || 'Check Again'}</span>
        </button>
      </div>

      {/* Safety Disclaimer */}
      <p className="text-center text-xs text-stone-400 max-w-md mx-auto pt-2">
        COOKIES observations are based solely on the submitted evidence. Never consider any link or message 100% safe. Always verify independently.
      </p>

      {/* Digital Consent Receipt Modal */}
      {showConsentReceipt && (
        <ConsentReceiptModal
          receipt={
            result.consentReceipt || {
              receiptId: `rcpt_${result.id.slice(0, 8)}`,
              website: result.inputPreview?.slice(0, 30) || 'checked-website.com',
              timestamp: result.checkedAt,
              observedChoices: {
                essential: true,
                analytics: result.findings.some((f) => f.dimension === 'data'),
                advertising: result.findings.some((f) => f.dimension === 'data'),
                thirdParty: result.findings.some((f) => f.dimension === 'data'),
              },
              observedInterfaceFlags: result.findings
                .filter((f) => f.dimension === 'data' || f.dimension === 'manipulation')
                .map((f) => f.title),
              potentialImpact:
                'You may be consenting to behavioral profile building, analytics recording, and marketing partner sharing across browsing sessions.',
              verificationAdvice:
                'Review the website\'s cookie preferences and privacy settings before consenting.',
            }
          }
          onClose={() => setShowConsentReceipt(false)}
        />
      )}
    </div>
  );
};
