# 🚀 Express Server - Quick Start Guide

## Start the Server

```bash
# Option 1: Using npm (recommended)
npm start

# Option 2: Using Node directly
node server.js

# Option 3: Development mode (with nodemon)
npm run dev
```

## Verify Server is Running

Open your browser or use curl:

```bash
# Health check
curl http://localhost:3000/api/health

# Expected response:
# {"success":true,"status":"healthy","timestamp":"2025-10-01T14:41:32.802Z"}
```

---

## 📄 All Routes

### Frontend Pages (HTML)

| Route | Method | Description |
|-------|--------|-------------|
| `/` or `/home` | GET | Homepage (index.html) |
| `/menu` | GET | Menu page (menu.html) |
| `/booking` | GET | Booking page (booking.html) |
| `/contact` | GET | Contact page (contact.html) |
| `/about` | GET | About page (generated HTML) |

**Usage:**
```bash
# Browser
http://localhost:3000/menu

# Curl
curl http://localhost:3000/menu
```

---

### API Endpoints (JSON)

| Route | Method | Description |
|-------|--------|-------------|
| `/api/info` | GET | Café information (name, hours, contact) |
| `/api/menu` | GET | Complete menu (12 items) |
| `/api/menu/:category` | GET | Filter menu by category |
| `/api/booking/timeslots` | GET | Available booking time slots |
| `/api/featured` | GET | Featured items and specials |
| `/api/specials` | GET | Daily and weekly specials |
| `/api/status` | GET | Server status and diagnostics |
| `/api/health` | GET | Simple health check |

**Usage:**
```bash
# Get all menu items
curl http://localhost:3000/api/menu

# Get pastries only
curl http://localhost:3000/api/menu/pastries

# Get server status
curl http://localhost:3000/api/status
```

---

### Text Endpoints

| Route | Method | Description |
|-------|--------|-------------|
| `/api/hours` | GET | Operating hours (plain text) |
| `/api/welcome` | GET | Welcome message (plain text) |

**Usage:**
```bash
curl http://localhost:3000/api/hours
curl http://localhost:3000/api/welcome
```

---

## 🧪 Quick Tests

### Test All Routes
```bash
# Frontend pages
curl http://localhost:3000/
curl http://localhost:3000/menu
curl http://localhost:3000/booking
curl http://localhost:3000/contact
curl http://localhost:3000/about

# API endpoints
curl http://localhost:3000/api/info
curl http://localhost:3000/api/menu
curl http://localhost:3000/api/menu/pastries
curl http://localhost:3000/api/menu/beverages
curl http://localhost:3000/api/booking/timeslots
curl http://localhost:3000/api/featured
curl http://localhost:3000/api/specials
curl http://localhost:3000/api/status
curl http://localhost:3000/api/health
curl http://localhost:3000/api/hours
curl http://localhost:3000/api/welcome

# Test 404 handler
curl http://localhost:3000/invalid-route
```

### Expected Outputs

**Menu API Response:**
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
        "description": "Bursting with fresh blueberries...",
        "image": "public/bluberry muffin.jpg",
        "available": true,
        "vegetarian": true
      }
      // ... more items
    ]
  }
}
```

**404 Error Response:**
```json
{
  "success": false,
  "error": "Not Found",
  "statusCode": 404,
  "requestedUrl": "/invalid-route",
  "method": "GET",
  "message": "The requested resource could not be found.",
  "timestamp": "2025-10-01T14:41:32.802Z",
  "requestId": "1730470892802-k2j9x5t3a",
  "suggestion": "Please check the URL and try again."
}
```

---

## 💻 Frontend Integration

### Basic Fetch
```javascript
fetch('/api/menu')
  .then(res => res.json())
  .then(data => {
    console.log(data.data.items);
  });
