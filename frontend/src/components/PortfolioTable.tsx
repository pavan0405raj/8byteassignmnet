import React from 'react';
import { SectorSummary, Stock } from '../types/stock';
import { ArrowUpRight, ArrowDownRight, BadgeAlert, Trash2, Edit } from 'lucide-react';

interface TableProps {
  sectors: SectorSummary[];
  onEditStock?: (stock: Stock) => void;
  onDeleteStock?: (id: string) => void;
}

export default function PortfolioTable({ sectors, onEditStock, onDeleteStock }: TableProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  };

  const formatPercentage = (val: number) => {
    return `${val > 0 ? '+' : ''}${val.toFixed(2)}%`;
  };

  return (
    <div className="bg-slate-800 border border-slate-700/60 rounded-xl overflow-hidden shadow-lg mb-8">
      <div className="p-6 border-b border-slate-700">
        <h4 className="text-lg font-semibold text-slate-100">Asset Holdings & Valuations</h4>
        <p className="text-xs text-slate-400 mt-1">Live data refreshes periodically. Values in local currency (INR).</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-slate-900 border-b border-slate-700 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <th className="py-4 px-6">Particulars</th>
              <th className="py-4 px-4 text-right">Purchase Price</th>
              <th className="py-4 px-4 text-right">Qty</th>
              <th className="py-4 px-4 text-right">Investment</th>
              <th className="py-4 px-4 text-right">Weight</th>
              <th className="py-4 px-4 text-center">Exchange</th>
              <th className="py-4 px-4 text-right">CMP (Live)</th>
              <th className="py-4 px-4 text-right">Present Value</th>
              <th className="py-4 px-4 text-right">Gain / Loss</th>
              <th className="py-4 px-4 text-right">P/E Ratio</th>
              <th className="py-4 px-4 text-right">Latest EPS</th>
              {(onEditStock || onDeleteStock) && <th className="py-4 px-4 text-center">Actions</th>}
            </tr>
          </thead>
          
          <tbody className="divide-y divide-slate-700/50">
            {sectors.map((sec, secIdx) => (
              <React.Fragment key={sec.sector}>
                {/* Sector Header Row */}
                <tr className="bg-slate-800/40 font-semibold text-slate-300">
                  <td colSpan={12} className="py-3 px-6 text-sm tracking-wide">
                    {sec.sector}
                  </td>
                </tr>
                
                {/* Stock Rows */}
                {sec.stocks.map((stock) => {
                  const isGain = (stock.gainLoss || 0) >= 0;
                  
                  return (
                    <tr 
                      key={stock._id || stock.id} 
                      className="hover:bg-slate-700/30 transition-colors text-slate-300 text-sm"
                    >
                      {/* Name & Indicators */}
                      <td className="py-4 px-6 font-medium">
                        <div className="flex flex-col">
                          <span className="text-white flex items-center gap-1.5">
                            {stock.name}
                            {stock.stage2 && (
                              <span className="text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-1.5 py-0.5 rounded font-normal">
                                Stage 2
                              </span>
                            )}
                            {stock.notes && (
                              <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded font-normal flex items-center gap-0.5">
                                <BadgeAlert className="w-3 h-3" />
                                {stock.notes}
                              </span>
                            )}
                          </span>
                          {stock.salePrice && (
                            <span className="text-[10px] text-slate-500">
                              Target Sale: {formatCurrency(stock.salePrice)}
                            </span>
                          )}
                        </div>
                      </td>
                      
                      {/* Purchase Price */}
                      <td className="py-4 px-4 text-right font-mono text-xs">
                        {formatCurrency(stock.purchasePrice)}
                      </td>
                      
                      {/* Qty */}
                      <td className="py-4 px-4 text-right font-mono text-xs">
                        {stock.quantity}
                      </td>
                      
                      {/* Investment */}
                      <td className="py-4 px-4 text-right font-mono text-xs text-white">
                        {formatCurrency(stock.investment)}
                      </td>
                      
                      {/* Weight */}
                      <td className="py-4 px-4 text-right font-mono text-xs text-slate-400">
                        {stock.portfolioWeight ? `${stock.portfolioWeight.toFixed(2)}%` : '0.00%'}
                      </td>
                      
                      {/* Exchange */}
                      <td className="py-4 px-4 text-center text-xs">
                        <span className={`px-2 py-0.5 rounded font-semibold text-[10px] border ${
                          stock.exchange === 'NSE' 
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                            : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                        }`}>
                          {stock.ticker} ({stock.exchange})
                        </span>
                      </td>
                      
                      {/* CMP */}
                      <td className="py-4 px-4 text-right font-mono text-xs text-white">
                        {stock.cmp ? formatCurrency(stock.cmp) : '—'}
                      </td>
                      
                      {/* Present Value */}
                      <td className="py-4 px-4 text-right font-mono text-xs text-white">
                        {stock.presentValue ? formatCurrency(stock.presentValue) : '—'}
                      </td>
                      
                      {/* Gain/Loss */}
                      <td className={`py-4 px-4 text-right font-mono text-xs ${
                        isGain ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        <div className="flex items-center justify-end gap-1">
                          {isGain ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                          <div className="flex flex-col items-end">
                            <span>{formatCurrency(stock.gainLoss || 0)}</span>
                            <span className="text-[10px] opacity-80">{formatPercentage(stock.gainLossPercentage || 0)}</span>
                          </div>
                        </div>
                      </td>
                      
                      {/* P/E Ratio */}
                      <td className="py-4 px-4 text-right font-mono text-xs text-slate-400">
                        {stock.pe !== undefined && stock.pe !== null ? stock.pe.toFixed(2) : '—'}
                      </td>
                      
                      {/* Latest EPS */}
                      <td className="py-4 px-4 text-right font-mono text-xs text-slate-400">
                        {stock.eps !== undefined && stock.eps !== null ? formatCurrency(stock.eps) : '—'}
                      </td>
                      
                      {/* Actions */}
                      {(onEditStock || onDeleteStock) && (
                        <td className="py-4 px-4">
                          <div className="flex justify-center items-center gap-2">
                            {onEditStock && (
                              <button 
                                onClick={() => onEditStock(stock)}
                                className="p-1.5 bg-slate-700/60 border border-slate-600 rounded text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {onDeleteStock && (
                              <button 
                                onClick={() => onDeleteStock(stock._id || stock.id || '')}
                                className="p-1.5 bg-red-500/10 border border-red-500/20 rounded text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
                
                {/* Sector Footer Summary Row */}
                <tr className="bg-slate-900/30 border-t border-slate-700/40 text-xs font-semibold text-slate-400">
                  <td className="py-3 px-6 text-slate-400 font-normal italic">
                    {sec.sector} Summary
                  </td>
                  <td className="py-3 px-4"></td>
                  <td className="py-3 px-4"></td>
                  <td className="py-3 px-4 text-right font-mono">
                    {formatCurrency(sec.totalInvestment)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono">
                    {sec.portfolioWeight.toFixed(2)}%
                  </td>
                  <td className="py-3 px-4"></td>
                  <td className="py-3 px-4"></td>
                  <td className="py-3 px-4 text-right font-mono text-slate-300">
                    {formatCurrency(sec.totalPresentValue)}
                  </td>
                  <td className={`py-3 px-4 text-right font-mono ${
                    sec.gainLoss >= 0 ? 'text-emerald-400/90' : 'text-red-400/90'
                  }`}>
                    <div className="flex flex-col items-end">
                      <span>{formatCurrency(sec.gainLoss)}</span>
                      <span className="text-[10px]">{formatPercentage(sec.gainLossPercentage)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4"></td>
                  <td className="py-3 px-4"></td>
                  {(onEditStock || onDeleteStock) && <td className="py-3 px-4"></td>}
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
