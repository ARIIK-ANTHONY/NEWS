const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 1001;

// Validate environment variables
function validateEnvVars() {
    const requiredVars = ["FINDWORK_API_KEY", "NEWS_API_KEY"];
    const missingVars = requiredVars.filter(key => !process.env[key]);

    if (missingVars.length > 0) {
        console.error(`❌ Missing environment variables: ${missingVars.join(", ")}`);
        process.exit(1);
    }

    // Log the keys for debugging purposes
    console.log('FINDWORK_API_KEY:', process.env.FINDWORK_API_KEY ? "Loaded" : "Missing");
    console.log('NEWS_API_KEY:', process.env.NEWS_API_KEY ? "Loaded" : "Missing");
}

validateEnvVars();

const FINDWORK_API_KEY = process.env.FINDWORK_API_KEY;
const NEWS_API_KEY = process.env.NEWS_API_KEY;

// CORS Configuration (Optional - specify frontend domain for better security)
const corsOptions = {
    origin: 'https://your-frontend-domain.com', // replace with your actual frontend domain
};
app.use(cors(corsOptions)); // Allows only requests from the specified domain

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(morgan("dev")); // Log HTTP requests

// Serve the homepage
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// News API Route
app.get("/api/news", async (req, res) => {
    const { category = "technology" } = req.query;

    try {
        console.log(`Fetching news for category: ${category}`);
        const response = await axios.get("https://newsapi.org/v2/top-headlines", {
            params: { category, language: "en", apiKey: NEWS_API_KEY }
        });

        if (!Array.isArray(response.data.articles)) {
            return res.status(500).json({ error: "Invalid response from News API." });
        }

        const filteredNews = response.data.articles.filter(article => article.content);
        res.json({ articles: filteredNews });
    } catch (error) {
        console.error("❌ News API Error:", error.message);
        res.status(500).json({ error: "Failed to fetch news. Please try again later." });
    }
});

// Job Search API Route
app.get("/api/jobs", async (req, res) => {
    const { query, location } = req.query;

    if (!query || !location) {
        return res.status(400).json({ error: "Job title and location are required." });
    }

    try {
        console.log(`Fetching jobs for query: ${query}, location: ${location}`);
        const response = await axios.get("https://findwork.dev/api/jobs/", {
            headers: { Authorization: `Token ${FINDWORK_API_KEY}` },
            params: { search: query, location }
        });

        if (!response.data.results || response.data.results.length === 0) {
            return res.status(200).json({ message: `No job listings found in ${location}. Try searching in a different city.` });
        }

        res.json(response.data);
    } catch (error) {
        console.error("❌ Job API Error:", error.response?.status || "Unknown", error.message);

        if (error.response) {
            console.error("Job API error response:", error.response.data);
            return res.status(error.response.status).json({ error: error.response.data || "An error occurred while fetching jobs." });
        }

        res.status(500).json({ error: "Failed to fetch jobs. Please try again later." });
    }
});

// Catch-all route for undefined routes
app.use((req, res) => {
    res.status(404).json({ error: "Route not found." });
});

// Graceful shutdown
process.on("SIGINT", () => {
    console.log("❌ Server shutting down...");
    process.exit(0);
});

// Start the server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
});
