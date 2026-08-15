const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const OpenAI = require("openai");
const path = require("path");

dotenv.config();

const app = express();
const PORT = 3000;

// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());
app.use(express.json());

// ===============================
// API KEYS
// ===============================

const TWELVE_DATA_API_KEY =
    process.env.TWELVE_DATA_API_KEY;

const OPENAI_API_KEY =
    process.env.OPENAI_API_KEY;

// ===============================
// OPENAI CLIENT
// ===============================

const openai = OPENAI_API_KEY
    ? new OpenAI({
        apiKey: OPENAI_API_KEY
    })
    : null;

// ===============================
// GALACTIC STARTUP
// ===============================

console.log("");
console.log("======================================");
console.log("🚀 GALACTIC BACKEND");
console.log("======================================");

console.log(
    `🔑 Twelve Data API Key Loaded: ${
        TWELVE_DATA_API_KEY ? "true" : "false"
    }`
);

console.log(
    `🤖 OpenAI API Key Loaded: ${
        OPENAI_API_KEY ? "true" : "false"
    }`
);

console.log("======================================");

// =========================================================
// GALACTIC WEBSITE
// =========================================================
//
// Opening:
//
// https://your-site.vercel.app/
//
// will now show stock-analysis.html
//
// =========================================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "stock-analysis.html")
    );

});

// =========================================================
// API HEALTH CHECK
// =========================================================
//
// Opening:
//
// /api/health
//
// will show the backend status.
//
// =========================================================

app.get("/api/health", (req, res) => {

    res.json({

        status: "online",

        message:
            "GALACTIC API is running 🚀",

        twelveDataLoaded:
            Boolean(TWELVE_DATA_API_KEY),

        openAILoaded:
            Boolean(OPENAI_API_KEY)

    });

});

// =========================================================
// STOCK QUOTE
// =========================================================
//
// Example:
//
// /api/stock?symbol=AAPL
//
// =========================================================

