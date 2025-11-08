const axios = require("axios");
const Portfolio = require("../models/Portfolio");

const ALPHA_URL = "https://www.alphavantage.co/query";

// Helper function to delay between API calls (to prevent rate limiting)
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

exports.getPortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ userId: req.params.userId });
    if (!portfolio) return res.json([]);

    const updatedStocks = [];

    // Loop through each stock in the user's portfolio
    for (const stock of portfolio.stocks) {
      try {
        // Fetch stock data from Alpha Vantage API
        const response = await axios.get(ALPHA_URL, {
          params: {
            function: "GLOBAL_QUOTE",
            symbol: stock.ticker,
            apikey: process.env.ALPHA_VANTAGE_API_KEY,
          },
        });

        const data = response.data["Global Quote"];
        const limitMsg = response.data["Note"];
        const errorMsg = response.data["Error Message"];

        let price = null;

        // Handle API rate limit or invalid data
        if (limitMsg) {
          console.warn("⚠️ Alpha Vantage API limit hit:", limitMsg);
        } else if (errorMsg) {
          console.warn("⚠️ Invalid ticker:", stock.ticker);
        } else if (data && data["05. price"]) {
          price = parseFloat(data["05. price"]);
        } else {
          console.warn(`⚠️ No price data for ${stock.ticker}`);
        }

        // Push updated stock data (with safe fallback values)
        updatedStocks.push({
          ...stock._doc,
          currentPrice: price,
          profitLoss:
            price != null
              ? (price - stock.buyPrice) * stock.quantity
              : null,
        });

        // Wait 1 second to avoid hitting Alpha Vantage's 5 requests/minute limit
        await delay(1000);
      } catch (err) {
        console.error(`❌ Error fetching ${stock.ticker}:`, err.message);
        updatedStocks.push({
          ...stock._doc,
          currentPrice: null,
          profitLoss: null,
        });
      }
    }

    // Send updated portfolio to frontend
    res.json(updatedStocks);
  } catch (error) {
    console.error("❌ Portfolio Fetch Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

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

