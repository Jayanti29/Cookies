import React, { useState, useEffect } from 'react';
import { Check, Circle } from 'lucide-react';

export const AnalysisProgress: React.FC<{ title?: string }> = ({ title = 'Checking…' }) => {
  const [step, setStep] = useState(0);

  const steps = [
    'Reading content',
    'Understanding what it is',
    'Looking for suspicious patterns',
    'Preparing explanation',
  ];

  useEffect(() => {
    const intervals = [
      setTimeout(() => setStep(1), 800),
      setTimeout(() => setStep(2), 1800),
      setTimeout(() => setStep(3), 2800),
      setTimeout(() => setStep(4), 3800),
    ];

    return () => intervals.forEach(clearTimeout);
  }, []);

  return (
    <div className="w-full max-w-md mx-auto py-12 px-6 flex flex-col items-center text-center animate-in fade-in duration-300">
      <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-3xl mb-6 animate-pulse">
        🍪
      </div>

      <h3 className="text-xl font-bold text-stone-900 mb-6">{title}</h3>

      <div className="w-full max-w-xs space-y-3.5 text-left bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        {steps.map((label, idx) => {
          const isDone = step > idx;
          const isCurrent = step === idx;

          return (
            <div key={label} className="flex items-center gap-3">
              {isDone ? (
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              ) : isCurrent ? (
                <div className="w-5 h-5 rounded-full border-2 border-amber-600 border-t-transparent animate-spin shrink-0" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-stone-100 text-stone-300 flex items-center justify-center shrink-0">
                  <Circle className="w-3 h-3 text-stone-300" />
                </div>
              )}
              <span
                className={`text-sm ${
                  isDone
                    ? 'text-stone-800 font-medium'
                    : isCurrent
                    ? 'text-amber-900 font-semibold'
                    : 'text-stone-400'
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-stone-400 mt-6 max-w-xs">
        Never making absolute claims. Verifying evidence carefully.
      </p>
    </div>
  );
};