```

### With Async/Await
```javascript
async function loadMenu() {
  try {
    const response = await fetch('/api/menu');
    const data = await response.json();
    
    if (data.success) {
      return data.data.items;
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Filter by Category
```javascript
async function loadCategoryMenu(category) {
  const response = await fetch(`/api/menu/${category}`);
  const data = await response.json();
  return data.items;
}

// Usage
const pastries = await loadCategoryMenu('pastries');
```

### POST Request Example
```javascript
async function submitBooking(bookingData) {
  const response = await fetch('/api/booking', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(bookingData)
  });
  
  return await response.json();
}

// Usage
const result = await submitBooking({
  name: 'John Doe',
  date: '2025-10-15',
  time: '7:00 PM',
  guests: 4
});
```

---

## 🛠️ Adding New Routes

### 1. Add Frontend Page Route
```javascript
app.get('/new-page', (req, res) => {
  console.log('📍 Route Hit: /new-page');
  res.sendFile(path.join(__dirname, 'new-page.html'));
});
```

### 2. Add API Route (JSON)
```javascript
app.get('/api/new-endpoint', (req, res) => {
  console.log('📍 API Route Hit: /api/new-endpoint');
  
  const data = {
    success: true,
    data: {
      message: 'New endpoint data'
    }
  };
  
  res.json(data);
});
```

### 3. Add Route with Parameters
```javascript
app.get('/api/items/:id', (req, res) => {
  const id = req.params.id;
  console.log(`📍 API Route Hit: /api/items/${id}`);
  
  // Find item by ID
  const item = findItemById(id);
  
  if (item) {
    res.json({ success: true, data: item });
  } else {
    res.status(404).json({
      success: false,
      message: `Item ${id} not found`
    });
  }
});
```

### 4. Add POST Route
```javascript
app.post('/api/submit', (req, res) => {
  console.log('📍 API Route Hit: POST /api/submit');
  
  const { name, email } = req.body;
  
  // Validate
  if (!name || !email) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields'
    });
  }
  
  // Process data
  res.json({
    success: true,
    message: 'Data received',
    data: { name, email }
  });
});
```

**Important:** Always add routes BEFORE error handlers!

---

## 📊 Monitoring

### View Logs
```bash
# Real-time log monitoring
tail -f logs/access.log

# View last 50 lines
tail -n 50 logs/access.log

# View full log
cat logs/access.log
```

### Check Server Status
```bash
curl http://localhost:3000/api/status
```

**Response includes:**
- Server status
- Uptime
- Memory usage
- Node.js version
- Environment

---

## ⚙️ Configuration

### Change Port
```bash
# Set port via environment variable
PORT=3001 node server.js

# Or edit server.js:
const PORT = process.env.PORT || 3001;
```

### Set Environment
```bash
# Production mode
NODE_ENV=production node server.js

# Development mode (default)
NODE_ENV=development node server.js
```

---

## 🛑 Stop Server

### Method 1: Keyboard
```
Press Ctrl+C in terminal
```

### Method 2: Kill Process
```bash
# Windows
taskkill /F /IM node.exe

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

---

## ❌ Common Issues

### Port Already in Use
```bash
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```bash
# Kill existing process
taskkill /F /IM node.exe  # Windows
lsof -ti:3000 | xargs kill -9  # macOS/Linux

# Or use different port
PORT=3001 node server.js
```

### Cannot GET /api/route
```bash
404 Not Found
```

**Solution:**
1. Check route exists in server.js
2. Verify route is BEFORE error handlers
3. Restart server after changes

### req.body is undefined
**Solution:**
```javascript
// Ensure middleware is enabled
app.use(express.json());

// Send correct Content-Type
fetch('/api/route', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});
```

---

## 📚 Documentation

For detailed information:

1. **[BACKEND_INTEGRATION_GUIDE.md](BACKEND_INTEGRATION_GUIDE.md)**
   - Complete route documentation
   - Integration examples
   - Best practices

2. **[MIDDLEWARE_ERROR_HANDLING_GUIDE.md](MIDDLEWARE_ERROR_HANDLING_GUIDE.md)**
   - Middleware stack details
   - Error handling
   - Security features

3. **[QUICK_REFERENCE_MIDDLEWARE.md](QUICK_REFERENCE_MIDDLEWARE.md)**
   - Quick commands
   - Testing examples
   - Troubleshooting

---

## 🎯 Quick Commands Cheat Sheet

```bash
# Start server
npm start

# Health check
curl http://localhost:3000/api/health

# Get menu
curl http://localhost:3000/api/menu

# Get menu by category
curl http://localhost:3000/api/menu/pastries

# Test 404
curl http://localhost:3000/invalid

# View logs
tail -f logs/access.log

# Stop server
Ctrl+C

# Kill process
taskkill /F /IM node.exe
```

---

**Last Updated:** October 1, 2025  
**Version:** 1.0.0  
**Port:** 3000  
**Status:** ✅ Ready to Use
