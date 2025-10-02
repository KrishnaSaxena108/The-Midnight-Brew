# 🔌 Form-to-Backend API Integration Guide

## Overview
Complete documentation of the JavaScript code that connects the login and registration forms to the backend APIs using the Fetch API.

---

## 📋 Implementation Details

### **1. Registration Form Integration**

#### Location
**File:** `register.html`
**Lines:** JavaScript section at bottom of file

#### API Endpoint
```javascript
POST http://localhost:3000/register
Content-Type: application/json
```

#### Form Data Collection
```javascript
// Get form values from inputs
const name = nameInput.value.trim();
const email = emailInput.value.trim();
const password = passwordInput.value;
const confirmPassword = confirmPasswordInput.value;
const termsAccepted = termsCheckbox.checked;
```

#### Client-Side Validation
```javascript
// Validate email
if (!email) {
    showError('email', 'Email is required');
    isValid = false;
} else if (!validateEmail(email)) {
    showError('email', 'Please enter a valid email address');
    isValid = false;
}

// Validate password
if (!password) {
    showError('password', 'Password is required');
    isValid = false;
} else if (password.length < 6) {
    showError('password', 'Password must be at least 6 characters');
    isValid = false;
}

// Validate password match
if (password !== confirmPassword) {
    showError('confirmPassword', 'Passwords do not match');
    isValid = false;
}

// Validate terms acceptance
if (!termsAccepted) {
    showAlert('Please agree to the Terms of Service and Privacy Policy');
    isValid = false;
}
```

#### Fetch API Request
```javascript
try {
    // Show loading state
    registerBtn.disabled = true;
    registerBtn.innerHTML = 'Creating account... <span class="spinner"></span>';
    
    // Send POST request
    const response = await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            email, 
            password,
            name: name || undefined  // Optional field
        })
    });
    
    // Parse JSON response
    const data = await response.json();
    
    if (response.ok && data.success) {
        // SUCCESS: Show message and redirect
        showAlert('Account created successfully! Redirecting to login...', 'success');
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        
    } else {
        // ERROR: Show error message
        showAlert(data.message || 'Registration failed. Please try again.');
        registerBtn.disabled = false;
        registerBtn.textContent = 'Create Account';
    }
    
} catch (error) {
    // NETWORK ERROR: Handle connection issues
    console.error('Registration error:', error);
    showAlert('Unable to connect to server. Please try again later.');
    registerBtn.disabled = false;
    registerBtn.textContent = 'Create Account';
}
```

#### Error Handling
```javascript
// Possible server responses:
// 1. Success (201)
{
    "success": true,
    "message": "User registered successfully",
    "user": { "id": 1, "email": "user@example.com", "name": "User Name" }
}

// 2. Validation Error (400)
{
    "success": false,
    "error": "Validation Error",
    "message": "Email and password are required"
}

// 3. Duplicate Email (409)
{
    "success": false,
    "error": "Conflict",
    "message": "User with this email already exists"
}

// 4. Server Error (500)
{
    "success": false,
    "error": "Internal Server Error",
    "message": "Failed to register user"
}
```

---

### **2. Login Form Integration**

#### Location
**File:** `login.html`
**Lines:** JavaScript section at bottom of file

#### API Endpoint
```javascript
POST http://localhost:3000/login
Content-Type: application/json
```

#### Form Data Collection
```javascript
// Get form values
const email = emailInput.value.trim();
const password = passwordInput.value;
const rememberMe = document.getElementById('rememberMe').checked;
```

#### Client-Side Validation
```javascript
// Validate email
if (!email) {
    showError('email', 'Email is required');
    isValid = false;
} else if (!validateEmail(email)) {
    showError('email', 'Please enter a valid email address');
    isValid = false;
}

// Validate password
if (!password) {
    showError('password', 'Password is required');
    isValid = false;
} else if (!validatePassword(password)) {
    showError('password', 'Password must be at least 6 characters');
    isValid = false;
}
```

