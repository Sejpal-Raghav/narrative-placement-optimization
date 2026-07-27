"use client";

import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot 
} from 'recharts';
import { Placement } from '@/lib/optimizer';

interface TensionChartProps {
  tensionCurve: number[];
  placements: Placement[];
}

export default function TensionChart({ tensionCurve, placements }: TensionChartProps) {
  // Format data for Recharts
  const data = tensionCurve.map((value, index) => ({
    time: index * 10,
    tension: value
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const timeStr = `${label}%`;
      const valStr = payload[0].value;
      
      const placementAtTime = placements.find(p => p.timestamp === label);
      
      return (
        <div className="bg-white border border-zinc-200 p-3 shadow-md rounded-md text-sm">
          <p className="font-semibold text-zinc-900 mb-1">Time: {timeStr}</p>
          <p className="text-zinc-600">Tension: <span className="font-medium text-zinc-900">{valStr}</span></p>
          
          {placementAtTime && (
            <div className="mt-2 pt-2 border-t border-zinc-100">
              <p className="font-semibold text-indigo-600">
                {placementAtTime.action === 'ad_break' ? 'Ad Break' : 'Paywall Unlock'}
              </p>
              <p className="text-xs text-zinc-500">Uplift: +{placementAtTime.projected_uplift.toFixed(1)}%</p>
              <p className="text-xs text-zinc-500">Churn Risk: {placementAtTime.churn_risk.toFixed(1)}%</p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80 bg-white border border-zinc-200 rounded-lg p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-zinc-900 tracking-tight">Narrative Tension & Placement Overlays</h3>
        <p className="text-sm text-zinc-500">Ad breaks (blue) and Paywalls (amber) placed by optimizer</p>
      </div>
      
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 30, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#a1a1aa', fontSize: 12 }}
              tickFormatter={(val) => `${val}%`}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#a1a1aa', fontSize: 12 }}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            
            <Line 
              type="monotone" 
              dataKey="tension" 
              stroke="#18181b" 
              strokeWidth={2}
              dot={{ r: 3, fill: '#18181b', strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#18181b', stroke: '#fff', strokeWidth: 2 }}
            />
            
            {/* Overlay Placements */}
            {placements.map((p, i) => {
              // Find the tension value at this timestamp for exact Y positioning
              const tensionValue = data.find(d => d.time === p.timestamp)?.tension || 0;
              
              if (p.action === 'ad_break') {
                return (
                  <ReferenceDot 
                    key={`ad-${i}`}
                    x={p.timestamp} 
                    y={tensionValue} 
                    r={6} 
                    fill="#4f46e5" // Indigo for ad breaks
                    stroke="#fff"
                    strokeWidth={2}
                  />
                );
              } else {
                return (
                  <ReferenceDot 
                    key={`pw-${i}`}
                    x={p.timestamp} 
                    y={tensionValue} 
                    r={8} 
                    fill="#d97706" // Amber for paywalls
                    stroke="#fff"
                    strokeWidth={2}
                  />
                );
              }
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
