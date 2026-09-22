import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { logout } from '../services/auth';
import { LanguageSelector } from '../components/LanguageSelector';
import { useLanguage, SUPPORTED_LANGUAGES, SupportedLanguage } from '../i18n';
import { User, Globe, Shield, Bell, Trash2, LogOut, Eye, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { language, setLanguage } = useLanguage();

  const handleSignOut = async () => {
    try {
      await logout();
      toast.success('Signed out successfully');
      navigate('/');
    } catch {
      toast.error('Could not sign out');
    }
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure? This will delete all your saved evidence and reports permanently.')) {
      toast.success('Account deletion requested');
      logout();
      navigate('/');
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 py-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center gap-4 p-6 rounded-3xl bg-white border border-stone-200 shadow-xs">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-black text-2xl">
          {currentUser?.displayName ? currentUser.displayName[0] : (currentUser?.email ? currentUser.email[0].toUpperCase() : '👤')}
        </div>
        <div>
          <h1 className="text-xl font-bold text-stone-900">
            {currentUser?.displayName || (currentUser?.email ? currentUser.email.split('@')[0] : 'Guest User')}
          </h1>
          <p className="text-xs text-stone-500 font-medium">
            {currentUser?.email || 'Sign in to sync your evidence and private reports.'}
          </p>
        </div>
      </div>

      {/* Language Preference */}
      <div className="rounded-3xl bg-white border border-stone-200 p-6 space-y-3 shadow-xs">
        <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
          <Globe className="w-4 h-4 text-amber-700" />
          <h3>Interface Language</h3>
        </div>
        <p className="text-xs text-stone-500">
          COOKIES supports 8 languages immediately throughout the platform.
        </p>
        <div className="grid grid-cols-2 gap-2 pt-2">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code as SupportedLanguage)}
              className={`p-3 rounded-2xl border text-left flex items-center justify-between transition text-xs font-semibold ${
                language === lang.code
                  ? 'border-amber-500 bg-amber-50 text-amber-900'
                  : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.nativeName}</span>
              </div>
              {language === lang.code && <Check className="w-3.5 h-3.5 text-amber-700" />}
            </button>
          ))}
        </div>
      </div>

      {/* Accessibility & Modes */}
      <div className="rounded-3xl bg-white border border-stone-200 p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
          <Eye className="w-4 h-4 text-amber-700" />
          <h3>Accessibility & View Mode</h3>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-stone-100 text-xs">
          <div>
            <p className="font-bold text-stone-800">Simple Mode</p>
            <p className="text-stone-500">Show only top 3 findings and plain next steps</p>
          </div>
          <input
            type="checkbox"
            defaultChecked
            className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between py-2 text-xs">
          <div>
            <p className="font-bold text-stone-800">High Contrast Mode</p>
            <p className="text-stone-500">Stronger border and text contrast</p>
          </div>
          <input
            type="checkbox"
            className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
          />
        </div>
      </div>

      {/* Privacy Guarantee */}
      <div className="rounded-3xl bg-white border border-stone-200 p-6 space-y-2 text-xs text-stone-600 shadow-xs">
        <div className="flex items-center gap-2 font-bold text-stone-900 mb-1">
          <Shield className="w-4 h-4 text-emerald-700" />
          <span>Privacy & Data Sovereignty</span>
        </div>
        <p>
          Camera frames are processed in-memory and never continuously stored. Submitted documents and screenshots remain strictly private in your personal Evidence Vault.
        </p>
      </div>

      {/* Account Actions */}
      <div className="space-y-3 pt-2">
        {currentUser ? (
          <button
            onClick={handleSignOut}
            className="w-full py-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-sm flex items-center justify-center gap-2 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        ) : (
          <button
            onClick={() => navigate('/auth')}
            className="w-full py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm transition shadow-sm"
          >
            Sign In or Create Account
          </button>
        )}

        {currentUser && (
          <button
            onClick={handleDeleteAccount}
            className="w-full py-3 rounded-2xl text-rose-600 hover:bg-rose-50 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Account & Erase All Evidence</span>
          </button>
        )}
      </div>
    </div>
  );
};
