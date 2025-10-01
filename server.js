// IMPORTS & DEPENDENCIES


const express = require('express');
const path = require('path');
const morgan = require('morgan');
const fs = require('fs');

// Initialize express app instance
const app = express();

// Define port
const PORT = process.env.PORT || 3000;

// Middle-Ware Configuration

// 1. Morgan Loader - Advanced HTTP request logging
// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Create a write stream for logging to file
const accessLogStream = fs.createWriteStream(
    path.join(logsDir, 'access.log'),
    { flags: 'a' }  
);

// Use morgan for logging
// 'combined' format for detailed logs
app.use(morgan('combined', { stream: accessLogStream }));

// Also log to console in 'dev' format (colorized, concise)
app.use(morgan('dev'));

// Custom morgan token for response time in milliseconds
morgan.token('response-time-ms', (req, res) => {
    if (!req._startAt || !res._startAt) {
        return '';
    }
    const ms = (res._startAt[0] - req._startAt[0]) * 1e3 +
               (res._startAt[1] - req._startAt[1]) * 1e-6;
    return ms.toFixed(2);
});

// 2. JSON PARSER MIDDLEWARE - Parse incoming JSON request bodies
/**
 * express.json() middleware
 * - Parses incoming requests with JSON payloads
 * - Available under req.body
 * - Limit set to 10mb for larger payloads
 */
app.use(express.json({ limit: '10mb' }));

/**
 * express.urlencoded() middleware  
 * - Parses incoming requests with URL-encoded payloads (form data)
 * - Available under req.body
 * - extended: true allows rich objects and arrays
 */
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 3. CORS MIDDLEWARE - Enable Cross-Origin Resource Sharing
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    
    next();
});

// 4. SECURITY HEADERS MIDDLEWARE
app.use((req, res, next) => {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Enable XSS filter
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    next();
});

// 5. REQUEST TIMESTAMP MIDDLEWARE
app.use((req, res, next) => {
    req.timestamp = new Date().toISOString();
    req.requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    next();
});

// 6. RESPONSE TIME TRACKER
app.use((req, res, next) => {
    const start = Date.now();
    
    // Intercept response finish
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`⏱️  Request to ${req.method} ${req.url} took ${duration}ms`);
    });
    
    next();
});

