import React, { useState } from 'react';
import axios from 'axios';

const AddStockForm = ({ onStockAdded }) => {
  const [formData, setFormData] = useState({ ticker: '', quantity: '', buyPrice: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:5000/api/portfolio/add', {
      userId: "user1",
      ...formData
    });
    onStockAdded();
    setFormData({ ticker: '', quantity: '', buyPrice: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <input name="ticker" value={formData.ticker} onChange={handleChange} placeholder="Ticker" required />
      <input name="quantity" type="number" value={formData.quantity} onChange={handleChange} placeholder="Quantity" required />
      <input name="buyPrice" type="number" value={formData.buyPrice} onChange={handleChange} placeholder="Buy Price" required />
      <button type="submit">Add Stock</button>
    </form>
  );
};

export default AddStockForm;
