import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, SUPPORTED_LANGUAGES, SupportedLanguage } from '../i18n';
import { Globe, ChevronDown, Check } from 'lucide-react';

export const LanguageSelector: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-sm font-medium transition shadow-sm"
        aria-expanded={isOpen}
      >
        <Globe className="w-4 h-4 text-amber-700" />
        <span>{compact ? currentLang.code.toUpperCase() : currentLang.nativeName}</span>
        <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white shadow-xl ring-1 ring-black/5 divide-y divide-stone-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="py-1">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code as SupportedLanguage);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition ${
                  language === lang.code
                    ? 'bg-amber-50 text-amber-900 font-semibold'
                    : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{lang.flag}</span>
                  <div>
                    <span className="block text-xs font-normal text-stone-500">{lang.name}</span>
                    <span className="block">{lang.nativeName}</span>
                  </div>
                </div>
                {language === lang.code && <Check className="w-4 h-4 text-amber-700" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
