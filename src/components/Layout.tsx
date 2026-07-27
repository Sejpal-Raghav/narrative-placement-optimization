import React from 'react';
import { LayoutDashboard, Settings, Activity, Database, Headphones, BarChart2 } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-zinc-50 font-sans text-zinc-900 flex">
      {/* Slim Left Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-zinc-200 flex flex-col h-screen sticky top-0">
        <div className="h-14 flex items-center px-5 border-b border-zinc-200">
          <div className="flex items-center gap-2 text-zinc-900">
            <LayoutDashboard size={18} />
            <h1 className="text-sm font-semibold tracking-tight uppercase">StoryYield</h1>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          <div className="px-3 pb-2 pt-4 text-xs font-semibold text-zinc-500 uppercase tracking-widest">
            Optimization
          </div>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-md bg-zinc-100 text-zinc-900 text-sm font-medium transition-colors">
            <Activity size={16} />
            Placement Engine
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-md text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 text-sm font-medium transition-colors">
            <BarChart2 size={16} />
            Yield Analytics
          </a>
          
          <div className="px-3 pb-2 pt-6 text-xs font-semibold text-zinc-500 uppercase tracking-widest">
            Configuration
          </div>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-md text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 text-sm font-medium transition-colors">
            <Database size={16} />
            Data Sources
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-md text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 text-sm font-medium transition-colors">
            <Headphones size={16} />
            Audio Inventory
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-md text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 text-sm font-medium transition-colors">
            <Settings size={16} />
            Settings
          </a>
        </nav>
        
        <div className="p-4 border-t border-zinc-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-600">
              RS
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-zinc-900">Raghav Sejpal</span>
              <span className="text-[10px] text-zinc-500">Growth Engineering</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 flex-shrink-0 bg-white border-b border-zinc-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center text-sm font-medium text-zinc-500">
            <span>Optimization</span>
            <span className="mx-2">/</span>
            <span className="text-zinc-900">Placement Engine</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-medium text-zinc-600">System Nominal</span>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
