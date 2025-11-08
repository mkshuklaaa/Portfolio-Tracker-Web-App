const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const portfolioRoutes = require('./routes/portfolioRoutes');
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/portfolio", require("./routes/portfolioRoutes"));


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  tlsAllowInvalidCertificates: true
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ MongoDB Connection Error:", err));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
