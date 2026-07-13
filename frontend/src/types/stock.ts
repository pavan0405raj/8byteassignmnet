export interface Stock {
  id?: string;
  _id?: string;
  name: string;
  purchasePrice: number;
  quantity: number;
  investment: number;
  weight: number;
  ticker: string;
  exchange: 'NSE' | 'BSE';
  sector: string;
  stage2: boolean;
  salePrice: number | null;
  notes: string | null;
  
  // Live values computed by backend
  cmp?: number;
  presentValue?: number;
  gainLoss?: number;
  gainLossPercentage?: number;
  portfolioWeight?: number;
  pe?: number | null;
  eps?: number | null;
}

export interface SectorSummary {
  sector: string;
  totalInvestment: number;
  totalPresentValue: number;
  gainLoss: number;
  gainLossPercentage: number;
  portfolioWeight: number;
  stocks: Stock[];
}

export interface PortfolioSummary {
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
}

export interface LivePortfolioResponse {
  success: boolean;
  summary: PortfolioSummary;
  sectors: SectorSummary[];
  stocks: Stock[];
}
