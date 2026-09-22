import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { StatusBadge } from '../components/StatusBadge';
import { Shield, ArrowRight, Globe, MessageSquare, CreditCard, ExternalLink } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();

  const stats = [
    { label: 'Sites checked', value: 27, icon: Globe },
    { label: 'Items analyzed', value: 43, icon: Shield },
    { label: 'Reports submitted', value: 8, icon: MessageSquare },
    { label: 'Subscriptions tracked', value: 5, icon: CreditCard },
  ];

  const recentChecks = [
    {
      title: 'amazon-prime-renewal-discount.in',
      type: 'Website',
      status: 'safe',
      date: 'Today, 11:20 AM',
    },
    {
      title: 'WhatsApp message: KYC verification demand',
      type: 'Message',
      status: 'high_concern',
      date: 'Yesterday',
    },
    {
      title: 'Google Career: Remote Support Specialist letter',
      type: 'Job Offer',
      status: 'multiple_concerns',
      date: '20 Sept 2026',
    },
    {
      title: 'StreamFlix annual subscription checkout',
      type: 'Website',
      status: 'review',
      date: '18 Sept 2026',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            My Safety Overview
          </h1>
          <p className="text-sm text-stone-500 mt-0.5">
            Your personal digital hygiene and verification statistics.
          </p>
        </div>

        <Link
          to="/check"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition"
        >
          <span>🔍 Check Something New</span>
        </Link>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="p-5 rounded-3xl bg-white border border-stone-200 shadow-xs flex flex-col justify-between"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center mb-3">
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-3xl font-black text-stone-900 tracking-tight">{stat.value}</p>
                <p className="text-xs font-semibold text-stone-500 mt-1">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="rounded-3xl bg-white border border-stone-200 p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-stone-900">Recent Activity</h3>
          <span className="text-xs font-semibold text-stone-400">Past 30 days</span>
        </div>

        <div className="divide-y divide-stone-100">
          {recentChecks.map((item, idx) => (
            <div key={idx} className="py-3.5 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-stone-800 line-clamp-1">{item.title}</p>
                <div className="flex items-center gap-2 text-xs text-stone-400">
                  <span className="font-semibold text-stone-600">{item.type}</span>
                  <span>•</span>
                  <span>{item.date}</span>
                </div>
              </div>

              <div className="shrink-0">
                <StatusBadge status={item.status} size="sm" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
