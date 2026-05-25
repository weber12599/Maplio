const express = require('express')
const puppeteer = require('puppeteer')
const cors = require('cors')
const rateLimit = require('express-rate-limit')

const app = express()
app.set('trust proxy', 1)
// Default port is 3000, or use the environment variable
const PORT = process.env.PORT || 3000

// ==========================================
// CONFIGURATION & SECURITY
// ==========================================

// Define your secret API Key here.
// In production, it is recommended to pass this via the Docker environment variable "API_KEY".
// Example: docker run -e API_KEY=my_secret_password ...
if (!process.env.API_KEY) {
    console.error('FATAL: Missing API_KEY environment variable. Exiting.')
    process.exit(1)
}
const MY_API_KEY = process.env.API_KEY

// Enable Cross-Origin Resource Sharing (CORS) to allow requests from your frontend
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173'
app.use(cors({ origin: corsOrigin }))

// Rate limiting
const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' }
})
app.use('/expandGoogleUrl', limiter)

// Parse incoming JSON payloads
app.use(express.json())

// Global browser instance
let globalBrowser = null

// Function to initialize or retrieve the existing browser instance
async function getBrowser() {
    if (globalBrowser && globalBrowser.isConnected()) {
        return globalBrowser
    }

    console.log('Launching new Puppeteer instance...')
    globalBrowser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage', // Crucial for Docker (uses /tmp instead of /dev/shm)
            '--lang=en-US', // Force English to reliably detect "Accept" buttons
            '--disable-accelerated-2d-canvas',
            '--disable-gpu'
        ]
    })
    return globalBrowser
}

// Function to safely close a page
async function closePage(page) {
    if (page) {
        try {
            await page.close()
        } catch (e) {
            console.error('Error closing page:', e)
        }
    }
}

// ==========================================
// MIDDLEWARE
// ==========================================

/**
 * Security Middleware: Validates the API Key.
 * All requests (except the root health check) must provide a valid 'x-api-key' header.
 */
app.use((req, res, next) => {
    // Allow public access to the root path for health checks (e.g., usually for Docker healthcheck)
    if (req.method === 'GET' && req.path === '/') {
        return next()
    }

    // Retrieve the API key from the request headers
    const clientKey = req.headers['x-api-key']

    // Validate the key
    if (clientKey !== MY_API_KEY) {
        console.warn(`[Security] Unauthorized access attempt from IP: ${req.ip}`)
        return res.status(403).json({ error: 'Forbidden: Invalid or missing API Key' })
    }

    // Proceed to the next middleware/route if valid
    next()
})

// ==========================================
// ROUTES
// ==========================================

/**
 * Health Check Endpoint
 * GET /
 */
app.get('/', (req, res) => {
    res.send('Maplio API is secure and running on the server!')
})

/**
 * Main Endpoint: Expand Google Maps Short URL
 * POST /expandGoogleUrl
 * Body: { "url": "https://goo.gl/maps/..." }
 */
app.post('/expandGoogleUrl', async (req, res) => {
    const shortUrl = req.body.url

    // 1. Validate input
    if (!shortUrl) {
        return res.status(400).json({ error: 'Missing "url" parameter in request body' })
    }

    // 1.1 Validate URL is from an allowed Google Maps domain
    let parsedUrl
    try {
        parsedUrl = new URL(shortUrl)
    } catch {
        return res.status(400).json({ error: 'Invalid URL format' })
    }
    const allowedHostnames = [
        'maps.google.com',
        'maps.app.goo.gl',
        'goo.gl',
        'google.com',
        'www.google.com'
    ]
    if (!allowedHostnames.includes(parsedUrl.hostname)) {
        console.warn(`[Security] Blocked disallowed hostname: ${parsedUrl.hostname}`)
        return res.status(400).json({ error: 'URL not from an allowed domain' })
    }

    console.log(`[Processing] URL: ${shortUrl}`)
    let page = null
    try {
        // 2. Reuse the global browser instance
        const browser = await getBrowser()
        page = await browser.newPage()

        // 2.1 Block heavy resources
        await page.setRequestInterception(true)
        page.on('request', (req) => {
            const resourceType = req.resourceType()
            // Block images, fonts, styles, media to save bandwidth and CPU
            if (['image', 'stylesheet', 'font', 'media', 'imageset'].includes(resourceType)) {
                req.abort()
            } else {
                req.continue()
            }
        })

        // 3. Set User-Agent
        // Spoof a standard desktop browser to avoid being served the mobile "Lite" version of Maps
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        )

        // 4. Navigate to the URL
        // We use 'domcontentloaded' for speed. We will handle the specific wait logic manually below.
        page.goto(shortUrl, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {})

        // 5. Smart Wait Logic
        // We poll the URL to see if it has resolved to the final Google Maps format (coordinates).
        // We also actively click "Consent" buttons if they appear.

        // Helper function to check if the current URL looks like a resolved map location
        const isTargetUrl = (url) => {
            return (
                url.includes('/maps/place') ||
                url.includes('/maps/search') ||
                /@-?\d+\.\d+,-?\d+\.\d+/.test(url)
            )
        }

        let attempts = 0
        const maxAttempts = 100

        while (attempts < maxAttempts) {
            const currentUrl = page.url()

            // Case A: Target URL found, exit loop
            if (isTargetUrl(currentUrl)) {
                break
            }

            // Case B: Stuck on Consent/Cookie page (common in headless mode)
            if (currentUrl.includes('consent.google.com')) {
                try {
                    await page.evaluate(() => {
                        // Find all buttons on the page
                        const buttons = Array.from(
                            document.querySelectorAll('button, input[type="submit"]')
                        )
                        // Look for "Accept", "Agree", or "OK"
                        const acceptBtn = buttons.find(
                            (b) =>
                                b.innerText.toLowerCase().includes('accept') ||
                                b.innerText.toLowerCase().includes('agree') ||
                                b.innerText.toLowerCase().includes('ok')
                        )
                        // Click it if found, otherwise click the first button as a fallback
                        if (acceptBtn) acceptBtn.click()
                        else if (buttons.length > 0) buttons[0].click()
                    })
                    // Wait briefly for navigation after clicking
                    await new Promise((r) => setTimeout(r, 500))
                } catch (e) {
                    console.warn('[Consent] Failed to click consent button:', e.message)
                }
            }

            // Wait 1 second before next check
            await new Promise((r) => setTimeout(r, 200))
            attempts++
        }

        // 6. Extract Data
        const finalUrl = page.url()
        console.log(`[Resolved] Final URL: ${finalUrl}`)

        // 7. Send Response
        if (
            finalUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) ||
            finalUrl.match(/[?&](?:q|ll)=(-?\d+\.\d+),(-?\d+\.\d+)/)
        ) {
            res.json({
                success: true,
                finalUrl: finalUrl
            })
        } else {
            // Even if no coordinates found, return the resolved URL (client might parse it differently)
            res.json({
                success: true,
                warning: 'Coordinates not found in the final URL',
                finalUrl: finalUrl
            })
        }
    } catch (error) {
        console.error('[Error] Puppeteer execution failed:', error)

        res.status(500).json({
            error: 'Internal Server Error'
        })
    } finally {
        // Only close the page, NOT the browser
        await closePage(page)
    }
})

// ==========================================
// START SERVER
// ==========================================
getBrowser().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
        console.log(`Security enabled. API Key required for POST requests.`)
    })
})
