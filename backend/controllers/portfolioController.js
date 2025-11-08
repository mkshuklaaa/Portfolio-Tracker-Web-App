const axios = require("axios");
const Portfolio = require("../models/Portfolio");

const ALPHA_URL = "https://www.alphavantage.co/query";

exports.getPortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ userId: req.params.userId });
    if (!portfolio) return res.json([]);

    const updatedStocks = [];

    // ⏳ Add delay to avoid API rate limits
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    for (const stock of portfolio.stocks) {
      try {
        await delay(15000); // wait 15s between requests (safe under free tier)

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

        if (limitMsg) {
          console.warn("⚠️ API limit hit, skipping", stock.ticker);
          updatedStocks.push({
            ...stock._doc,
            currentPrice: null,
            profitLoss: null,
          });
          continue;
        }

        if (errorMsg || !data || !data["05. price"]) {
          console.warn("⚠️ No price data for", stock.ticker);
          updatedStocks.push({
            ...stock._doc,
            currentPrice: null,
            profitLoss: null,
          });
          continue;
        }

        const price = parseFloat(data["05. price"]);
        updatedStocks.push({
          ...stock._doc,
          currentPrice: price,
          profitLoss: (price - stock.buyPrice) * stock.quantity,
        });
      } catch (err) {
        console.error("❌ Error fetching data for", stock.ticker, ":", err.message);
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
