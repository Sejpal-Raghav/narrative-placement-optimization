import React from 'react';
import Link from 'next/link';
import { FileText, Activity, TrendingUp, ArrowRight, LayoutDashboard } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 flex flex-col items-center justify-center p-8">
      
      <div className="max-w-3xl w-full">
        {/* Header / Logo */}
        <div className="flex items-center gap-2 text-zinc-900 mb-16">
          <LayoutDashboard size={20} />
          <h1 className="text-sm font-semibold tracking-tight uppercase">Narrative Placement Optimization</h1>
        </div>

        {/* Hero Section */}
        <div className="mb-16">
          <h2 className="text-4xl font-semibold tracking-tight text-zinc-900 mb-4">
            Deterministic yield optimization <br /> for audio platforms.
          </h2>
          <p className="text-sm text-zinc-500 leading-relaxed max-w-2xl">
            Static ad placements cause unnecessary session churn and sub-optimal conversion rates. 
            This engine dynamically parses audio transcripts to correlate content tension with drop-off risk, 
            scheduling monetization triggers precisely when engagement peaks.
          </p>
        </div>

        {/* Architecture Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 border-t border-zinc-200 pt-12">
          
          <div className="space-y-3">
            <FileText size={18} className="text-zinc-400" />
            <h3 className="text-sm font-semibold tracking-tight text-zinc-900">1. Signal Ingestion</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              The localized inference engine parses `.epub` or `.txt` transcripts to deterministically map narrative pacing and cliffhanger intensity.
            </p>
          </div>

          <div className="space-y-3">
            <Activity size={18} className="text-zinc-400" />
            <h3 className="text-sm font-semibold tracking-tight text-zinc-900">2. Risk Prediction</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              The engine flags structural lulls and weak narrative hooks, mapping them to timestamps where listener abandonment probability spikes.
            </p>
          </div>

          <div className="space-y-3">
            <TrendingUp size={18} className="text-zinc-400" />
            <h3 className="text-sm font-semibold tracking-tight text-zinc-900">3. Yield Optimization</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Ads are dynamically injected into high-engagement segments to maximize completion rates, while paywalls are gated behind upper-quartile cliffhangers.
            </p>
          </div>

        </div>

        {/* CTA */}
        <div className="border-t border-zinc-200 pt-12 flex items-center justify-between">
          <div className="text-xs text-zinc-400 font-medium uppercase tracking-widest">
            Try the Prototype
          </div>
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 bg-zinc-900 text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
          >
            View Dashboard
            <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </div>
  );
}
