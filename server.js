const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

// Error handling setup
process.on('uncaughtException', (err) => {
  console.error('🚨 Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('🚨 Unhandled Rejection:', err);
});

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting (critical for production)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false
});

// Environment validation
function validateEnvVars() {
  const requiredVars = ["FINDWORK_API_KEY", "NEWS_API_KEY"];
  const missingVars = requiredVars.filter(key => !process.env[key]);

  if (missingVars.length > 0) {
    console.error(`❌ Missing environment variables: ${missingVars.join(", ")}`);
    return false;
  }
  return true;
}

// Non-blocking validation
if (!validateEnvVars()) {
  console.warn("⚠️  Starting server with missing environment variables - some features may not work");
}

const FINDWORK_API_KEY = process.env.FINDWORK_API_KEY;
const NEWS_API_KEY = process.env.NEWS_API_KEY;

// Middleware
app.use(cors());
app.use(limiter); // Critical security middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "Public")));
app.use(morgan("dev"));

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "Public", "index.html"));
});

// News API Route
app.get("/api/news", async (req, res) => {
  if (!NEWS_API_KEY) {
    return res.status(500).json({ 
      error: "News API not configured",
      success: false 
    });
  }

  const { category = "technology" } = req.query;
  try {
    console.log(`📰 Fetching news for category: ${category}`);
    const response = await axios.get("https://newsapi.org/v2/top-headlines", {
      params: {
        category,
        language: "en",
        apiKey: NEWS_API_KEY
      },
      timeout: 5000 // Add timeout
    });
    
    const filteredNews = response.data.articles.filter(article => article.content);
    res.json({ 
      success: true,
      articles: filteredNews 
    });
  } catch (error) {
    console.error("❌ News API Error:", error.message);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch news" 
    });
  }
});

// Job Search API Route
app.get("/api/jobs", async (req, res) => {
  if (!FINDWORK_API_KEY) {
    return res.status(500).json({ 
      success: false,
      error: "Jobs API not configured" 
    });
  }

  const { query, location } = req.query;
  if (!query?.trim() || !location?.trim()) {
    return res.status(400).json({ 
      success: false,
      error: "Job title and location are required",
      example: "/api/jobs?query=developer&location=New+York"
    });
  }

  try {
    console.log(`💼 Fetching jobs for: ${query} in ${location}`);
    const response = await axios.get("https://findwork.dev/api/jobs/", {
      headers: {
        Authorization: `Token ${FINDWORK_API_KEY}`
      },
      params: {
        search: query,
        location
      },
      timeout: 5000 // Add timeout
    });

    if (!response.data.results?.length) {
      return res.status(200).json({
        success: true,
        message: `No jobs found in ${location}`,
        results: []
      });
    }
    
    res.json({
      success: true,
      ...response.data
    });
  } catch (error) {
    console.error("❌ Job API Error:", error.message);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch jobs" 
    });
  }
});

// Health check (minimal addition)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString() 
  });
});

app.get('/favicon.ico', (req, res) => res.status(204).end());

// Error handling
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: "Route not found",
    availableEndpoints: [
      "GET /api/news",
      "GET /api/jobs",
      "GET /api/health"
    ]
  });
});

// Server setup
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`
  ✅ Server running on:
  - Local:    http://localhost:${PORT}
  - Network:  http://0.0.0.0:${PORT}
  
  🔍 Available APIs:
  - News:     /api/news?category=technology
  - Jobs:     /api/jobs?query=developer&location=New+York
  - Health:   /api/health
  `);
});

app.set('trust proxy', true);  // Needed for X-Forwarded-* headers

// Event listeners
server.on('error', (err) => {
  console.error('🚨 Server failed to start:', err);
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`\n🛑 Received ${signal}, shutting down...`);
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
