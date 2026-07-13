const Stock = require('../models/Stock');
const financeService = require('../services/financeService');
const { validationResult } = require('express-validator');

// Get all raw stocks from database
exports.getAllStocks = async (req, res) => {
  try {
    const stocks = await Stock.find().sort({ sector: 1, name: 1 });
    res.json({
      success: true,
      count: stocks.length,
      data: stocks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stocks',
      error: error.message
    });
  }
};

// Get live portfolio valuation and sector grouping
exports.getLivePortfolio = async (req, res) => {
  try {
    const dbStocks = await Stock.find();
    
    if (dbStocks.length === 0) {
      return res.json({
        success: true,
        summary: {
          totalInvestment: 0,
          totalPresentValue: 0,
          totalGainLoss: 0,
          totalGainLossPercentage: 0
        },
        sectors: [],
        stocks: []
      });
    }

    // Fetch live market data (caching and chunks handled inside service)
    const liveStocks = await financeService.getLiveStockData(dbStocks);

    // Calculate total portfolio investment for weight allocations
    let totalInvestment = 0;
    liveStocks.forEach(stock => {
      totalInvestment += stock.investment;
    });

    // Calculate calculations and values
    let totalPresentValue = 0;
    const processedStocks = liveStocks.map(stock => {
      const presentValue = stock.cmp * stock.quantity;
      const gainLoss = presentValue - stock.investment;
      const gainLossPercentage = stock.investment > 0 ? (gainLoss / stock.investment) * 100 : 0;
      const portfolioWeight = totalInvestment > 0 ? (stock.investment / totalInvestment) * 100 : 0;

      totalPresentValue += presentValue;

      return {
        ...stock,
        presentValue: Number(presentValue.toFixed(2)),
        gainLoss: Number(gainLoss.toFixed(2)),
        gainLossPercentage: Number(gainLossPercentage.toFixed(2)),
        portfolioWeight: Number(portfolioWeight.toFixed(2))
      };
    });

    const totalGainLoss = totalPresentValue - totalInvestment;
    const totalGainLossPercentage = totalInvestment > 0 ? (totalGainLoss / totalInvestment) * 100 : 0;

    // Group stocks by sector
    const sectorGroups = {};
    processedStocks.forEach(stock => {
      if (!sectorGroups[stock.sector]) {
        sectorGroups[stock.sector] = {
          sector: stock.sector,
          totalInvestment: 0,
          totalPresentValue: 0,
          gainLoss: 0,
          gainLossPercentage: 0,
          portfolioWeight: 0,
          stocks: []
        };
      }

      const sec = sectorGroups[stock.sector];
      sec.totalInvestment += stock.investment;
      sec.totalPresentValue += stock.presentValue;
      sec.portfolioWeight += stock.portfolioWeight;
      sec.stocks.push(stock);
    });

    // Finalize sector summaries
    const sectors = Object.values(sectorGroups).map(sec => {
      sec.gainLoss = Number((sec.totalPresentValue - sec.totalInvestment).toFixed(2));
      sec.gainLossPercentage = sec.totalInvestment > 0 ? Number(((sec.gainLoss / sec.totalInvestment) * 100).toFixed(2)) : 0;
      sec.totalInvestment = Number(sec.totalInvestment.toFixed(2));
      sec.totalPresentValue = Number(sec.totalPresentValue.toFixed(2));
      sec.portfolioWeight = Number(sec.portfolioWeight.toFixed(2));
      return sec;
    }).sort((a, b) => b.totalInvestment - a.totalInvestment); // sort by sector size

    res.json({
      success: true,
      summary: {
        totalInvestment: Number(totalInvestment.toFixed(2)),
        totalPresentValue: Number(totalPresentValue.toFixed(2)),
        totalGainLoss: Number(totalGainLoss.toFixed(2)),
        totalGainLossPercentage: Number(totalGainLossPercentage.toFixed(2))
      },
      sectors,
      stocks: processedStocks
    });
  } catch (error) {
    console.error('Error computing live portfolio:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to compute live portfolio values',
      error: error.message
    });
  }
};

// Add new stock holding
exports.addStock = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { name, purchasePrice, quantity, ticker, exchange, sector, stage2, salePrice, notes } = req.body;
    
    const investment = purchasePrice * quantity;
    
    // We will recalculate weights dynamically in live portfolio calculation
    // So default weight is set relative to current total investment
    const allStocks = await Stock.find();
    let totalInv = investment;
    allStocks.forEach(s => totalInv += s.investment);
    
    const weight = totalInv > 0 ? investment / totalInv : 0;

    const newStock = new Stock({
      name,
      purchasePrice,
      quantity,
      investment,
      weight,
      ticker,
      exchange,
      sector,
      stage2: stage2 || false,
      salePrice: salePrice || null,
      notes: notes || null
    });

    await newStock.save();
    
    // Dynamic recalculation of weights for all stocks
    const updatedStocks = await Stock.find();
    let newTotalInv = 0;
    updatedStocks.forEach(s => newTotalInv += s.investment);
    
    if (newTotalInv > 0) {
      await Promise.all(updatedStocks.map(async (s) => {
        s.weight = s.investment / newTotalInv;
        await s.save();
      }));
    }

    res.status(201).json({
      success: true,
      message: 'Stock holding added successfully',
      data: newStock
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add stock holding',
      error: error.message
    });
  }
};

// Update stock details
exports.updateStock = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { name, purchasePrice, quantity, ticker, exchange, sector, stage2, salePrice, notes } = req.body;
    
    let stock = await Stock.findById(req.params.id);
    if (!stock) {
      return res.status(404).json({ success: false, message: 'Stock not found' });
    }

    stock.name = name !== undefined ? name : stock.name;
    stock.purchasePrice = purchasePrice !== undefined ? purchasePrice : stock.purchasePrice;
    stock.quantity = quantity !== undefined ? quantity : stock.quantity;
    stock.ticker = ticker !== undefined ? ticker : stock.ticker;
    stock.exchange = exchange !== undefined ? exchange : stock.exchange;
    stock.sector = sector !== undefined ? sector : stock.sector;
    stock.stage2 = stage2 !== undefined ? stage2 : stock.stage2;
    stock.salePrice = salePrice !== undefined ? salePrice : stock.salePrice;
    stock.notes = notes !== undefined ? notes : stock.notes;

    if (purchasePrice !== undefined || quantity !== undefined) {
      stock.investment = stock.purchasePrice * stock.quantity;
    }

    await stock.save();

    // Recalculate weights for all stocks
    const updatedStocks = await Stock.find();
    let newTotalInv = 0;
    updatedStocks.forEach(s => newTotalInv += s.investment);
    
    if (newTotalInv > 0) {
      await Promise.all(updatedStocks.map(async (s) => {
        s.weight = s.investment / newTotalInv;
        await s.save();
      }));
    }

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: stock
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update stock',
      error: error.message
    });
  }
};

// Delete stock holding
exports.deleteStock = async (req, res) => {
  try {
    const stock = await Stock.findById(req.params.id);
    if (!stock) {
      return res.status(404).json({ success: false, message: 'Stock not found' });
    }

    await stock.deleteOne();

    // Recalculate weights for all stocks
    const updatedStocks = await Stock.find();
    let newTotalInv = 0;
    updatedStocks.forEach(s => newTotalInv += s.investment);
    
    if (newTotalInv > 0) {
      await Promise.all(updatedStocks.map(async (s) => {
        s.weight = s.investment / newTotalInv;
        await s.save();
      }));
    }

    res.json({
      success: true,
      message: 'Stock holding removed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete stock',
      error: error.message
    });
  }
};
