import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import "./App.css";

function App() {
  const [ticker, setTicker] = useState("");
  const [quantity, setQuantity] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [portfolio, setPortfolio] = useState([]);

  const fetchPortfolio = async () => {
    try {
      const response = await axios.get("https://portfolio-tracker-web-app.onrender.com/api/portfolio/user1");
      setPortfolio(response.data);
    } catch (err) {
      console.error("Error fetching portfolio:", err);
    }
  };

  const handleAdd = async () => {
    try {
      await axios.post("http://localhost:5000/api/portfolio/add", {
        userId: "user1",
        ticker,
        quantity,
        buyPrice,
      });
      setTicker("");
      setQuantity("");
      setBuyPrice("");
      fetchPortfolio();
    } catch (err) {
      console.error("Error adding stock:", err);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const totalValue = portfolio.reduce(
    (sum, stock) => sum + (stock.currentPrice || 0) * stock.quantity,
    0
  );
  const totalProfit = portfolio.reduce(
    (sum, stock) => sum + (stock.profitLoss || 0),
    0
  );

  return (
    <div className="app-container">
      <motion.h1
        className="app-title"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        💼 Portfolio Tracker
      </motion.h1>

      <motion.div
        className="input-box"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <input
          type="text"
          placeholder="Ticker"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
        />
        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <input
          type="number"
          placeholder="Buy Price"
          value={buyPrice}
          onChange={(e) => setBuyPrice(e.target.value)}
        />
        <motion.button
          className="add-btn"
          whileTap={{ scale: 0.95 }}
          onClick={handleAdd}
        >
          ➕ Add Stock
        </motion.button>
      </motion.div>

      <motion.div
        className="portfolio-box"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h2 className="section-title">📊 Portfolio Summary</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Ticker</th>
                <th>Quantity</th>
                <th>Buy Price</th>
                <th>Current Price</th>
                <th>Profit/Loss</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.map((stock, idx) => (
                <motion.tr
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <td>{stock.ticker}</td>
                  <td>{stock.quantity}</td>
                  <td>${stock.buyPrice}</td>
                  <td>
                    {stock.currentPrice
                      ? `$${stock.currentPrice.toFixed(2)}`
                      : "Loading..."}
                  </td>
                  <td
                    className={
                      stock.profitLoss > 0
                        ? "profit"
                        : stock.profitLoss < 0
                        ? "loss"
                        : "neutral"
                    }
                  >
                    {stock.profitLoss != null
                      ? `$${stock.profitLoss.toFixed(2)}`
                      : "Calculating..."}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="totals">
          <p>
            Total Value:{" "}
            <span className="highlight">${totalValue.toFixed(2)}</span>
          </p>
          <p>
            Total Profit/Loss:{" "}
            <span
              className={
                totalProfit > 0
                  ? "profit"
                  : totalProfit < 0
                  ? "loss"
                  : "neutral"
              }
            >
              ${totalProfit.toFixed(2)}
            </span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default App;