// 7. SERVE STATIC FILES
app.use(express.static(__dirname));
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
    console.log('📍 Route Hit: About Page (/about)');
    const aboutHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>About - The Midnight Brew</title>
            <style>
                body {
                    font-family: 'Georgia', serif;
                    max-width: 800px;
                    margin: 50px auto;
                    padding: 20px;
                    background-color: #1a1a1a;
                    color: #f5f5f5;
                    line-height: 1.6;
                }
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
            <p>
                Welcome to <span class="highlight">The Midnight Brew</span> - a cozy late-night café 
                where coffee meets creativity. Founded in 2020, we've become the go-to destination 
                for night owls, artists, students, and anyone seeking a warm refuge during the quiet hours.
            </p>
            
            <h2>Our Mission</h2>
            <p>
                We believe the best conversations, ideas, and connections happen in the stillness of 
                the night. Our mission is to provide a welcoming space where you can work, relax, 
                create, or simply enjoy a perfectly crafted cup of coffee at any hour.
            </p>
            
            <h2>What Makes Us Special</h2>
            <ul>
                <li>✨ Open late into the night - because inspiration doesn't follow a schedule</li>
                <li>☕ Expertly crafted coffee and specialty drinks</li>
                <li>🥐 Fresh pastries and savory treats baked daily</li>
                <li>📚 Cozy reading nooks and comfortable workspaces</li>
                <li>🎵 Curated playlists to set the perfect ambiance</li>
                <li>🌙 A community of creative minds and friendly faces</li>
            </ul>
            
            <h2>Visit Us</h2>
            <p>
                <strong>Hours:</strong><br>
                Monday - Friday: 10:00 AM - 12:00 AM<br>
                Saturday - Sunday: 10:00 AM - 2:00 AM
            </p>
            
            <p style="margin-top: 40px;">
                <a href="/">← Back to Home</a> | 
                <a href="/menu">View Menu →</a> | 
                <a href="/contact">Contact Us →</a>
            </p>
        </body>
        </html>
    `;
    res.send(aboutHTML);
});

// ============================================
// API ROUTES (HTTP GET for data)
// ============================================

/**
 * Route: Get Café Information (/api/info)
 * Method: GET
 * Handler: Returns JSON with café details
 */
app.get('/api/info', (req, res) => {
    console.log('📍 API Route Hit: /api/info');
    
    // Sending relevant data as JSON response
    const cafeInfo = {
        success: true,
        data: {
            name: 'The Midnight Brew',
            tagline: 'A cozy late-night café where coffee meets creativity',
            established: '2020',
            hours: {
                weekdays: '10:00 AM - 12:00 AM',
                weekends: '10:00 AM - 2:00 AM'
            },
            location: {
                address: '123 Coffee Street, Brew City',
                zipCode: '12345'
            },
            contact: {
                email: 'info@themidnightbrew.com',
                phone: '+1 (555) 123-4567'
            },
            social: {
                instagram: '@themidnightbrew',
                facebook: 'TheMidnightBrewCafe',
                twitter: '@midnight_brew'
            }
        }
    };
    
    // Use res.json() for API data
    res.json(cafeInfo);
});

/**
 * Route: Get Menu Items (/api/menu)
 * Method: GET
 * Handler: Returns JSON with complete menu data matching frontend needs
 */
app.get('/api/menu', (req, res) => {
    console.log('📍 API Route Hit: /api/menu');
    
    // Comprehensive menu data matching frontend structure
    const menuData = {
        success: true,
        timestamp: new Date().toISOString(),
        data: {
            categories: ['Pastries', 'Beverages', 'Sandwiches', 'Soups'],
            items: [
                // Pastries
                {
                    id: 1,
                    name: 'Blueberry Muffin',
                    category: 'Pastries',
                    price: 3.50,
                    description: 'Bursting with fresh blueberries and topped with a golden crumb',
                    image: 'public/bluberry muffin.jpg',
                    available: true,
                    vegetarian: true
                },
                {
                    id: 2,
                    name: 'Chocolate Croissant',
                    category: 'Pastries',
                    price: 4.25,
                    description: 'Buttery, flaky pastry filled with rich dark chocolate',
                    image: 'public/chocolate crossiant.jpg',
                    available: true,
                    vegetarian: true
                },
                {
                    id: 3,
                    name: 'Apple Turnover',
                    category: 'Pastries',
                    price: 3.75,
                    description: 'Warm spiced apples wrapped in golden puff pastry',
                    image: 'public/apple turnover.jpg',
                    available: true,
                    vegetarian: true
                },
                
                // Beverages (Coffee)
                {
                    id: 4,
                    name: 'Espresso',
                    category: 'Beverages',
                    subcategory: 'Coffee',
                    price: 2.50,
                    description: 'Rich, bold shot of perfectly extracted coffee beans',
                    image: 'public/hot1.jpg',
                    available: true,
                    vegan: true
                },
                {
                    id: 5,
                    name: 'Latte',
                    category: 'Beverages',
                    subcategory: 'Coffee',
                    price: 4.50,
                    description: 'Smooth espresso with velvety steamed milk and foam art',
                    image: 'public/hot2.webp',
                    available: true,
                    vegetarian: true
                },
                {
                    id: 6,
                    name: 'Cappuccino',
                    category: 'Beverages',
                    subcategory: 'Coffee',
                    price: 4.00,
                    description: 'Perfect balance of espresso, steamed milk, and thick foam',
                    image: 'public/hot3.jpg',
                    available: true,
                    vegetarian: true
                },
                
                // Sandwiches
                {
                    id: 7,
                    name: 'BLT Sandwich',
                    category: 'Sandwiches',
                    price: 8.99,
                    description: 'Classic bacon, lettuce, and tomato on toasted bread',
                    image: 'public/Blt.jpg',
                    available: true,
                    vegetarian: false
                },
                {
                    id: 8,
                    name: 'Club Sandwich',
                    category: 'Sandwiches',
                    price: 9.50,
                    description: 'Triple-decker with turkey, bacon, lettuce, and tomato',
                    image: 'public/club sandwitch.avif',
                    available: true,
                    vegetarian: false
                },
                {
                    id: 9,
                    name: 'Grilled Cheese',
                    category: 'Sandwiches',
                    price: 7.50,
                    description: 'Three cheese blend melted on artisan sourdough',
                    image: 'public/grilled.webp',
                    available: true,
                    vegetarian: true
                },
                
                // Soups
                {
                    id: 10,
                    name: 'Tomato Basil Soup',
                    category: 'Soups',
                    price: 6.50,
                    description: 'Creamy tomato soup with fresh basil',
                    image: 'public/tomato.jpg',
                    available: true,
                    vegetarian: true,
                    vegan: false
                },
                {
                    id: 11,
                    name: 'Broccoli Cheddar Soup',
                    category: 'Soups',
                    price: 6.75,
                    description: 'Rich and cheesy with fresh broccoli florets',
                    image: 'public/brocalli cheddar soup.jpg',
                    available: true,
                    vegetarian: true
                },
                {
                    id: 12,
                    name: 'Chinese Noodle Soup',
                    category: 'Soups',
                    price: 7.25,
                    description: 'Savory broth with egg noodles and vegetables',
                    image: 'public/chinese noodle soup.jpg',
                    available: true,
                    vegetarian: false
                }
            ],
            featured: [
                { id: 5, name: 'Latte', category: 'Beverages', price: 4.50 },
                { id: 2, name: 'Chocolate Croissant', category: 'Pastries', price: 4.25 },
                { id: 7, name: 'BLT Sandwich', category: 'Sandwiches', price: 8.99 }
            ],
            specials: [
                {
                    name: 'Midnight Special',
                    description: 'Any coffee + pastry combo',
                    price: 7.00,
                    available: true,
                    validUntil: '11:59 PM'
                }
            ]
        }
    };
    
    // Use res.json() for structured API data
    res.json(menuData);
});

/**
 * Route: Get Menu by Category (/api/menu/:category)
 * Method: GET
 * Handler: Returns JSON with filtered menu items
 */
app.get('/api/menu/:category', (req, res) => {
    const category = req.params.category;
    console.log(`📍 API Route Hit: /api/menu/${category}`);
    
    // Complete item database
    const allItems = [
        { id: 1, name: 'Blueberry Muffin', category: 'pastries', price: 3.50, description: 'Fresh blueberries with golden crumb', image: 'public/bluberry muffin.jpg' },
        { id: 2, name: 'Chocolate Croissant', category: 'pastries', price: 4.25, description: 'Buttery pastry with dark chocolate', image: 'public/chocolate crossiant.jpg' },
        { id: 3, name: 'Apple Turnover', category: 'pastries', price: 3.75, description: 'Warm spiced apples in puff pastry', image: 'public/apple turnover.jpg' },
        { id: 4, name: 'Espresso', category: 'beverages', subcategory: 'coffee', price: 2.50, description: 'Rich, bold coffee shot', image: 'public/hot1.jpg' },
        { id: 5, name: 'Latte', category: 'beverages', subcategory: 'coffee', price: 4.50, description: 'Smooth espresso with steamed milk', image: 'public/hot2.webp' },
        { id: 6, name: 'Cappuccino', category: 'beverages', subcategory: 'coffee', price: 4.00, description: 'Espresso with thick foam', image: 'public/hot3.jpg' },
        { id: 7, name: 'BLT Sandwich', category: 'sandwiches', price: 8.99, description: 'Classic bacon, lettuce, tomato', image: 'public/Blt.jpg' },
        { id: 8, name: 'Club Sandwich', category: 'sandwiches', price: 9.50, description: 'Triple-decker delight', image: 'public/club sandwitch.avif' },
        { id: 9, name: 'Grilled Cheese', category: 'sandwiches', price: 7.50, description: 'Three cheese blend', image: 'public/grilled.webp' },
        { id: 10, name: 'Tomato Basil Soup', category: 'soups', price: 6.50, description: 'Creamy with fresh basil', image: 'public/tomato.jpg' },
        { id: 11, name: 'Broccoli Cheddar Soup', category: 'soups', price: 6.75, description: 'Rich and cheesy', image: 'public/brocalli cheddar soup.jpg' },
        { id: 12, name: 'Chinese Noodle Soup', category: 'soups', price: 7.25, description: 'Savory broth with noodles', image: 'public/chinese noodle soup.jpg' }
    ];
    
    // Filter items by category
    const filteredItems = allItems.filter(item => 
        item.category.toLowerCase() === category.toLowerCase()
    );
    
    if (filteredItems.length > 0) {
        // Use res.json() to send filtered data
        res.json({
            success: true,
            category: category,
            count: filteredItems.length,
            items: filteredItems
        });
    } else {
        res.status(404).json({
            success: false,
            message: `No items found in category: ${category}`,
            availableCategories: ['pastries', 'beverages', 'sandwiches', 'soups']
        });
    }
});

/**
 * Route: Get Available Time Slots (/api/booking/timeslots)
 * Method: GET
 * Handler: Returns JSON with available booking time slots
 */
app.get('/api/booking/timeslots', (req, res) => {
    console.log('📍 API Route Hit: /api/booking/timeslots');
    
    const { date } = req.query;
    
    // Generate time slots based on café hours
    const timeSlots = {
        success: true,
        date: date || new Date().toISOString().split('T')[0],
        data: {
            lunch: [
                { time: '11:00 AM', available: true, capacity: 'High' },
                { time: '11:30 AM', available: true, capacity: 'High' },
                { time: '12:00 PM', available: true, capacity: 'Medium' },
                { time: '12:30 PM', available: false, capacity: 'Full' },
                { time: '1:00 PM', available: true, capacity: 'High' },
                { time: '1:30 PM', available: true, capacity: 'High' }
            ],
            afternoon: [
                { time: '2:00 PM', available: true, capacity: 'High' },
                { time: '2:30 PM', available: true, capacity: 'High' },
                { time: '3:00 PM', available: true, capacity: 'High' },
                { time: '3:30 PM', available: true, capacity: 'Medium' },
                { time: '4:00 PM', available: true, capacity: 'High' },
                { time: '4:30 PM', available: true, capacity: 'High' }
            ],
            dinner: [
                { time: '5:00 PM', available: true, capacity: 'Medium' },
                { time: '5:30 PM', available: false, capacity: 'Full' },
                { time: '6:00 PM', available: true, capacity: 'Medium' },
                { time: '6:30 PM', available: true, capacity: 'Low' },
                { time: '7:00 PM', available: true, capacity: 'High' },
                { time: '7:30 PM', available: true, capacity: 'High' }
            ],
            lateNight: [
                { time: '8:00 PM', available: true, capacity: 'High' },
                { time: '8:30 PM', available: true, capacity: 'High' },
                { time: '9:00 PM', available: true, capacity: 'High' },
                { time: '9:30 PM', available: true, capacity: 'High' },
                { time: '10:00 PM', available: true, capacity: 'High' },
                { time: '10:30 PM', available: true, capacity: 'Medium' }
            ]
        }
    };
    
    // Use res.json() for booking data
    res.json(timeSlots);
});

/**
 * Route: Get Featured Items (/api/featured)
 * Method: GET
 * Handler: Returns JSON with featured/special items
 */
app.get('/api/featured', (req, res) => {
    console.log('📍 API Route Hit: /api/featured');
    
    const featuredData = {
        success: true,
        data: {
            itemOfTheDay: {
                name: 'Midnight Latte',
                description: 'Special blend with vanilla and caramel',
                price: 5.50,
                originalPrice: 6.50,
                discount: '15% OFF',
                image: 'public/hot2.webp'
            },
            mostPopular: [
                { id: 5, name: 'Latte', orders: 145, rating: 4.8 },
                { id: 2, name: 'Chocolate Croissant', orders: 132, rating: 4.9 },
                { id: 7, name: 'BLT Sandwich', orders: 98, rating: 4.7 }
            ],
            newArrivals: [
                { name: 'Matcha Latte', price: 5.25, available: true },
                { name: 'Vegan Cookie', price: 3.00, available: true }
            ]
        }
    };
    
    // Use res.json() for featured data
    res.json(featuredData);
});

/**
 * Route: Get Operating Hours (/api/hours)
 * Method: GET
 * Handler: Returns plain text with operating hours
 */
app.get('/api/hours', (req, res) => {
    console.log('📍 API Route Hit: /api/hours');
    
    const hoursText = `
