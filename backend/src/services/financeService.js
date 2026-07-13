const fetch = global.fetch || require('node-fetch'); // Native fetch in Node 18+, fallback just in case

// Mapping of numeric BSE codes to NSE/BSE tickers for Yahoo Finance
const BSE_TO_YAHOO_TICKER = {
  '532174': 'ICICIBANK.NS',
  '544252': 'BAJAJHFL.NS',
  '511577': '511577.BO', // Savani Financials
  '542651': 'KPITTECH.NS',
  '544028': 'TATATECH.NS',
  '544107': 'BLSE.NS',
  '532790': 'TANLA.NS',
  '532540': 'TATACONSUM.NS',
  '500331': 'PIDILITIND.NS',
  '500400': 'TATAPOWER.NS',
  '542323': 'KPIGREEN.NS',
  '532667': 'SUZLON.NS',
  '542851': 'GENSOL.NS',
  '543517': 'HARIOMPIPE.NS',
  '542652': 'POLYCAB.NS',
  '543318': 'CLEAN.NS',
  '506401': 'DEEPAKNTR.NS',
  '541557': 'FINEORG.NS',
  '533282': 'GRAVITA.NS',
  '540719': 'SBILIFE.NS',
  '500209': 'INFY.NS',
  '543237': 'HAPPIESTMN.NS',
  '543272': 'EASEMYTRIP.NS'
};

// Mapping of tickers/BSE codes to Google Finance Query Symbol (Ticker, Exchange)
const TO_GOOGLE_FINANCE_TICKER = (ticker, exchange) => {
  if (exchange === 'BSE') {
    return { symbol: ticker, exch: 'BOM' };
  }
  return { symbol: ticker, exch: 'NSE' };
};

// Simple In-Memory Caches
const cmpCache = {}; // { ticker: { value: 123.4, expiresAt: Date } }
const fundamentalCache = {}; // { ticker: { pe: 15.2, eps: 45.1, expiresAt: Date } }

const CACHE_DURATIONS = {
  CMP: 30 * 1000,          // 30 seconds
  FUNDAMENTALS: 12 * 60 * 60 * 1000 // 12 hours (P/E and EPS change slowly)
};

/**
 * Fetch Current Market Price (CMP) from Yahoo Finance
 */
const fetchYahooCMP = async (ticker, exchange) => {
  let yahooSymbol = ticker;
  if (exchange === 'BSE') {
    yahooSymbol = BSE_TO_YAHOO_TICKER[ticker] || `${ticker}.BO`;
  } else {
    // NSE
    if (!yahooSymbol.endsWith('.NS')) {
      yahooSymbol = `${yahooSymbol}.NS`;
    }
  }

  // Check Cache
  const now = Date.now();
  if (cmpCache[yahooSymbol] && cmpCache[yahooSymbol].expiresAt > now) {
    return cmpCache[yahooSymbol].value;
  }

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!res.ok) {
      throw new Error(`Yahoo HTTP error: ${res.status}`);
    }

    const data = await res.json();
    const meta = data.chart?.result?.[0]?.meta;
    const price = meta?.regularMarketPrice;

    if (price !== undefined && price !== null) {
      // Update Cache
      cmpCache[yahooSymbol] = {
        value: Number(price),
        expiresAt: now + CACHE_DURATIONS.CMP
      };
      return Number(price);
    }
    throw new Error('Price not found in Yahoo response');
  } catch (error) {
    console.error(`Error fetching CMP for ${yahooSymbol}:`, error.message);
    // Return cached value if exists, else null
    return cmpCache[yahooSymbol] ? cmpCache[yahooSymbol].value : null;
  }
};

/**
 * Scrape P/E Ratio and EPS from Google Finance
 */
