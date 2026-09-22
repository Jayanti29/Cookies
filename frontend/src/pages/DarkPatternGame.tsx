import React, { useState } from 'react';
import { Gamepad2, CheckCircle2, XCircle, AlertTriangle, ArrowRight, RotateCcw, Trophy, Award, Sparkles } from 'lucide-react';

interface Challenge {
  id: number;
  title: string;
  scenario: string;
  uiPrompt: string;
  options: {
    id: string;
    text: string;
    isDeceptiveChoice: boolean;
    explanation: string;
  }[];
  darkPatternName: string;
  deceptiveMechanism: string;
  safeAlternative: string;
}

const CHALLENGES: Challenge[] = [
  {
    id: 1,
    title: 'The Cookie Wall Choice',
    scenario: 'You land on a news website to read an article. A large pop-up covers the screen.',
    uiPrompt: 'Which button would you click?',
    options: [
      {
        id: 'opt1',
        text: 'ACCEPT ALL & CONTINUE READING (Bright Amber Button)',
        isDeceptiveChoice: true,
        explanation: 'Clicking the prominent button consents to 800+ third-party marketing partners and cross-site behavioral tracking with zero customization.',
      },
      {
        id: 'opt2',
        text: 'Manage Preferences / Reject Non-Essential (Small gray text)',
        isDeceptiveChoice: false,
        explanation: 'Excellent choice! Opening preferences lets you reject tracking cookies while still accessing the content with strictly functional cookies.',
      },
    ],
    darkPatternName: 'Asymmetric Choice / Visual Interference',
    deceptiveMechanism: 'The website makes the privacy-invasive option vibrant and effortless while hiding the privacy-preserving option in faded low-contrast text.',
    safeAlternative: 'Always look for secondary links like "Manage Settings" or "Reject Non-Essential" before clicking bright primary buttons.',
  },
  {
    id: 2,
    title: 'The Sneak-Into-Basket Add-on',
    scenario: 'You are ordering a ₹14,999 smartphone on an e-commerce platform. You reach the final cart stage.',
    uiPrompt: 'What action should you take before tapping "Proceed to Pay"?',
    options: [
      {
        id: 'opt1',
        text: 'Tap "Proceed to Pay" immediately without expanding cart line items',
        isDeceptiveChoice: true,
        explanation: 'You would have been billed an extra ₹699 for a "Comprehensive 1-Year Screen Protection" that was pre-checked into your cart by default.',
      },
      {
        id: 'opt2',
        text: 'Inspect the itemized breakdown and uncheck pre-selected protection plans',
        isDeceptiveChoice: false,
        explanation: 'Spot on! Identifying and unchecking pre-ticked add-ons prevents drip markups from inflating your total.',
      },
    ],
    darkPatternName: 'Sneak Into Basket / Preselection',
    deceptiveMechanism: 'Optional paid warranties or accessories are enabled by default, exploiting the consumer\'s assumption that only their requested product is in the cart.',
    safeAlternative: 'Always inspect the line-item breakdown at checkout to uncheck pre-selected add-ons or insurance plans.',
  },
  {
    id: 3,
    title: 'The ₹9 Trial Auto-Mandate',
    scenario: 'A document conversion tool offers: "Convert your PDF for just ₹9! Instant Access".',
    uiPrompt: 'What should you check before entering your UPI PIN or card details?',
    options: [
      {
        id: 'opt1',
        text: 'Enter payment details since ₹9 is a negligible amount',
        isDeceptiveChoice: true,
        explanation: 'Hidden in tiny light-gray terms is an auto-debit mandate that will charge ₹2,499 every week starting on day 3.',
      },
      {
        id: 'opt2',
        text: 'Read the fine print near the checkout button to check for recurring mandates',
        isDeceptiveChoice: false,
        explanation: 'Great eye! You caught the forced continuity trap before authorizing a recurring auto-pay mandate.',
      },
    ],
    darkPatternName: 'Forced Continuity / Hidden Renewal Trap',
    deceptiveMechanism: 'A very low introductory price is used as bait to capture recurring billing authorization without transparent renewal warnings.',
    safeAlternative: 'Never authorize payments without verifying if the checkout registers an e-mandate or recurring autopay.',
  },
  {
    id: 4,
    title: 'The Confirmshaming Exit Popup',
    scenario: 'You decide to decline an expensive newsletter subscription and click the exit cross.',
    uiPrompt: 'Which option represents the confirmshaming dark pattern?',
    options: [
      {
        id: 'opt1',
        text: '"No thanks, I prefer paying full price and hate saving money"',
        isDeceptiveChoice: true,
        explanation: 'Correct! This button uses emotional guilt and condescending language to manipulate you into second-guessing your decline.',
      },
      {
        id: 'opt2',
        text: '"Close" or "No thank you"',
        isDeceptiveChoice: false,
        explanation: 'Neutral decline options respect user autonomy without psychological manipulation.',
      },
    ],
    darkPatternName: 'Confirmshaming',
    deceptiveMechanism: 'The website emotionally manipulates the user by wording the opt-out button in a way that shames or insults their intelligence.',
    safeAlternative: 'Recognize emotional language in buttons as a manipulative psychological trick and decline without guilt.',
  },
  {
    id: 5,
    title: 'The Fake Urgency Countdown',
    scenario: 'Booking a hotel room: A bright red countdown clock pulses: "Only 1 room left! 32 people are looking right now! Deal expires in 04:12".',
    uiPrompt: 'What is the safest assessment of this urgency cue?',
    options: [
      {
        id: 'opt1',
        text: 'Rush through checkout immediately before the timer expires',
        isDeceptiveChoice: true,
        explanation: 'Rushing bypasses your analytical thinking and causes you to miss added booking fees and non-refundable cancellation penalties.',
      },
      {
        id: 'opt2',
        text: 'Pause, recognize artificial scarcity, and compare prices on alternative channels',
        isDeceptiveChoice: false,
        explanation: 'Smart thinking! Refreshing the page often resets these automated countdown timers entirely.',
      },
    ],
    darkPatternName: 'Fake Urgency / Artificial Scarcity',
    deceptiveMechanism: 'Scripted timers and fabricated scarcity cues induce panic and rush users into hasty financial decisions.',
    safeAlternative: 'Never let countdown timers dictate your purchase speed. Cross-check availability independently.',
  },
];

