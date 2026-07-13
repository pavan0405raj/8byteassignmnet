const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const excelPath = 'C:\\Users\\PavanRaj\\Downloads\\9BFAE6A1.xlsx';
const outputPath = path.join(__dirname, '..', '..', 'data', 'seed.json');

try {
  // Read Excel file
  const workbook = xlsx.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Convert worksheet to a 2D array
  const rows = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
  
  let currentSector = null;
  const stocks = [];
  
  // Start from row index 2 (skip the very first empty/meta header rows and column header row at index 1)
  for (let i = 2; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;
    
    const noVal = row[0];
    const particulars = row[1];
    
    // Check if this is a sector header
    // Sector header has null/undefined in column A and non-empty string in column B, and no purchase price in column C
    if ((noVal === null || noVal === undefined) && particulars && (row[2] === null || row[2] === undefined)) {
      currentSector = particulars.trim();
      continue;
    }
    
    // If both serial number and stock name are present, it's a stock row
    if (noVal !== null && noVal !== undefined && particulars) {
      const serialNum = parseInt(noVal, 10);
      if (isNaN(serialNum)) continue; // skip total or summary rows
      
      const purchasePrice = Number(row[2]);
      const qty = Number(row[3]);
      const investment = Number(row[4]);
      const weight = Number(row[5]);
      
      // NSE/BSE exchange ticker code in column G (index 6)
      const rawTicker = row[6];
      let ticker = rawTicker ? String(rawTicker).trim() : null;
      let exchange = 'NSE';
      
      // If ticker consists of digits, it's a BSE code
      if (ticker && /^\d+$/.test(ticker)) {
        exchange = 'BSE';
      }
      
      // Stage-2 in column AG (Index 32)
      const stage2Val = row[32];
      const stage2 = stage2Val === 'Yes' || stage2Val === true;
      
      // Sale price in column AH (Index 33)
      const salePrice = row[33] ? Number(row[33]) : null;
      
      // Notes/Abhishek in column AI (Index 34)
      const notes = row[34] ? String(row[34]).trim() : null;
      
      stocks.push({
        name: String(particulars).trim(),
        purchasePrice,
        quantity: qty,
        investment,
        weight,
        ticker,
        exchange,
        sector: currentSector || 'Others',
        stage2,
        salePrice,
        notes
      });
    }
  }
  
  // Ensure the directory exists
  const dataDir = path.dirname(outputPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Write output
  fs.writeFileSync(outputPath, JSON.stringify(stocks, null, 2));
  console.log(`Successfully parsed ${stocks.length} stocks and saved to data/seed.json`);
} catch (error) {
  console.error('Error parsing Excel file:', error);
  process.exit(1);
}