#### Fetch API Request
```javascript
try {
    // Show loading state
    loginBtn.disabled = true;
    loginBtn.innerHTML = 'Logging in... <span class="spinner"></span>';
    
    // Send POST request
    const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });
    
    // Parse JSON response
    const data = await response.json();
    
    if (response.ok && data.success) {
        // SUCCESS: Store token and redirect
        
        // Store token based on "Remember Me" preference
        if (rememberMe) {
            // Persistent storage (survives browser close)
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
        } else {
            // Session storage (cleared when browser closes)
            sessionStorage.setItem('authToken', data.token);
            sessionStorage.setItem('user', JSON.stringify(data.user));
        }
        
        // Show success message
        showAlert('Login successful! Redirecting...', 'success');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
        
    } else {
        // ERROR: Show error message
        showAlert(data.message || 'Login failed. Please try again.');
        loginBtn.disabled = false;
        loginBtn.textContent = 'Login';
    }
    
} catch (error) {
    // NETWORK ERROR: Handle connection issues
    console.error('Login error:', error);
    showAlert('Unable to connect to server. Please try again later.');
    loginBtn.disabled = false;
    loginBtn.textContent = 'Login';
}
```

#### Token Storage Logic
```javascript
// Remember Me checked → localStorage (persistent)
if (rememberMe) {
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
}

// Remember Me not checked → sessionStorage (temporary)
else {
    sessionStorage.setItem('authToken', data.token);
    sessionStorage.setItem('user', JSON.stringify(data.user));
}

// Retrieve token (checks both storages)
const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
```

#### Error Handling
```javascript
// Possible server responses:
// 1. Success (200)
{
    "success": true,
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { "id": 1, "email": "user@example.com", "name": "User Name" }
}

// 2. Validation Error (400)
{
    "success": false,
    "error": "Validation Error",
    "message": "Email and password are required"
}

// 3. Authentication Failed (401)
{
    "success": false,
    "error": "Authentication Failed",
    "message": "Invalid email or password"
}

// 4. Server Error (500)
{
    "success": false,
    "error": "Internal Server Error",
    "message": "Failed to login"
}
```

---

### **3. Dashboard API Integration**

#### Location
**File:** `dashboard.html`
**Lines:** JavaScript section at bottom of file

#### API Endpoint
```javascript
GET http://localhost:3000/dashboard
Authorization: Bearer <jwt_token>
```

#### Token Verification on Page Load
```javascript
window.addEventListener('DOMContentLoaded', async function() {
    // Check if token exists
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    
    if (!token) {
        // No token → redirect to login
        window.location.href = 'login.html';
        return;
    }

    try {
        // Verify token with server
        const response = await fetch('http://localhost:3000/dashboard', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            
            // Update UI with user data
            document.getElementById('userName').textContent = data.user.name || 'User';
            document.getElementById('userEmail').textContent = data.user.email;
            document.getElementById('userId').textContent = data.user.id;
            document.getElementById('detailName').textContent = data.user.name || 'Not provided';
            document.getElementById('detailEmail').textContent = data.user.email;
            
            // Calculate token expiry
            if (data.user.exp) {
                const expiryDate = new Date(data.user.exp * 1000);
                const now = new Date();
                const minutesLeft = Math.round((expiryDate - now) / 1000 / 60);
                document.getElementById('tokenExpiry').textContent = 
                    minutesLeft > 0 ? `${minutesLeft} minutes` : 'Expired';
            }
            
        } else {
            // Token invalid → clear and redirect
            throw new Error('Invalid token');
        }
        
    } catch (error) {
        console.error('Authentication error:', error);
        // Clear invalid tokens
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('user');
        // Redirect to login
        window.location.href = 'login.html';
    }
});
```

#### Logout Function
```javascript
function logout() {
    // Clear all stored tokens and user data
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('user');
    
    // Redirect to home page
    window.location.href = 'index.html';
}
```

---

## 🎯 Key Features Implemented

### **1. Real-Time Validation**
```javascript
// Validate on blur (when user leaves input)
emailInput.addEventListener('blur', function() {
    const email = this.value.trim();
    if (!email) {
        showError('email', 'Email is required');
    } else if (!validateEmail(email)) {
        showError('email', 'Please enter a valid email address');
    } else {
        showSuccess('email');
    }
});

// Clear errors on input
emailInput.addEventListener('input', function() {
    if (this.classList.contains('error')) {
        document.getElementById('emailError').classList.remove('show');
    }
});
```

### **2. Password Strength Indicator**
```javascript
// Register page only
passwordInput.addEventListener('input', function() {
    updatePasswordStrength(this.value);
});

function updatePasswordStrength(password) {
    const strength = checkPasswordStrength(password);
    
    if (strength <= 2) {
        strengthFill.classList.add('strength-weak');
        strengthText.textContent = '❌ Weak password';
        strengthText.style.color = '#f44336';
    } else if (strength <= 3) {
        strengthFill.classList.add('strength-medium');
        strengthText.textContent = '⚠️ Medium strength';
        strengthText.style.color = '#ff9800';
    } else {
        strengthFill.classList.add('strength-strong');
        strengthText.textContent = '✅ Strong password';
        strengthText.style.color = '#4caf50';
    }
}
```

