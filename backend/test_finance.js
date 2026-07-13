const financeService = require('./src/services/financeService');

const mockStocks = [
  {
    _id: '1',
    name: 'HDFC Bank',
    ticker: 'HDFCBANK',
    exchange: 'NSE',
    purchasePrice: 1490,
    quantity: 50,
    investment: 74500,
    weight: 0.048,
    sector: 'Financial Sector'
  },
  {
    _id: '2',
    name: 'ICICI Bank',
    ticker: '532174',
    exchange: 'BSE',
    purchasePrice: 780,
    quantity: 84,
    investment: 65520,
    weight: 0.042,
    sector: 'Financial Sector'
  }
];

async function run() {
  console.log('Testing finance service live data fetch...');
  const start = Date.now();
  const data = await financeService.getLiveStockData(mockStocks);
  console.log(`Fetch completed in ${(Date.now() - start) / 1000}s`);
  console.log(JSON.stringify(data, null, 2));
}

run();
