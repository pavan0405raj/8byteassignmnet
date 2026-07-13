import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  subtext?: string;
  icon: LucideIcon;
  trend?: {
    isPositive: boolean;
    value: string;
  };
  className?: string;
}

export default function MetricCard({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  className = '',
}: MetricCardProps) {
  return (
    <div className={`bg-slate-800 border border-slate-700/60 rounded-xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:border-slate-600/80 ${className}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-400 text-sm font-medium tracking-wide uppercase">{title}</p>
          <h3 className="text-2xl font-bold mt-2 text-white">{value}</h3>
          {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
        </div>
        <div className="p-3 bg-slate-700/40 rounded-lg border border-slate-700">
          <Icon className="w-6 h-6 text-slate-300" />
        </div>
      </div>
      
      {trend && (
        <div className="flex items-center mt-4">
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              trend.isPositive
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}
          >
            {trend.value}
          </span>
          <span className="text-xs text-slate-400 ml-2">since purchase</span>
        </div>
      )}
    </div>
  );
}
