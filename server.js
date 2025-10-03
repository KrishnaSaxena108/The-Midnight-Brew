const express = require('express');
const path = require('path');
const morgan = require('morgan');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// JWT Secret Key (In production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// In-memory user database (temporary storage)
const users = [];

// In-memory bookings database (temporary storage)
const bookings = [];

// Middle-Ware Configuration

// 1. Morgan Loader - Advanced HTTP request logging
// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);
const accessLogStream = fs.createWriteStream(path.join(logsDir, 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));
app.use(morgan('dev'));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Request tracking
app.use((req, res, next) => {
    req.timestamp = new Date().toISOString();
    req.requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    next();
});

// Response time tracking
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        console.log(`${req.method} ${req.url} - ${Date.now() - start}ms`);
    });
    next();
});

// Static files
app.use('/public', express.static(path.join(__dirname, 'public')));

// 8. CUSTOM REQUEST LOGGER (in addition to morgan)
app.use((req, res, next) => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📍 Incoming Request`);
    console.log(`   Method:    ${req.method}`);
    console.log(`   URL:       ${req.url}`);
    console.log(`   Timestamp: ${req.timestamp}`);
    console.log(`   Request ID: ${req.requestId}`);
    console.log(`   IP:        ${req.ip || req.connection.remoteAddress}`);
    console.log(`   User-Agent: ${req.get('User-Agent') || 'Not specified'}`);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log(`   Body:      ${JSON.stringify(req.body)}`);
    }
    console.log(`${'='.repeat(60)}\n`);
    
    next();
});

// ============================================
// FRONTEND PAGE ROUTES (HTTP GET)
// ============================================

/**
 * Route: Homepage (/)
 * Method: GET
 * Handler: Serves the main landing page
 */
app.get('/', (req, res) => {
    console.log('📍 Route Hit: Homepage (/)');
    res.sendFile(path.join(__dirname, 'index.html'), (err) => {
        if (err) {
            console.error('Error serving homepage:', err);
            res.status(500).send('Error loading homepage');
        }
    });
});

/**
 * Route: Homepage Alternative (/home)
 * Method: GET
 * Handler: Alternate path to homepage
 */
app.get('/home', (req, res) => {
    console.log('📍 Route Hit: /home');
    res.sendFile(path.join(__dirname, 'index.html'), (err) => {
        if (err) {
            console.error('Error serving homepage:', err);
            res.status(500).send('Error loading homepage');
        }
    });
});

/**
 * Route: Menu Page (/menu)
 * Method: GET
 * Handler: Displays café menu with all items
 */
app.get('/menu', (req, res) => {
    console.log('📍 Route Hit: Menu Page (/menu)');
    res.sendFile(path.join(__dirname, 'menu.html'), (err) => {
        if (err) {
            console.error('Error serving menu page:', err);
            res.status(500).send('Error loading menu page');
        }
    });
});

/**
 * Route: Booking Page (/booking)
 * Method: GET
 * Handler: Table reservation and booking form
 */
app.get('/booking', (req, res) => {
    console.log('📍 Route Hit: Booking Page (/booking)');
    res.sendFile(path.join(__dirname, 'booking.html'), (err) => {
        if (err) {
            console.error('Error serving booking page:', err);
            res.status(500).send('Error loading booking page');
        }
    });
});

/**
 * Route: Contact Page (/contact)
 * Method: GET
 * Handler: Contact form and café information
 */
app.get('/contact', (req, res) => {
    console.log('📍 Route Hit: Contact Page (/contact)');
    res.sendFile(path.join(__dirname, 'contact.html'), (err) => {
        if (err) {
            console.error('Error serving contact page:', err);
            res.status(500).send('Error loading contact page');
        }
    });
});

/**
 * Route: About Page (/about)
 * Method: GET
 * Handler: Sends basic HTML about The Midnight Brew
 */
app.get('/about', (req, res) => {
    const aboutHTML = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>About - The Midnight Brew</title>
            <style>
                body { font-family: 'Georgia', serif; max-width: 800px; margin: 50px auto; padding: 20px; background-color: #1a1a1a; color: #f5f5f5; line-height: 1.6; }
                h1 { color: #d4a574; border-bottom: 2px solid #d4a574; padding-bottom: 10px; }
                h2 { color: #c89666; margin-top: 30px; }
                .highlight { color: #d4a574; font-weight: bold; }
                a { color: #d4a574; text-decoration: none; }
                a:hover { text-decoration: underline; }
            </style>
        </head>
        <body>
            <h1>☕ About The Midnight Brew</h1>
            <h2>Our Story</h2>
            <p>Welcome to <span class="highlight">The Midnight Brew</span> - a cozy late-night café where coffee meets creativity.</p>
            <h2>Our Mission</h2>
            <p>We provide a welcoming space where you can work, relax, create, or simply enjoy a perfectly crafted cup of coffee at any hour.</p>
            <p><a href="/">← Back to Home</a> | <a href="/menu">View Menu →</a> | <a href="/contact">Contact Us →</a></p>
        </body>
        </html>`;
    res.send(aboutHTML);
});

