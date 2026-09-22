import React from 'react';
import { Finding } from '../types';
import { useLanguage } from '../i18n';
import { X, Eye, AlertCircle, HelpCircle, CheckSquare } from 'lucide-react';

interface WhyModalProps {
  finding: Finding | null;
  onClose: () => void;
}

export const WhyModal: React.FC<WhyModalProps> = ({ finding, onClose }) => {
  const { t } = useLanguage();

  if (!finding) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-stone-200 p-6 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom-8 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
              ?
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">{finding.title}</h3>
              <p className="text-xs text-stone-500 capitalize">{finding.type.replace(/_/g, ' ')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Core Sections */}
        <div className="space-y-4 py-4">
          {/* 1. What we observed */}
          <div className="rounded-2xl bg-stone-50 p-4 border border-stone-150">
            <div className="flex items-center gap-2 text-stone-900 font-semibold text-sm mb-1.5">
              <Eye className="w-4 h-4 text-amber-700" />
              <h4>{t('result.whatWeFound') || '1. What we observed'}</h4>
            </div>
            <p className="text-sm text-stone-700 leading-relaxed">
              {finding.evidence || finding.description}
            </p>
          </div>

          {/* 2. Reasonable Interpretation */}
          {finding.interpretation && (
            <div className="rounded-2xl bg-stone-50 p-4 border border-stone-150">
              <div className="flex items-center gap-2 text-stone-900 font-semibold text-sm mb-1.5">
                <HelpCircle className="w-4 h-4 text-blue-700" />
                <h4>2. Reasonable Interpretation</h4>
              </div>
              <p className="text-sm text-stone-700 leading-relaxed">
                {finding.interpretation}
              </p>
            </div>
          )}

          {/* 3. Why it matters */}
          <div className="rounded-2xl bg-amber-50/70 p-4 border border-amber-100">
            <div className="flex items-center gap-2 text-amber-900 font-semibold text-sm mb-1.5">
              <AlertCircle className="w-4 h-4 text-amber-700" />
              <h4>{t('result.whyItMatters') || '3. Why it matters'}</h4>
            </div>
            <p className="text-sm text-amber-900 leading-relaxed">
              {finding.whyItMatters || finding.explanation}
            </p>
          </div>

          {/* 3. What is uncertain */}
          <div className="rounded-2xl bg-stone-50 p-4 border border-stone-150">
            <div className="flex items-center gap-2 text-stone-700 font-semibold text-sm mb-1.5">
              <HelpCircle className="w-4 h-4 text-stone-500" />
              <h4>{t('result.whatUncertain') || 'What is uncertain'}</h4>
            </div>
            <p className="text-sm text-stone-600 leading-relaxed">
              {finding.whatIsUncertain || 'External official verification of the entity could not be independently established from this evidence alone.'}
            </p>
          </div>

          {/* 4. What you can verify */}
          <div className="rounded-2xl bg-emerald-50/70 p-4 border border-emerald-100">
            <div className="flex items-center gap-2 text-emerald-900 font-semibold text-sm mb-1.5">
              <CheckSquare className="w-4 h-4 text-emerald-700" />
              <h4>{t('result.whatToDo') || 'What you can verify'}</h4>
            </div>
            <p className="text-sm text-emerald-900 leading-relaxed">
              {finding.recommendation || finding.whatToVerify || 'Open the official app or website directly rather than following links.'}
            </p>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-stone-900 text-white font-medium text-sm hover:bg-stone-800 transition"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
