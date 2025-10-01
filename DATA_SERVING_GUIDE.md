# 📦 Data Serving Guide - Frontend Integration

## Overview

This guide explains how backend routes serve dynamic data to frontend components using **`res.json()`** for APIs and **`res.send()`** for simple content.

---

## 🎯 Response Methods Used

### 1. **`res.json(data)` - For API Data**
Used when frontend needs structured JSON data (objects, arrays).

```javascript
app.get('/api/menu', (req, res) => {
    const menuData = { /* data object */ };
    res.json(menuData);  // Sends JSON with proper Content-Type
});
```

**Automatically sets:** `Content-Type: application/json`

### 2. **`res.send(content)` - For Simple Content**
Used for text, HTML, or simple responses.

```javascript
app.get('/api/welcome', (req, res) => {
    res.send('Welcome to The Midnight Brew!');  // Sends text
});
```

**Can send:** Text, HTML, Buffer, Object (converts to JSON)

---

## 📊 Data Routes for Frontend Components

### 1. **Complete Menu Data** - `/api/menu`

**Route Handler:**
```javascript
app.get('/api/menu', (req, res) => {
    const menuData = {
        success: true,
        timestamp: new Date().toISOString(),
        data: {
            categories: ['Pastries', 'Beverages', 'Sandwiches', 'Soups'],
            items: [
                {
                    id: 1,
                    name: 'Blueberry Muffin',
                    category: 'Pastries',
                    price: 3.50,
                    description: '...',
                    image: 'public/bluberry muffin.jpg',
                    available: true,
                    vegetarian: true
                },
                // ... 12 total items
            ],
            featured: [...],
            specials: [...]
        }
    };
    
    res.json(menuData);  // ✅ Using res.json()
});
```

**Frontend Usage:**
```javascript
// Fetch menu data
fetch('http://localhost:3000/api/menu')
    .then(response => response.json())
    .then(data => {
        console.log(data.data.items);  // Array of menu items
        // Render menu dynamically
        data.data.items.forEach(item => {
            // Create menu card
        });
    });
```

**Response Example:**
```json
{
  "success": true,
  "timestamp": "2025-10-01T14:30:00.000Z",
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
    ]
  }
}
```

---

### 2. **Filtered Menu by Category** - `/api/menu/:category`

**Route Handler:**
```javascript
app.get('/api/menu/:category', (req, res) => {
    const category = req.params.category;
    const filteredItems = allItems.filter(item => 
        item.category.toLowerCase() === category.toLowerCase()
    );
    
    if (filteredItems.length > 0) {
        res.json({  // ✅ Using res.json()
            success: true,
            category: category,
            count: filteredItems.length,
            items: filteredItems
        });
    } else {
        res.status(404).json({  // ✅ With error status
            success: false,
            message: `No items found in category: ${category}`
        });
    }
});
```

**Frontend Usage:**
```javascript
// Get only pastries
fetch('http://localhost:3000/api/menu/pastries')
    .then(response => response.json())
    .then(data => {
        console.log(`Found ${data.count} pastries`);
        data.items.forEach(item => {
            // Display pastry
        });
    });

// Get beverages
fetch('http://localhost:3000/api/menu/beverages')
    .then(response => response.json())
    .then(data => {
        // Render beverages
    });
```

**Available Categories:**
- `/api/menu/pastries`
- `/api/menu/beverages`
- `/api/menu/sandwiches`
- `/api/menu/soups`

---

### 3. **Café Information** - `/api/info`

**Route Handler:**
```javascript
app.get('/api/info', (req, res) => {
    const cafeInfo = {
        success: true,
        data: {
            name: 'The Midnight Brew',
            tagline: 'A cozy late-night café...',
            established: '2020',
            hours: {
                weekdays: '10:00 AM - 12:00 AM',
                weekends: '10:00 AM - 2:00 AM'
            },
            location: { address: '...', zipCode: '...' },
            contact: { email: '...', phone: '...' },
            social: { instagram: '...', facebook: '...' }
        }
    };
    
    res.json(cafeInfo);  // ✅ Using res.json()
});
```

**Frontend Usage:**
```javascript
// Display café info in footer or contact page
fetch('http://localhost:3000/api/info')
    .then(response => response.json())
    .then(data => {
        const info = data.data;
        document.getElementById('cafe-name').textContent = info.name;
        document.getElementById('phone').textContent = info.contact.phone;
        document.getElementById('email').textContent = info.contact.email;
        document.getElementById('hours-weekday').textContent = info.hours.weekdays;
    });
```

