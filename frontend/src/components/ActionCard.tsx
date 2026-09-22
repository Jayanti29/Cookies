import React from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon, ArrowUpRight } from 'lucide-react';

interface ActionCardProps {
  to: string;
  icon: LucideIcon | string;
  title: string;
  description: string;
  badge?: string;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  to,
  icon: Icon,
  title,
  description,
  badge,
}) => {
  return (
    <Link
      to={to}
      className="group relative flex flex-col justify-between p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/80 shadow-xs hover:shadow-md hover:border-amber-300 transition-all duration-200"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 group-hover:bg-amber-100 flex items-center justify-center transition-colors">
            {typeof Icon === 'string' ? (
              <span className="text-2xl">{Icon}</span>
            ) : (
              <Icon className="w-6 h-6 text-stone-700 group-hover:text-amber-800 transition-colors" />
            )}
          </div>
          <div className="flex items-center gap-1">
            {badge && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                {badge}
              </span>
            )}
            <ArrowUpRight className="w-5 h-5 text-stone-300 group-hover:text-amber-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>
        </div>

        <h3 className="text-base font-bold text-stone-900 mb-1.5 group-hover:text-amber-950 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-stone-500 line-clamp-2 leading-relaxed">
          {description}
        </p>
      </div>
    </Link>
  );
};
