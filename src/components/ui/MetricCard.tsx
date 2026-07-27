import React from 'react';

export default function MetricCard({ title, value, subtext }: { title: string; value: string | number; subtext?: string }) {
  return (
    <div className="border border-zinc-200 rounded-md p-5 bg-white flex flex-col justify-between hover:border-zinc-300 transition-colors">
      <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">{title}</h3>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-medium tracking-tight text-zinc-900">{value}</span>
      </div>
      {subtext && <p className="mt-2 text-xs font-medium text-zinc-400">{subtext}</p>}
    </div>
  );
}