---

### 4. **Booking Time Slots** - `/api/booking/timeslots`

**Route Handler:**
```javascript
app.get('/api/booking/timeslots', (req, res) => {
    const { date } = req.query;  // Optional query parameter
    
    const timeSlots = {
        success: true,
        date: date || new Date().toISOString().split('T')[0],
        data: {
            lunch: [
                { time: '11:00 AM', available: true, capacity: 'High' },
                { time: '12:00 PM', available: true, capacity: 'Medium' },
                // ...
            ],
            afternoon: [...],
            dinner: [...],
            lateNight: [...]
        }
    };
    
    res.json(timeSlots);  // ✅ Using res.json()
});
```

**Frontend Usage:**
```javascript
// Get available time slots for booking page
const selectedDate = '2025-10-15';
fetch(`http://localhost:3000/api/booking/timeslots?date=${selectedDate}`)
    .then(response => response.json())
    .then(data => {
        // Render time slot buttons
        data.data.lunch.forEach(slot => {
            const button = document.createElement('button');
            button.textContent = slot.time;
            button.disabled = !slot.available;
            button.classList.add('time-slot', slot.capacity.toLowerCase());
        });
    });
```

---

### 5. **Featured Items** - `/api/featured`

**Route Handler:**
```javascript
app.get('/api/featured', (req, res) => {
    const featuredData = {
        success: true,
        data: {
            itemOfTheDay: {
                name: 'Midnight Latte',
                description: 'Special blend...',
                price: 5.50,
                originalPrice: 6.50,
                discount: '15% OFF'
            },
            mostPopular: [
                { id: 5, name: 'Latte', orders: 145, rating: 4.8 },
                // ...
            ],
            newArrivals: [...]
        }
    };
    
    res.json(featuredData);  // ✅ Using res.json()
});
```

**Frontend Usage:**
```javascript
// Display featured items on homepage
fetch('http://localhost:3000/api/featured')
    .then(response => response.json())
    .then(data => {
        // Show item of the day
        const itemOfDay = data.data.itemOfTheDay;
        displaySpecialOffer(itemOfDay);
        
        // Show most popular items
        data.data.mostPopular.forEach(item => {
            displayPopularItem(item);
        });
    });
```

---

### 6. **Daily Specials** - `/api/specials`

**Route Handler:**
```javascript
app.get('/api/specials', (req, res) => {
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
                    savings: 1.50
                }
            ],
            weeklySpecial: { /* ... */ }
        }
    };
    
    res.json(specialsData);  // ✅ Using res.json()
});
```

**Frontend Usage:**
```javascript
// Show specials banner
fetch('http://localhost:3000/api/specials')
    .then(response => response.json())
    .then(data => {
        data.data.dailySpecials.forEach(special => {
            createSpecialBanner(special);
        });
    });
```

---

### 7. **Operating Hours (Text)** - `/api/hours`

**Route Handler:**
```javascript
app.get('/api/hours', (req, res) => {
    const hoursText = `
🕐 THE MIDNIGHT BREW - OPERATING HOURS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Monday    : 10:00 AM - 12:00 AM
...
    `;
    
    res.type('text/plain');  // Set content type
    res.send(hoursText);     // ✅ Using res.send() for text
});
```

**Frontend Usage:**
```javascript
// Display formatted hours text
fetch('http://localhost:3000/api/hours')
    .then(response => response.text())  // Use .text() not .json()
    .then(text => {
        document.getElementById('hours-display').textContent = text;
    });
```

---

### 8. **Welcome Message (Simple Text)** - `/api/welcome`

**Route Handler:**
```javascript
app.get('/api/welcome', (req, res) => {
    const message = 'Welcome to The Midnight Brew! ☕ Where coffee meets creativity. 🌙';
    res.send(message);  // ✅ Using res.send() for simple text
});
```

**Frontend Usage:**
```javascript
// Show welcome message
fetch('http://localhost:3000/api/welcome')
    .then(response => response.text())
    .then(message => {
        showNotification(message);
    });
```

---

### 9. **Server Status** - `/api/status`

**Route Handler:**
```javascript
app.get('/api/status', (req, res) => {
    const statusData = {
        success: true,
        server: 'The Midnight Brew API',
        status: 'online',
        version: '1.0.0',
        uptime: process.uptime(),
        memory: { /* ... */ }
    };
    
    res.json(statusData);  // ✅ Using res.json()
});
```

**Frontend Usage:**
```javascript
// Admin dashboard - show server health
fetch('http://localhost:3000/api/status')
    .then(response => response.json())
    .then(data => {
        console.log(`Server uptime: ${data.uptime}s`);
        console.log(`Memory used: ${data.memory.used}`);
    });