// API routes
app.get('/api/info', (req, res) => {
    const cafeInfo = {
        success: true,
        data: {
            name: 'The Midnight Brew',
            tagline: 'A cozy late-night café where coffee meets creativity',
            established: '2020',
            hours: { weekdays: '10:00 AM - 12:00 AM', weekends: '10:00 AM - 2:00 AM' },
            location: { address: '123 Coffee Street, Brew City', zipCode: '12345' },
            contact: { email: 'info@themidnightbrew.com', phone: '+1 (555) 123-4567' }
        }
    };
    res.json(cafeInfo);
});

app.get('/api/menu', (req, res) => {
    const menuData = {
        success: true,
        timestamp: new Date().toISOString(),
        data: {
            categories: ['Pastries', 'Beverages', 'Sandwiches', 'Soups'],
            items: [
                { id: 1, name: 'Blueberry Muffin', category: 'Pastries', price: 3.50, description: 'Fresh blueberries with golden crumb', image: 'public/bluberry muffin.jpg', available: true },
                { id: 2, name: 'Chocolate Croissant', category: 'Pastries', price: 4.25, description: 'Buttery pastry with dark chocolate', image: 'public/chocolate crossiant.jpg', available: true },
                { id: 3, name: 'Apple Turnover', category: 'Pastries', price: 3.75, description: 'Warm spiced apples in puff pastry', image: 'public/apple turnover.jpg', available: true },
                { id: 4, name: 'Espresso', category: 'Beverages', price: 2.50, description: 'Rich, bold coffee shot', image: 'public/hot1.jpg', available: true },
                { id: 5, name: 'Latte', category: 'Beverages', price: 4.50, description: 'Smooth espresso with steamed milk', image: 'public/hot2.webp', available: true },
                { id: 6, name: 'Cappuccino', category: 'Beverages', price: 4.00, description: 'Espresso with thick foam', image: 'public/hot3.jpg', available: true },
                { id: 7, name: 'BLT Sandwich', category: 'Sandwiches', price: 8.99, description: 'Classic bacon, lettuce, tomato', image: 'public/Blt.jpg', available: true },
                { id: 8, name: 'Club Sandwich', category: 'Sandwiches', price: 9.50, description: 'Triple-decker delight', image: 'public/club sandwitch.avif', available: true },
                { id: 9, name: 'Grilled Cheese', category: 'Sandwiches', price: 7.50, description: 'Three cheese blend', image: 'public/grilled.webp', available: true },
                { id: 10, name: 'Tomato Basil Soup', category: 'Soups', price: 6.50, description: 'Creamy with fresh basil', image: 'public/tomato.jpg', available: true },
                { id: 11, name: 'Broccoli Cheddar Soup', category: 'Soups', price: 6.75, description: 'Rich and cheesy', image: 'public/brocalli cheddar soup.jpg', available: true },
                { id: 12, name: 'Chinese Noodle Soup', category: 'Soups', price: 7.25, description: 'Savory broth with noodles', image: 'public/chinese noodle soup.jpg', available: true }
            ]
        }
    };
    res.json(menuData);
});

app.get('/api/menu/:category', (req, res) => {
    const category = req.params.category;
    const allItems = [
        { id: 1, name: 'Blueberry Muffin', category: 'pastries', price: 3.50 },
        { id: 2, name: 'Chocolate Croissant', category: 'pastries', price: 4.25 },
        { id: 4, name: 'Espresso', category: 'beverages', price: 2.50 },
        { id: 5, name: 'Latte', category: 'beverages', price: 4.50 },
        { id: 7, name: 'BLT Sandwich', category: 'sandwiches', price: 8.99 },
        { id: 8, name: 'Club Sandwich', category: 'sandwiches', price: 9.50 },
        { id: 10, name: 'Tomato Basil Soup', category: 'soups', price: 6.50 }
    ];
    const filteredItems = allItems.filter(item => item.category.toLowerCase() === category.toLowerCase());
    
    if (filteredItems.length > 0) {
        res.json({ success: true, category: category, count: filteredItems.length, items: filteredItems });
    } else {
        res.status(404).json({ success: false, message: `No items found in category: ${category}` });
    }
});

