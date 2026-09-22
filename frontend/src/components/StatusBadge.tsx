import React from 'react';
import { AnalysisStatus } from '../types';
import { useLanguage } from '../i18n';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, ShieldAlert } from 'lucide-react';

interface StatusBadgeProps {
  status: AnalysisStatus | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  const { t } = useLanguage();

  const config: Record<string, { label: string; bg: string; text: string; border: string; icon: any }> = {
    safe: {
      label: t('status.safe'),
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      icon: CheckCircle2,
    },
    info: {
      label: t('status.info'),
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-200',
      icon: Info,
    },
    review: {
      label: t('status.review'),
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      icon: AlertTriangle,
    },
    multiple_concerns: {
      label: t('status.concerns'),
      bg: 'bg-orange-50',
      text: 'text-orange-800',
      border: 'border-orange-200',
      icon: AlertOctagon,
    },
    high_concern: {
      label: t('status.high'),
      bg: 'bg-rose-50',
      text: 'text-rose-800',
      border: 'border-rose-200',
      icon: ShieldAlert,
    },
  };

  const current = config[status] || config.review;
  const IconComponent = current.icon;

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3.5 py-1.5 text-sm gap-2 font-medium',
    lg: 'px-4 py-2 text-base gap-2.5 font-semibold',
  };

  return (
    <div
      className={`inline-flex items-center rounded-full border ${current.bg} ${current.text} ${current.border} ${sizeClasses[size]}`}
    >
      {showIcon && <IconComponent className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'} />}
      <span>{current.label}</span>
    </div>
  );
};
