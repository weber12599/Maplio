const express = require('express')
const puppeteer = require('puppeteer')
const cors = require('cors')

const app = express()
// Default port is 3000, or use the environment variable
const PORT = process.env.PORT || 3000

// ==========================================
// CONFIGURATION & SECURITY
// ==========================================

// Define your secret API Key here.
// In production, it is recommended to pass this via the Docker environment variable "API_KEY".
// Example: docker run -e API_KEY=my_secret_password ...
const MY_API_KEY = process.env.API_KEY || 'maplio_secret_key_999'

// Enable Cross-Origin Resource Sharing (CORS) to allow requests from your frontend
app.use(cors())

// Parse incoming JSON payloads
app.use(express.json())

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
    res.send('Maplio API is secure and running on Synology NAS!')
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

    console.log(`[Processing] URL: ${shortUrl}`)
    let browser = null

    try {
        // 2. Launch Puppeteer (Headless Chrome)
        // Note: 'headless: "new"' is the modern mode.
        // Args are optimized for Docker environments to prevent crashes.
        browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage', // Crucial for Docker (uses /tmp instead of /dev/shm)
                '--lang=en-US' // Force English to reliably detect "Accept" buttons
            ]
        })

        const page = await browser.newPage()

        // 3. Set User-Agent
        // Spoof a standard desktop browser to avoid being served the mobile "Lite" version of Maps
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        )

        // 4. Navigate to the URL
        // We use 'domcontentloaded' for speed. We will handle the specific wait logic manually below.
        await page.goto(shortUrl, { waitUntil: 'domcontentloaded', timeout: 30000 })

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
        const maxAttempts = 15 // Wait up to ~15 seconds

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
                    await new Promise((r) => setTimeout(r, 2000))
                } catch (e) {
                    console.warn('[Consent] Failed to click consent button:', e.message)
                }
            }

            // Wait 1 second before next check
            await new Promise((r) => setTimeout(r, 1000))
            attempts++
        }

        // 6. Extract Data
        const finalUrl = page.url()
        console.log(`[Resolved] Final URL: ${finalUrl}`)

        let coords = null

        // Pattern 1: URL contains @lat,lng (standard view)
        const atMatch = finalUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
        if (atMatch) {
            coords = { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) }
        }
        // Pattern 2: URL contains query params ?q=lat,lng or &ll=lat,lng (search view)
        else {
            const queryMatch = finalUrl.match(/[?&](?:q|ll)=(-?\d+\.\d+),(-?\d+\.\d+)/)
            if (queryMatch) {
                coords = { lat: parseFloat(queryMatch[1]), lng: parseFloat(queryMatch[2]) }
            }
        }

        const pageTitle = await page.title()
        await browser.close()

        // 7. Send Response
        if (coords) {
            res.json({
                success: true,
                finalUrl: finalUrl,
                coordinates: coords,
                title: pageTitle
            })
        } else {
            // Even if no coordinates found, return the resolved URL (client might parse it differently)
            res.json({
                success: true,
                warning: 'Coordinates not found in the final URL',
                finalUrl: finalUrl,
                title: pageTitle
            })
        }
    } catch (error) {
        console.error('[Error] Puppeteer execution failed:', error)

        // Ensure browser is closed in case of error
        if (browser) await browser.close()

        res.status(500).json({
            error: 'Internal Server Error',
            details: error.message
        })
    }
})

// ==========================================
// START SERVER
// ==========================================
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
    console.log(`Security enabled. API Key required for POST requests.`)
})
