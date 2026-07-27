import React from 'react';

export default function MetricCard({ title, value, subtext }: { title: string; value: string | number; subtext?: string }) {
  return (
    <div className="border border-zinc-200 rounded-lg p-4 bg-white shadow-sm flex flex-col justify-between">
      <h3 className="text-sm font-medium text-zinc-500 tracking-tight">{title}</h3>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-zinc-900">{value}</span>
      </div>
      {subtext && <p className="mt-1 text-xs text-zinc-400">{subtext}</p>}
    </div>
  );
}
