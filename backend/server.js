const express = require('express');
const cors = require('cors');
const { scrapeAll } = require('./scraper');

const app = express();
const PORT = 5000;

// ─── Middleware ──────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Cache to avoid duplicate requests ──────────────────────────
let cachedData = null;
let cacheTimestamp = null;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

// ─── Health Check ────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Khaki Tours Scraper API',
        endpoints: {
            scrape: 'GET /scrape',
            health: 'GET /'
        }
    });
});

// ─── Scrape Endpoint ─────────────────────────────────────────────
app.get('/scrape', async (req, res) => {
    try {
        // Check cache
        const now = Date.now();
        if (cachedData && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION_MS)) {
            console.log('Returning cached data...');
            return res.json(cachedData);
        }

        console.log('Starting scrape of khakitours.com...');
        const startTime = Date.now();

        // Set a 30 second timeout
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Scrape timeout: exceeded 30 seconds')), 30000)
        );

        const scrapePromise = scrapeAll();
        const data = await Promise.race([scrapePromise, timeoutPromise]);

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`Scrape complete in ${elapsed}s`);

        // Update cache
        cachedData = data;
        cacheTimestamp = Date.now();

        res.json(data);
    } catch (err) {
        console.error('Scrape error:', err.message);
        res.status(500).json({
            error: true,
            message: err.message || 'Failed to scrape website',
            agency: {},
            team: [],
            packages: [],
            richMedia: {
                hero_images: [],
                gallery_images: [],
                team_images: [],
                package_images: [],
                embedded_videos: []
            },
            metadata: {
                total_team_members: 0,
                total_packages: 0,
                total_images: 0,
                scraped_at: new Date().toISOString()
            }
        });
    }
});

// ─── Start Server ────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`🚀 Khaki Tours Scraper API running on http://localhost:${PORT}`);
    console.log(`📡 Scrape endpoint: http://localhost:${PORT}/scrape`);
});
