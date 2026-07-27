import React from 'react';

interface TradeoffSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export default function TradeoffSlider({ value, onChange }: TradeoffSliderProps) {
  return (
    <div className="border border-zinc-200 rounded-lg p-5 bg-white shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-sm font-medium text-zinc-900 tracking-tight">Monetization Aggressiveness</h3>
          <p className="text-xs text-zinc-500 mt-1">Adjust the ad break and paywall frequency</p>
        </div>
        <div className="text-xl font-semibold text-zinc-900">{value} / 10</div>
      </div>
      
      <input 
        type="range" 
        min="1" 
        max="10" 
        step="1"
        value={value} 
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer focus-visible:ring-2 focus-visible:ring-zinc-900 outline-none accent-zinc-900"
      />
      
      <div className="flex justify-between text-xs text-zinc-400 mt-2 font-medium">
        <span>Conservative (Lower Churn)</span>
        <span>Aggressive (Max Revenue)</span>
      </div>
    </div>
  );
}
