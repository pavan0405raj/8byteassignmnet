const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const stockController = require('../controllers/stockController');

// Validation middlewares
const stockValidationRules = [
  check('name', 'Stock name is required').not().isEmpty().trim(),
  check('purchasePrice', 'Purchase price must be a positive number').isFloat({ min: 0.01 }),
  check('quantity', 'Quantity must be a positive integer').isInt({ min: 1 }),
  check('ticker', 'Ticker/Exchange Code is required').not().isEmpty().trim(),
  check('exchange', 'Exchange must be either NSE or BSE').isIn(['NSE', 'BSE']),
  check('sector', 'Sector name is required').not().isEmpty().trim()
];

// Routes
router.get('/', stockController.getAllStocks);
router.get('/portfolio/live', stockController.getLivePortfolio);
router.post('/', stockValidationRules, stockController.addStock);
router.put('/:id', stockValidationRules, stockController.updateStock);
router.delete('/:id', stockController.deleteStock);

module.exports = router;
