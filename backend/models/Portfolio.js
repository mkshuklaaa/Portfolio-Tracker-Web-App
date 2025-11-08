const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  ticker: String,
  quantity: Number,
  buyPrice: Number
});

const portfolioSchema = new mongoose.Schema({
  userId: String,  // optional for multi-user system
  stocks: [stockSchema]
});

module.exports = mongoose.model('Portfolio', portfolioSchema);
