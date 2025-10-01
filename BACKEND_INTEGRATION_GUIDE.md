# 🔗 Backend Integration Guide - The Midnight Brew

## Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [All Routes Documentation](#all-routes-documentation)
- [Starting the Express Server](#starting-the-express-server)
- [Backend Integration](#backend-integration)
- [Adding New Routes](#adding-new-routes)
- [Frontend-Backend Communication](#frontend-backend-communication)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Overview

The Midnight Brew uses **Express.js** as its backend framework, providing:
- RESTful API endpoints for dynamic data
- Static file serving for HTML/CSS/JS/images
- Comprehensive middleware stack for security and logging
- Error handling and request tracking
- CORS support for frontend integration

**Server Details:**
- **Framework:** Express.js v5.1.0
- **Port:** 3000 (default)
- **Base URL:** `http://localhost:3000`
- **Environment:** Node.js

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                         │
│  - HTML Pages (index.html, menu.html, booking.html, etc.)  │
│  - JavaScript (booking.js, theme.js)                        │
│  - CSS (styles.css)                                         │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ HTTP Requests
                  │
┌─────────────────▼───────────────────────────────────────────┐
│              EXPRESS.JS SERVER (server.js)                  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         MIDDLEWARE STACK (10 Layers)                 │  │
│  │  1. Morgan Logger                                    │  │
│  │  2. JSON Parser (express.json)                       │  │
│  │  3. URL-encoded Parser                               │  │
│  │  4. CORS Headers                                     │  │
│  │  5. Security Headers                                 │  │
│  │  6. Request Tracking                                 │  │
│  │  7. Response Timer                                   │  │
│  │  8. Static File Serving                              │  │
│  │  9. Custom Logger                                    │  │
│  │ 10. Error Handlers                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              ROUTE HANDLERS                          │  │
│  │  - Frontend Pages (6 routes)                         │  │
│  │  - API Endpoints (10 routes)                         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## All Routes Documentation

### 📄 Frontend Page Routes (6 Routes)

These routes serve HTML pages to the browser.

#### 1. Homepage - `/` or `/home`
```javascript
GET /
GET /home
```

**Purpose:** Serve the main landing page  
**Response:** `index.html`  
**Method:** `res.sendFile()`  
**Use Case:** Main entry point for the website

**Example:**
```bash
# Browser
http://localhost:3000/

# Curl
curl http://localhost:3000/
```

---

#### 2. Menu Page - `/menu`
```javascript
GET /menu
```

**Purpose:** Display the café menu page  
**Response:** `menu.html`  
**Method:** `res.sendFile()`  
**Use Case:** Browse menu items and categories

**Example:**
```bash
# Browser
http://localhost:3000/menu

# Curl
curl http://localhost:3000/menu
```

---

#### 3. Booking Page - `/booking`
```javascript
GET /booking
```

**Purpose:** Table reservation and booking form  
**Response:** `booking.html`  
**Method:** `res.sendFile()`  
**Use Case:** Make table reservations

**Example:**
```bash
# Browser
http://localhost:3000/booking

# Curl
curl http://localhost:3000/booking
```

---

#### 4. Contact Page - `/contact`
```javascript
GET /contact
```

**Purpose:** Contact form and café information  
**Response:** `contact.html`  
**Method:** `res.sendFile()`  
**Use Case:** Get in touch with the café

**Example:**
```bash
# Browser
http://localhost:3000/contact

# Curl
curl http://localhost:3000/contact
```

---

#### 5. About Page - `/about`
```javascript
GET /about
```

**Purpose:** About The Midnight Brew story and mission  
**Response:** Generated HTML string  
**Method:** `res.send()`  
**Use Case:** Learn about the café's history

**Example:**
```bash
# Browser
http://localhost:3000/about

# Curl
curl http://localhost:3000/about
```

**Response Preview:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>About - The Midnight Brew</title>
</head>
<body>
    <h1>☕ About The Midnight Brew</h1>
    <h2>Our Story</h2>
    <p>Welcome to The Midnight Brew...</p>
</body>
</html>
```

---

### 🔌 API Data Routes (10 Routes)

These routes return JSON data for dynamic content.

#### 6. Café Information - `/api/info`
```javascript
GET /api/info
```

**Purpose:** Get complete café details  
**Response Type:** JSON  
**Method:** `res.json()`

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "name": "The Midnight Brew",
    "tagline": "A cozy late-night café where coffee meets creativity",
    "established": "2020",
    "hours": {
      "weekdays": "10:00 AM - 12:00 AM",
      "weekends": "10:00 AM - 2:00 AM"
    },
    "location": {
      "address": "123 Coffee Street, Brew City",
      "zipCode": "12345"
    },
    "contact": {
      "email": "info@themidnightbrew.com",
      "phone": "+1 (555) 123-4567"
    },
    "social": {
      "instagram": "@themidnightbrew",
      "facebook": "TheMidnightBrewCafe",
      "twitter": "@midnight_brew"
    }
  }
}
```

**Frontend Integration:**
```javascript
// Fetch café info
fetch('/api/info')
  .then(res => res.json())
  .then(data => {
    console.log(data.data.name); // "The Midnight Brew"
    console.log(data.data.contact.phone); // "+1 (555) 123-4567"
  });
```

---

#### 7. Complete Menu - `/api/menu`
```javascript
GET /api/menu
```

**Purpose:** Get all menu items across all categories  
**Response Type:** JSON  
**Method:** `res.json()`  
**Items Included:** 12 items (Pastries, Beverages, Sandwiches, Soups)

**Response Structure:**
```json
{
  "success": true,
  "timestamp": "2025-10-01T14:41:32.802Z",
  "data": {
    "categories": ["Pastries", "Beverages", "Sandwiches", "Soups"],
    "items": [
      {
        "id": 1,
        "name": "Blueberry Muffin",
        "category": "Pastries",
        "price": 3.50,
        "description": "Bursting with fresh blueberries and topped with a golden crumb",
        "image": "public/bluberry muffin.jpg",
        "available": true,
        "vegetarian": true
      },
      {
        "id": 5,
        "name": "Latte",
        "category": "Beverages",
        "subcategory": "Coffee",
        "price": 4.50,
        "description": "Smooth espresso with velvety steamed milk and foam art",
        "image": "public/hot2.webp",
        "available": true,
        "vegetarian": true
      }
      // ... 10 more items
    ],
    "featured": [
      { "id": 5, "name": "Latte", "category": "Beverages", "price": 4.50 }
    ],
    "specials": [
      {
        "name": "Midnight Special",
        "description": "Any coffee + pastry combo",
        "price": 7.00,
        "available": true,
        "validUntil": "11:59 PM"
      }
    ]
  }
}
```

**Frontend Integration:**
```javascript
// Display menu items
fetch('/api/menu')
  .then(res => res.json())
  .then(data => {
    const items = data.data.items;
    items.forEach(item => {
      console.log(`${item.name} - $${item.price}`);
    });
  });
```

---

#### 8. Menu by Category - `/api/menu/:category`
```javascript
GET /api/menu/pastries
GET /api/menu/beverages
GET /api/menu/sandwiches
GET /api/menu/soups
```

**Purpose:** Get filtered menu items by category  
**Response Type:** JSON  
**Method:** `res.json()`  
**Parameters:** `:category` (lowercase: pastries, beverages, sandwiches, soups)

**Response Structure:**
```json
{
  "success": true,
  "category": "pastries",
  "count": 3,
  "items": [
    {
      "id": 1,
      "name": "Blueberry Muffin",
      "category": "pastries",
      "price": 3.50,
      "description": "Fresh blueberries with golden crumb",
      "image": "public/bluberry muffin.jpg"
    },
    {
      "id": 2,
      "name": "Chocolate Croissant",
      "category": "pastries",
      "price": 4.25,
      "description": "Buttery pastry with dark chocolate",
      "image": "public/chocolate crossiant.jpg"
    },
    {
      "id": 3,
      "name": "Apple Turnover",
      "category": "pastries",
      "price": 3.75,
      "description": "Warm spiced apples in puff pastry",
      "image": "public/apple turnover.jpg"
    }
  ]
}
```

**Frontend Integration:**
```javascript
// Filter menu by category
const category = 'pastries';
fetch(`/api/menu/${category}`)
  .then(res => res.json())
  .then(data => {
    console.log(`Found ${data.count} items in ${data.category}`);
    data.items.forEach(item => {
      console.log(`- ${item.name}: $${item.price}`);
    });
  });
```

**Error Response (Invalid Category):**
```json
{
  "success": false,
  "message": "No items found in category: invalid",
  "availableCategories": ["pastries", "beverages", "sandwiches", "soups"]
}
```

---

#### 9. Booking Time Slots - `/api/booking/timeslots`
```javascript
GET /api/booking/timeslots
GET /api/booking/timeslots?date=2025-10-15
```

**Purpose:** Get available booking time slots  
**Response Type:** JSON  
**Method:** `res.json()`  
**Query Parameters:** `date` (optional, format: YYYY-MM-DD)

**Response Structure:**
```json
{
  "success": true,
  "date": "2025-10-01",
  "data": {
    "lunch": [
      { "time": "11:00 AM", "available": true, "capacity": "High" },
      { "time": "11:30 AM", "available": true, "capacity": "High" },
      { "time": "12:00 PM", "available": true, "capacity": "Medium" },
      { "time": "12:30 PM", "available": false, "capacity": "Full" }
    ],
    "afternoon": [
      { "time": "2:00 PM", "available": true, "capacity": "High" }
      // ... more slots
    ],
    "dinner": [
      { "time": "5:00 PM", "available": true, "capacity": "Medium" }
      // ... more slots
    ],
    "lateNight": [
      { "time": "8:00 PM", "available": true, "capacity": "High" }
      // ... more slots
    ]
  }
}
```

**Frontend Integration:**
```javascript
// Get available slots for specific date
const date = '2025-10-15';
fetch(`/api/booking/timeslots?date=${date}`)
  .then(res => res.json())
  .then(data => {
    // Display lunch slots
    data.data.lunch.forEach(slot => {
      if (slot.available) {
        console.log(`${slot.time} - ${slot.capacity} capacity`);
      }
    });
  });
```

---

#### 10. Featured Items - `/api/featured`
```javascript
GET /api/featured
```

**Purpose:** Get featured items, item of the day, and new arrivals  
**Response Type:** JSON  
**Method:** `res.json()`

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "itemOfTheDay": {
      "name": "Midnight Latte",
      "description": "Special blend with vanilla and caramel",
      "price": 5.50,
      "originalPrice": 6.50,
      "discount": "15% OFF",
      "image": "public/hot2.webp"
    },
    "mostPopular": [
      { "id": 5, "name": "Latte", "orders": 145, "rating": 4.8 },
      { "id": 2, "name": "Chocolate Croissant", "orders": 132, "rating": 4.9 },
      { "id": 7, "name": "BLT Sandwich", "orders": 98, "rating": 4.7 }
    ],
    "newArrivals": [
      { "name": "Matcha Latte", "price": 5.25, "available": true },
      { "name": "Vegan Cookie", "price": 3.00, "available": true }
    ]
  }
}
```

**Frontend Integration:**
```javascript
// Display featured items on homepage
fetch('/api/featured')
  .then(res => res.json())
  .then(data => {
    const special = data.data.itemOfTheDay;
    console.log(`Today's Special: ${special.name} - ${special.discount}`);
    
    console.log('Most Popular:');
    data.data.mostPopular.forEach(item => {
      console.log(`- ${item.name} (⭐ ${item.rating}, ${item.orders} orders)`);
    });
  });
```

---

#### 11. Daily Specials - `/api/specials`
```javascript
GET /api/specials
```

**Purpose:** Get current daily and weekly specials/deals  
**Response Type:** JSON  
**Method:** `res.json()`

**Response Structure:**
```json
{
  "success": true,
  "date": "2025-10-01",
  "data": {
    "dailySpecials": [
      {
        "id": 1,
        "name": "Midnight Combo",
        "description": "Any coffee + any pastry",
        "price": 7.00,
        "regularPrice": 8.50,
        "savings": 1.50,
        "validUntil": "11:59 PM"
      },
      {
        "id": 2,
        "name": "Happy Hour",
        "description": "20% off all beverages",
        "validTime": "2:00 PM - 4:00 PM",
        "discount": "20%"
      }
    ],
    "weeklySpecial": {
      "name": "Weekend Brunch Deal",
      "description": "Sandwich + Soup + Coffee",
      "price": 15.99,
      "regularPrice": 19.50,
      "validDays": ["Saturday", "Sunday"]
    }
  }
}
```

**Frontend Integration:**
```javascript
// Display today's specials
fetch('/api/specials')
  .then(res => res.json())
  .then(data => {
    data.data.dailySpecials.forEach(special => {
      console.log(`${special.name}: $${special.price} (save $${special.savings})`);
    });
  });
```

---

#### 12. Server Status - `/api/status`
```javascript
GET /api/status
```

**Purpose:** Get detailed server status and diagnostics  
**Response Type:** JSON  
**Method:** `res.json()`

**Response Structure:**
```json
{
  "success": true,
  "server": "The Midnight Brew API",
  "status": "online",
  "version": "1.0.0",
  "uptime": 1629.98,
  "uptimeFormatted": "0h 27m",
  "timestamp": "2025-10-01T14:41:32.802Z",
  "environment": "development",
  "node_version": "v22.19.0",
  "memory": {
    "total": "45 MB",
    "used": "32 MB"
  }
}
```

**Frontend Integration:**
```javascript
// Check server health
fetch('/api/status')
  .then(res => res.json())
  .then(data => {
    console.log(`Server: ${data.status}`);
    console.log(`Uptime: ${data.uptimeFormatted}`);
    console.log(`Memory: ${data.memory.used}/${data.memory.total}`);
  });
```

---

#### 13. Health Check - `/api/health`
```javascript
GET /api/health
```

**Purpose:** Simple health check endpoint  
**Response Type:** JSON  
**Method:** `res.json()`

**Response Structure:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-10-01T14:41:32.802Z"
}
```

**Frontend Integration:**
```javascript
// Quick health check
fetch('/api/health')
  .then(res => res.json())
  .then(data => {
    if (data.status === 'healthy') {
      console.log('✅ API is healthy');
    }
  });
```

---

#### 14. Operating Hours - `/api/hours` (TEXT)
```javascript
GET /api/hours
```

**Purpose:** Get operating hours as plain text  
**Response Type:** Plain Text  
**Method:** `res.send()`  
**Content-Type:** `text/plain`

**Response:**
```
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
```

**Frontend Integration:**
```javascript
// Display hours as text
fetch('/api/hours')
  .then(res => res.text())
  .then(text => {
    document.getElementById('hours').textContent = text;
  });
```

---

#### 15. Welcome Message - `/api/welcome` (TEXT)
```javascript
GET /api/welcome
```

**Purpose:** Get welcome message as plain text  
**Response Type:** Plain Text  
**Method:** `res.send()`

**Response:**
```
Welcome to The Midnight Brew! ☕ Where coffee meets creativity. 🌙
```

**Frontend Integration:**
```javascript
// Display welcome message
fetch('/api/welcome')
  .then(res => res.text())
  .then(message => {
    console.log(message);
  });
```

---

## Starting the Express Server

### Prerequisites

Ensure you have Node.js installed:
```bash
node --version  # Should show v18.x or higher
npm --version   # Should show v9.x or higher
```

### Installation Steps

#### 1. Navigate to Project Directory
```bash
cd c:/Users/mdawa/OneDrive/Desktop/The-Midnight-Brew
```

#### 2. Install Dependencies (First Time Only)
```bash
npm install
```

This installs:
- `express` (v5.1.0) - Web framework
- `morgan` (v1.10.0) - HTTP logger
- All other dependencies

#### 3. Start the Server

**Option A: Using npm script (Recommended)**
```bash
npm start
```

**Option B: Using Node directly**
```bash
node server.js
```

**Option C: Development mode with auto-restart (requires nodemon)**
```bash
npm install -g nodemon
npm run dev
```

### Expected Output

When the server starts successfully, you'll see:

```
═══════════════════════════════════════════════════════════
🚀 The Midnight Brew Server is Running!
📍 URL: http://localhost:3000
📂 Static Files: C:\Users\mdawa\OneDrive\Desktop\The-Midnight-Brew
📋 Logs Directory: C:\Users\mdawa\OneDrive\Desktop\The-Midnight-Brew\logs
🌍 Environment: development
═══════════════════════════════════════════════════════════

🛡️  MIDDLEWARE ACTIVE:
   ✅ Morgan Logger (combined + dev formats)
   ✅ JSON Parser (express.json) - 10mb limit
   ✅ URL-encoded Parser (extended: true)
   ✅ CORS Headers (all origins)
   ✅ Security Headers (XSS, Clickjacking protection)
   ✅ Request Tracking (ID, Timestamp)
   ✅ Response Time Monitoring
   ✅ Custom Request Logger
   ✅ Static File Serving
   ✅ Error Handler (404 + Global)

📄 FRONTEND PAGE ROUTES (app.get):
   GET  /           → Homepage (index.html)
   GET  /home       → Homepage (index.html)
   GET  /menu       → Menu Page (menu.html)
   GET  /booking    → Booking Page (booking.html)
   GET  /contact    → Contact Page (contact.html)
   GET  /about      → About Page (Generated HTML)

🔌 API DATA ROUTES - JSON (res.json):
   GET  /api/info              → Café Information
   GET  /api/menu              → Complete Menu (12 items)
   GET  /api/menu/:category    → Menu by Category
   GET  /api/booking/timeslots → Available Time Slots
   GET  /api/featured          → Featured Items
   GET  /api/specials          → Daily Specials
   GET  /api/status            → Server Status
   GET  /api/health            → Health Check

📝 API TEXT ROUTES (res.send):
   GET  /api/hours             → Operating Hours (Text)
   GET  /api/welcome           → Welcome Message (Text)

💡 EXAMPLE USAGE:
   Pages:   http://localhost:3000/menu
   JSON:    http://localhost:3000/api/menu
   Filter:  http://localhost:3000/api/menu/pastries
   Text:    curl http://localhost:3000/api/welcome

📊 MONITORING:
   Logs:    tail -f logs/access.log
   Status:  http://localhost:3000/api/status
   Health:  http://localhost:3000/api/health
═══════════════════════════════════════════════════════════
```

### Verify Server is Running

Open your browser and visit:
- **Homepage:** http://localhost:3000
- **Menu API:** http://localhost:3000/api/menu
- **Health Check:** http://localhost:3000/api/health

Or use curl:
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{"success":true,"status":"healthy","timestamp":"2025-10-01T14:41:32.802Z"}
```

### Stop the Server

Press `Ctrl+C` in the terminal running the server.

You'll see:
```
👋 SIGINT received (Ctrl+C). Starting graceful shutdown...
✅ Server closed. Process terminating...
```

---

## Backend Integration

### How the Backend is Integrated

#### 1. **Express.js Framework**
The backend uses Express.js, a minimal and flexible Node.js web application framework.

**Location:** `server.js`

**Core Setup:**
```javascript
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

#### 2. **Middleware Stack**
The server uses 10 middleware layers that process every request:

```javascript
// 1. Morgan - HTTP logging
app.use(morgan('combined', { stream: accessLogStream }));
app.use(morgan('dev'));

// 2. JSON Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 3. CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    // ... more headers
    next();
});

// 4-9. Security, Tracking, Timing, Logging, Static Files
// ... (see MIDDLEWARE_ERROR_HANDLING_GUIDE.md)

// 10. Error Handlers
app.use((req, res) => { /* 404 handler */ });
app.use((err, req, res, next) => { /* Global error handler */ });
```

#### 3. **Static File Serving**
HTML, CSS, JS, and images are served automatically:

```javascript
app.use(express.static(__dirname));
app.use('/public', express.static(path.join(__dirname, 'public')));
```

**What this means:**
- `index.html` → `http://localhost:3000/index.html`
- `styles.css` → `http://localhost:3000/styles.css`
- `public/logo.jpeg` → `http://localhost:3000/public/logo.jpeg`

#### 4. **Route Handlers**
Routes are defined using Express routing methods:

```javascript
// Page Route
app.get('/menu', (req, res) => {
    res.sendFile(path.join(__dirname, 'menu.html'));
});

// API Route
app.get('/api/menu', (req, res) => {
    const menuData = { /* data */ };
    res.json(menuData);
});
```

#### 5. **Frontend Integration**
Frontend pages use `fetch()` to communicate with the backend:

**Example in `booking.js`:**
```javascript
// Fetch time slots from backend
async function loadTimeSlots() {
    try {
        const response = await fetch('/api/booking/timeslots');
        const data = await response.json();
        
        if (data.success) {
            displayTimeSlots(data.data.lunch);
        }
    } catch (error) {
        console.error('Failed to load time slots:', error);
    }
}
```

#### 6. **Error Handling**
The backend provides structured error responses:

```javascript
// 404 Error
{
  "success": false,
  "error": "Not Found",
  "statusCode": 404,
  "message": "The requested resource could not be found."
}

// Server Error
{
  "success": false,
  "error": "ValidationError",
  "statusCode": 400,
  "message": "Invalid input data"
}
```

---

## Adding New Routes

### Step-by-Step Guide

#### Method 1: Add a Frontend Page Route

**Use Case:** Serve a new HTML page

**Steps:**

1. **Create the HTML file**
   ```bash
   # Create gallery.html in project root
   touch gallery.html
   ```

2. **Add route to server.js**
   ```javascript
   /**
    * Route: Gallery Page (/gallery)
    * Method: GET
    * Handler: Serves photo gallery page
    */
   app.get('/gallery', (req, res) => {
       console.log('📍 Route Hit: Gallery Page (/gallery)');
       res.sendFile(path.join(__dirname, 'gallery.html'), (err) => {
           if (err) {
               console.error('Error serving gallery page:', err);
               res.status(500).send('Error loading gallery page');
           }
       });
   });
   ```

3. **Place route BEFORE error handlers**
   - Insert after existing page routes (line ~220)
   - Must be BEFORE the 404 handler

4. **Restart server**
   ```bash
   # Press Ctrl+C to stop
   # Then start again
   node server.js
   ```

5. **Test the route**
   ```bash
   curl http://localhost:3000/gallery
   # Or open in browser: http://localhost:3000/gallery
   ```

---

#### Method 2: Add an API Data Route (JSON)

**Use Case:** Return JSON data for frontend consumption

**Steps:**

1. **Define data structure**
   ```javascript
   /**
    * Route: Get Photo Gallery Images (/api/gallery)
    * Method: GET
    * Handler: Returns JSON with gallery images
    */
   app.get('/api/gallery', (req, res) => {
       console.log('📍 API Route Hit: /api/gallery');
       
       // Prepare gallery data
       const galleryData = {
           success: true,
           timestamp: new Date().toISOString(),
           data: {
               categories: ['Interior', 'Food', 'Events'],
               images: [
                   {
                       id: 1,
                       title: 'Cozy Corner',
                       category: 'Interior',
                       url: 'public/gallery/interior1.jpg',
                       description: 'Our reading nook',
                       uploadDate: '2025-09-15'
                   },
                   {
                       id: 2,
                       title: 'Signature Latte',
                       category: 'Food',
                       url: 'public/gallery/food1.jpg',
                       description: 'Our famous midnight latte',
                       uploadDate: '2025-09-20'
                   }
                   // Add more images
               ]
           }
       };
       
       // Send JSON response
       res.json(galleryData);
   });
   ```

2. **Place route in API section**
   - Insert after existing API routes (line ~750)
   - Must be BEFORE error handlers

3. **Restart server**
   ```bash
   node server.js
   ```

4. **Test the route**
   ```bash
   curl http://localhost:3000/api/gallery
   ```

   Expected output:
   ```json
   {
     "success": true,
     "timestamp": "2025-10-01T14:41:32.802Z",
     "data": {
       "categories": ["Interior", "Food", "Events"],
       "images": [...]
     }
   }
   ```

5. **Integrate with frontend**
   ```javascript
   // In your JavaScript file
   fetch('/api/gallery')
       .then(res => res.json())
       .then(data => {
           const images = data.data.images;
           images.forEach(img => {
               console.log(`${img.title} - ${img.url}`);
           });
       });
   ```

---

#### Method 3: Add an API Route with Parameters

**Use Case:** Filter data based on URL parameters

**Steps:**

1. **Add parameterized route**
   ```javascript
   /**
    * Route: Get Gallery by Category (/api/gallery/:category)
    * Method: GET
    * Handler: Returns filtered gallery images
    */
   app.get('/api/gallery/:category', (req, res) => {
       const category = req.params.category; // Get URL parameter
       console.log(`📍 API Route Hit: /api/gallery/${category}`);
       
       // Sample data
       const allImages = [
           { id: 1, title: 'Cozy Corner', category: 'interior', url: 'public/gallery/interior1.jpg' },
           { id: 2, title: 'Signature Latte', category: 'food', url: 'public/gallery/food1.jpg' },
           { id: 3, title: 'Live Music Night', category: 'events', url: 'public/gallery/event1.jpg' }
       ];
       
       // Filter by category
       const filteredImages = allImages.filter(img => 
           img.category.toLowerCase() === category.toLowerCase()
       );
       
       if (filteredImages.length > 0) {
           res.json({
               success: true,
               category: category,
               count: filteredImages.length,
               images: filteredImages
           });
       } else {
           res.status(404).json({
               success: false,
               message: `No images found in category: ${category}`,
               availableCategories: ['interior', 'food', 'events']
           });
       }
   });
   ```

2. **Test with different parameters**
   ```bash
   curl http://localhost:3000/api/gallery/food
   curl http://localhost:3000/api/gallery/interior
   curl http://localhost:3000/api/gallery/events
   curl http://localhost:3000/api/gallery/invalid
   ```

---

#### Method 4: Add a POST Route (Form Submission)

**Use Case:** Handle form submissions or data creation

**Steps:**

1. **Add POST route**
   ```javascript
   /**
    * Route: Submit Contact Form (/api/contact)
    * Method: POST
    * Handler: Process contact form submission
    */
   app.post('/api/contact', (req, res) => {
       console.log('📍 API Route Hit: POST /api/contact');
       
       // Get form data from request body
       const { name, email, message } = req.body;
       
       // Validate input
       if (!name || !email || !message) {
           return res.status(400).json({
               success: false,
               error: 'ValidationError',
               message: 'All fields are required',
               missing: {
                   name: !name,
                   email: !email,
                   message: !message
               }
           });
       }
       
       // Process the data (save to database, send email, etc.)
       console.log(`New contact from: ${name} (${email})`);
       console.log(`Message: ${message}`);
       
       // Send success response
       res.json({
           success: true,
           message: 'Thank you for contacting us! We will get back to you soon.',
           data: {
               name: name,
               email: email,
               timestamp: new Date().toISOString()
           }
       });
   });
   ```

2. **Test with curl**
   ```bash
   curl -X POST http://localhost:3000/api/contact \
     -H "Content-Type: application/json" \
     -d '{"name":"John Doe","email":"john@example.com","message":"Great café!"}'
   ```

3. **Frontend integration**
   ```javascript
   // In your contact form JavaScript
   async function submitContactForm(event) {
       event.preventDefault();
       
       const formData = {
           name: document.getElementById('name').value,
           email: document.getElementById('email').value,
           message: document.getElementById('message').value
       };
       
       try {
           const response = await fetch('/api/contact', {
               method: 'POST',
               headers: {
                   'Content-Type': 'application/json'
               },
               body: JSON.stringify(formData)
           });
           
           const data = await response.json();
           
           if (data.success) {
               alert(data.message);
           } else {
               alert('Error: ' + data.message);
           }
       } catch (error) {
           console.error('Form submission error:', error);
       }
   }
   ```

---

### Route Addition Checklist

When adding a new route:

- [ ] Define route purpose and method (GET, POST, PUT, DELETE)
- [ ] Add JSDoc comment explaining the route
- [ ] Place route in correct section (Frontend or API)
- [ ] Ensure route is BEFORE error handlers
- [ ] Use appropriate response method:
  - `res.sendFile()` for HTML files
  - `res.json()` for JSON data
  - `res.send()` for plain text
- [ ] Add error handling
- [ ] Add console logging
- [ ] Test the route with curl or browser
- [ ] Document the route in this file
- [ ] Update startup message (optional)

---

## Frontend-Backend Communication

### Using fetch() API

#### Basic GET Request
```javascript
fetch('/api/menu')
    .then(response => response.json())
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
```

#### GET Request with Parameters
```javascript
const category = 'pastries';
fetch(`/api/menu/${category}`)
    .then(response => response.json())
    .then(data => {
        console.log(data.items);
    });
```

#### POST Request with Data
```javascript
const bookingData = {
    name: 'John Doe',
    date: '2025-10-15',
    time: '7:00 PM',
    guests: 4
};

fetch('/api/booking', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(bookingData)
})
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Booking confirmed!');
        }
    });
```

#### Async/Await Pattern (Recommended)
```javascript
async function loadMenu() {
    try {
        const response = await fetch('/api/menu');
        const data = await response.json();
        
        if (data.success) {
            displayMenu(data.data.items);
        }
    } catch (error) {
        console.error('Failed to load menu:', error);
    }
}
```

#### Error Handling
```javascript
async function fetchWithErrorHandling() {
    try {
        const response = await fetch('/api/menu');
        
        // Check if response is ok
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Check API success flag
        if (!data.success) {
            throw new Error(data.message || 'API request failed');
        }
        
        return data;
    } catch (error) {
        console.error('Error:', error);
        // Show user-friendly error message
        alert('Failed to load data. Please try again.');
    }
}
```

---

## Best Practices

### 1. Route Organization
```javascript
// ✅ GOOD: Organized by category
// Frontend Routes
app.get('/', ...);
app.get('/menu', ...);
app.get('/booking', ...);

// API Routes
app.get('/api/info', ...);
app.get('/api/menu', ...);
app.get('/api/booking/timeslots', ...);

// Error Handlers (MUST BE LAST)
app.use((req, res) => { /* 404 */ });
app.use((err, req, res, next) => { /* Global error */ });
```

### 2. Consistent Response Format
```javascript
// ✅ GOOD: Always include success flag
{
  "success": true,
  "data": { /* actual data */ }
}

// ❌ BAD: Inconsistent format
{ "items": [...] }  // Missing success flag
```

### 3. Error Responses
```javascript
// ✅ GOOD: Structured error response
res.status(404).json({
    success: false,
    error: 'Not Found',
    message: 'Item not found',
    statusCode: 404
});

// ❌ BAD: Plain text error
res.status(404).send('Not found');
```

### 4. Async Route Handling
```javascript
// ✅ GOOD: Use asyncHandler wrapper
app.get('/api/data', asyncHandler(async (req, res) => {
    const data = await fetchData();
    res.json({ success: true, data });
}));

// ❌ BAD: Unhandled promise rejection
app.get('/api/data', async (req, res) => {
    const data = await fetchData(); // If this fails, server crashes
    res.json(data);
});
```

### 5. Input Validation
```javascript
// ✅ GOOD: Validate all inputs
app.post('/api/booking', (req, res) => {
    const { name, date, time } = req.body;
    
    if (!name || !date || !time) {
        return res.status(400).json({
            success: false,
            error: 'ValidationError',
            message: 'Missing required fields'
        });
    }
    
    // Process booking
});
```

### 6. Logging
```javascript
// ✅ GOOD: Log important events
console.log(`📍 Route Hit: /api/menu`);
console.log(`✅ Booking created for ${name}`);
console.error(`❌ Error: ${error.message}`);

// ❌ BAD: No logging
// Silent failures are hard to debug
```

---

## Troubleshooting

### Common Issues

#### Issue 1: Port Already in Use
**Error:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Windows
taskkill /F /IM node.exe

# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 node server.js
```

---

#### Issue 2: Cannot GET /api/route
**Error:** 404 Not Found

**Solution:**
1. Check route is defined in `server.js`
2. Verify route is BEFORE error handlers
3. Check spelling and case sensitivity
4. Restart server after adding route

---

#### Issue 3: Request Body is undefined
**Error:** `req.body` is `undefined`

**Solution:**
```javascript
// Ensure JSON parser middleware is enabled
app.use(express.json());

// And client sends correct Content-Type
fetch('/api/route', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'  // ← Important!
    },
    body: JSON.stringify(data)
});
```

---

#### Issue 4: CORS Error in Browser
**Error:** `Access to fetch at 'http://localhost:3000/api/menu' from origin 'http://example.com' has been blocked by CORS policy`

**Solution:**
```javascript
// CORS middleware is already configured in server.js
// If still having issues, update the CORS middleware:
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // or specific domain
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});
```

---

#### Issue 5: Static Files Not Loading
**Error:** CSS/JS files not found (404)

**Solution:**
```javascript
// Ensure static middleware is configured
app.use(express.static(__dirname));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Use correct paths in HTML
<link rel="stylesheet" href="/styles.css">
<script src="/booking.js"></script>
<img src="/public/logo.jpeg">
```

---

#### Issue 6: Server Crashes on Error
**Error:** Server stops when an error occurs

**Solution:**
```javascript
// Use asyncHandler for async routes
app.get('/api/data', asyncHandler(async (req, res) => {
    const data = await fetchData();
    res.json({ success: true, data });
}));

