import React from 'react';

export default function TradeoffSlider({ value, onChange }: { value: number, onChange: (v: number) => void }) {
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs font-medium text-zinc-500 mb-3">
        <span>Maximize Retention</span>
        <span>Maximize Impressions</span>
      </div>
      <input 
        type="range" 
        min="1" 
        max="10" 
        value={value} 
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
      />
      <div className="mt-3 flex justify-between text-[10px] text-zinc-400 font-medium">
        <span>Sparse Placements</span>
        <span className="text-zinc-900 font-semibold bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">Level {value}</span>
        <span>Aggressive Placements</span>
      </div>
    </div>
  );
}
