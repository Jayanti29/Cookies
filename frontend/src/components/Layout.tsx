import React from 'react';
import { TopNav } from './TopNav';
import { BottomNav } from './BottomNav';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1A1A1A] flex flex-col font-sans antialiased selection:bg-amber-200">
      <TopNav />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12">
        {children}
      </main>
      <BottomNav />
    </div>
  );
};
