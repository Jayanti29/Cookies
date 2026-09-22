import React, { useState } from 'react';
import { BookOpen, Check, X, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export const Learn: React.FC = () => {
  const [expandedCard, setExpandedCard] = useState<string | null>('hidden_fees');
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const darkPatterns = [
    {
      id: 'hidden_fees',
      title: 'Hidden Fees (Drip Pricing)',
      icon: '💰',
      example: '₹499 item ends up costing ₹646 on final OTP screen due to sudden convenience fee and handling fee.',
      howToSpot: 'Notice how the price steadily grows as you move through checkout steps.',
      whatToDo: 'Always inspect the itemized receipt breakdown before confirming any OTP or transaction.',
    },
    {
      id: 'fake_urgency',
      title: 'Fake Urgency & Countdown Timers',
      icon: '⏱️',
      example: '"Only 2 items left at this price! Deal expires in 04:59 minutes."',
      howToSpot: 'Refresh the webpage. If the countdown resets back to 5:00 minutes, the urgency is synthetic.',
      whatToDo: 'Do not rush. Genuine vendors and banks never force you to act within minutes.',
    },
    {
      id: 'hidden_subscription',
      title: 'Hidden Recurring Subscriptions',
      icon: '🔄',
      example: '7-day trial for ₹1 quietly turns into auto-debit of ₹899 every month.',
      howToSpot: 'Look for tiny gray text below checkout buttons mentioning renewal terms.',
      whatToDo: 'Use a prepaid card with limits or check cancellation policy before entering card details.',
    },
    {
      id: 'phishing',
      title: 'Phishing Messages & Impersonation',
      icon: '🎣',
      example: '"Your electricity will be disconnected tonight at 9:30 PM due to unpaid bill. Pay immediately."',
      howToSpot: 'Urgent language combined with an unofficial link or individual UPI ID.',
      whatToDo: 'Never click the link. Open your official utility provider app directly to check dues.',
    },
    {
      id: 'fake_jobs',
      title: 'Fake Job Offers & Recruitment Scams',
      icon: '💼',
      example: 'Work from home earning ₹80,000/month, but you must pay ₹2,500 for laptop insurance first.',
      howToSpot: 'Legitimate employers never ask candidates to pay for interviews, tests, or equipment.',
      whatToDo: 'Never transfer money to get a job. Verify the recruiter on official company email domain.',
    },
    {
      id: 'qr_scams',
      title: 'QR Code Payment Traps',
      icon: '📱',
      example: '"Scan this QR code to receive your ₹10,000 prize or OLX payment into your bank."',
      howToSpot: 'Scanning a QR in a UPI app is ONLY for sending money, never for receiving money.',
      whatToDo: 'Never enter your UPI PIN to receive money. PIN is solely required when you pay.',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-10 py-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
          <BookOpen className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          Learn to Spot the Trick
        </h1>
        <p className="text-sm text-stone-500 max-w-md mx-auto">
          Real examples of online deceptive patterns, manipulation tactics, and how ordinary users can protect themselves.
        </p>
      </div>

      {/* Interactive Mini Quiz: Can You Spot the Trick? */}
      <div className="rounded-3xl bg-amber-500/10 border border-amber-200 p-6 sm:p-8 space-y-5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900">
          <HelpCircle className="w-4 h-4 text-amber-700" />
          <span>Interactive Safety Quiz: Can You Spot the Trick?</span>
        </div>

        <h3 className="text-lg font-bold text-stone-900">
          You receive this SMS from "VK-SBIIN": "Dear customer, your bank account is suspended due to pending KYC. Click http://sbi-verify-kyc.in to update now." What is the safest reaction?
        </h3>

        <div className="space-y-2.5">
          {[
            { id: 0, text: 'Click the link immediately to prevent account suspension.', isCorrect: false },
            { id: 1, text: 'Forward the message to friends to check if their accounts are suspended too.', isCorrect: false },
            { id: 2, text: 'Do not click. Open the official SBI YONO app or visit the branch directly to verify.', isCorrect: true },
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => {
                setQuizAnswer(option.id);
                setQuizSubmitted(true);
              }}
              className={`w-full p-4 rounded-2xl border text-left text-sm font-semibold transition flex items-center justify-between ${
                quizSubmitted && option.isCorrect
                  ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                  : quizSubmitted && quizAnswer === option.id && !option.isCorrect
                  ? 'bg-rose-100 border-rose-300 text-rose-900'
                  : quizAnswer === option.id
                  ? 'bg-amber-100 border-amber-300 text-stone-900'
                  : 'bg-white border-stone-200 text-stone-800 hover:border-stone-300'
              }`}
            >
              <span>{option.text}</span>
              {quizSubmitted && option.isCorrect && <Check className="w-5 h-5 text-emerald-700 shrink-0" />}
              {quizSubmitted && quizAnswer === option.id && !option.isCorrect && <X className="w-5 h-5 text-rose-700 shrink-0" />}
            </button>
          ))}
        </div>

        {quizSubmitted && (
          <div className="p-4 rounded-2xl bg-white border border-stone-200 text-xs text-stone-700 space-y-1">
            <span className="font-bold text-emerald-800 block">Explanation:</span>
            Banks never send third-party domain links (.in, .xyz) via SMS to update confidential KYC. Always open your verified banking application independently.
          </div>
        )}
      </div>

      {/* Educational Cards */}
      <div className="space-y-4">
        <h2 className="text-xs font-black uppercase tracking-wider text-stone-400 px-1">
          Deceptive Pattern Library
        </h2>

        {darkPatterns.map((pattern) => {
          const isExpanded = expandedCard === pattern.id;

          return (
            <div
              key={pattern.id}
              className="rounded-3xl bg-white border border-stone-200 shadow-xs overflow-hidden transition"
            >
              <button
                type="button"
                onClick={() => setExpandedCard(isExpanded ? null : pattern.id)}
                className="w-full p-5 sm:p-6 flex items-center justify-between text-left hover:bg-stone-50/50 transition"
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-2xl">{pattern.icon}</span>
                  <h3 className="text-base font-bold text-stone-900">{pattern.title}</h3>
                </div>
                {isExpanded ? <ChevronUp className="w-5 h-5 text-stone-400" /> : <ChevronDown className="w-5 h-5 text-stone-400" />}
              </button>

              {isExpanded && (
                <div className="px-6 pb-6 pt-2 border-t border-stone-100 space-y-4 animate-in fade-in duration-200">
                  {/* Example */}
                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-150">
                    <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 block mb-1">
                      Real-World Example
                    </span>
                    <p className="text-xs font-mono text-stone-700">"{pattern.example}"</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/60 space-y-1">
                      <span className="font-bold text-amber-900 block">How to spot it:</span>
                      <p className="text-stone-600 leading-relaxed">{pattern.howToSpot}</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/60 space-y-1">
                      <span className="font-bold text-emerald-900 block">What you should do:</span>
                      <p className="text-stone-600 leading-relaxed">{pattern.whatToDo}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
