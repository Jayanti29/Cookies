import React, { useState } from 'react';
import { Finding } from '../types';
import { WhyModal } from './WhyModal';
import { useLanguage } from '../i18n';
import { AlertCircle, HelpCircle, ArrowRight } from 'lucide-react';

export const FindingCard: React.FC<{ finding: Finding }> = ({ finding }) => {
  const [showWhy, setShowWhy] = useState(false);
  const { t } = useLanguage();

  const severityStyles = {
    low: 'border-l-blue-500 bg-blue-50/20',
    medium: 'border-l-amber-500 bg-amber-50/20',
    high: 'border-l-orange-500 bg-orange-50/25',
    critical: 'border-l-rose-500 bg-rose-50/30',
  };

  return (
    <>
      <div
        className={`rounded-2xl border border-stone-200 border-l-4 p-4 sm:p-5 bg-white shadow-xs transition hover:shadow-sm ${
          severityStyles[finding.severity] || severityStyles.medium
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-base text-stone-900">{finding.title}</h3>
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                {finding.severity}
              </span>
            </div>
            <p className="text-sm text-stone-600 leading-relaxed mt-1">
              {finding.description || finding.explanation}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowWhy(true)}
            className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold transition"
          >
            <span>{t('result.why') || 'Why?'}</span>
            <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
          </button>
        </div>

        {/* Observed Evidence snippet if available */}
        {finding.evidence && (
          <div className="mt-3.5 p-2.5 rounded-xl bg-stone-50 border border-stone-150 text-xs text-stone-700 font-mono">
            <span className="font-bold text-stone-500 block mb-0.5 uppercase tracking-wider text-[10px]">
              {t('result.evidence') || 'Observed Evidence'}:
            </span>
            "{finding.evidence}"
          </div>
        )}

        {/* Suggested Next Action */}
        {finding.recommendation && (
          <div className="mt-3 flex items-start gap-2 text-xs text-amber-950 font-medium">
            <ArrowRight className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
            <span>{finding.recommendation}</span>
          </div>
        )}
      </div>

      <WhyModal finding={showWhy ? finding : null} onClose={() => setShowWhy(false)} />
    </>
  );
};