### **3. Loading States**
```javascript
// Before API call
loginBtn.disabled = true;
loginBtn.innerHTML = 'Logging in... <span class="spinner"></span>';

// After API call (success or error)
loginBtn.disabled = false;
loginBtn.textContent = 'Login';
```

### **4. Alert Messages**
```javascript
function showAlert(message, type = 'error') {
    alertBox.textContent = message;
    alertBox.className = `alert alert-${type} show`;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        alertBox.classList.remove('show');
    }, 5000);
}

// Usage:
showAlert('Login successful!', 'success');
showAlert('Invalid credentials', 'error');
```

### **5. Auto-Redirects**
```javascript
// After successful registration (2 second delay)
setTimeout(() => {
    window.location.href = 'login.html';
}, 2000);

// After successful login (1 second delay)
setTimeout(() => {
    window.location.href = 'dashboard.html';
}, 1000);
```

### **6. Auto-Login Check**
```javascript
// On login page load
window.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (token) {
        // Verify token is still valid
        fetch('http://localhost:3000/dashboard', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (response.ok) {
                // Already logged in → redirect to dashboard
                window.location.href = 'dashboard.html';
            }
        })
        .catch(err => console.log('Token verification failed'));
    }
});
```

---

## 🧪 Testing the Integration

### **Test 1: Successful Registration**
```javascript
// Open browser console (F12)
// On register.html page, execute:

fetch('http://localhost:3000/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
    })
})
.then(res => res.json())
.then(data => console.log('Registration Response:', data))
.catch(err => console.error('Error:', err));

// Expected Output:
// {
//   "success": true,
//   "message": "User registered successfully",
//   "user": { "id": 1, "email": "test@example.com", "name": "Test User" }
// }
```

### **Test 2: Successful Login**
```javascript
// On login.html page, execute:

fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
    })
})
.then(res => res.json())
.then(data => {
    console.log('Login Response:', data);
    // Store token
    localStorage.setItem('authToken', data.token);
})
.catch(err => console.error('Error:', err));

// Expected Output:
// {
//   "success": true,
//   "message": "Login successful",
//   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
//   "user": { "id": 1, "email": "test@example.com", "name": "Test User" }
// }
```

### **Test 3: Access Protected Dashboard**
```javascript
// On dashboard.html page, execute:

const token = localStorage.getItem('authToken');

fetch('http://localhost:3000/dashboard', {
    headers: {
        'Authorization': `Bearer ${token}`
    }
})
.then(res => res.json())
.then(data => console.log('Dashboard Response:', data))
.catch(err => console.error('Error:', err));

// Expected Output:
// {
//   "success": true,
//   "message": "Welcome to your dashboard",
//   "user": {
//     "id": 1,
//     "email": "test@example.com",
//     "name": "Test User",
//     "iat": 1759403429,
//     "exp": 1759407029
//   },
//   "timestamp": "2025-10-02T10:30:00.000Z"
// }
```

### **Test 4: Error Handling - Invalid Credentials**
```javascript
fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: 'test@example.com',
        password: 'wrongpassword'
    })
})
.then(res => res.json())
.then(data => console.log('Error Response:', data))
.catch(err => console.error('Error:', err));

// Expected Output:
// {
//   "success": false,
//   "error": "Authentication Failed",
//   "message": "Invalid email or password"
// }
```

### **Test 5: Error Handling - Duplicate Registration**
```javascript
fetch('http://localhost:3000/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: 'test@example.com',  // Already registered
        password: 'password123'
    })
})
.then(res => res.json())
.then(data => console.log('Error Response:', data))
.catch(err => console.error('Error:', err));

// Expected Output:
// {
//   "success": false,
//   "error": "Conflict",
//   "message": "User with this email already exists"
// }
```

---

## 📊 Response Flow Diagrams

### Registration Flow
```
User fills form
    ↓
Client validation
    ↓ (if valid)
POST /register
    ↓
Server validation
    ↓ (if valid)
Hash password
    ↓
Save to database
    ↓
Return success (201)
    ↓
Show success alert
    ↓
Auto-redirect to login (2s)
```

