# The Midnight Brew - Server Documentation

## 🚀 Overview
This Express.js server handles all HTTP requests for The Midnight Brew café website, serving both frontend pages and API endpoints.

## 📋 Server Structure

### Port Configuration
- **Default Port:** 3000
- **Environment Port:** Can be set via `PORT` environment variable

### Middleware Stack
1. **JSON Parser** - Parses incoming JSON payloads
2. **URL-encoded Parser** - Handles form submissions
3. **Static File Server** - Serves HTML, CSS, JS, and images
4. **Request Logger** - Logs all incoming requests with timestamps

---

## 🌐 Frontend Page Routes (HTTP GET)

All frontend routes use the **HTTP GET method** to serve HTML pages.

### Home Page
- **Route:** `GET /` or `GET /home`
- **File:** `index.html`
- **Description:** Main landing page of The Midnight Brew
- **Example:** `http://localhost:3000/`

### Menu Page
- **Route:** `GET /menu`
- **File:** `menu.html`
- **Description:** Displays café menu with all available items
- **Example:** `http://localhost:3000/menu`

### Booking Page
- **Route:** `GET /booking`
- **File:** `booking.html`
- **Description:** Table reservation and booking form
- **Example:** `http://localhost:3000/booking`

### Contact Page
- **Route:** `GET /contact`
- **File:** `contact.html`
- **Description:** Contact form and café information
- **Example:** `http://localhost:3000/contact`

---

## 🔌 API Endpoints (HTTP GET)

API endpoints return JSON responses for data access.

### Get Café Information
- **Route:** `GET /api/info`
- **Description:** Returns basic information about The Midnight Brew
- **Response Format:**
```json
{
  "success": true,
  "data": {
    "name": "The Midnight Brew",
    "tagline": "A cozy late-night café where coffee meets creativity",
    "hours": {
      "weekdays": "10:00 AM - 12:00 AM",
      "weekends": "10:00 AM - 2:00 AM"
    },
    "contact": {
      "email": "info@themidnightbrew.com",
      "phone": "+1 (555) 123-4567"
    }
  }
}
```

### Get Menu Items
- **Route:** `GET /api/menu`
- **Description:** Returns menu data (placeholder for database integration)
- **Response Format:**
```json
{
  "success": true,
  "data": {
    "categories": ["Coffee", "Tea", "Pastries", "Sandwiches", "Soups"],
    "featured": [
      { "id": 1, "name": "Midnight Espresso", "category": "Coffee", "price": 4.50 }
    ]
  }
}
```

### Health Check
- **Route:** `GET /api/health`
- **Description:** Returns server status for monitoring
- **Response Format:**
```json
{
  "success": true,
  "status": "running",
  "timestamp": "2025-10-01T12:00:00.000Z"
}
```

---

## ⚠️ Error Handling

### 404 - Not Found
When a route doesn't exist, the server returns:
```json
{
  "success": false,
  "error": "Page not found",
  "requestedUrl": "/invalid-route",
  "message": "The page you are looking for does not exist."
}
```

### 500 - Server Error
For internal server errors:
```json
{
  "success": false,
  "error": "Internal Server Error",
  "message": "Something went wrong on the server."
}
```

---

## 🛠️ Running the Server

### Start the Server
```bash
npm start
```

Or directly:
```bash
node server.js
```

### Stop the Server
Press `Ctrl+C` in the terminal

### Development Mode (with auto-restart)
Install nodemon first:
```bash
npm install --save-dev nodemon
```

Then add to `package.json`:
```json
"scripts": {
  "dev": "nodemon server.js"
}
```

Run with:
```bash
npm run dev
```

---

## 📁 Static File Serving

The server automatically serves static files from:
- **Root directory:** All `.html`, `.css`, `.js` files
- **Public folder:** Images and assets in `/public/`

### Example Static Resources:
- `http://localhost:3000/styles.css`
- `http://localhost:3000/booking.js`
- `http://localhost:3000/theme.js`
- `http://localhost:3000/public/logo.jpeg`

---

## 🔄 Request Flow

1. **Client sends HTTP GET request** → `http://localhost:3000/menu`
2. **Express receives request** → Logs it with timestamp
3. **Route handler matches** → `/menu` route found
4. **Response sent** → `menu.html` file served to client
5. **Browser renders page** → User sees the menu

---

## 📊 Testing Routes

You can test all routes using:

### Browser
Simply navigate to any URL listed above

### cURL (Command Line)
```bash
# Test home page
curl http://localhost:3000/

# Test API endpoint
curl http://localhost:3000/api/info

# Test health check
curl http://localhost:3000/api/health
```

### Postman or Thunder Client
Import the URLs and test GET requests

---

## 🔮 Future Enhancements

Consider adding:
1. **POST routes** for form submissions (booking, contact)
2. **Database integration** for menu items and bookings
3. **Authentication** for admin panel
4. **Rate limiting** for API endpoints
5. **CORS configuration** for cross-origin requests
6. **Environment variables** for configuration
7. **Validation middleware** for incoming data

---

## 📞 Support

For questions or issues, refer to the main README.md or contact the development team.
