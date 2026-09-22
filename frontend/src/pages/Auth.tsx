import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithEmail, registerWithEmail, loginWithGoogle, loginAsDemoUser } from '../services/auth';
import { useStore } from '../store';
import { Lock, Mail, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const Auth: React.FC = () => {
  const navigate = useNavigate();
  const setUser = useStore((s) => s.setUser);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = async () => {
    try {
      setLoading(true);
      const demoUser = await loginAsDemoUser();
      setUser(demoUser);
      toast.success('Logged in as Safety Citizen (Demo Mode)!');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        await registerWithEmail(email, password);
        toast.success('Account created successfully!');
      } else {
        await loginWithEmail(email, password);
        toast.success('Welcome back!');
      }
      navigate('/dashboard');
    } catch (err: any) {
      if (err?.code === 'auth/unauthorized-domain' || err?.message?.includes('unauthorized-domain')) {
        toast('IP domain not whitelisted in Firebase — activated Demo Account!', { icon: '⚡' });
        await handleDemoLogin();
      } else {
        toast.error(err.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
      toast.success('Signed in with Google!');
      navigate('/dashboard');
    } catch (err: any) {
      if (err?.code === 'auth/unauthorized-domain' || err?.message?.includes('unauthorized-domain')) {
        toast('Google OAuth requires authorized domain — activated Demo Account!', { icon: '⚡' });
        await handleDemoLogin();
      } else {
        toast.error(err.message || 'Google sign in failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 py-8 animate-in fade-in duration-200">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-3xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto text-2xl">
          🍪
        </div>
        <h1 className="text-2xl font-black text-stone-900 tracking-tight">
          {isSignUp ? 'Create your COOKIES account' : 'Welcome back to COOKIES'}
        </h1>
        <p className="text-xs text-stone-500 max-w-xs mx-auto">
          Save evidence, track recurring subscriptions, and participate in community safety.
        </p>
      </div>

      <div className="rounded-3xl bg-white border border-stone-200 p-6 sm:p-8 space-y-5 shadow-xs">
        {/* Instant Demo Sign-In Button */}
        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-2xl bg-amber-600 hover:bg-amber-700 font-bold text-xs text-white flex items-center justify-center gap-2.5 transition shadow-sm"
        >
          <Zap className="w-4 h-4 text-amber-200 fill-amber-200" />
          <span>⚡ Instant Demo Access (No Password Needed)</span>
        </button>

        {/* Google Sign-in */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="w-full py-3 px-4 rounded-2xl border border-stone-300 hover:bg-stone-50 font-semibold text-xs text-stone-800 flex items-center justify-center gap-3 transition shadow-2xs"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-stone-200" />
          <span className="text-[11px] uppercase tracking-wider text-stone-400 font-bold">or</span>
          <div className="flex-1 h-px bg-stone-200" />
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-sm transition shadow-sm"
          >
            {loading ? 'Please wait…' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="text-center pt-1">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-amber-800 hover:text-amber-900 font-semibold"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
          </button>
        </div>
      </div>
    </div>
  );
};
