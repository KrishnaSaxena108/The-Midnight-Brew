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

jwt-auth
// JWT Secret Key (In production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// In-memory user database (temporary storage)
const users = [];

// In-memory bookings database (temporary storage)
const bookings = [];

// Middle-Ware Configuration

// 0. CORS Middleware - Enable with credentials support
app.use(cors({
    origin: 'http://localhost:3000', // Allow frontend origin
    credentials: true // Allow cookies to be sent
}));

// 1. Cookie Parser - Parse cookies from requests
app.use(cookieParser());

// 2. Morgan Loader - Advanced HTTP request logging
// Create logs directory if it doesn't exist
=======
// Logging setup
main
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

jwt-auth
// 8. JWT AUTHENTICATION MIDDLEWARE
/**
 * Middleware to verify JWT tokens
 * Checks HTTP-only cookie first, then Authorization header
 * Verifies token and attaches user info to request
 */
const authenticateToken = (req, res, next) => {
    // Try to get token from HTTP-only cookie first (preferred)
    let token = req.cookies.authToken;
    
    // Fallback to Authorization header if cookie not present
    if (!token) {
        const authHeader = req.headers['authorization'];
        token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    }
    
    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Unauthorized',
            message: 'Access token is required. Please login first.'
        });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden',
                message: 'Invalid or expired token. Please login again.'
            });
        }
        
        req.user = user; // Attach user info to request
        next();
    });
};

// 9. CUSTOM REQUEST LOGGER (in addition to morgan)
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
// AUTHENTICATION ROUTES
// ============================================

/**
 * Route: User Registration (/register)
 * Method: POST
 * Handler: Register new user with email and password
 */
app.post('/register', async (req, res) => {
    console.log('📍 Auth Route Hit: POST /register');
    
    try {
        const { email, password, name } = req.body;
        
        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Validation Error',
                message: 'Email and password are required'
            });
        }
        
        // Check if user already exists
        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: 'Conflict',
                message: 'User with this email already exists'
            });
        }
        
        // Hash password with bcrypt (10 salt rounds)
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create new user
        const newUser = {
            id: users.length + 1,
            email,
            name: name || email.split('@')[0],
            password: hashedPassword,
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        
        console.log(`✅ User registered successfully: ${email}`);
        
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name
            }
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'Failed to register user'
        });
    }
});

/**
 * Route: User Login (/login)
 * Method: POST
 * Handler: Authenticate user and return JWT token
 */
app.post('/login', async (req, res) => {
    console.log('📍 Auth Route Hit: POST /login');
    
    try {
        const { email, password } = req.body;
        
        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Validation Error',
                message: 'Email and password are required'
            });
        }
        
        // Find user
        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication Failed',
                message: 'Invalid email or password'
            });
        }
        
        // Verify password with bcrypt
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'Authentication Failed',
                message: 'Invalid email or password'
            });
        }
        
        // Generate JWT token (valid for 1 hour)
        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email,
                name: user.name 
            },
            JWT_SECRET,
            { expiresIn: '1h' }
        );
        
        // Set HTTP-only cookie (secure in production)
        res.cookie('authToken', token, {
            httpOnly: true,     // Prevents JavaScript access (XSS protection)
            secure: process.env.NODE_ENV === 'production', // HTTPS only in production
            sameSite: 'strict', // CSRF protection
            maxAge: 3600000     // 1 hour (matches JWT expiry)
        });
        
        console.log(`✅ User logged in successfully: ${email} (JWT set in HTTP-only cookie)`);
        
        res.json({
            success: true,
            message: 'Login successful',
            token, // Still send token for localStorage fallback
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'Failed to login'
        });
    }
});

/**
 * Route: User Logout (/logout)
 * Method: POST
 * Handler: Clear authentication cookie
 */
app.post('/logout', (req, res) => {
    console.log('📍 Auth Route Hit: POST /logout');
    
    // Clear the HTTP-only cookie
    res.clearCookie('authToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    
    console.log('✅ User logged out successfully (cookie cleared)');
    
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
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
 * Route: Dashboard Page (/dashboard)
 * Method: GET
 * Handler: Protected dashboard - requires JWT authentication
 * Returns: User info + user-specific bookings
 */
app.get('/dashboard', authenticateToken, (req, res) => {
    console.log(`📍 Protected Route Hit: Dashboard (/dashboard) - User: ${req.user.email}`);
    
    // Get user's bookings (filter by user ID)
    const userBookings = bookings.filter(booking => booking.userId === req.user.id);
    
    // Separate into upcoming and past bookings
    const now = new Date();
    const upcomingBookings = userBookings.filter(b => new Date(b.date) >= now);
    const pastBookings = userBookings.filter(b => new Date(b.date) < now);
    
    // Sort: upcoming by date ascending, past by date descending
    upcomingBookings.sort((a, b) => new Date(a.date) - new Date(b.date));
    pastBookings.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    res.json({
        success: true,
        message: 'Welcome to your dashboard',
        user: req.user,
        bookings: {
            total: userBookings.length,
            upcoming: upcomingBookings,
            past: pastBookings.slice(0, 5) // Return last 5 past bookings
        },
        timestamp: new Date().toISOString()
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

main
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

jwt-auth
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

/**
 * Route: Get Available Time Slots (/api/booking/timeslots)
 * Method: GET
 * Handler: Returns JSON with available booking time slots
 */

 main
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

jwt-auth
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
    console.log(`   ✅ JWT Authentication Middleware`);
    
    console.log('\n🔐 AUTHENTICATION ROUTES:');
    console.log(`   POST /register              → User Registration`);
    console.log(`   POST /login                 → User Login (Returns JWT)`);
    
    console.log('\n📄 FRONTEND PAGE ROUTES (app.get):');
    console.log(`   GET  /           → Homepage (index.html)`);
    console.log(`   GET  /home       → Homepage (index.html)`);
    console.log(`   GET  /menu       → Menu Page (menu.html)`);
    console.log(`   GET  /booking    → Booking Page (booking.html)`);
    console.log(`   GET  /contact    → Contact Page (contact.html)`);
    console.log(`   GET  /about      → About Page (Generated HTML)`);
    
    console.log('\n🔒 PROTECTED ROUTES (Require JWT):');
    console.log(`   GET  /dashboard             → User Dashboard (Protected)`);
    console.log(`   POST /api/booking           → Submit Booking (Protected)`);
    
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
    console.log(`   Auth:    curl -X POST http://localhost:${PORT}/register -H "Content-Type: application/json" -d "{\\"email\\":\\"user@test.com\\",\\"password\\":\\"pass123\\"}"`);
    
    console.log('\n📊 MONITORING:');
    console.log(`   Logs:    tail -f logs/access.log`);
    console.log(`   Status:  http://localhost:${PORT}/api/status`);
    console.log(`   Health:  http://localhost:${PORT}/api/health`);
    console.log('═══════════════════════════════════════════════════════════\n');

// Start server
const server = app.listen(PORT, () => {
    console.log(`🚀 The Midnight Brew Server running at http://localhost:${PORT}`);
main
});

module.exports = { app, server };