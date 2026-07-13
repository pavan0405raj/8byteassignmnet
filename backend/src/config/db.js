const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Stock = require('../models/Stock');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/portfolio_db');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Auto seeding logic
    await seedDatabase();
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    const count = await Stock.countDocuments();
    if (count === 0) {
      console.log('Stock collection is empty. Seeding initial data from seed.json...');
      const seedPath = path.join(__dirname, '..', '..', 'data', 'seed.json');
      
      if (!fs.existsSync(seedPath)) {
        console.warn('seed.json file not found, skipping database seeding');
        return;
      }
      
      const fileData = fs.readFileSync(seedPath, 'utf8');
      const stocks = JSON.parse(fileData);
      
      await Stock.insertMany(stocks);
      console.log(`Successfully seeded ${stocks.length} stocks into MongoDB!`);
    } else {
      console.log(`Stock collection has ${count} records. Seeding not required.`);
    }
  } catch (error) {
    console.error('Error seeding database:', error.message);
  }
};

module.exports = connectDB;