export const DarkPatternGame: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasRevealed, setHasRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const currentChallenge = CHALLENGES[currentIdx];

  const handleSelectOption = (optionId: string) => {
    if (hasRevealed) return;
    setSelectedOptionId(optionId);
    setHasRevealed(true);

    const option = currentChallenge.options.find((o) => o.id === optionId);
    if (option && !option.isDeceptiveChoice) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < CHALLENGES.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOptionId(null);
      setHasRevealed(false);
    } else {
      setCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOptionId(null);
    setHasRevealed(false);
    setScore(0);
    setCompleted(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>INTERACTIVE CONSUMER CHALLENGE</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          Can You Spot the Trick?
        </h1>
        <p className="text-sm text-stone-600 max-w-md mx-auto">
          Test your instincts against real deceptive interfaces. Learn how dark patterns nudge people into unintended payments and consent.
        </p>
      </div>

      {!completed ? (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-6">
          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-stone-500 uppercase tracking-wider">
              <span>Challenge {currentIdx + 1} of {CHALLENGES.length}</span>
              <span>Score: {score} / {CHALLENGES.length}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
              <div
                className="h-full bg-amber-600 transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / CHALLENGES.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Scenario */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-stone-900">
              {currentChallenge.title}
            </h3>
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-700 leading-relaxed">
              <span className="font-bold text-stone-900 block mb-1">Scenario:</span>
              {currentChallenge.scenario}
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-800">
              {currentChallenge.uiPrompt}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentChallenge.options.map((option) => {
              const isSelected = selectedOptionId === option.id;
              let btnStyle = 'border-stone-200 hover:border-amber-400 bg-white';

              if (hasRevealed) {
                if (isSelected) {
                  btnStyle = option.isDeceptiveChoice
                    ? 'border-rose-300 bg-rose-50/70 text-rose-950'
                    : 'border-emerald-300 bg-emerald-50/70 text-emerald-950';
                } else if (!option.isDeceptiveChoice) {
                  btnStyle = 'border-emerald-300 bg-emerald-50/40 text-emerald-950';
                }
              }

              return (
                <button
                  key={option.id}
                  onClick={() => handleSelectOption(option.id)}
                  disabled={hasRevealed}
                  className={`w-full p-4 rounded-2xl border text-left text-xs font-semibold transition flex items-center justify-between gap-3 ${btnStyle}`}
                >
                  <span className="leading-relaxed">{option.text}</span>
                  {hasRevealed && (
                    <span>
                      {!option.isDeceptiveChoice ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : isSelected ? (
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      ) : null}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Educational Reveal */}
          {hasRevealed && (
            <div className="p-5 rounded-2xl bg-stone-100 border border-stone-200 space-y-3 text-xs animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-950 font-bold text-[11px]">
                  Pattern: {currentChallenge.darkPatternName}
                </span>
              </div>

              <p className="text-stone-700 leading-relaxed">
                <span className="font-bold text-stone-900">What made this deceptive: </span>
                {currentChallenge.deceptiveMechanism}
              </p>

              <p className="text-stone-700 leading-relaxed">
                <span className="font-bold text-emerald-800">Safe Rule of Thumb: </span>
                {currentChallenge.safeAlternative}
              </p>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleNext}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
                >
                  <span>{currentIdx < CHALLENGES.length - 1 ? 'Next Challenge' : 'See Results'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Completed Summary */
        <div className="p-8 rounded-3xl bg-white border border-stone-200 shadow-xs text-center space-y-5 animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto text-3xl">
            🏆
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-stone-900 tracking-tight">
              Challenge Completed!
            </h2>
            <p className="text-xs text-stone-500">
              You scored <span className="font-bold text-stone-900">{score}</span> out of <span className="font-bold text-stone-900">{CHALLENGES.length}</span> deceptive patterns spotted.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-700 text-left space-y-1.5 max-w-md mx-auto">
            <span className="font-bold text-stone-900 block">Key Takeaways for Daily Browsing:</span>
            <ul className="list-disc list-inside space-y-1 text-stone-600">
              <li>Always check for "Manage Settings" on cookie banners</li>
              <li>Inspect itemized line items at checkout for pre-selected add-ons</li>
              <li>Scrutinize ₹1 or ₹9 trial bait for ongoing auto-debit mandates</li>
              <li>Never let fake countdown urgency dictate purchase speed</li>
            </ul>
          </div>

          <button
            onClick={handleRestart}
            className="px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs inline-flex items-center gap-2 transition shadow-xs"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Challenge Again</span>
          </button>
        </div>
      )}
    </div>
  );
};