```

---

## 🔄 Complete Frontend Integration Example

### Dynamic Menu Loading

**HTML:**
```html
<div id="menu-container" class="row"></div>
```

**JavaScript:**
```javascript
// Load and display menu dynamically
async function loadMenu() {
    try {
        const response = await fetch('http://localhost:3000/api/menu');
        const data = await response.json();
        
        if (data.success) {
            const menuContainer = document.getElementById('menu-container');
            
            data.data.items.forEach(item => {
                const menuCard = `
                    <div class="col-md-4">
                        <div class="menu-card">
                            <img src="${item.image}" alt="${item.name}">
                            <h4>${item.name}</h4>
                            <p>${item.description}</p>
                            <span class="price">$${item.price.toFixed(2)}</span>
                            ${item.available ? 
                                '<button class="btn-order">Order Now</button>' : 
                                '<span class="unavailable">Out of Stock</span>'
                            }
                        </div>
                    </div>
                `;
                menuContainer.innerHTML += menuCard;
            });
        }
    } catch (error) {
        console.error('Error loading menu:', error);
    }
}

// Call on page load
document.addEventListener('DOMContentLoaded', loadMenu);
```

### Category Filter

```javascript
async function filterByCategory(category) {
    try {
        const response = await fetch(`http://localhost:3000/api/menu/${category}`);
        const data = await response.json();
        
        if (data.success) {
            displayItems(data.items);
        } else {
            showError(data.message);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Usage
document.getElementById('pastries-btn').addEventListener('click', () => {
    filterByCategory('pastries');
});
```

---

## 📋 Summary of Response Methods

| Route | Method | Data Type | Frontend Use |
|-------|--------|-----------|--------------|
| `/api/menu` | `res.json()` | JSON Object | Menu display |
| `/api/menu/:category` | `res.json()` | JSON Object | Filtered menu |
| `/api/info` | `res.json()` | JSON Object | Café details |
| `/api/booking/timeslots` | `res.json()` | JSON Object | Time picker |
| `/api/featured` | `res.json()` | JSON Object | Homepage specials |
| `/api/specials` | `res.json()` | JSON Object | Deals banner |
| `/api/status` | `res.json()` | JSON Object | Admin dashboard |
| `/api/health` | `res.json()` | JSON Object | Health monitor |
| `/api/hours` | `res.send()` | Plain Text | Hours display |
| `/api/welcome` | `res.send()` | Plain Text | Welcome banner |

---

## ✅ Best Practices

### 1. **Use `res.json()` for Structured Data**
```javascript
// ✅ Good - For objects and arrays
res.json({ success: true, data: items });

// ❌ Avoid - Manual JSON stringification
res.send(JSON.stringify({ data: items }));
```

### 2. **Use `res.send()` for Simple Content**
```javascript
// ✅ Good - For simple text
res.send('Welcome message');

// ❌ Unnecessary - For simple text
res.json({ message: 'Welcome message' });
```

### 3. **Always Include Success Indicator**
```javascript
// ✅ Good - Clear success status
res.json({ success: true, data: {...} });

// ❌ Avoid - Ambiguous response
res.json({ items: [...] });
```

### 4. **Handle Errors Properly**
```javascript
// ✅ Good - With status code and message
res.status(404).json({
    success: false,
    message: 'Item not found'
});
```

---

## 🧪 Testing Data Routes

```bash
# Test JSON endpoints
curl http://localhost:3000/api/menu | json_pp
curl http://localhost:3000/api/menu/pastries
curl http://localhost:3000/api/featured

# Test text endpoints
curl http://localhost:3000/api/welcome
curl http://localhost:3000/api/hours

# Test with query parameters
curl "http://localhost:3000/api/booking/timeslots?date=2025-10-15"
```

---

## 🎉 Implementation Complete!

All backend routes now properly serve data using:
- ✅ **`res.json(data)`** for API endpoints (8 routes)
- ✅ **`res.send(content)`** for text content (2 routes)
- ✅ **Structured data objects** matching frontend needs
- ✅ **Proper error handling** with status codes
- ✅ **Complete menu data** (12 items across 4 categories)
- ✅ **Dynamic filtering** by category
- ✅ **Booking time slots** data
- ✅ **Featured items** and specials

Frontend can now fetch and display all dynamic data from backend API routes! 🚀
