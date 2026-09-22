import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Camera, FileText, User } from 'lucide-react';
import { useLanguage } from '../i18n';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const { t } = useLanguage();

  const navItems = [
    { to: '/', label: t('nav.home') || 'Home', icon: Home },
    { to: '/check', label: t('nav.check') || 'Check', icon: Search },
    { to: '/camera', label: t('nav.camera') || 'Camera', icon: Camera, isCenter: true },
    { to: '/reports', label: t('nav.reports') || 'Reports', icon: FileText },
    { to: '/profile', label: t('nav.profile') || 'Profile', icon: User },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-2 py-1 safe-area-pb">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to);

          if (item.isCenter) {
            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex flex-col items-center -mt-5 group"
                aria-label={item.label}
              >
                <div className="w-13 h-13 rounded-full bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center shadow-lg ring-4 ring-[#FAFAF8] transition-transform active:scale-95">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-semibold mt-1 text-stone-800">{item.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center py-1.5 px-3 rounded-lg transition ${
                active ? 'text-amber-800 font-semibold' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
              <span className="text-[11px] mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
