# Technical Challenges & Solutions Document

**Candidate**: Pavan Raj  
**Role**: Full Stack Technical Assessment  
**Project**: Dynamic Portfolio Dashboard  

---

## 1. Challenge: Yahoo Finance and Google Finance Lack Official Free APIs
### Why it Occurred
Modern financial portals (Yahoo Finance, Google Finance) have deprecated their official free public APIs or gated them behind expensive commercial paywalls. Building an interactive stock dashboard requires real-time stock prices (CMP), Price-to-Earnings (P/E) ratios, and Earnings Per Share (EPS) without relying on paid enterprise credentials.

### Solution
- **Yahoo Finance**: Utilized the unofficial Yahoo Finance chart query API (`https://query1.finance.yahoo.com/v8/finance/chart/{symbol}`) which is lightweight, returns clean JSON metadata, and includes the live `regularMarketPrice`.
- **Google Finance**: Built a server-side web scraper using regular expressions to parse Google Finance's HTML page (`https://www.google.com/finance/quote/{symbol}:{exchange}`). By targeting the specific structure of Key Statistics grids (`div` elements with class `SwQK7` and `dO6ijd`), we extracted `P/E ratio` and `EPS` dynamically.
- **Failover / Fallback System**: To make the system robust against network timeouts or scraping failures, the backend automatically falls back to database transaction purchase prices if a fetch fails, ensuring the user interface remains populated and fully functional.

---

## 2. Challenge: Rate Limiting & Blocking on Concurrent Requests
### Why it Occurred
The portfolio contains 29 assets. Fetching live prices and scraping fundamentals for 29 stocks concurrently every 15 seconds causes a burst of parallel HTTP requests to Yahoo and Google servers. This triggers rate limit thresholds, resulting in HTTP `429 Too Many Requests` or IP temporary bans.

### Solution
- **Dual-Tiered Caching Layer**:
  - **CMP Cache (Yahoo Finance)**: Cached in-memory for **30 seconds** (sufficient for live user dashboards during trading hours).
  - **Fundamentals Cache (Google Finance)**: Cached in-memory for **12 hours**. Since P/E ratio and EPS are static metrics that only update daily or quarterly, there is no need to fetch them repeatedly on every tick.
- **Request Throttling (Batching)**:
  Implemented a chunking mechanism in Node.js. Instead of hitting external endpoints with all 29 requests in parallel, the service processes requests in sequential batches of **5 stocks** at a time with a short throttling sleep timer (200ms) between batches.

---

## 3. Challenge: Mixed Exchange Identifiers (NSE Ticker Names vs. BSE Numeric Codes)
### Why it Occurred
The source Excel sheet represents stock assets using mixed identifiers: some records use alphabetical tickers (e.g. `HDFCBANK`, `BAJFINANCE` representing NSE exchange symbols), while others use numeric codes (e.g. `532174`, `544252` representing BSE exchange codes). Yahoo Finance and Google Finance expect distinct formats:
- Yahoo Finance needs `.NS` suffix for NSE and `.BO` for BSE. However, Yahoo Finance query API does not support numeric BSE codes (e.g. `532174.BO` returns a 404).
- Google Finance needs symbols structured as `TICKER:NSE` or `BSE_CODE:BOM`.

### Solution
- **Ticker Mapping System**: Created a static mapping dictionary in the Node.js backend. Numeric BSE codes are translated to their corresponding standard NSE tickers (e.g., `532174` -> `ICICIBANK.NS`) for Yahoo Finance requests.
- **Smart Suffixing**: Google Finance endpoints are targeted dynamically. If a stock is listed as a BSE asset, the scraper queries the `BOM` exchange; otherwise, it queries the `NSE` exchange.

---

## 4. Challenge: Database Seeding & Portability
### Why it Occurred
The dataset resides in a local Excel file (`9BFAE6A1.xlsx`). Hardcoding the local absolute file path in backend scripts would break the application when deploying it to cloud platforms like Vercel, Render, or Netlify, where local Windows file paths do not exist.

### Solution
- Developed a one-time Excel parsing script (`src/utils/parseExcel.js`) using the `xlsx` library to parse the spreadsheet rows and structure.
- Saved the output as a compact, self-contained `seed.json` database backup inside the backend repository.
- Configured the MongoDB/Mongoose connection logic to automatically check the document count on startup. If the database is empty, it seeds the parsed JSON collection automatically, making the application cloud-ready.

---

## 5. Trade-offs Made
- **Regex vs. Cheerio/Puppeteer HTML Parsing**: Used simple JavaScript regex checks instead of full HTML parsers like Cheerio or headless browsers like Puppeteer. While Cheerio is robust, regex is significantly faster, lightweight, and uses far less CPU/memory, making it well-suited for a standard Node.js server.
- **In-Memory Cache vs. Redis**: Used a simple in-memory JS object cache rather than spinning up a Redis container. For a single-instance portfolio application, an in-memory cache is fully adequate, faster to configure, and reduces external dependencies.
