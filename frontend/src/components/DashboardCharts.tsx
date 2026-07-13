'use client';

import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { SectorSummary, Stock } from '../types/stock';

interface ChartsProps {
  sectors: SectorSummary[];
  stocks: Stock[];
}

const COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#14b8a6', // teal-500
  '#f43f5e', // rose-500
  '#6366f1'  // indigo-500
];

export default function DashboardCharts({ sectors, stocks }: ChartsProps) {
  // Sector Allocation Data
  const allocationData = sectors.map(sec => ({
    name: sec.sector,
    value: sec.totalInvestment,
    weight: sec.portfolioWeight
  }));

  // Top 10 Stocks by Performance (absolute gain/loss)
  const performanceData = [...stocks]
    .sort((a, b) => (b.gainLoss || 0) - (a.gainLoss || 0))
    .slice(0, 8)
    .map(st => ({
      name: st.name,
      Investment: st.investment,
      CurrentValue: st.presentValue || st.investment,
      GainLoss: st.gainLoss || 0
    }));

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Sector Allocation Pie Chart */}
      <div className="bg-slate-800 border border-slate-700/60 rounded-xl p-6 shadow-lg">
        <h4 className="text-lg font-semibold text-slate-100 mb-4">Sector Allocation</h4>
        <div className="h-[300px] flex items-center justify-center">
          {allocationData.length === 0 ? (
            <p className="text-slate-400 text-sm">No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#475569',
                    color: '#f8fafc'
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  iconSize={8}
                  formatter={(value, entry: any) => {
                    const weight = entry.payload?.weight || 0;
                    return <span className="text-slate-300 text-xs">{value} ({weight.toFixed(1)}%)</span>;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Stock Performance Comparison */}
      <div className="bg-slate-800 border border-slate-700/60 rounded-xl p-6 shadow-lg">
        <h4 className="text-lg font-semibold text-slate-100 mb-4">Top Holdings Valuation</h4>
        <div className="h-[300px]">
          {performanceData.length === 0 ? (
            <p className="text-slate-400 text-sm">No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={performanceData}
                margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  tickLine={false}
                  angle={-25}
                  textAnchor="end"
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  tickLine={false}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#475569',
                    color: '#f8fafc'
                  }}
                />
                <Legend iconSize={8} verticalAlign="top" height={36} />
                <Bar dataKey="Investment" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Investment Value" />
                <Bar dataKey="CurrentValue" fill="#10b981" radius={[4, 4, 0, 0]} name="Current Value" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
