"use client";

import React, { useState, useMemo, useRef } from 'react';
import Layout from '@/components/Layout';
import MetricCard from '@/components/ui/MetricCard';
import TradeoffSlider from '@/components/ui/TradeoffSlider';
import TensionChart from '@/components/TensionChart';
import resultsData from '@/data/results.json';
import { EpisodeData, optimizePlacements } from '@/lib/optimizer';
import { FileText, TrendingUp, Activity, CheckCircle2, Loader2, Upload, AlertCircle, Eye } from 'lucide-react';

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
        <div className="flex h-full items-center justify-center text-zinc-500 font-medium">
          Loading dashboard...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8 max-w-[1400px] mx-auto">
        {/* Demo Data Banner */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-3 flex items-start sm:items-center gap-3">
          <div className="text-blue-500 mt-0.5 sm:mt-0 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Prototype Environment:</span> You are currently viewing the dashboard with pre-populated demo data. To generate live telemetry, ingest a new script using the Content Roster below.
          </p>
        </div>

        <header className="mb-8">
          <h2 className="text-2xl font-semibold text-zinc-900 tracking-tight">Yield Optimizer Engine</h2>
          <p className="text-sm text-zinc-500 mt-1.5 max-w-2xl leading-relaxed">
            Dynamically schedule ad breaks and paywalls by correlating content tension with session drop-off risk. 
            Avoid lulls, monetize plateaus.
          </p>
        </header>

        {/* Global Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <MetricCard 
            title="Total Ad Placements" 
            value={totalAds.toLocaleString()} 
            subtext={`Across ${episodeList.length} indexed episodes`} 
          />
          <MetricCard 
            title="Paywall Triggers" 
            value={totalPaywalls.toLocaleString()} 
            subtext="Upper-quartile intensity zones" 
          />
          <MetricCard 
            title="Projected ARPU Uplift" 
            value={`+${avgUplift.toFixed(2)}%`} 
            subtext="Vs. fixed 5-min intervals" 
          />
          <MetricCard 
            title="Session Drop-off Risk" 
            value={`${avgChurnRisk.toFixed(2)}%`} 
            subtext="Minimized via dynamic pacing" 
          />
        </div>

        {/* Growth Pipeline Explainer (Minimalist) */}
        <div className="border border-zinc-200 rounded-md bg-white p-6 mb-8 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="shrink-0 md:w-48">
            <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-widest mb-1">Pipeline Architecture</h3>
            <p className="text-xs text-zinc-500">Deterministic signal extraction and yield optimization logic.</p>
          </div>
          
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 border-l border-zinc-100 pl-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-zinc-400" />
                <h4 className="text-sm font-medium text-zinc-900">1. Content Parsing</h4>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Analyze script telemetry to map narrative pacing and cliffhangers.
              </p>
            </div>
            
            <div className="space-y-1.5 border-l border-zinc-100 pl-6">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-zinc-400" />
                <h4 className="text-sm font-medium text-zinc-900">2. Risk Mapping</h4>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Flag structural timestamps where listener abandonment probability spikes.
              </p>
            </div>

            <div className="space-y-1.5 border-l border-zinc-100 pl-6">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-zinc-400" />
                <h4 className="text-sm font-medium text-zinc-900">3. Placement Logic</h4>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Insert ads during high-engagement segments to maximize completion rates.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
          {/* Main Visualization Area */}
          <div className="xl:col-span-2 space-y-6">
            
            <TensionChart 
              tensionCurve={selectedEp.tension_curve} 
              placements={currentPlacements} 
            />
            
            <div className="border border-zinc-200 rounded-md bg-white p-6">
              <h4 className="text-sm font-semibold text-zinc-900 tracking-tight mb-2">Monetization vs. Retention Tradeoff</h4>
              <p className="text-xs text-zinc-500 mb-6 max-w-xl leading-relaxed">
                Adjust the density threshold for ad placements. Higher aggressiveness yields more immediate impressions but increases the predicted risk of session abandonment.
              </p>
              <TradeoffSlider 
                value={aggressiveness} 
                onChange={setAggressiveness} 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-zinc-200 rounded-md bg-white p-6">
                <div className="flex gap-2 items-center mb-4">
                  <Eye className="text-zinc-400" size={16} />
                  <h4 className="text-sm font-semibold text-zinc-900">Signal Extraction Log</h4>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed bg-zinc-50 p-3 rounded border border-zinc-100">
                  {selectedEp.llm_insights || "No signals extracted for this session."}
                </p>
              </div>

              <div className="border border-zinc-200 rounded-md bg-white p-6">
                <div className="flex gap-2 items-center mb-4">
                  <AlertCircle className="text-zinc-400" size={16} />
                  <h4 className="text-sm font-semibold text-zinc-900">Decision Engine Rules</h4>
                </div>
                <ul className="text-xs text-zinc-600 leading-relaxed space-y-2 list-disc pl-4">
                  <li>Blocks ad insertion within a 2-point radius of a drop-off spike (weak hook + pacing lull).</li>
                  <li>Paywalls are strictly gated behind upper-quartile cliffhanger intensity scores.</li>
                  <li>Minimizes back-to-back ad clusters.</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Right Column: Data Table & Telemetry */}
          <div className="space-y-6">
            
            {/* Telemetry Signals */}
            <div className="border border-zinc-200 bg-white rounded-md p-6">
              <h3 className="text-sm font-semibold text-zinc-900 tracking-tight mb-5">Telemetry Payload: {selectedEp.id}</h3>
              <dl className="space-y-4">
                <div className="flex justify-between border-b border-zinc-100 pb-3">
                  <dt className="text-xs font-medium text-zinc-500">Arc Position</dt>
                  <dd className="text-xs font-semibold text-zinc-900 capitalize">{selectedEp.arc_position}</dd>
                </div>
                <div className="flex justify-between border-b border-zinc-100 pb-3">
                  <dt className="text-xs font-medium text-zinc-500">Pacing Flag</dt>
                  <dd className="text-xs font-semibold text-zinc-900 capitalize">{selectedEp.pacing_flag}</dd>
                </div>
                <div className="flex justify-between border-b border-zinc-100 pb-3">
                  <dt className="text-xs font-medium text-zinc-500">Engagement Hook Score</dt>
                  <dd className="text-xs font-semibold text-zinc-900">{selectedEp.hook_strength}/100</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-xs font-medium text-zinc-500">Conversion Potential</dt>
                  <dd className="text-xs font-semibold text-zinc-900">{selectedEp.cliffhanger_intensity}/100</dd>
                </div>
              </dl>
            </div>

            {/* Content Roster Data Table */}
            <div className="border border-zinc-200 bg-white rounded-md flex flex-col h-[500px]">
              <div className="flex justify-between items-center p-4 border-b border-zinc-200">
                <h3 className="text-sm font-semibold text-zinc-900 tracking-tight">Content Roster</h3>
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
                    className="flex items-center gap-2 text-xs font-medium border border-zinc-200 bg-white text-zinc-900 px-3 py-1.5 rounded hover:bg-zinc-50 disabled:opacity-50 transition-colors focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
                  >
                    {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    {isUploading ? 'Processing...' : 'Ingest Script'}
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50/50">
                      <th className="px-4 py-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Episode Name</th>
                      <th className="px-4 py-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider text-right">Yield Score</th>
                    </tr>
                  </thead>
                </table>
              </div>
              <div className="overflow-y-auto flex-1 custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <tbody>
                    {episodeList.map((ep) => (
                      <tr 
                        key={ep.id}
                        onClick={() => setSelectedEpId(ep.id)}
                        className={`border-b border-zinc-100 cursor-pointer transition-colors ${
                          selectedEpId === ep.id ? 'bg-zinc-50' : 'hover:bg-zinc-50/50'
                        }`}
                      >
                        <td className="px-4 py-3 w-10">
                          {selectedEpId === ep.id ? (
                            <CheckCircle2 size={14} className="text-emerald-500" />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border border-zinc-200 bg-zinc-50"></div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <p className={`text-xs font-medium truncate w-48 ${selectedEpId === ep.id ? 'text-zinc-900' : 'text-zinc-600'}`}>
                            {ep.title}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-xs font-semibold ${ep.cliffhanger_intensity > 80 ? 'text-emerald-600' : 'text-zinc-500'}`}>
                            {((ep.hook_strength + ep.cliffhanger_intensity) / 2).toFixed(0)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </Layout>
  );
}