🕐 THE MIDNIGHT BREW - OPERATING HOURS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Monday    : 10:00 AM - 12:00 AM
Tuesday   : 10:00 AM - 12:00 AM
Wednesday : 10:00 AM - 12:00 AM
Thursday  : 10:00 AM - 12:00 AM
Friday    : 10:00 AM - 12:00 AM
Saturday  : 10:00 AM - 2:00 AM
Sunday    : 10:00 AM - 2:00 AM

☕ Late night service available on weekends!
📞 Call us: +1 (555) 123-4567
    `;
    
    // Use res.type() and res.send() for plain text
    res.type('text/plain');
    res.send(hoursText);
});

/**
 * Route: Welcome Message (/api/welcome)
 * Method: GET
 * Handler: Returns a simple text greeting
 */
app.get('/api/welcome', (req, res) => {
    console.log('📍 API Route Hit: /api/welcome');
    
    const welcomeMessage = 'Welcome to The Midnight Brew! ☕ Where coffee meets creativity. 🌙';
    
    // Use res.send() for simple text content
    res.send(welcomeMessage);
});

/**
 * Route: Get Daily Specials (/api/specials)
 * Method: GET
 * Handler: Returns JSON with current specials and deals
 */
app.get('/api/specials', (req, res) => {
    console.log('📍 API Route Hit: /api/specials');
    
    const specialsData = {
        success: true,
        date: new Date().toISOString().split('T')[0],
        data: {
            dailySpecials: [
                {
                    id: 1,
                    name: 'Midnight Combo',
                    description: 'Any coffee + any pastry',
                    price: 7.00,
                    regularPrice: 8.50,
                    savings: 1.50,
                    validUntil: '11:59 PM'
                },
                {
                    id: 2,
                    name: 'Happy Hour',
                    description: '20% off all beverages',
                    validTime: '2:00 PM - 4:00 PM',
                    discount: '20%'
                }
            ],
            weeklySpecial: {
                name: 'Weekend Brunch Deal',
                description: 'Sandwich + Soup + Coffee',
                price: 15.99,
                regularPrice: 19.50,
                validDays: ['Saturday', 'Sunday']
            }
        }
    };
    
    // Use res.json() for complex structured data
    res.json(specialsData);
});

/**
 * Route: Server Status (/api/status)
 * Method: GET  
 * Handler: Returns detailed server status
 */
app.get('/api/status', (req, res) => {
    console.log('📍 API Route Hit: /api/status');
    
    const statusData = {
        success: true,
        server: 'The Midnight Brew API',
        status: 'online',
        version: '1.0.0',
        uptime: process.uptime(),
        uptimeFormatted: `${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m`,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        node_version: process.version,
        memory: {
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB'
        }
    };
    
    // Use res.json() for status data
    res.json(statusData);
});

/**
 * Route: Health Check (/api/health)
 * Method: GET
 * Handler: Simple health check endpoint
 */
app.get('/api/health', (req, res) => {
    console.log('📍 API Route Hit: /api/health');
    
    // Use res.json() for health status
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});


// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

/**
 * ROUTE NOT FOUND HANDLER (404)
 * Catches all undefined routes and returns structured error
 */
app.use((req, res, next) => {
    console.log(`❌ 404 Error: Route not found - ${req.method} ${req.url}`);
    
    res.status(404).json({
        success: false,
        error: 'Not Found',
        statusCode: 404,
        requestedUrl: req.url,
        method: req.method,
        message: 'The requested resource could not be found.',
        timestamp: new Date().toISOString(),
        requestId: req.requestId,
        suggestion: 'Please check the URL and try again.'
    });
});

/**
 * GLOBAL ERROR HANDLER
 * Catches all unhandled errors in the application
 * Must have 4 parameters: (err, req, res, next)
 */
app.use((err, req, res, next) => {
    // Log error details
    console.error('\n' + '❌'.repeat(30));
    console.error('🚨 SERVER ERROR OCCURRED');
    console.error('─'.repeat(60));
    console.error(`Request ID: ${req.requestId || 'N/A'}`);
    console.error(`Timestamp:  ${new Date().toISOString()}`);
    console.error(`Method:     ${req.method}`);
    console.error(`URL:        ${req.url}`);
    console.error(`IP:         ${req.ip || req.connection.remoteAddress}`);
    console.error('─'.repeat(60));
    console.error('Error Details:');
    console.error(`Name:       ${err.name || 'Error'}`);
    console.error(`Message:    ${err.message || 'Unknown error'}`);
    if (err.stack) {
        console.error(`Stack:      ${err.stack}`);
    }
    console.error('❌'.repeat(30) + '\n');

    // Determine status code
    const statusCode = err.statusCode || err.status || 500;
    
    // Prepare error response
    const errorResponse = {
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
