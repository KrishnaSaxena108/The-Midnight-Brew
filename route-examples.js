
// EXPRESS ROUTE EXAMPLES - The Midnight Brew

// This file demonstrates the app.get('/route', handler) syntax
// with real examples from our server.


const express = require('express');
const path = require('path');
const app = express();


// EXAMPLE 1: Basic Route - Sending HTML File

// Syntax: app.get('/route-path', (req, res) => { /* handler */ })
app.get('/', (req, res) => {
    // Handler function sends the homepage file
    res.sendFile(path.join(__dirname, 'index.html'));
});


// EXAMPLE 2: Named Route - Menu Page


app.get('/menu', (req, res) => {
    // Handler sends menu.html when user visits /menu
    res.sendFile(path.join(__dirname, 'menu.html'));
});


// EXAMPLE 3: API Route - Sending JSON Data

app.get('/api/info', (req, res) => {
    // Handler function creates and sends JSON data
    const cafeData = {
        name: 'The Midnight Brew',
        tagline: 'A cozy late-night café',
        hours: {
            weekdays: '10:00 AM - 12:00 AM',
            weekends: '10:00 AM - 2:00 AM'
        }
    };
    
    // Send JSON response
    res.json(cafeData);
});

// EXAMPLE 4: Dynamic Route - With Parameters

app.get('/api/menu/:category', (req, res) => {
    // Access route parameter
    const category = req.params.category;
    
    // Sample data
    const menuItems = {
        coffee: [
            { name: 'Espresso', price: 4.50 },
            { name: 'Latte', price: 5.25 }
        ],
        pastries: [
            { name: 'Croissant', price: 3.75 },
            { name: 'Muffin', price: 3.50 }
        ]
    };
    
    // Send filtered data based on category
    if (menuItems[category]) {
        res.json({
            success: true,
            category: category,
            items: menuItems[category]
        });
    } else {
        res.status(404).json({
            success: false,
            message: 'Category not found'
        });
    }
});

// EXAMPLE 5: Text Response

app.get('/api/welcome', (req, res) => {
    // Handler sends plain text
    const message = 'Welcome to The Midnight Brew! ☕';
    res.send(message);
});

// EXAMPLE 6: Generated HTML Response

app.get('/about', (req, res) => {
    // Handler generates and sends HTML
    const aboutHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>About Us</title>
        </head>
        <body>
            <h1>About The Midnight Brew</h1>
            <p>A cozy late-night café since 2020</p>
        </body>
        </html>
    `;
    
    res.send(aboutHTML);
});

// EXAMPLE 7: Route with Error Handling

app.get('/contact', (req, res) => {
    // Handler with error callback
    res.sendFile(path.join(__dirname, 'contact.html'), (err) => {
        if (err) {
            console.error('Error loading contact page:', err);
            res.status(500).send('Error loading page');
        }
    });
});

// EXAMPLE 8: Route with Logging

app.get('/booking', (req, res) => {
    // Log when route is accessed
    console.log(`[${new Date().toISOString()}] Booking page accessed`);
    
    // Send response
    res.sendFile(path.join(__dirname, 'booking.html'));
});

// EXAMPLE 9: Health Check Route

app.get('/api/health', (req, res) => {
    // Simple health check returning status
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

// EXAMPLE 10: Complex Data Route

app.get('/api/status', (req, res) => {
    // Handler with complex data processing
    const statusData = {
        server: 'The Midnight Brew API',
        status: 'online',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: '1.0.0',
        timestamp: new Date().toISOString()
    };
    
    res.json(statusData);
});

// ROUTE SYNTAX BREAKDOWN

/*
 * app.get('/route', (req, res) => { ... })
 *    │      │           │    │       │
 *    │      │           │    │       └─ Handler body (logic)
 *    │      │           │    └───────── Response object
 *    │      │           └────────────── Request object
 *    │      └────────────────────────── Route path (URL)
 *    └───────────────────────────────── HTTP GET method
 */

// RESPONSE METHODS USED IN HANDLERS

/*
 * res.sendFile()    - Send HTML/file from disk
 * res.json()        - Send JSON data (automatic Content-Type)
 * res.send()        - Send any data (HTML, text, etc.)
 * res.type()        - Set Content-Type header
 * res.status()      - Set HTTP status code
 */

// TESTING THESE ROUTES

/*
 * Browser:
 *   http://localhost:3000/
 *   http://localhost:3000/menu
 *   http://localhost:3000/api/info
 * 
 * Command Line:
 *   curl http://localhost:3000/api/welcome
 *   curl http://localhost:3000/api/menu/coffee
 * 
 * JavaScript:
 *   fetch('http://localhost:3000/api/info')
 *     .then(res => res.json())
 *     .then(data => console.log(data));
 */

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
