# Dynamic Portfolio Dashboard

A dynamic, production-ready Full Stack stock portfolio tracking application. The backend is built with **Node.js, Express, and MongoDB**, and the frontend is built with **Next.js, TypeScript, and Tailwind CSS**. 

Live stock prices are fetched from Yahoo Finance, and P/E ratios and Earnings (EPS) are scraped from Google Finance with a built-in caching mechanism to avoid rate limits.

---

## 🚀 Features

- **Summary Metric Cards**: Live valuations for Portfolio Value, Total Invested, Net Gain/Loss (with percentage ROI badge), and Active Sector counts.
- **Visual Analytics**: Interactive allocation pie charts (Sector weights) and holdings bar charts (Investment vs. Present Value comparison) built with Recharts.
- **Grouped Asset Table**: Holdings displayed by Sector, with dedicated sector-level calculations (Total Sector Investment, Present Value, Sector ROI, Sector Weight) and total portfolio summaries.
- **CRUD Operations**: Add, edit, or delete transactions via a fully validated modal interface.
- **Resilient Web Scraping**: Live CMP fetching and fundamentals scraping from Google Finance with fallbacks.
- **Dual-Tiered Caching & Throttling**: CMP prices are cached for 30 seconds; static fundamentals (P/E, EPS) are cached for 12 hours. External API calls are processed in throttled batches to prevent rate limits.
- **Auto-Database Seeding**: The backend automatically seeds MongoDB with the 29 portfolio records extracted from the spreadsheet upon startup.

---

## 🛠️ Tech Stack

**Frontend**:
- Next.js (React Framework, App Router)
- TypeScript
- Tailwind CSS
- Recharts (Data Visualization)
- Axios (HTTP Requests)
- Lucide React (Icons)

**Backend**:
- Node.js & Express.js
- MongoDB & Mongoose
- xlsx (Excel parsing utility for seeding)
- CORS, Helmet, Morgan (Middlewares)
- Express Validator (Input validations)
- dotenv (Environment configuration)

---

## 📁 Folder Structure

```
portfolio-dashboard/
├── backend/                  # Node.js + Express.js API
│   ├── src/
│   │   ├── config/           # db.js (database connection and seeding logic)
│   │   ├── models/           # Stock.js model
│   │   ├── controllers/      # stockController.js
│   │   ├── routes/           # stockRoutes.js
│   │   ├── services/         # financeService.js (scrapers & fetchers)
│   │   ├── utils/            # parseExcel.js (excel parser)
│   │   └── server.js         # Backend entry point
│   ├── data/
│   │   └── seed.json         # Structured stock records parsed from excel
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
├── frontend/                 # Next.js Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css   # Tailwind configuration & global styles
│   │   │   ├── layout.tsx    # App root layout
│   │   │   └── page.tsx      # Main Dashboard View
│   │   ├── components/
│   │   │   ├── MetricCard.tsx      # Value summary index card
│   │   │   ├── DashboardCharts.tsx # Recharts pie and bar visualizer
│   │   │   ├── PortfolioTable.tsx  # Grouped sector valuation table
│   │   │   └── StockModal.tsx      # Add/Edit stock transaction modal
│   │   ├── utils/
│   │   │   └── api.ts        # Axios API client mappings
│   │   └── types/
│   │       └── stock.ts      # TypeScript interfaces
│   ├── postcss.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── next.config.mjs
│   ├── next-env.d.ts
│   └── package.json
├── challenges.md             # Design decisions & solved challenges document
├── loom_script.md            # Video explanation script
└── README.md                 # Project README
```

---

## ⚙️ Installation & Running Locally

### Prerequisites
- Node.js (v18.x or higher)
- npm (v9.x or higher)
- MongoDB running locally or a MongoDB Atlas connection string.

### 1. Database Seeding & Backend Configuration
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your environment variables. Create a `.env` file in the `backend/` root directory (you can copy `.env.example`):
   ```
   PORT=5000
   MONGO_URI=mongodb+srv://pavan0405raj_db_user:SZU84hF5Vm7aCPCy@cluster0.lj1mgwe.mongodb.net/portfolio_db?retryWrites=true&w=majority
   NODE_ENV=development
   ```
4. Start the backend server:
   ```bash
   npm start
   ```
   *Note: On startup, the backend checks MongoDB. If the collection is empty, it automatically seeds the database with the portfolio data from `data/seed.json`!*

### 2. Frontend Configuration
1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:3000` to interact with the dashboard.

---

## 🎛️ API Endpoints

The backend API is bound to `http://localhost:5000/api/stocks` and includes:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/stocks` | Fetch raw stock transactions database records. |
| **GET** | `/api/stocks/portfolio/live` | Fetch live market valuations, compute gains/losses, weights, and group by sector. |
| **POST** | `/api/stocks` | Add a new stock holding (validated via Express Validator). |
| **PUT** | `/api/stocks/:id` | Update an existing stock holding's details. |
| **DELETE** | `/api/stocks/:id` | Delete a stock holding. |
| **GET** | `/health` | Health check endpoint returning status code 200. |

---

## 🧩 Design Decisions & Optimization
- **Backend Caching**: External scraping of Google Finance is cached for **12 hours** to avoid rate limiting. Live Yahoo CMP is cached for **30 seconds** to maintain responsive updating during trading sessions.
- **Throttling Requests**: external fetches are chunked in sets of 5 with a 200ms sleep window, preventing concurrent spike triggers.
- **Portability**: Extracted spreadsheet data to `seed.json` to enable zero-dependency server startup and automated cloud container deployments.
- **State Fallbacks**: Prevents UI breaks by displaying purchase price if live fetching is disconnected.
