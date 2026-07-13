# Loom Video Explanation Script

**Duration**: 5 - 8 minutes  
**Target Audience**: 8byte Technical Reviewers  

---

## 1. Introduction (0:00 - 0:45)
> *Tip: Share your browser showing the live Dashboard screen.*

"Hello, my name is Pavan Raj, and today I will walk you through the implementation of the Dynamic Portfolio Dashboard I built for the 8byte Technical Assessment.

The goal of this project is to build a dynamic portfolio tracker that displays holding records parsed from the Excel sheet, groups them by business sector, and fetches live valuations.

For the tech stack:
- **Frontend**: Built with **Next.js** using TypeScript, Tailwind CSS, and Recharts.
- **Backend**: A **Node.js** and **Express.js** REST API.
- **Database**: **MongoDB Atlas** with Mongoose.

Let's look at the running dashboard!"

---

## 2. Walkthrough of the Live Dashboard (0:45 - 2:00)
> *Tip: Point to specific elements on the screen as you talk.*

"As you can see, the interface is styled with a premium slate dark theme. 

At the top, we have our key metric index cards showing:
- **Total Portfolio Value**: The current live market valuation.
- **Total Investment**: The total amount invested.
- **Net Gain/Loss**: Expressed in rupees and a percentage ROI badge.
- **Diversification Sectors**: The count of active sectors.

Below the cards, we have two visual charts powered by **Recharts**:
1. On the left, a **Sector Allocation** pie chart that calculates the proportional weight of each sector.
2. On the right, a **Top Holdings Valuation** bar chart comparing the purchase investment value against the current live value.

Further down, we have our **Asset Holdings Table**. Notice that the rows are grouped by sector (such as Financials, Tech, Consumer). 
- At the end of each sector block, we display a **Sector Summary** row showing the total investment, present value, and gain/loss specifically for that sector.
- Stocks like *HDFC Bank* have custom badges showing details like 'Stage 2' or exit notes, which were parsed directly from columns in the Excel spreadsheet.
- The dashboard is set to **Auto-refresh** every 15 seconds, making live API requests in the background to fetch updated CMP values."

---

## 3. Creating and Modifying Holdings (2:00 - 3:00)
> *Tip: Click 'Add Transaction' button, fill out mock details, and save. Then click edit.*

"Let's demonstrate how we can add a new transaction holding. If I click **Add Transaction**, a modal opens. Let's enter a stock name, ticker symbol, sector, and transaction parameters. When we save, the server recalculates the portfolio weights dynamically and inserts it into MongoDB. We can also edit or delete any holding directly from the actions column."

---

## 4. Backend Code and Scraping Architecture (3:00 - 5:00)
> *Tip: Switch to your code editor showing the backend folder structure.*

"Now let's jump into the code. 

First, look at the folder structure:
- We have a clear separation with `/backend` and `/frontend` directories.
- In `/backend/data/seed.json`, we have the structured JSON representation of the Excel sheet. I wrote a Node parsing script that converts the spreadsheet so the project is fully portable and doesn't rely on local filesystem paths in production.
- In `/backend/src/config/db.js`, we connect to MongoDB Atlas and check if the stock collection is empty. If it is, the server automatically seeds itself with our 29 stock assets.

Let's check the core file, `financeService.js`.
Since Yahoo and Google Finance do not have public free APIs, I implemented scrapers:
- **Yahoo Finance**: We query the unofficial chart endpoint to fetch live prices (CMP) using tickers.
- **Google Finance**: We scrape the Google Finance page using regex to extract P/E Ratio and EPS.
- **Caching Layer**: To avoid getting blocked or rate-limited by Google/Yahoo, the backend caches prices for 30 seconds, and caches fundamentals (P/E and EPS) for 12 hours. We also throttle requests in batches of 5 to respect external servers.
- **Error Resiliency**: If any external fetch fails, the service falls back to the stock's purchase price as its CMP, preventing UI crashes."

---

## 5. Frontend Architecture (5:00 - 6:30)
> *Tip: Open the `/frontend` directory in the editor.*

"Now looking at the Next.js frontend:
- We use the Next.js App Router for layout and rendering.
- In `src/components`, the table, metric cards, and charts are modularized.
- In `src/app/page.tsx`, we manage the state for loading skeletons, countdown timers, and API integrations using React Hooks.
- `next.config.mjs` is configured with rewrite proxies to prevent CORS issues when communicating with our Express backend.
- Styling is implemented using Tailwind CSS utility classes."

---

## 6. How to Run the Project & Conclusion (6:30 - 7:00)
"To run the project locally:
1. Clone the repository and configure the `.env` file in the backend with your MongoDB connection string.
2. In the `backend` folder, run `npm install` and `npm start`. The database seeds itself automatically.
3. In the `frontend` folder, run `npm install` and `npm run dev`. The dashboard will be available at `http://localhost:3000`.

Thank you for your time, and I look hurtful to your feedback!"
