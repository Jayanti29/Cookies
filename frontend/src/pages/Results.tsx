import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { ResultsScreen } from '../components/ResultsScreen';
import { AnalysisResult } from '../types';
import { ArrowLeft, Loader2 } from 'lucide-react';

export const Results: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentResult = useStore((s) => s.currentResult);
  const [result, setResult] = useState<AnalysisResult | null>(currentResult);

  useEffect(() => {
    if (currentResult) {
      setResult(currentResult);
    } else {
      // Fallback mock/demo if navigating directly
      setResult({
        id: id || 'demo-1',
        status: 'review',
        summary: 'Review subscription and renewal terms before payment.',
        analysisType: 'website',
        findings: [
          {
            id: '1',
            type: 'hidden_subscription',
            severity: 'medium',
            title: 'Possible recurring payment',
            description: 'This appears to include a payment that may continue automatically.',
            evidence: 'Renews at ₹499/month automatically after 7-day trial.',
            explanation: 'You may be billed repeatedly if not cancelled before the trial expires.',
            recommendation: 'Check the renewal and cancellation terms before paying.',
            whyItMatters: 'Unexpected recurring charges can deplete your account balance.',
            whatIsUncertain: 'Whether there is an easy one-click cancellation button in user profile.',
            whatToVerify: 'Look for terms of service link on checkout.',
          },
          {
            id: '2',
            type: 'hidden_fee',
            severity: 'low',
            title: 'Additional platform fee',
            description: 'An extra processing fee of ₹49 was added during final checkout step.',
            evidence: 'Base price ₹499 + Platform Convenience Fee ₹49.',
            explanation: 'Hidden fees alter the true price you expected to pay.',
            recommendation: 'Check the total itemized cost before providing OTP.',
            whyItMatters: 'Hidden costs add up over multiple transactions.',
          },
        ],
        totalFindings: 2,
        isDemo: true,
        checkedAt: new Date().toISOString(),
        language: 'en',
      });
    }
  }, [currentResult, id]);

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
        <p className="text-sm text-stone-500 font-medium">Loading analysis result…</p>
      </div>
    );
  }

  return (
    <div className="py-2 space-y-4">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 bg-stone-100 px-3 py-1.5 rounded-full transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Checker</span>
      </button>

      <ResultsScreen result={result} />
    </div>
  );
};
