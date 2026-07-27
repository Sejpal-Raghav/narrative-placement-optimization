import React from 'react';
import { LayoutDashboard } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-zinc-50 font-sans text-zinc-900 flex flex-col">
      {/* Top Navigation */}
      <header className="w-full border-b border-zinc-200 bg-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="text-zinc-900" size={20} />
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">StoryYield</h1>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
