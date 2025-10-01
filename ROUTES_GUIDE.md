# 🛣️ Express Routes Guide - The Midnight Brew

## Understanding Express Route Syntax

In Express.js, routes are defined using the following pattern:
```javascript
app.get('/route-path', (req, res) => {
    // Handler function - sends response
});
```

- **`app.get()`** - Defines a route that responds to HTTP GET requests
- **`'/route-path'`** - The URL path for this route
- **`(req, res) => {}`** - Handler function that processes the request and sends a response

---

## 📄 Frontend Page Routes

### 1. Homepage Route
```javascript
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
```
- **Route:** `/`
- **URL:** http://localhost:3000/
- **Response:** Sends `index.html` file
- **Description:** Main landing page

### 2. Homepage Alternative
```javascript
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
```
- **Route:** `/home`
- **URL:** http://localhost:3000/home
- **Response:** Sends `index.html` file
- **Description:** Alternative path to homepage

### 3. Menu Page Route
```javascript
app.get('/menu', (req, res) => {
    res.sendFile(path.join(__dirname, 'menu.html'));
});
```
- **Route:** `/menu`
- **URL:** http://localhost:3000/menu
- **Response:** Sends `menu.html` file
- **Description:** Displays café menu

### 4. Booking Page Route
```javascript
app.get('/booking', (req, res) => {
    res.sendFile(path.join(__dirname, 'booking.html'));
});
```
- **Route:** `/booking`
- **URL:** http://localhost:3000/booking
- **Response:** Sends `booking.html` file
- **Description:** Table reservation page

### 5. Contact Page Route
```javascript
app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'contact.html'));
});
```
- **Route:** `/contact`
- **URL:** http://localhost:3000/contact
- **Response:** Sends `contact.html` file
- **Description:** Contact form and info

### 6. About Page Route
```javascript
app.get('/about', (req, res) => {
    const aboutHTML = `<!DOCTYPE html>...`;
    res.send(aboutHTML);
});
```
- **Route:** `/about`
- **URL:** http://localhost:3000/about
- **Response:** Sends dynamically generated HTML
- **Description:** About The Midnight Brew

---

## 🔌 API Data Routes

### 1. Café Information
```javascript
app.get('/api/info', (req, res) => {
    res.json({
        success: true,
        data: { /* café details */ }
    });
});
```
- **Route:** `/api/info`
- **URL:** http://localhost:3000/api/info
- **Response Type:** JSON
- **Data:** Name, hours, contact, location, social media

**Example Response:**
```json
{
  "success": true,
  "data": {
    "name": "The Midnight Brew",
    "tagline": "A cozy late-night café where coffee meets creativity",
    "hours": {
      "weekdays": "10:00 AM - 12:00 AM",
      "weekends": "10:00 AM - 2:00 AM"
    }
  }
}
```

### 2. Full Menu Data
```javascript
app.get('/api/menu', (req, res) => {
    res.json({
        success: true,
        data: { items: [...] }
    });
});
```
- **Route:** `/api/menu`
- **URL:** http://localhost:3000/api/menu
- **Response Type:** JSON
- **Data:** Complete menu with 12+ items across categories

**Example Response:**
```json
{
  "success": true,
  "data": {
    "categories": ["Coffee", "Tea", "Pastries", "Sandwiches", "Soups"],
    "items": [
      {
        "id": 1,
        "name": "Midnight Espresso",
        "category": "Coffee",
        "price": 4.50,
        "description": "Rich double shot espresso"
      }
    ]
  }
}
```

### 3. Menu by Category (Dynamic Route)
```javascript
app.get('/api/menu/:category', (req, res) => {
    const category = req.params.category;
    // Filter and return items
});
```
- **Route:** `/api/menu/:category`
- **URL Examples:** 
  - http://localhost:3000/api/menu/coffee
  - http://localhost:3000/api/menu/pastries
  - http://localhost:3000/api/menu/sandwiches
- **Response Type:** JSON
- **Data:** Filtered menu items for specific category

**Example Request:**
```bash
curl http://localhost:3000/api/menu/coffee
```

**Example Response:**
```json
{
  "success": true,
  "category": "coffee",
  "count": 2,
  "items": [
    { "id": 1, "name": "Midnight Espresso", "price": 4.50 },
    { "id": 2, "name": "Caramel Latte", "price": 5.25 }
  ]
}
```

