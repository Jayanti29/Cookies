import React from 'react';
import { ShieldCheck, Camera, Lock } from 'lucide-react';

interface PrivacyIndicatorProps {
  type: 'camera' | 'upload' | 'vault';
}

export const PrivacyIndicator: React.FC<PrivacyIndicatorProps> = ({ type }) => {
  const configs = {
    camera: {
      icon: Camera,
      text: 'Camera active — frames are analyzed locally and not permanently stored.',
      badge: 'Camera Active',
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    upload: {
      icon: ShieldCheck,
      text: 'Your file is used solely to analyze the content you submitted.',
      badge: 'Private Analysis',
      color: 'text-stone-600 bg-stone-100 border-stone-200',
    },
    vault: {
      icon: Lock,
      text: 'Only you can access saved evidence unless you choose to include it in a community report.',
      badge: 'End-to-End Private',
      color: 'text-amber-800 bg-amber-50 border-amber-200',
    },
  };

  const current = configs[type];
  const Icon = current.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${current.color}`}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{current.badge}</span>
      <span className="hidden sm:inline text-stone-400">|</span>
      <span className="hidden sm:inline font-normal text-stone-600">{current.text}</span>
    </div>
  );
};