/**
 * Route: Submit Booking (/api/booking)
 * Method: POST
 * Handler: Protected route to submit table booking - requires JWT authentication
 */
app.post('/api/booking', authenticateToken, (req, res) => {
    console.log(`📍 Protected API Route Hit: POST /api/booking - User: ${req.user.email}`);
    
    try {
        const { date, time, guests, specialRequests } = req.body;
        
        // Validation
        if (!date || !time || !guests) {
            return res.status(400).json({
                success: false,
                error: 'Validation Error',
                message: 'Date, time, and number of guests are required'
            });
        }
        
        // Create booking object
        const booking = {
            id: Date.now(),
            userId: req.user.id,
            userEmail: req.user.email,
            userName: req.user.name,
            date,
            time,
            guests: parseInt(guests),
            specialRequests: specialRequests || '',
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        // Save booking to in-memory database
        bookings.push(booking);
        
        console.log(`✅ Booking created:`, booking);
        
        res.status(201).json({
            success: true,
            message: 'Booking submitted successfully',
            data: booking
        });
        
    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'Failed to submit booking'
        });
    }
});

app.get('/api/booking/timeslots', (req, res) => {
    const timeSlots = {
        success: true,
        date: req.query.date || new Date().toISOString().split('T')[0],
        data: {
            lunch: [{ time: '11:00 AM', available: true }, { time: '12:00 PM', available: true }],
            afternoon: [{ time: '2:00 PM', available: true }, { time: '3:00 PM', available: true }],
            dinner: [{ time: '6:00 PM', available: true }, { time: '7:00 PM', available: true }],
            lateNight: [{ time: '8:00 PM', available: true }, { time: '9:00 PM', available: true }]
        }
    };
    res.json(timeSlots);
});

app.get('/api/featured', (req, res) => {
    const featuredData = {
        success: true,
        data: {
            itemOfTheDay: { name: 'Midnight Latte', description: 'Special blend with vanilla and caramel', price: 5.50 },
            mostPopular: [
                { id: 5, name: 'Latte', orders: 145, rating: 4.8 },
                { id: 2, name: 'Chocolate Croissant', orders: 132, rating: 4.9 }
            ]
        }
    };
    res.json(featuredData);
});

app.get('/api/hours', (req, res) => {
    const hoursText = `THE MIDNIGHT BREW - OPERATING HOURS
Monday-Friday: 10:00 AM - 12:00 AM
Saturday-Sunday: 10:00 AM - 2:00 AM
Call us: +1 (555) 123-4567`;
    res.type('text/plain').send(hoursText);
});

app.get('/api/welcome', (req, res) => {
    res.send('Welcome to The Midnight Brew! ☕ Where coffee meets creativity. 🌙');
});

app.get('/api/specials', (req, res) => {
    const specialsData = {
        success: true,
        date: new Date().toISOString().split('T')[0],
        data: {
            dailySpecials: [
                { id: 1, name: 'Midnight Combo', description: 'Any coffee + any pastry', price: 7.00, validUntil: '11:59 PM' }
            ]
        }
    };
    res.json(specialsData);
});

app.get('/api/status', (req, res) => {
    const statusData = {
        success: true,
        server: 'The Midnight Brew API',
        status: 'online',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    };
    res.json(statusData);
});

app.get('/api/health', (req, res) => {
    res.json({ success: true, status: 'healthy', timestamp: new Date().toISOString() });
});

// Error handlers
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        error: 'Not Found',
        statusCode: 404,
        requestedUrl: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
    });
});

app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    const statusCode = err.statusCode || err.status || 500;
    res.status(statusCode).json({
        success: false,
        error: err.name || 'Internal Server Error',
        statusCode: statusCode,
        message: err.message || 'An unexpected error occurred on the server.',
        timestamp: new Date().toISOString(),
        requestId: req.requestId,
        path: req.url
    };

    // Add stack trace in development mode only
    if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = err.stack;
        errorResponse.details = err.details || 'No additional details available';
    }

    // Handle specific error types
    if (err.name === 'ValidationError') {
        errorResponse.statusCode = 400;
        errorResponse.message = 'Validation failed. Please check your input.';
    } else if (err.name === 'UnauthorizedError') {
        errorResponse.statusCode = 401;
        errorResponse.message = 'Authentication required. Please log in.';
    } else if (err.name === 'SyntaxError' && err.message.includes('JSON')) {
        errorResponse.statusCode = 400;
        errorResponse.message = 'Invalid JSON format in request body.';
    }

    // Send error response
    res.status(statusCode).json(errorResponse);
});

