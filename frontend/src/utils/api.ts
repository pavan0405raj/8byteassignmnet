import axios from 'axios';
import { LivePortfolioResponse, Stock } from '../types/stock';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const portfolioApi = {
  // Fetch live portfolio with valuations and groupings
  getLivePortfolio: async (): Promise<LivePortfolioResponse> => {
    const response = await api.get<LivePortfolioResponse>('/stocks/portfolio/live');
    return response.data;
  },

  // Get raw stock holdings list
  getStocks: async (): Promise<{ success: boolean; data: Stock[] }> => {
    const response = await api.get('/stocks');
    return response.data;
  },

  // Add stock holding
  addStock: async (stock: Partial<Stock>): Promise<{ success: boolean; data: Stock }> => {
    const response = await api.post('/stocks', stock);
    return response.data;
  },

  // Update stock holding
  updateStock: async (id: string, stock: Partial<Stock>): Promise<{ success: boolean; data: Stock }> => {
    const response = await api.put(`/stocks/${id}`, stock);
    return response.data;
  },

  // Delete stock holding
  deleteStock: async (id: string): Promise<{ success: boolean }> => {
    const response = await api.delete(`/stocks/${id}`);
    return response.data;
  },
};

export default api;
