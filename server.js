// Load environment variables first
require('dotenv').config();

const express = require('express');
const path = require('path');
const morgan = require('morgan');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/database');
const User = require('./models/User');
const Booking = require('./models/Booking');
const Session = require('./models/Session');
const { 
    generateToken, 
    authenticateToken, 
    optionalAuth, 
    invalidateSession, 
    invalidateAllUserSessions, 
    cleanupExpiredSessions 
} = require('./auth/middleware');

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
app.use(cookieParser());

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

// Response time tracking (for monitoring only)
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        // Response time logging removed for production
    });
    next();
});

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Serve CSS and JS files with proper paths
app.get('/css/styles.css', (req, res) => res.sendFile(path.join(__dirname, 'public/css/styles.css')));
app.get('/js/theme.js', (req, res) => res.sendFile(path.join(__dirname, 'public/js/theme.js')));
app.get('/js/booking.js', (req, res) => res.sendFile(path.join(__dirname, 'public/js/booking.js')));
app.get('/js/auth-nav.js', (req, res) => res.sendFile(path.join(__dirname, 'public/js/auth-nav.js')));

// Backward compatibility routes (optional)
app.get('/styles.css', (req, res) => res.redirect('/css/styles.css'));
app.get('/theme.js', (req, res) => res.redirect('/js/theme.js'));
app.get('/booking.js', (req, res) => res.redirect('/js/booking.js'));
app.get('/auth-nav.js', (req, res) => res.redirect('/js/auth-nav.js'));

// Authentication Routes
// Register endpoint
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName, phone } = req.body;

        // Validate required fields
        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Hash password
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user
        const newUser = new User({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            phone: phone || ''
        });

        await newUser.save();

        // Generate JWT token with session
        const token = await generateToken(newUser, req);

        // Set cookie
        const cookieMaxAge = (parseInt(process.env.COOKIE_MAX_AGE_HOURS) || 24) * 60 * 60 * 1000;
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: cookieMaxAge
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                id: newUser._id,
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                phone: newUser.phone
            },
            token
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token with session
        const token = await generateToken(user, req);

        // Set cookie
        const cookieMaxAge = (parseInt(process.env.COOKIE_MAX_AGE_HOURS) || 24) * 60 * 60 * 1000;
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: cookieMaxAge
        });

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone
            },
            token
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Logout endpoint
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
    try {
        // Invalidate the current session
        await invalidateSession(req.user.sessionId);
        
        res.clearCookie('token');
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.clearCookie('token');
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    }
});

// Logout from all devices endpoint
app.post('/api/auth/logout-all', authenticateToken, async (req, res) => {
    try {
        // Invalidate all sessions for the current user
        await invalidateAllUserSessions(req.user.userId);
        
        res.clearCookie('token');
        res.json({
            success: true,
            message: 'Logged out from all devices successfully'
        });
    } catch (error) {
        console.error('Logout all error:', error);
        res.clearCookie('token');
        res.json({
            success: true,
            message: 'Logged out from all devices successfully'
        });
    }
});

// Get current user endpoint
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Protected booking endpoint
app.post('/api/bookings', authenticateToken, async (req, res) => {
    try {
        const { bookingDate, bookingTime, partySize, occasion, preferences, specialRequests } = req.body;

        // Validate required fields
        if (!bookingDate || !bookingTime || !partySize) {
            return res.status(400).json({
                success: false,
                message: 'Please provide booking date, time, and party size'
            });
        }

        // Create new booking
        const newBooking = new Booking({
            userId: req.user.userId,
            bookingDate,
            bookingTime,
            partySize: parseInt(partySize),
            occasion: occasion || '',
            preferences: preferences || [],
            specialRequests: specialRequests || ''
        });

        await newBooking.save();

        // Populate user details
        await newBooking.populate('userId', 'firstName lastName email phone');

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            booking: newBooking
        });

    } catch (error) {
        console.error('Booking creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create booking'
        });
    }
});

// Get user bookings
app.get('/api/bookings', authenticateToken, async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user.userId })
            .populate('userId', 'firstName lastName email phone')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            bookings
        });

    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch bookings'
        });
    }
});

// Cancel/Delete booking
app.delete('/api/bookings/:id', authenticateToken, async (req, res) => {
    try {
        const booking = await Booking.findOne({
            _id: req.params.id,
            userId: req.user.userId
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        booking.status = 'cancelled';
        await booking.save();

        res.json({
            success: true,
            message: 'Booking cancelled successfully'
        });

    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel booking'
        });
    }
});

// Frontend routes - now serving from public folder
app.get('/', optionalAuth, (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));
app.get('/home', optionalAuth, (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));
app.get('/menu', optionalAuth, (req, res) => res.sendFile(path.join(__dirname, 'public/menu.html')));
app.get('/contact', optionalAuth, (req, res) => res.sendFile(path.join(__dirname, 'public/contact.html')));

// Protected booking page - requires authentication
app.get('/booking', authenticateToken, (req, res) => res.sendFile(path.join(__dirname, 'public/booking.html')));

// Login page
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public/login.html')));

// Register page
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'public/register.html')));

// Dashboard page - requires authentication
app.get('/dashboard', authenticateToken, (req, res) => res.sendFile(path.join(__dirname, 'public/dashboard.html')));

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

// Initialize MongoDB connection and start server
const startServer = async () => {
    try {
        await connectDB();
        
        // Invalidate all existing sessions on server restart
        try { await Session.updateMany({}, { isActive: false }); } catch (e) { /* no DB */ }
        
        // Clean up expired sessions
        try { await cleanupExpiredSessions(); } catch (e) { /* no DB */ }
        
        const server = app.listen(PORT, () => {
            console.log(`🚀 The Midnight Brew Server running at http://localhost:${PORT}`);
        });
        
        // Graceful shutdown
        process.on('SIGTERM', () => {
            console.log('SIGTERM received. Shutting down gracefully...');
            server.close(() => {
                console.log('Process terminated');
            });
        });
        
        return server;
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Start the server
startServer();

module.exports = { app };