// Or use try-catch
app.get('/api/data', async (req, res, next) => {
    try {
        const data = await fetchData();
        res.json({ success: true, data });
    } catch (error) {
        next(error); // Pass to error handler
    }
});
```

---

## Quick Reference

### Start Server
```bash
npm start
# or
node server.js
```

### Test Routes
```bash
# Health check
curl http://localhost:3000/api/health

# Get menu
curl http://localhost:3000/api/menu

# Get menu by category
curl http://localhost:3000/api/menu/pastries

# POST request
curl -X POST http://localhost:3000/api/route \
  -H "Content-Type: application/json" \
  -d '{"key":"value"}'
```

### Monitor Logs
```bash
# View access logs
tail -f logs/access.log

# Watch server output
# Just run: node server.js
```

### Stop Server
```
Press Ctrl+C
```

---

## Additional Resources

### Documentation Files
1. **BACKEND_INTEGRATION_GUIDE.md** (this file) - Complete integration guide
2. **MIDDLEWARE_ERROR_HANDLING_GUIDE.md** - Middleware documentation
3. **ROUTES_GUIDE.md** - Detailed route reference
4. **DATA_SERVING_GUIDE.md** - Data structure documentation
5. **QUICK_REFERENCE_MIDDLEWARE.md** - Quick commands

### External Resources
- [Express.js Documentation](https://expressjs.com/)
- [MDN Web Docs - Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [HTTP Status Codes](https://httpstatuses.com/)
- [REST API Best Practices](https://restfulapi.net/)

---

**Last Updated:** October 1, 2025  
**Version:** 1.0.0  
**Server:** Express.js v5.1.0  
**Status:** ✅ Production Ready
