import React from 'react';
import { AlertCircle } from 'lucide-react';

export const DemoLabel: React.FC<{ inline?: boolean }> = ({ inline = false }) => {
  if (inline) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-100 text-amber-900 border border-amber-300">
        <AlertCircle className="w-3 h-3" />
        DEMO DATA
      </span>
    );
  }

  return (
    <div className="w-full bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 flex items-center justify-between text-xs text-amber-900 font-medium">
      <div className="flex items-center gap-2">
        <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white font-black text-[10px] tracking-wider uppercase">
          DEMO DATA
        </span>
        <span>This result was generated from demo benchmark samples for demonstration.</span>
      </div>
    </div>
  );
};
