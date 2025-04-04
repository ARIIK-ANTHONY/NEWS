const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 1000;

// Validate environment variables
function validateEnvVars() {
    const requiredVars = ["FINDWORK_API_KEY", "NEWS_API_KEY"];
    const missingVars = requiredVars.filter(key => !process.env[key]);

    if (missingVars.length > 0) {
        console.error(`❌ Missing environment variables: ${missingVars.join(", ")}`);
        process.exit(1);
    }
}
validateEnvVars();

const FINDWORK_API_KEY = process.env.FINDWORK_API_KEY;
const NEWS_API_KEY = process.env.NEWS_API_KEY;

app.use(cors());
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
            if (error.response.status === 404) {
                return res.status(200).json({ message: `No job listings found in ${location}. Try searching in a different city.` });
            }
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
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
