const axios = require("axios");
const Portfolio = require("../models/Portfolio");

// ✅ Twelve Data API endpoint
const TWELVE_URL = "https://api.twelvedata.com/price";

// Helper function (optional small delay for stability)
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ✅ Get Portfolio (fetching live stock prices)
exports.getPortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ userId: req.params.userId });
    if (!portfolio) return res.json([]);

    const updatedStocks = [];

    // Loop through each stock and fetch its current price
    for (const stock of portfolio.stocks) {
      try {
        const response = await axios.get(TWELVE_URL, {
          params: {
            symbol: stock.ticker,
            apikey: process.env.TWELVE_API_KEY, // ✅ use Twelve Data API key
          },
        });

        let price = null;

        // ✅ Check if valid price is returned
        if (response.data && response.data.price) {
          price = parseFloat(response.data.price);
        } else if (response.data.message) {
          console.warn(`⚠️ Invalid ticker or API issue for ${stock.ticker}: ${response.data.message}`);
        } else {
          console.warn(`⚠️ No price data for ${stock.ticker}`);
        }

        updatedStocks.push({
          ...stock._doc,
          currentPrice: price,
          profitLoss:
            price != null
              ? (price - stock.buyPrice) * stock.quantity
              : null,
        });

        // Small delay to avoid overwhelming free API limits
        await delay(200);
      } catch (err) {
        console.error(`❌ Error fetching ${stock.ticker}:`, err.message);
        updatedStocks.push({
          ...stock._doc,
          currentPrice: null,
          profitLoss: null,
        });
      }
    }

    res.json(updatedStocks);
  } catch (error) {
    console.error("❌ Portfolio Fetch Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Add new stock to user portfolio
exports.addStock = async (req, res) => {
  try {
    const { userId, ticker, quantity, buyPrice } = req.body;

    let portfolio = await Portfolio.findOne({ userId });
    if (!portfolio) {
      portfolio = new Portfolio({ userId, stocks: [] });
    }

    portfolio.stocks.push({ ticker, quantity, buyPrice });
    await portfolio.save();

    res.json({ message: "✅ Stock added successfully", portfolio });
  } catch (error) {
    console.error("❌ Error adding stock:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


