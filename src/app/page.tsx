"use client";

import React, { useState, useMemo, useRef } from 'react';
import Layout from '@/components/Layout';
import MetricCard from '@/components/ui/MetricCard';
import TradeoffSlider from '@/components/ui/TradeoffSlider';
import TensionChart from '@/components/TensionChart';
import resultsData from '@/data/results.json';
import { EpisodeData, optimizePlacements } from '@/lib/optimizer';
import { AlertCircle, FileText, TrendingUp, Activity, Code, UploadCloud, Loader2, ArrowRight } from 'lucide-react';

const initialEpisodes = resultsData as Record<string, EpisodeData>;

export default function Dashboard() {
  const [episodes, setEpisodes] = useState<Record<string, EpisodeData>>(initialEpisodes);
  const [aggressiveness, setAggressiveness] = useState(5);
  const [selectedEpId, setSelectedEpId] = useState(Object.keys(initialEpisodes)[0]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const episodeList = useMemo(() => Object.values(episodes).sort((a, b) => a.episode_number - b.episode_number), [episodes]);
  const selectedEp = episodes[selectedEpId];
  
  const allPlacements = useMemo(() => {
    return optimizePlacements(episodes, aggressiveness);
  }, [episodes, aggressiveness]);

  const currentPlacements = useMemo(() => {
    return allPlacements.filter(p => p.episodeId === selectedEpId);
  }, [allPlacements, selectedEpId]);

  // Aggregate metrics
  const totalAds = allPlacements.filter(p => p.action === 'ad_break').length;
  const totalPaywalls = allPlacements.filter(p => p.action === 'paywall').length;
  const avgUplift = allPlacements.length 
    ? allPlacements.reduce((sum, p) => sum + p.projected_uplift, 0) / allPlacements.length 
    : 0;
  const avgChurnRisk = allPlacements.length 
    ? allPlacements.reduce((sum, p) => sum + p.churn_risk, 0) / allPlacements.length 
    : 0;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/extract', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const newEpisode: EpisodeData = await res.json();
      
      setEpisodes(prev => ({
        ...prev,
        [newEpisode.id]: newEpisode
      }));
      setSelectedEpId(newEpisode.id);
    } catch (err) {
      console.error(err);
      alert("Failed to extract narrative signals from file.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!selectedEp) {
    return (
      <Layout>
        <div className="flex h-full items-center justify-center text-zinc-500">
          Loading dashboard...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8 max-w-7xl mx-auto">
        <header className="mb-8">
          <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">Yield Optimizer Engine</h2>
          <p className="text-sm text-zinc-500 mt-1 max-w-3xl">
            A deterministic growth engine that maximizes LTV by replacing fixed-schedule ad breaks with dynamic, content-aware monetization triggers. We predict drop-off risk to minimize churn and identify high-engagement plateaus to maximize eCPM.
          </p>
        </header>

        {/* Growth Pipeline Explainer */}
        <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-xl p-6 mb-8 text-white shadow-md">
          <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-4">How It Works</h3>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <div className="bg-indigo-500/20 text-indigo-300 p-1.5 rounded">
                  <FileText size={18} />
                </div>
                <h4 className="font-medium text-zinc-100">1. Content Parsing</h4>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">
                We analyze the raw episode script to map out pacing changes, hook strength, and cliffhangers.
              </p>
            </div>
            
            <div className="hidden md:block text-zinc-600 shrink-0">
              <ArrowRight size={24} />
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <div className="bg-amber-500/20 text-amber-300 p-1.5 rounded">
                  <Activity size={18} />
                </div>
                <h4 className="font-medium text-zinc-100">2. Risk Mapping</h4>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">
                We flag exact timestamps where listeners are most likely to drop off due to low narrative tension.
              </p>
            </div>

            <div className="hidden md:block text-zinc-600 shrink-0">
              <ArrowRight size={24} />
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <div className="bg-emerald-500/20 text-emerald-300 p-1.5 rounded">
                  <TrendingUp size={18} />
                </div>
                <h4 className="font-medium text-zinc-100">3. Placement Logic</h4>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">
                We insert ad breaks during high-engagement segments to maximize completion, and trigger paywalls right at the cliffhanger.
              </p>
            </div>
          </div>
        </div>

        {/* Global Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <MetricCard 
            title="Total Ad Placements" 
            value={totalAds} 
            subtext={`Across ${episodeList.length} episodes`} 
          />
          <MetricCard 
            title="Paywall Triggers" 
            value={totalPaywalls} 
            subtext="High willingness-to-pay zones" 
          />
          <MetricCard 
            title="Projected ARPU Uplift" 
            value={`+${avgUplift.toFixed(1)}%`} 
            subtext="Vs. fixed 5-min intervals" 
          />
          <MetricCard 
            title="Session Drop-off Risk" 
            value={`${avgChurnRisk.toFixed(1)}%`} 
            subtext="Reduced by smart pacing" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Visualization Area */}
          <div className="lg:col-span-2 space-y-6">
            <TensionChart 
              tensionCurve={selectedEp.tension_curve} 
              placements={currentPlacements} 
            />
            
            <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-sm">
              <h4 className="text-sm font-semibold text-zinc-900 tracking-tight mb-4">Monetization vs. Retention Tradeoff</h4>
              <p className="text-xs text-zinc-500 mb-4">
                Adjust the density of ad placements. Higher aggressiveness yields more immediate impressions but increases the risk of session abandonment.
              </p>
              <TradeoffSlider 
                value={aggressiveness} 
                onChange={setAggressiveness} 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-sm">
                <div className="flex gap-2 items-center mb-3">
                  <Activity className="text-indigo-600" size={18} />
                  <h4 className="text-sm font-semibold text-zinc-900">Content-Aware Signal Extraction</h4>
                </div>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  {selectedEp.llm_insights || "No signals extracted for this session."}
                </p>
              </div>

              <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-sm">
                <div className="flex gap-2 items-center mb-3">
                  <AlertCircle className="text-amber-600" size={18} />
                  <h4 className="text-sm font-semibold text-zinc-900">Decision Engine Strategy</h4>
                </div>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  The optimizer prevents ad insertion within a 2-point radius of a predicted drop-off spike (e.g., weak hook + pacing lull). Paywalls are strictly gated behind upper-quartile cliffhanger intensity scores.
                </p>
              </div>
            </div>
            
            {/* Structured Output Viewer */}
            <div className="bg-zinc-950 rounded-lg p-5 shadow-sm overflow-hidden">
              <div className="flex gap-2 items-center mb-3">
                <Code className="text-zinc-400" size={18} />
                <h4 className="text-sm font-semibold text-zinc-100">Placement Engine Raw Payload</h4>
              </div>
              <p className="text-xs text-zinc-400 mb-3">
                The deterministic JSON output generated by the signal extractor, used to compute placement coordinates.
              </p>
              <pre className="text-xs text-zinc-300 overflow-x-auto p-4 bg-zinc-900 rounded border border-zinc-800">
                {JSON.stringify({
                  hook_strength: selectedEp.hook_strength,
                  cliffhanger_intensity: selectedEp.cliffhanger_intensity,
                  tension_curve: selectedEp.tension_curve,
                  arc_position: selectedEp.arc_position,
                  pacing_flag: selectedEp.pacing_flag,
                  llm_insights: selectedEp.llm_insights
                }, null, 2)}
              </pre>
            </div>

          </div>
          
          {/* Sidebar / Inspector */}
          <div className="space-y-6">
            <div className="border border-zinc-200 bg-white rounded-lg p-5 shadow-sm flex flex-col h-[400px]">
              <div className="flex justify-between items-center mb-4 shrink-0">
                <h3 className="text-sm font-semibold text-zinc-900 tracking-tight">Active Content Roster</h3>
                <div>
                  <input 
                    type="file" 
                    accept=".txt,.epub" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center gap-1.5 text-xs font-medium bg-zinc-900 text-white px-2.5 py-1.5 rounded hover:bg-zinc-800 disabled:opacity-50 transition-colors"
                  >
                    {isUploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                    {isUploading ? 'Processing...' : 'Ingest Script'}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 overflow-y-auto pr-2 flex-1 custom-scrollbar">
                {episodeList.map((ep) => (
                  <button
                    key={ep.id}
                    onClick={() => setSelectedEpId(ep.id)}
                    className={`w-full flex items-start gap-3 p-3 rounded-md text-left transition-colors border ${
                      selectedEpId === ep.id 
                        ? 'bg-zinc-50 border-zinc-300 ring-1 ring-zinc-900' 
                        : 'border-transparent hover:bg-zinc-50'
                    }`}
                  >
                    <FileText className={`mt-0.5 shrink-0 ${selectedEpId === ep.id ? 'text-zinc-900' : 'text-zinc-400'}`} size={16} />
                    <div className="min-w-0">
                      <p className={`text-sm font-medium truncate ${selectedEpId === ep.id ? 'text-zinc-900' : 'text-zinc-700'}`}>
                        {ep.title}
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Hook Score: {ep.hook_strength} | Cliffhanger: {ep.cliffhanger_intensity}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="border border-zinc-200 bg-white rounded-lg p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-zinc-900 tracking-tight mb-4">Content Telemetry Signals</h3>
              <dl className="space-y-3">
                <div className="flex justify-between border-b border-zinc-100 pb-2">
                  <dt className="text-sm text-zinc-500">Arc Position</dt>
                  <dd className="text-sm font-medium text-zinc-900 capitalize">{selectedEp.arc_position}</dd>
                </div>
                <div className="flex justify-between border-b border-zinc-100 pb-2">
                  <dt className="text-sm text-zinc-500">Pacing Flag</dt>
                  <dd className="text-sm font-medium text-zinc-900 capitalize">{selectedEp.pacing_flag}</dd>
                </div>
                <div className="flex justify-between border-b border-zinc-100 pb-2">
                  <dt className="text-sm text-zinc-500">Engagement Hook</dt>
                  <dd className="text-sm font-medium text-zinc-900">{selectedEp.hook_strength}/100</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-zinc-500">Conversion Potential</dt>
                  <dd className="text-sm font-medium text-zinc-900">{selectedEp.cliffhanger_intensity}/100</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
