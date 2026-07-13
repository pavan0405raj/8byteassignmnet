'use client';

import React, { useState, useEffect } from 'react';
import { Stock } from '../types/stock';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (stock: Partial<Stock>) => void;
  stock?: Stock | null;
}

export default function StockModal({ isOpen, onClose, onSave, stock }: ModalProps) {
  const [formData, setFormData] = useState<Partial<Stock>>({
    name: '',
    ticker: '',
    exchange: 'NSE',
    sector: 'Financial Sector',
    purchasePrice: 0,
    quantity: 0,
    stage2: false,
    salePrice: null,
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (stock) {
      setFormData({
        name: stock.name,
        ticker: stock.ticker,
        exchange: stock.exchange,
        sector: stock.sector,
        purchasePrice: stock.purchasePrice,
        quantity: stock.quantity,
        stage2: stock.stage2,
        salePrice: stock.salePrice,
        notes: stock.notes || ''
      });
    } else {
      setFormData({
        name: '',
        ticker: '',
        exchange: 'NSE',
        sector: 'Financial Sector',
        purchasePrice: 0,
        quantity: 0,
        stage2: false,
        salePrice: null,
        notes: ''
      });
    }
    setErrors({});
  }, [stock, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) newErrors.name = 'Stock name is required';
    if (!formData.ticker?.trim()) newErrors.ticker = 'Ticker/Exchange Code is required';
    if (!formData.sector?.trim()) newErrors.sector = 'Sector is required';
    if (!formData.purchasePrice || formData.purchasePrice <= 0) {
      newErrors.purchasePrice = 'Purchase price must be greater than 0';
    }
    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      let finalVal: any = value;
      if (name === 'purchasePrice' || name === 'quantity' || name === 'salePrice') {
        finalVal = value === '' ? null : Number(value);
      }
      setFormData(prev => ({ ...prev, [name]: finalVal }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">
            {stock ? 'Edit Stock Holding' : 'Add New Stock Holding'}
          </h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase">Stock Name</label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
                placeholder="e.g. Infosys"
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase">Ticker/Exchange Code</label>
              <input
                type="text"
                name="ticker"
                value={formData.ticker || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
                placeholder="e.g. INFY or 500209"
              />
              {errors.ticker && <p className="text-red-400 text-xs mt-1">{errors.ticker}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase">Exchange</label>
              <select
                name="exchange"
                value={formData.exchange}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="NSE">NSE</option>
                <option value="BSE">BSE</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase">Sector</label>
              <select
                name="sector"
                value={formData.sector}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="Financial Sector">Financial Sector</option>
                <option value="Tech Sector">Tech Sector</option>
                <option value="Consumer">Consumer</option>
                <option value="Power">Power</option>
                <option value="Pipe Sector">Pipe Sector</option>
                <option value="Others">Others</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase">Purchase Price (₹)</label>
              <input
                type="number"
                step="0.01"
                name="purchasePrice"
                value={formData.purchasePrice || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
                placeholder="0.00"
              />
              {errors.purchasePrice && <p className="text-red-400 text-xs mt-1">{errors.purchasePrice}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase">Quantity</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
                placeholder="0"
              />
              {errors.quantity && <p className="text-red-400 text-xs mt-1">{errors.quantity}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase">Target Sale Price (Optional)</label>
              <input
                type="number"
                step="0.01"
                name="salePrice"
                value={formData.salePrice || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase">Exit Notes / Status (Optional)</label>
              <input
                type="text"
                name="notes"
                value={formData.notes || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
                placeholder="e.g. Exit or Must exit"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="stage2"
              name="stage2"
              checked={formData.stage2 || false}
              onChange={handleChange}
              className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-blue-500 focus:ring-blue-500"
            />
            <label htmlFor="stage2" className="text-sm font-medium text-slate-300 select-none">
              Mark as Stage 2 Stock (Strong Uptrend)
            </label>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700 px-4 py-2 text-slate-300 text-sm font-medium hover:bg-slate-700/50 hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-white text-sm font-medium hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20"
            >
              Save Holding
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
