# Interview Preparation & Codebase Walkthrough

This document helps you understand every component of the project and prepares you to answer likely technical questions diplomatically during the 8byte interviews.

---

## 1. Codebase Walkthrough (Understanding What Was Built)

### A. The Backend (Express.js + MongoDB)
- **`src/server.js`**: The starting point of our backend. It configures standard middleware: `cors` (enables frontend-backend requests), `helmet` (secures HTTP headers), and `morgan` (logs requests). It mounts the `/api/stocks` route.
- **`src/config/db.js`**: Connects to your MongoDB Atlas cluster. When connection succeeds, it checks if any stocks exist in the collection. If it is empty, it parses and seeds the 29 stocks from `data/seed.json` automatically.
- **`src/models/Stock.js`**: Defines the database schema for a stock holding, storing core transaction details like `purchasePrice`, `quantity`, `ticker` (symbol/code), `exchange` (NSE/BSE), and `sector` name.
- **`src/services/financeService.js`**:
  - Contains a `BSE_TO_YAHOO_TICKER` map that translates numeric BSE codes into corresponding standard NSE symbols for Yahoo Finance (because Yahoo doesn't support numeric BSE codes).
  - Fetches live prices (CMP) from the Yahoo Finance chart query API.
  - Queries Google Finance and parses the P/E ratio and EPS (earnings) using clean regular expressions from the HTML.
  - Groups requests into **chunks of 5** with a 200ms delay to prevent rate limit blocks.
  - Implements an **in-memory cache**: CMP prices are cached for **30 seconds**; P/E and EPS are cached for **12 hours** (since they change slowly).
- **`src/controllers/stockController.js`**: Contains the CRUD logic. The core endpoint is `getLivePortfolio`, which pulls stock transactions, merges them with the scraper's live prices and P/E/EPS, computes final valuations, aggregates sector summaries (investment, present value, returns), and returns a clean structured JSON response.

### B. The Frontend (Next.js + TypeScript + Tailwind)
- **`src/app/page.tsx`**: The main page component. It orchestrates the dashboard's state, manages a 15-second countdown timer for auto-refreshes, displays loading skeletons during initial fetch, and handles popups for CRUD modals.
- **`src/components/PortfolioTable.tsx`**: Renders a tabular list of holdings. It is grouped by Sector (e.g. Financials, Tech) and appends a **Sector Summary** row at the end of each section showing total investment, present value, and returns for that sector.
- **`src/components/DashboardCharts.tsx`**: Uses **Recharts** to display a clean **Sector Allocation** pie chart and a **Top Holdings Valuation** bar chart (comparing purchase cost vs. current value).
- **`src/components/MetricCard.tsx`**: Renders the summary stats cards at the top of the dashboard.
- **`src/components/StockModal.tsx`**: A form modal for adding or editing stock transaction parameters.
- **`next.config.mjs`**: Contains API proxies. Queries sent to `/api/*` on the client are automatically forwarded to the backend on `http://localhost:5000/api/*`, resolving CORS issues.

---

## 2. Likely Interview Questions & Diplomatic Answers

### Q1: "Why did you use web scraping instead of an official API?"
* **Why they ask**: To see if you understand financial data limitations and cost trade-offs.
* **Diplomatic Answer**: 
> *"Yahoo Finance and Google Finance do not offer free, official public APIs anymore; they are now gated behind paid enterprise licensing. For a portfolio utility of this scope, relying on unofficial chart endpoints and parsing HTML statistics is the most cost-effective approach. I acknowledged this limitation by introducing a robust error fallback—if the scrapers fail or time out, the system falls back to the database purchase price, ensuring the dashboard never crashes."*

---

### Q2: "If Yahoo or Google changes their HTML structure, your scrapers will break. How would you handle this in a production-grade app?"
* **Why they ask**: To assess your architecture skills and planning for system failures.
* **Diplomatic Answer**:
> *"Web scraping is inherently fragile in production because frontend selectors change. To make this production-ready, I would isolate the scraping logic behind a standard service interface (like `IFinanceService`). If the HTML structure changes, we would only need to update the regex patterns in that single service file without touching the controllers or routes. Furthermore, in a commercial setting, we would swap out the scraping layer for a paid data provider like IEX Cloud, AlphaVantage, or Bloomberg API by simply updating a feature flag or config setting."*

---

### Q3: "Why did you choose an in-memory cache instead of Redis?"
* **Why they ask**: To see if you over-engineer solutions or understand database limits.
* **Diplomatic Answer**:
> *"For a single-instance portfolio tool with 29 assets, introducing a Redis container adds unnecessary infrastructure complexity and maintenance overhead. An in-memory JavaScript cache is extremely fast, uses minimal memory, and keeps the project clean and easy to run locally. However, if the user base scales, we can easily swap the in-memory cache for Redis because the caching rules are modularized."*

---

### Q4: "I noticed you used CommonJS (`require`) on the backend, but ES Modules (`import`) on the frontend. Why the difference?"
* **Why they ask**: To see if you understand Node.js standards vs. modern framework build systems.
* **Diplomatic Answer**:
> *"Next.js uses a compiler (Webpack/Turbopack) out of the box, which natively handles ES Modules and TypeScript imports on the client side. Node.js backends, however, run directly in the V8 runtime. Using standard CommonJS (`require`) in the Express server ensures native compatibility without requiring compile/transpile steps (like Babel or ts-node) to run the server, keeping local development fast and deployment simple. It follows standard Node.js practices for a solid backend."*

---

### Q5: "How are the weights and gain/loss totals computed?"
* **Why they ask**: To check if you wrote the calculations yourself and understand the business logic.
* **Diplomatic Answer**:
> *"The backend is responsible for all math calculations to keep the frontend clean and fast:
> 1. **Investment**: `Purchase Price × Quantity` for each stock.
> 2. **Present Value**: `Live CMP × Quantity`.
> 3. **Individual Gain/Loss**: `Present Value - Investment`.
> 4. **Portfolio Weights**: We sum the total investment of all stocks, and then calculate `Stock Investment / Total Portfolio Investment × 100` for each stock.
> 5. **Sector Summaries**: We loop through all processed stocks, group them by sector name, and sum their investments and present values to calculate the sector's total weight and ROI percentage.
> This ensures that the frontend only has to receive, loop, and display the values, reducing calculation overhead on the browser."*
