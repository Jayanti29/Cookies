import React from 'react';
import { Link } from 'react-router-dom';
import { ActionCard } from '../components/ActionCard';
import { useLanguage } from '../i18n';
import {
  Globe,
  Camera,
  QrCode,
  Briefcase,
  MessageSquare,
  AlertTriangle,
  ShieldCheck,
  Cookie,
  ArrowRight,
  Sparkles,
  Gamepad2,
  ShieldAlert,
  CreditCard,
  MousePointerClick,
  FileCheck,
  Send,
  Lock,
} from 'lucide-react';

export const Home: React.FC = () => {
  const { t } = useLanguage();

  const oneTapActions = [
    { label: 'PAY', icon: '💳', to: '/checkout-diff', desc: 'Spot checkout price shifts & sneaky add-ons' },
    { label: 'CLICK', icon: '🔗', to: '/check/qr', desc: 'Verify destination links & QR codes' },
    { label: 'ACCEPT', icon: '🍪', to: '/cookie-truth', desc: 'Audit cookie banners & tracking consent' },
    { label: 'SIGN', icon: '📄', to: '/check/job', desc: 'Scan contracts, job offers & agreements' },
    { label: 'RESPOND', icon: '💬', to: '/check/message', desc: 'Screen suspicious SMS, emails & DMs' },
  ];

  const actionCards = [
    {
      to: '/cookie-truth',
      icon: Cookie,
      title: 'Cookie Truth Scanner',
      description: 'Audit observable cookies, banner biases, and generate Digital Consent Receipts.',
      badge: 'Signature',
    },
    {
      to: '/checkout-diff',
      icon: Sparkles,
      title: 'Checkout Difference',
      description: 'Compare ad screenshot vs checkout total to spot sneaky price increases.',
      badge: 'Multimodal',
    },
    {
      to: '/check/website',
      icon: Globe,
      title: t('home.checkWebsite') || 'Check Website',
      description: t('home.checkWebsiteDesc') || 'Analyze a website before you trust or pay.',
    },
    {
      to: '/camera',
      icon: Camera,
      title: t('home.scanAnythingTitle') || 'Scan Anything',
      description: t('home.scanAnythingDesc') || 'Use your camera or upload an image.',
      badge: 'Camera',
    },
    {
      to: '/check/job',
      icon: Briefcase,
      title: t('home.checkJob') || 'Check Job Offer',
      description: t('home.checkJobDesc') || 'Analyze an offer letter or recruitment message.',
    },
    {
      to: '/check/message',
      icon: MessageSquare,
      title: t('home.checkMessage') || 'Check Message',
      description: t('home.checkMessageDesc') || 'Check suspicious SMS, email, WhatsApp or social-media messages.',
    },
  ];

  return (
    <div className="space-y-12 py-4 sm:py-8 animate-in fade-in duration-300">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-6 pt-4 sm:pt-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold tracking-wide uppercase">
          <span>🍪</span>
          <span>DIGITAL CONSUMER PROTECTION & CONSENT INTELLIGENCE</span>
        </div>

        <div className="space-y-3">
          <p className="text-sm sm:text-base font-bold text-amber-800 uppercase tracking-wider">
            What are you really agreeing to?
          </p>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight leading-[1.1]">
            COOKIES checks what a website wants from you — your MONEY, your DATA, or BOTH.
          </h1>
        </div>

        <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-xl mx-auto">
          Understand hidden costs, deceptive interfaces, tracking consent, and suspicious digital content before you click, accept, pay or trust.
        </p>

        {/* The 3 Core Dimensions Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-left">
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 shadow-xs">
            <span className="font-extrabold text-xs text-amber-950 flex items-center gap-1.5 uppercase tracking-wider">
              <span>💰</span>
              <span>MONEY</span>
            </span>
            <p className="text-xs text-amber-900/90 mt-1 leading-relaxed">
              Financial deception, drip pricing, hidden recurring subscriptions, and checkout fee shifts.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 shadow-xs">
            <span className="font-extrabold text-xs text-blue-950 flex items-center gap-1.5 uppercase tracking-wider">
              <span>🔐</span>
              <span>DATA</span>
            </span>
            <p className="text-xs text-blue-900/90 mt-1 leading-relaxed">
              Tracking consent, asymmetric cookie banners, buried opt-outs, and behavioral profile building.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/80 shadow-xs">
            <span className="font-extrabold text-xs text-purple-950 flex items-center gap-1.5 uppercase tracking-wider">
              <span>🧠</span>
              <span>ATTENTION</span>
            </span>
            <p className="text-xs text-purple-900/90 mt-1 leading-relaxed">
              Dark patterns, fake countdown urgency, confirmshaming, roach motels, and deceptive friction.
            </p>
          </div>
        </div>

        {/* Primary & Secondary CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
          <Link
            to="/check"
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 active:scale-98 text-white font-bold text-base shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>🔍 Check Something</span>
          </Link>

          <Link
            to="/cookie-truth"
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-stone-900 hover:bg-black active:scale-98 text-amber-400 font-bold text-base shadow-xs transition-all flex items-center justify-center gap-2 border border-stone-800"
          >
            <span>🍪 Cookie Truth Scanner</span>
          </Link>
        </div>
      </section>

      {/* CHECK BEFORE YOU Section */}
      <section className="space-y-3 max-w-3xl mx-auto">
        <h2 className="text-xs font-black uppercase tracking-wider text-stone-400 text-center">
          Check Before You Act
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {oneTapActions.map((act) => (
            <Link
              key={act.label}
              to={act.to}
              className="p-3.5 rounded-2xl bg-white border border-stone-200 hover:border-amber-400 hover:shadow-xs transition group text-center space-y-1"
            >
              <div className="text-2xl">{act.icon}</div>
              <span className="font-black text-xs text-stone-900 block group-hover:text-amber-800 transition">
                {act.label}
              </span>
              <p className="text-[10px] text-stone-500 line-clamp-2 leading-tight">
                {act.desc}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Main Feature Cards Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-black uppercase tracking-wider text-stone-400">
            Consumer Safety Verification Tools
          </h2>
          <span className="text-xs text-stone-500 font-medium">Evidence-based assessment</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {actionCards.map((card) => (
            <ActionCard key={card.to} {...card} />
          ))}
        </div>
      </section>

      {/* Interactive Safety Features (True Cost, Game, Authority Admin) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Price Journey */}
        <Link
          to="/true-cost"
          className="p-6 rounded-3xl bg-white border border-stone-200 hover:border-amber-400 shadow-xs transition group space-y-2 flex flex-col justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">Financial Flow</span>
            <h3 className="text-lg font-bold text-stone-900 group-hover:text-amber-800 transition">
              Price Journey
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Trace advertised price down to product, add-ons, service fees, taxes, and auto-renewals.
            </p>
          </div>
          <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-stone-700 group-hover:text-amber-800">
            <span>Calculate Price Path</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        {/* Can You Spot the Trick Game */}
        <Link
          to="/game"
          className="p-6 rounded-3xl bg-white border border-stone-200 hover:border-amber-400 shadow-xs transition group space-y-2 flex flex-col justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold text-purple-800 uppercase tracking-wider block">Interactive Challenge</span>
            <h3 className="text-lg font-bold text-stone-900 group-hover:text-purple-800 transition">
              Can You Spot the Trick?
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Test your ability to spot manipulative consent prompts, sneak-into-basket add-ons, and confirmshaming.
            </p>
          </div>
          <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-stone-700 group-hover:text-purple-800">
            <span>Play Challenge</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        {/* Authority & Admin Center */}
        <Link
          to="/admin"
          className="p-6 rounded-3xl bg-stone-900 text-white border border-stone-800 hover:border-stone-700 shadow-xs transition group space-y-2 flex flex-col justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">Authority Portal</span>
            <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition">
              Admin & Case Center
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Review community reports, manage case lifecycles, and generate formal consumer protection dossiers.
            </p>
          </div>
          <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-amber-400 group-hover:text-amber-300">
            <span>Open Authority Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      </section>
    </div>
  );
};
