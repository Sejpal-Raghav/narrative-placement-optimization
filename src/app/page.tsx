"use client";

import React, { useState, useMemo, useRef } from 'react';
import Layout from '@/components/Layout';
import MetricCard from '@/components/ui/MetricCard';
import TradeoffSlider from '@/components/ui/TradeoffSlider';
import TensionChart from '@/components/TensionChart';
import resultsData from '@/data/results.json';
import { EpisodeData, optimizePlacements } from '@/lib/optimizer';
import { AlertCircle, FileText, Brain, Code, UploadCloud, Loader2 } from 'lucide-react';

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
          <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Narrative Placement Optimization</h2>
          <p className="text-sm text-zinc-500 mt-1">
            Placing ad breaks and paywalls based on LLM-extracted tension and drop-off risks.
          </p>
        </header>

        {/* Global Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <MetricCard 
            title="Total Ad Placements" 
            value={totalAds} 
            subtext={`Across ${episodeList.length} episodes`} 
          />
          <MetricCard 
            title="Total Paywalls" 
            value={totalPaywalls} 
            subtext="High willingness-to-pay zones" 
          />
          <MetricCard 
            title="Avg Revenue Uplift" 
            value={`+${avgUplift.toFixed(1)}%`} 
            subtext="Projected vs fixed schedule" 
          />
          <MetricCard 
            title="Avg Churn Risk" 
            value={`${avgChurnRisk.toFixed(1)}%`} 
            subtext="Drop-off probability" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Visualization Area */}
          <div className="lg:col-span-2 space-y-6">
            <TensionChart 
              tensionCurve={selectedEp.tension_curve} 
              placements={currentPlacements} 
            />
            
            <TradeoffSlider 
              value={aggressiveness} 
              onChange={setAggressiveness} 
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-sm">
                <div className="flex gap-2 items-center mb-3">
                  <Brain className="text-indigo-600" size={18} />
                  <h4 className="text-sm font-semibold text-zinc-900">LLM Narrative Insights</h4>
                </div>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  {selectedEp.llm_insights || "No insights available for this episode."}
                </p>
              </div>

              <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-sm">
                <div className="flex gap-2 items-center mb-3">
                  <AlertCircle className="text-amber-600" size={18} />
                  <h4 className="text-sm font-semibold text-zinc-900">Placement Strategy</h4>
                </div>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  The optimizer avoids placing ads within 2 points of a drop-off risk spike (e.g., when the hook is weak and the pacing is a lull). Paywalls are placed dynamically based on cliffhanger intensity.
                </p>
              </div>
            </div>
            
            {/* Structured Output Viewer */}
            <div className="bg-zinc-950 rounded-lg p-5 shadow-sm overflow-hidden">
              <div className="flex gap-2 items-center mb-3">
                <Code className="text-zinc-400" size={18} />
                <h4 className="text-sm font-semibold text-zinc-100">Structured Data Payload (Zod Parsed)</h4>
              </div>
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
                <h3 className="text-sm font-semibold text-zinc-900 tracking-tight">Episode Selector</h3>
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
                    {isUploading ? 'Extracting...' : 'Upload'}
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
                        Hook: {ep.hook_strength} | Cliffhanger: {ep.cliffhanger_intensity}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="border border-zinc-200 bg-white rounded-lg p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-zinc-900 tracking-tight mb-4">Extracted Signals</h3>
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
                  <dt className="text-sm text-zinc-500">Hook Strength</dt>
                  <dd className="text-sm font-medium text-zinc-900">{selectedEp.hook_strength}/100</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-zinc-500">Cliffhanger Intensity</dt>
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
