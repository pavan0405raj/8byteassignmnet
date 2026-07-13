'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  RefreshCw, 
  Wallet, 
  Layers, 
  PieChart as PieIcon,
  AlertTriangle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { portfolioApi } from '../utils/api';
import { Stock, SectorSummary, PortfolioSummary } from '../types/stock';
import MetricCard from '../components/MetricCard';
import DashboardCharts from '../components/DashboardCharts';
import PortfolioTable from '../components/PortfolioTable';
import StockModal from '../components/StockModal';

export default function Dashboard() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [sectors, setSectors] = useState<SectorSummary[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary>({
    totalInvestment: 0,
    totalPresentValue: 0,
    totalGainLoss: 0,
    totalGainLossPercentage: 0
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Auto refresh states
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [countdown, setCountdown] = useState(15);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStock, setEditingStock] = useState<Stock | null>(null);

  // Fetch data function
  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    
    try {
      const data = await portfolioApi.getLivePortfolio();
      if (data.success) {
        setStocks(data.stocks || []);
        setSectors(data.sectors || []);
        setSummary(data.summary);
      } else {
        throw new Error('API reported failure');
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        'Could not establish connection with Express backend. Please ensure the backend server and MongoDB are running.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
      setCountdown(15);
    }
  }, []);

  // Initialize and handle auto-refresh
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          fetchData(true);
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  // Flash messages helper
  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // CRUD handlers
  const handleAddClick = () => {
    setEditingStock(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (stock: Stock) => {
    setEditingStock(stock);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this stock holding from your portfolio?')) return;
    try {
      await portfolioApi.deleteStock(id);
      triggerSuccess('Holding removed successfully!');
      fetchData(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove stock holding');
    }
  };

  const handleModalSave = async (formData: Partial<Stock>) => {
    try {
      if (editingStock && editingStock._id) {
        await portfolioApi.updateStock(editingStock._id, formData);
        triggerSuccess('Holding updated successfully!');
      } else {
        await portfolioApi.addStock(formData);
        triggerSuccess('New stock holding added!');
      }
      setIsModalOpen(false);
      fetchData(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error occurred while saving holding');
    }
  };

  // Formatting helpers
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const netGainIsPositive = summary.totalGainLoss >= 0;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      {/* Top Banner Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-xl">
              <Layers className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Dynamic Asset Portfolio</h1>
              <p className="text-xs text-slate-400">Octa Byte AI Pvt Ltd — Technical Case Study Dashboard</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Refresh controls */}
          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700/60 rounded-xl px-4 py-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="auto-refresh"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-blue-500 focus:ring-blue-500"
              />
              <label htmlFor="auto-refresh" className="text-xs text-slate-300 font-medium select-none flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Live update {autoRefresh && `(${countdown}s)`}
              </label>
            </div>
            
            <span className="w-px h-4 bg-slate-700 mx-2" />
            
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing || loading}
              className="text-slate-300 hover:text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-400' : ''}`} />
            </button>
          </div>

          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2.5 text-white text-sm font-semibold transition-all shadow-lg shadow-blue-600/15"
          >
            <Plus className="w-4 h-4" />
            Add Transaction
          </button>
        </div>
      </header>

      {/* Notifications / Alerts */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex gap-3 items-start shadow-lg">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Configuration Alert</span>
            <span className="text-slate-300 text-xs">{error}</span>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm flex gap-3 items-center shadow-lg animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {/* Loading Skeleton state */}
      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-800 border border-slate-700/60 rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="h-[300px] bg-slate-800 border border-slate-700/60 rounded-xl animate-pulse" />
          <div className="h-64 bg-slate-800 border border-slate-700/60 rounded-xl animate-pulse" />
        </div>
      ) : (
        <>
          {/* Top Index Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Portfolio Value"
              value={formatCurrency(summary.totalPresentValue)}
              subtext="Current live evaluation"
              icon={Wallet}
            />
            <MetricCard
              title="Total Investment"
              value={formatCurrency(summary.totalInvestment)}
              subtext="Capital sum invested"
              icon={Layers}
            />
            <MetricCard
              title="Net Gain / Loss"
              value={formatCurrency(summary.totalGainLoss)}
              subtext="Total returns"
              icon={netGainIsPositive ? TrendingUp : TrendingDown}
              trend={{
                isPositive: netGainIsPositive,
                value: `${summary.totalGainLossPercentage.toFixed(2)}%`
              }}
              className={netGainIsPositive ? 'hover:border-emerald-500/20' : 'hover:border-red-500/20'}
            />
            <MetricCard
              title="Market Sectors"
              value={sectors.length.toString()}
              subtext="Diversification spread"
              icon={PieIcon}
            />
          </div>

          {/* Charts section */}
          <DashboardCharts sectors={sectors} stocks={stocks} />

          {/* Portfolio Grouped Table */}
          <PortfolioTable 
            sectors={sectors} 
            onEditStock={handleEditClick}
            onDeleteStock={handleDeleteClick}
          />
        </>
      )}

      {/* Stock holding creation / modification dialog */}
      <StockModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSave}
        stock={editingStock}
      />
    </div>
  );
}
