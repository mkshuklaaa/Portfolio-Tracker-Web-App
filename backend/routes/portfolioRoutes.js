const express = require("express");
const router = express.Router();
const { getPortfolio, addStock } = require("../controllers/portfolioController");

router.get("/:userId", getPortfolio);
router.post("/add", addStock);


module.exports = router;