app.get("/api/stock", async (req, res) => {

    try {

        const symbol =
            req.query.symbol;

        if (!symbol) {

            return res.status(400).json({

                error:
                    "Please provide a stock symbol."

            });

        }

        if (!TWELVE_DATA_API_KEY) {

            return res.status(500).json({

                error:
                    "Twelve Data API key is not loaded."

            });

        }

        const url =
            `https://api.twelvedata.com/quote` +
            `?symbol=${encodeURIComponent(symbol)}` +
            `&apikey=${encodeURIComponent(TWELVE_DATA_API_KEY)}`;

        const response =
            await fetch(url);

        const data =
            await response.json();

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

// =========================================================
// HISTORICAL STOCK DATA
// =========================================================
//
// Example:
//
// /api/history?symbol=AAPL&interval=1day
//
// =========================================================

app.get("/api/history", async (req, res) => {

    try {

        const symbol =
            req.query.symbol;

        const interval =
            req.query.interval ||
            "1day";

        if (!symbol) {

            return res.status(400).json({

                error:
                    "Please provide a stock symbol."

            });

        }

        if (!TWELVE_DATA_API_KEY) {

            return res.status(500).json({

                error:
                    "Twelve Data API key is not loaded."

            });

        }

        const url =
            `https://api.twelvedata.com/time_series` +
            `?symbol=${encodeURIComponent(symbol)}` +
            `&interval=${encodeURIComponent(interval)}` +
            `&outputsize=30` +
            `&apikey=${encodeURIComponent(TWELVE_DATA_API_KEY)}`;

        const response =
            await fetch(url);

        const data =
            await response.json();

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

// =========================================================
// GALACTIC AI CHAT
// =========================================================
//
// POST:
//
// /api/ai/chat
//
// =========================================================

app.post("/api/ai/chat", async (req, res) => {

    try {

        const {
            message,
            history = []
        } = req.body;

        // ===============================
        // VALIDATE MESSAGE
        // ===============================

        if (
            !message ||
            typeof message !== "string"
        ) {

            return res.status(400).json({

                error:
                    "Please provide a message."

            });

        }

        // ===============================
        // CHECK OPENAI
        // ===============================

        if (!openai) {

            return res.status(500).json({

                error:
                    "OpenAI API key is not loaded."

            });

        }

        // ===============================
        // LIMIT MESSAGE
        // ===============================

        const userMessage =
            message
                .trim()
                .slice(0, 4000);

        if (!userMessage) {

            return res.status(400).json({

                error:
                    "Message cannot be empty."

            });

        }

        // ===============================
        // CONVERSATION
        // ===============================

        const messages = [

            {
                role: "system",

                content: `
You are GALACTIC AI, the financial intelligence assistant
inside the GALACTIC Financial Intelligence website.

Your job is to help users understand:

- Stocks
- Investing
- Financial markets
- Company analysis
- Financial ratios
- Fundamental analysis
- Technical analysis
- Economics
- Personal finance concepts
- Accounting
- IFRS
- GAAP
- Financial analysis

Important rules:

1. Give clear and beginner-friendly explanations.

2. Use financial terminology when useful,
   but explain difficult terms.

3. Never claim guaranteed investment returns.

4. Do not present yourself as a licensed
   financial advisor.

5. When discussing investments, clearly mention
   relevant risks.

6. If the user asks about current prices or live
   market data, explain that live data should be
   obtained from GALACTIC's market-data system.

7. Do not invent stock prices, financial results,
   or market facts.

8. Keep answers useful and reasonably concise.

9. You are part of the GALACTIC Financial
   Intelligence platform.
`
            }

        ];

        // ===============================
        // ADD HISTORY
        // ===============================

        if (Array.isArray(history)) {

            for (
                const item
                of history.slice(-10)
            ) {

                if (

                    item &&

                    (
                        item.role === "user" ||
                        item.role === "assistant"
                    ) &&

                    typeof item.content === "string"

                ) {

                    messages.push({

                        role:
                            item.role,

                        content:
                            item.content
                                .slice(0, 4000)

                    });

                }

            }

        }

        // ===============================
        // CURRENT MESSAGE
        // ===============================

        messages.push({

            role: "user",

            content:
                userMessage

        });

        // ===============================
        // OPENAI REQUEST
        // ===============================

        const completion =
            await openai.chat.completions.create({

                model:
                    "gpt-4o-mini",

                messages:
                    messages,

                temperature:
                    0.4,

                max_tokens:
                    800

            });

        // ===============================
        // GET REPLY
        // ===============================

        const reply =
            completion
                .choices?.[0]
                ?.message
                ?.content ||

            "I couldn't generate a response.";

        // ===============================
        // SEND RESPONSE
        // ===============================

        res.json({

            success:
                true,

            reply:
                reply

        });

    } catch (error) {

        console.error(
            "======================================"
        );

        console.error(
            "🤖 GALACTIC AI ERROR"
        );

        console.error(error);

        console.error(
            "======================================"
        );

        res.status(500).json({

            success:
                false,

            error:
                "Unable to generate AI response."

        });

    }

});

// =========================================================
// SERVER START
// =========================================================

app.listen(PORT, () => {

    console.log("");

    console.log(
        `🌐 Server: http://localhost:${PORT}`
    );

    console.log(
        `🔑 Twelve Data: ${
            TWELVE_DATA_API_KEY
                ? "READY ✅"
                : "MISSING ❌"
        }`
    );

    console.log(
        `🤖 GALACTIC AI: ${
            OPENAI_API_KEY
                ? "READY ✅"
                : "MISSING ❌"
        }`
    );

    console.log("");

    console.log(
        "Available endpoints:"
    );

    console.log(
        "➡️  GET  /"
    );

    console.log(
        "➡️  GET  /api/health"
    );

    console.log(
        "➡️  GET  /api/stock?symbol=AAPL"
    );

    console.log(
        "➡️  GET  /api/history?symbol=AAPL&interval=1day"
    );

    console.log(
        "➡️  POST /api/ai/chat"
    );

    console.log("");

    console.log(
        "GALACTIC is ready 🚀"
    );

});