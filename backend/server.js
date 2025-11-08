// 🌿 Load environment variables
require("dotenv").config();

// 🚀 Import dependencies
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// 🧩 Import routes
const portfolioRoutes = require("./routes/portfolioRoutes");

// ⚙️ Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// 💾 MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    tlsAllowInvalidCertificates: true, // helps on Render or free MongoDB clusters
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) =>
    console.error("❌ MongoDB Connection Error:", err.message)
  );

// 🧭 Routes
app.use("/api/portfolio", portfolioRoutes);

// 🌐 Root route (for quick Render check)
app.get("/", (req, res) => {
  res.send("🚀 Portfolio Tracker Backend is Running Successfully!");
});

// 🎧 Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🟢 Server running on http://localhost:${PORT}`)
);