/**
 * ASYNC ERROR WRAPPER
 * Utility function to wrap async route handlers and catch errors
 */
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

/**
 * VALIDATION ERROR HANDLER
 * Creates validation error with proper format
 */
function createValidationError(message, details = []) {
    const error = new Error(message);
    error.name = 'ValidationError';
    error.statusCode = 400;
    error.details = details;
    return error;
}

/**
 * PROCESS ERROR HANDLERS
 * Handle uncaught exceptions and unhandled promise rejections
 */
process.on('uncaughtException', (err) => {
    console.error('\n💥 UNCAUGHT EXCEPTION! Shutting down...');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Stack trace:', err.stack);
    
    // Give ongoing requests time to finish
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('\n💥 UNHANDLED REJECTION! Shutting down...');
    console.error('Promise:', promise);
    console.error('Reason:', reason);
    
    // Give ongoing requests time to finish
    process.exit(1);
});

// ============================================
// GRACEFUL SHUTDOWN HANDLER
// ============================================

let server;

process.on('SIGTERM', () => {
    console.log('\n👋 SIGTERM received. Starting graceful shutdown...');
    if (server) {
        server.close(() => {
            console.log('✅ Server closed. Process terminating...');
            process.exit(0);
        });
    }
});

process.on('SIGINT', () => {
    console.log('\n\n👋 SIGINT received (Ctrl+C). Starting graceful shutdown...');
    if (server) {
        server.close(() => {
            console.log('✅ Server closed. Process terminating...');
            process.exit(0);
        });
    }
});

// ============================================
// START SERVER
// ============================================

server = app.listen(PORT, () => {
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`🚀 The Midnight Brew Server is Running!`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`📂 Static Files: ${__dirname}`);
    console.log(`📋 Logs Directory: ${path.join(__dirname, 'logs')}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('\n🛡️  MIDDLEWARE ACTIVE:');
    console.log(`   ✅ Morgan Logger (combined + dev formats)`);
    console.log(`   ✅ JSON Parser (express.json) - 10mb limit`);
    console.log(`   ✅ URL-encoded Parser (extended: true)`);
    console.log(`   ✅ CORS Headers (all origins)`);
    console.log(`   ✅ Security Headers (XSS, Clickjacking protection)`);
    console.log(`   ✅ Request Tracking (ID, Timestamp)`);
    console.log(`   ✅ Response Time Monitoring`);
    console.log(`   ✅ Custom Request Logger`);
    console.log(`   ✅ Static File Serving`);
    console.log(`   ✅ Error Handler (404 + Global)`);
    
    console.log('\n📄 FRONTEND PAGE ROUTES (app.get):');
    console.log(`   GET  /           → Homepage (index.html)`);
    console.log(`   GET  /home       → Homepage (index.html)`);
    console.log(`   GET  /menu       → Menu Page (menu.html)`);
    console.log(`   GET  /booking    → Booking Page (booking.html)`);
    console.log(`   GET  /contact    → Contact Page (contact.html)`);
    console.log(`   GET  /about      → About Page (Generated HTML)`);
    
    console.log('\n🔌 API DATA ROUTES - JSON (res.json):');
    console.log(`   GET  /api/info              → Café Information`);
    console.log(`   GET  /api/menu              → Complete Menu (12 items)`);
    console.log(`   GET  /api/menu/:category    → Menu by Category`);
    console.log(`   GET  /api/booking/timeslots → Available Time Slots`);
    console.log(`   GET  /api/featured          → Featured Items`);
    console.log(`   GET  /api/specials          → Daily Specials`);
    console.log(`   GET  /api/status            → Server Status`);
    console.log(`   GET  /api/health            → Health Check`);
    
    console.log('\n📝 API TEXT ROUTES (res.send):');
    console.log(`   GET  /api/hours             → Operating Hours (Text)`);
    console.log(`   GET  /api/welcome           → Welcome Message (Text)`);
    
    console.log('\n💡 EXAMPLE USAGE:');
    console.log(`   Pages:   http://localhost:${PORT}/menu`);
    console.log(`   JSON:    http://localhost:${PORT}/api/menu`);
    console.log(`   Filter:  http://localhost:${PORT}/api/menu/pastries`);
    console.log(`   Text:    curl http://localhost:${PORT}/api/welcome`);
    
    console.log('\n📊 MONITORING:');
    console.log(`   Logs:    tail -f logs/access.log`);
    console.log(`   Status:  http://localhost:${PORT}/api/status`);
    console.log(`   Health:  http://localhost:${PORT}/api/health`);
    console.log('═══════════════════════════════════════════════════════════\n');
});

// Export app and server for testing purposes
module.exports = { app, server };