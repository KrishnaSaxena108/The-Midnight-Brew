const express = require('express');
const path = require('path');
const morgan = require('morgan');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Logging setup
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
app.use(express.static(path.join(__dirname, 'public')));
app.get('/styles.css', (req, res) => res.sendFile(path.join(__dirname, 'styles.css')));
app.get('/theme.js', (req, res) => res.sendFile(path.join(__dirname, 'theme.js')));
app.get('/booking.js', (req, res) => res.sendFile(path.join(__dirname, 'booking.js')));

// Frontend routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/home', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/menu', (req, res) => res.sendFile(path.join(__dirname, 'menu.html')));
app.get('/booking', (req, res) => res.sendFile(path.join(__dirname, 'booking.html')));
app.get('/contact', (req, res) => res.sendFile(path.join(__dirname, 'contact.html')));

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
        message: err.message || 'An unexpected error occurred',
        timestamp: new Date().toISOString()
    });
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`🚀 The Midnight Brew Server running at http://localhost:${PORT}`);
});

module.exports = { app, server };