const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  purchasePrice: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  investment: {
    type: Number,
    required: true,
    min: 0
  },
  weight: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  ticker: {
    type: String,
    required: true,
    trim: true
  },
  exchange: {
    type: String,
    required: true,
    enum: ['NSE', 'BSE']
  },
  sector: {
    type: String,
    required: true,
    trim: true
  },
  stage2: {
    type: Boolean,
    default: false
  },
  salePrice: {
    type: Number,
    default: null
  },
  notes: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Stock', stockSchema);
