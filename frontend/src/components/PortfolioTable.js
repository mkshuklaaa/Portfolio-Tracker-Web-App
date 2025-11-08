import React from 'react';

const PortfolioTable = ({ stocks }) => {
    const safeStocks = Array.isArray(stocks) ? stocks : [];
    const totalValue = safeStocks.reduce((acc, s) => acc + ((s.currentPrice || 0) * (s.quantity || 0)),0);
    const totalProfit = safeStocks.reduce((acc, s) => acc + (s.profitLoss || 0),0);

  return (
    <div>
      <h3>Portfolio Summary</h3>
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
  {stocks.map((s, i) => (
    <tr key={i}>
      <td>{s.ticker}</td>
      <td>{s.quantity}</td>
      <td>{s.buyPrice}</td>
      <td>
        {s.currentPrice != null
          ? s.currentPrice.toFixed(2)
          : "Loading..."}
      </td>
      <td style={{ color: s.profitLoss > 0 ? "green" : "red" }}>
        {s.profitLoss != null
          ? s.profitLoss.toFixed(2)
          : "Calculating..."}
      </td>
    </tr>
  ))}
</tbody>

      </table>
      <h4>Total Value: ${totalValue.toFixed(2)}</h4>
      <h4>Total Profit/Loss: ${totalProfit.toFixed(2)}</h4>
    </div>
  );
};

export default PortfolioTable;