const scrapeGoogleFundamentals = async (ticker, exchange) => {
  const { symbol, exch } = TO_GOOGLE_FINANCE_TICKER(ticker, exchange);
  const cacheKey = `${symbol}:${exch}`;

  // Check Cache
  const now = Date.now();
  if (fundamentalCache[cacheKey] && fundamentalCache[cacheKey].expiresAt > now) {
    return fundamentalCache[cacheKey].value;
  }

  const url = `https://www.google.com/finance/quote/${symbol}:${exch}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    if (!res.ok) {
      throw new Error(`Google Finance HTTP error: ${res.status}`);
    }

    const html = await res.text();

    // Scrape P/E ratio
    let pe = null;
    const peMatch = html.match(/P\/E ratio<\/div><div class="[^"]*">([^<]+)<\/div>/);
    if (peMatch && peMatch[1]) {
      const peStr = peMatch[1].trim();
      pe = peStr === '-' ? null : Number(peStr.replace(/,/g, ''));
    }

    // Scrape EPS
    let eps = null;
    const epsMatch = html.match(/EPS<\/div><div class="[^"]*">([^<]+)<\/div>/);
    if (epsMatch && epsMatch[1]) {
      const epsStr = epsMatch[1].trim();
      if (epsStr !== '-') {
        // Clean currency symbols e.g. ₹ or $
        const cleanedEps = epsStr.replace(/[^\d\.\-]/g, '');
        eps = Number(cleanedEps);
      }
    }

    const result = { pe, eps };

    // Update Cache
    fundamentalCache[cacheKey] = {
      value: result,
      expiresAt: now + CACHE_DURATIONS.FUNDAMENTALS
    };

    return result;
  } catch (error) {
    console.error(`Error scraping Google Finance for ${cacheKey}:`, error.message);
    // Return cached value if exists, else fallback nulls
    return fundamentalCache[cacheKey] ? fundamentalCache[cacheKey].value : { pe: null, eps: null };
  }
};

/**
 * Batch processing of live portfolio data with concurrency limits/throttling
 */
const getLiveStockData = async (stocks) => {
  // Process in chunks of 5 to avoid triggering rate limits on rapid parallel requests
  const CHUNK_SIZE = 5;
  const results = [];

  for (let i = 0; i < stocks.length; i += CHUNK_SIZE) {
    const chunk = stocks.slice(i, i + CHUNK_SIZE);
    const chunkPromises = chunk.map(async (stock) => {
      try {
        const [cmp, fundamentals] = await Promise.all([
          fetchYahooCMP(stock.ticker, stock.exchange),
          scrapeGoogleFundamentals(stock.ticker, stock.exchange)
        ]);

        return {
          id: stock._id,
          ticker: stock.ticker,
          name: stock.name,
          sector: stock.sector,
          exchange: stock.exchange,
          purchasePrice: stock.purchasePrice,
          quantity: stock.quantity,
          investment: stock.investment,
          weight: stock.weight,
          stage2: stock.stage2,
          salePrice: stock.salePrice,
          notes: stock.notes,
          cmp: cmp !== null ? cmp : stock.purchasePrice, // Fallback to purchasePrice if fetch fails
          pe: fundamentals.pe,
          eps: fundamentals.eps
        };
      } catch (err) {
        console.error(`Error updating live data for ${stock.name}:`, err.message);
        return {
          id: stock._id,
          ticker: stock.ticker,
          name: stock.name,
          sector: stock.sector,
          exchange: stock.exchange,
          purchasePrice: stock.purchasePrice,
          quantity: stock.quantity,
          investment: stock.investment,
          weight: stock.weight,
          stage2: stock.stage2,
          salePrice: stock.salePrice,
          notes: stock.notes,
          cmp: stock.purchasePrice, // Fallback
          pe: null,
          eps: null
        };
      }
    });

    const chunkResults = await Promise.all(chunkPromises);
    results.push(...chunkResults);

    // Minor delay between batches to respect rate limits
    if (i + CHUNK_SIZE < stocks.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  return results;
};

module.exports = {
  fetchYahooCMP,
  scrapeGoogleFundamentals,
  getLiveStockData
};