### 4. Operating Hours
```javascript
app.get('/api/hours', (req, res) => {
    const hoursText = `...`;
    res.type('text/plain');
    res.send(hoursText);
});
```
- **Route:** `/api/hours`
- **URL:** http://localhost:3000/api/hours
- **Response Type:** Plain Text
- **Data:** Formatted hours schedule

### 5. Welcome Message
```javascript
app.get('/api/welcome', (req, res) => {
    res.send('Welcome to The Midnight Brew! ☕');
});
```
- **Route:** `/api/welcome`
- **URL:** http://localhost:3000/api/welcome
- **Response Type:** Plain Text
- **Data:** Simple greeting message

### 6. Server Status
```javascript
app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        uptime: process.uptime()
    });
});
```
- **Route:** `/api/status`
- **URL:** http://localhost:3000/api/status
- **Response Type:** JSON
- **Data:** Server health, uptime, version

### 7. Health Check
```javascript
app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy' });
});
```
- **Route:** `/api/health`
- **URL:** http://localhost:3000/api/health
- **Response Type:** JSON
- **Data:** Simple health status

---

## 🎯 Handler Functions Explained

### Types of Responses

#### 1. **Sending Files** (`res.sendFile()`)
```javascript
app.get('/menu', (req, res) => {
    res.sendFile(path.join(__dirname, 'menu.html'));
});
```
- Used for serving HTML files
- Best for existing pages

#### 2. **Sending JSON** (`res.json()`)
```javascript
app.get('/api/info', (req, res) => {
    res.json({ name: 'The Midnight Brew' });
});
```
- Used for API data
- Automatically sets `Content-Type: application/json`

#### 3. **Sending Text/HTML** (`res.send()`)
```javascript
app.get('/about', (req, res) => {
    res.send('<h1>About Us</h1>');
});
```
- Used for dynamic content
- Can send HTML, text, or other data

#### 4. **Sending Plain Text** (`res.type() + res.send()`)
```javascript
app.get('/api/hours', (req, res) => {
    res.type('text/plain');
    res.send('Monday: 10:00 AM - 12:00 AM');
});
```
- Sets specific content type
- Good for plain text responses

---

## 🧪 Testing Your Routes

### Using Browser
Simply navigate to any route:
```
http://localhost:3000/menu
http://localhost:3000/api/info
```

### Using cURL (Command Line)
```bash
# Test homepage
curl http://localhost:3000/

# Test JSON API
curl http://localhost:3000/api/info

# Test with pretty print
curl http://localhost:3000/api/menu | json_pp

# Test specific category
curl http://localhost:3000/api/menu/coffee
```

### Using Postman/Thunder Client
1. Create new GET request
2. Enter URL: `http://localhost:3000/api/menu`
3. Click Send
4. View response

### Using JavaScript fetch()
```javascript
// From browser console or frontend code
fetch('http://localhost:3000/api/menu')
    .then(response => response.json())
    .then(data => console.log(data));
```

---

## 📊 Route Parameters

### Dynamic Routes
```javascript
app.get('/api/menu/:category', (req, res) => {
    const category = req.params.category;  // Access parameter
    // Use category value
});
```

**URL Examples:**
- `/api/menu/coffee` → `req.params.category = 'coffee'`
- `/api/menu/pastries` → `req.params.category = 'pastries'`

---

## ✨ Best Practices

1. **Clear Route Names** - Use descriptive paths
2. **Consistent Response Format** - JSON for APIs, HTML for pages
3. **Error Handling** - Always include error callbacks
4. **Logging** - Log route access for debugging
5. **Status Codes** - Use appropriate HTTP status codes
6. **Documentation** - Comment each route clearly

---

## 🚀 All Available Routes Summary

| Method | Route | Response Type | Description |
|--------|-------|---------------|-------------|
| GET | `/` | HTML | Homepage |
| GET | `/home` | HTML | Homepage (alt) |
| GET | `/menu` | HTML | Menu page |
| GET | `/booking` | HTML | Booking page |
| GET | `/contact` | HTML | Contact page |
| GET | `/about` | HTML | About page |
| GET | `/api/info` | JSON | Café info |
| GET | `/api/menu` | JSON | Full menu |
| GET | `/api/menu/:category` | JSON | Category menu |
| GET | `/api/hours` | Text | Hours schedule |
| GET | `/api/welcome` | Text | Welcome msg |
| GET | `/api/status` | JSON | Server status |
| GET | `/api/health` | JSON | Health check |

---

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [HTTP Methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods)
- [REST API Best Practices](https://restfulapi.net/)
