import React from 'react';
import { LayoutDashboard } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-zinc-50 font-sans text-zinc-900 flex flex-col">
      {/* Top Navigation */}
      <header className="w-full h-14 border-b border-zinc-200 bg-white px-8 flex items-center sticky top-0 z-10">
        <div className="flex items-center gap-2 text-zinc-900">
          <LayoutDashboard size={18} />
          <h1 className="text-sm font-semibold tracking-tight uppercase">NARRATIVE PLACEMENT OPTIMIZATION</h1>
        </div>
      </header>
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
