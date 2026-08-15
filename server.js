const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

// ======================================
// MIDDLEWARE
// ======================================

app.use(cors());
app.use(express.json());

// ======================================
// SERVE GALACTIC FRONTEND
// ======================================

app.get("/", (req, res) => {
    res.sendFile(
        path.join(__dirname, "stock-analysis.html")
    );
});

// ======================================
// TWELVE DATA API KEY
// ======================================

const TWELVE_DATA_API_KEY =
    process.env.TWELVE_DATA_API_KEY;

// ======================================
// STOCK QUOTE
//
// Example:
// /api/stock?symbol=AAPL
// ======================================

app.get("/api/stock", async (req, res) => {

    try {

        const symbol = req.query.symbol;

        if (!symbol) {
            return res.status(400).json({
                error: "Please provide a stock symbol."
            });
        }

        if (!TWELVE_DATA_API_KEY) {
            return res.status(500).json({
                error:
                    "Twelve Data API key is not loaded."
            });
        }

        const url =
            "https://api.twelvedata.com/quote" +
            "?symbol=" +
            encodeURIComponent(symbol) +
            "&apikey=" +
            encodeURIComponent(
                TWELVE_DATA_API_KEY
            );

        const response = await fetch(url);

        const data = await response.json();

        if (!response.ok || data.code) {

            return res
                .status(
                    Number(data.code) ||
                    response.status ||
                    400
                )
                .json(data);
        }

        res.json(data);

    } catch (error) {

        console.error(
            "Stock API Error:",
            error
        );

        res.status(500).json({
            error:
                "Unable to fetch stock data."
        });
    }
});

// ======================================
// HISTORICAL STOCK DATA
//
// Example:
// /api/history?symbol=AAPL&interval=1day
// ======================================

app.get("/api/history", async (req, res) => {

    try {

        const symbol = req.query.symbol;

        const interval =
            req.query.interval || "1day";

        if (!symbol) {
            return res.status(400).json({
                error: "Please provide a stock symbol."
            });
        }

        if (!TWELVE_DATA_API_KEY) {
            return res.status(500).json({
                error:
                    "Twelve Data API key is not loaded."
            });
        }

        const url =
            "https://api.twelvedata.com/time_series" +
            "?symbol=" +
            encodeURIComponent(symbol) +
            "&interval=" +
            encodeURIComponent(interval) +
            "&outputsize=30" +
            "&apikey=" +
            encodeURIComponent(
                TWELVE_DATA_API_KEY
            );

        const response = await fetch(url);

        const data = await response.json();

        if (!response.ok || data.code) {

            return res
                .status(
                    Number(data.code) ||
                    response.status ||
                    400
                )
                .json(data);
        }

        res.json(data);

    } catch (error) {

        console.error(
            "History API Error:",
            error
        );

        res.status(500).json({
            error:
                "Unable to fetch historical stock data."
        });
    }
});

// ======================================
// SERVER START
// ======================================

app.listen(PORT, () => {

    console.log("");
    console.log(
        "======================================"
    );

    console.log("🚀 GALACTIC BACKEND");

    console.log(
        "======================================"
    );

    console.log(
        `🔑 Twelve Data: ${
            TWELVE_DATA_API_KEY
                ? "READY ✅"
                : "MISSING ❌"
        }`
    );

    console.log(
        "======================================"
    );

    console.log(
        `🌐 Server running on port ${PORT}`
    );

    console.log("");
    console.log(
        "🚀 GALACTIC is ready!"
    );
});