### Login Flow
```
User enters credentials
    ↓
Client validation
    ↓ (if valid)
POST /login
    ↓
Server finds user
    ↓
Verify password (bcrypt)
    ↓ (if valid)
Generate JWT token
    ↓
Return token (200)
    ↓
Store token (localStorage/sessionStorage)
    ↓
Show success alert
    ↓
Auto-redirect to dashboard (1s)
```

### Dashboard Access Flow
```
Page loads
    ↓
Check for token
    ↓ (if exists)
GET /dashboard with Bearer token
    ↓
Server verifies JWT
    ↓ (if valid)
Return user data (200)
    ↓
Display dashboard
    ↓ (if invalid)
Clear token
    ↓
Redirect to login
```

---

## 🔒 Security Considerations

### **1. Token Storage**
```javascript
// ✅ GOOD: Store in localStorage/sessionStorage
localStorage.setItem('authToken', token);

// ❌ BAD: Store in cookie without HttpOnly flag
document.cookie = `token=${token}`;  // Vulnerable to XSS
```

### **2. HTTPS in Production**
```javascript
// Development (HTTP)
const API_URL = 'http://localhost:3000';

// Production (HTTPS)
const API_URL = 'https://yourdomain.com';

// Or use relative URLs (inherits protocol)
const API_URL = '/api';  // ✅ Recommended
```

### **3. Token Expiration Handling**
```javascript
// Check token expiry before making requests
const token = localStorage.getItem('authToken');
if (token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isExpired = payload.exp * 1000 < Date.now();
        
        if (isExpired) {
            // Token expired, clear and redirect
            localStorage.removeItem('authToken');
            window.location.href = 'login.html';
        }
    } catch (e) {
        // Invalid token format
        localStorage.removeItem('authToken');
    }
}
```

### **4. CORS Headers**
```javascript
// Server already configured with CORS
// Allows requests from any origin in development

// For production, restrict to specific domain:
app.use(cors({
    origin: 'https://yourdomain.com',
    credentials: true
}));
```

---

## 📝 Error Message Examples

### Registration Errors
```javascript
// Empty email
"Email is required"

// Invalid email format
"Please enter a valid email address"

// Password too short
"Password must be at least 6 characters"

// Passwords don't match
"Passwords do not match"

// Terms not accepted
"Please agree to the Terms of Service and Privacy Policy"

// Duplicate email (from server)
"User with this email already exists"

// Server error
"Failed to register user"
```

### Login Errors
```javascript
// Empty email
"Email is required"

// Invalid email format
"Please enter a valid email address"

// Empty password
"Password is required"

// Wrong credentials (from server)
"Invalid email or password"

// Server error
"Failed to login"

// Network error
"Unable to connect to server. Please try again later."
```

### Dashboard Errors
```javascript
// No token
→ Redirect to login.html

// Invalid token
→ "Invalid or expired token. Please login again."
→ Clear tokens, redirect to login

// Token expired
→ "Your session has expired. Please login again."
→ Clear tokens, redirect to login
```

---

## 🎯 Summary

### ✅ **What's Implemented:**

1. **Registration Form → /register API**
   - ✅ Fetch API POST request
   - ✅ JSON body with email, password, name
   - ✅ Success/error handling
   - ✅ Loading states
   - ✅ Alert messages
   - ✅ Auto-redirect on success

2. **Login Form → /login API**
   - ✅ Fetch API POST request
   - ✅ JSON body with email, password
   - ✅ Token storage (localStorage/sessionStorage)
   - ✅ Remember Me functionality
   - ✅ Success/error handling
   - ✅ Auto-redirect on success

3. **Dashboard → /dashboard API**
   - ✅ Fetch API GET request
   - ✅ Authorization Bearer header
   - ✅ Token verification
   - ✅ User data display
   - ✅ Logout functionality
   - ✅ Auto-redirect if not authenticated

4. **Error Handling**
   - ✅ Network errors (try-catch)
   - ✅ Server errors (response.ok check)
   - ✅ Validation errors (client & server)
   - ✅ User-friendly error messages

5. **UX Enhancements**
   - ✅ Real-time validation
   - ✅ Loading spinners
   - ✅ Success/error alerts
   - ✅ Auto-redirects
   - ✅ Token persistence
   - ✅ Auto-login check

---

**All form-to-backend integrations are complete and fully functional!** 🎉

The JavaScript code uses modern Fetch API, handles all error cases, provides excellent UX with loading states and alerts, and implements secure token management.
