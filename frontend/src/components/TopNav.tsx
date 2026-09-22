import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LanguageSelector } from './LanguageSelector';
import { useLanguage } from '../i18n';
import { useAuth } from '../hooks/useAuth';
import { Shield, User as UserIcon } from 'lucide-react';

export const TopNav: React.FC = () => {
  const location = useLocation();
  const { t } = useLanguage();
  const { currentUser } = useAuth();

  const navLinks = [
    { to: '/', label: t('nav.home') || 'Home' },
    { to: '/check', label: t('nav.check') || 'Check' },
    { to: '/reports', label: t('nav.reports') || 'Reports' },
    { to: '/learn', label: 'Learn' },
    { to: '/community', label: 'Community' },
    { to: '/evidence', label: 'My Evidence' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAFAF8]/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="text-2xl transform group-hover:rotate-12 transition-transform duration-200">🍪</span>
          <span className="font-extrabold text-xl tracking-tight text-stone-900">COOKIES</span>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                isActive(link.to)
                  ? 'bg-stone-200/70 text-stone-900 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions: Language + Auth Profile */}
        <div className="flex items-center gap-3">
          <LanguageSelector />
          <Link
            to={currentUser ? '/profile' : '/auth'}
            className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-full border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-sm font-medium transition shadow-sm"
          >
            <UserIcon className="w-4 h-4 text-stone-600" />
            <span className="hidden sm:inline">
              {currentUser ? (currentUser.displayName || currentUser.email?.split('@')[0]) : 'Sign In'}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
};
