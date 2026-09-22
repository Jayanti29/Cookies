import React from 'react';
import { Link } from 'react-router-dom';
import { ActionCard } from '../components/ActionCard';
import { useLanguage } from '../i18n';
import { Globe, Camera, QrCode, Briefcase, MessageSquare, AlertTriangle, ShieldCheck } from 'lucide-react';

export const Home: React.FC = () => {
  const { t } = useLanguage();

  const actionCards = [
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
      to: '/check/qr',
      icon: QrCode,
      title: t('home.checkLink') || 'Check Link / QR',
      description: t('home.checkLinkDesc') || 'Check a link or QR before opening it.',
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
    {
      to: '/reports/new',
      icon: AlertTriangle,
      title: t('home.report') || 'Report Something',
      description: t('home.reportDesc') || 'Report suspicious digital activity to protect others.',
    },
  ];

  return (
    <div className="space-y-12 py-4 sm:py-8 animate-in fade-in duration-300">
      {/* Hero Section */}
      <section className="text-center max-w-2xl mx-auto space-y-6 pt-4 sm:pt-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold tracking-wide uppercase">
          <span>🍪</span>
          <span>Consumer Digital Safety</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight leading-[1.1]">
          {t('home.tagline') || 'Check Before You Trust.'}
        </h1>

        <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-xl mx-auto">
          {t('home.subtitle') ||
            'Check websites, links, messages, job offers, QR codes and suspicious content before you click, pay or respond.'}
        </p>

        {/* Primary & Secondary CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <Link
            to="/check"
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 active:scale-98 text-white font-bold text-base shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>{t('home.checkSomething') || '🔍 Check Something'}</span>
          </Link>

          <Link
            to="/camera"
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white hover:bg-stone-50 active:scale-98 border border-stone-200 text-stone-800 font-bold text-base shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <span>{t('home.scanAnything') || '📷 Scan Anything'}</span>
          </Link>
        </div>

        <p className="text-xs text-stone-400 font-medium">
          {t('home.notSure') || 'Not sure? Just show COOKIES.'}
        </p>
      </section>

      {/* Main 6 Action Cards Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-black uppercase tracking-wider text-stone-400">
            What would you like to verify?
          </h2>
          <span className="text-xs text-stone-500 font-medium">One touch verification</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {actionCards.map((card) => (
            <ActionCard key={card.to} {...card} />
          ))}
        </div>
      </section>

      {/* Additional Tools Banner */}
      <section className="rounded-3xl bg-white border border-stone-200/80 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>Interactive Safety Tools</span>
          </div>
          <h3 className="text-xl font-bold text-stone-900">Track subscriptions & calculate true costs</h3>
          <p className="text-sm text-stone-500 max-w-xl">
            Reveal hidden recurring charges with our deterministic True Cost Calculator, or monitor renewal dates in Subscription Watchdog.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/true-cost"
            className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition"
          >
            True Cost Calculator
          </Link>
          <Link
            to="/subscriptions"
            className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition"
          >
            Subscriptions
          </Link>
        </div>
      </section>
    </div>
  );
};
