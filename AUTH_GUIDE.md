# 🔐 JWT Authentication Guide

## Overview
The Midnight Brew server now includes JWT (JSON Web Token) based authentication to secure sensitive routes and user data.

## Features Added

### 1. User Registration & Login
- **POST /register** - Create new user accounts
- **POST /login** - Authenticate users and receive JWT token

### 2. Protected Routes
- **GET /dashboard** - User dashboard (requires authentication)
- **POST /api/booking** - Submit table bookings (requires authentication)

### 3. Security Features
- Password hashing with bcrypt (10 salt rounds)
- JWT tokens with 1-hour expiration
- Authorization header validation
- Comprehensive error handling
- CORS enabled for cross-origin requests

---

## 📋 API Documentation

### Register New User

**Endpoint:** `POST /register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "yourpassword",
  "name": "Your Name" // optional
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Your Name"
  }
}
```

**Error Responses:**
- **400** - Missing email or password
- **409** - User already exists
- **500** - Server error

**Example cURL:**
```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123","name":"John Doe"}'
```

---

### Login User

**Endpoint:** `POST /login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Your Name"
  }
}
```

**Error Responses:**
- **400** - Missing email or password
- **401** - Invalid credentials
- **500** - Server error

**Example cURL:**
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}'
```

---

### Access Protected Dashboard

**Endpoint:** `GET /dashboard`

**Headers Required:**
```
Authorization: Bearer <your_jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Welcome to your dashboard",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Your Name",
    "iat": 1759403429,
    "exp": 1759407029
  },
  "timestamp": "2025-10-01T17:30:00.000Z"
}
```

**Error Responses:**
- **401** - No token provided
- **403** - Invalid or expired token

**Example cURL:**
```bash
curl -X GET http://localhost:3000/dashboard \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Submit Booking (Protected)

**Endpoint:** `POST /api/booking`

**Headers Required:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "date": "2025-10-15",
  "time": "18:00",
  "guests": 4,
  "specialRequests": "Window seat please" // optional
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Booking submitted successfully",
  "data": {
    "id": 1759403462796,
    "userId": 1,
    "userEmail": "user@example.com",
    "userName": "Your Name",
    "date": "2025-10-15",
    "time": "18:00",
    "guests": 4,
    "specialRequests": "Window seat please",
    "status": "pending",
    "createdAt": "2025-10-01T17:31:02.796Z"
  }
}
```

**Error Responses:**
- **400** - Missing required fields
- **401** - No token provided
- **403** - Invalid or expired token
- **500** - Server error

**Example cURL:**
```bash
curl -X POST http://localhost:3000/api/booking \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"date":"2025-10-15","time":"18:00","guests":4,"specialRequests":"Window seat"}'
```

---

## 🔑 Authentication Flow

### Complete Authentication Workflow

```bash
# 1. Register a new user
TOKEN_RESPONSE=$(curl -s -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123","name":"John"}')

echo "Registration Response: $TOKEN_RESPONSE"

# 2. Login to get JWT token
TOKEN=$(curl -s -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo "JWT Token: $TOKEN"

# 3. Access protected dashboard
curl -X GET http://localhost:3000/dashboard \
  -H "Authorization: Bearer $TOKEN"

# 4. Submit a booking
curl -X POST http://localhost:3000/api/booking \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"date":"2025-10-15","time":"18:00","guests":4}'
```

---

## 🛡️ Security Implementation Details

### Password Security
- **Algorithm:** bcrypt
- **Salt Rounds:** 10
- **Storage:** Passwords are never stored in plain text
- **Verification:** Secure password comparison using bcrypt.compare()

### JWT Token
- **Algorithm:** HS256 (HMAC-SHA256)
- **Expiration:** 1 hour (3600 seconds)
- **Payload:** Contains user id, email, and name
- **Secret Key:** Configurable via JWT_SECRET environment variable

### Middleware Protection
```javascript
// JWT middleware checks:
1. Presence of Authorization header
2. Bearer token format
3. Token validity and expiration
4. Attaches user info to request object
```

### Error Handling
- **401 Unauthorized:** Missing token
- **403 Forbidden:** Invalid/expired token
- **400 Bad Request:** Validation errors
- **409 Conflict:** Duplicate registration
- **500 Internal Server Error:** Server errors

---

## 🔧 Configuration

### Environment Variables
```bash
# Optional - defaults provided
PORT=3000
JWT_SECRET=your-secret-key-change-in-production
```

### Security Recommendations for Production

1. **Use Strong JWT Secret**
   ```bash
   # Generate a secure random secret
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Use Environment Variables**
   ```javascript
   // In production, never hardcode secrets
   const JWT_SECRET = process.env.JWT_SECRET;
   ```

3. **Enable HTTPS**
   - JWT tokens should only be transmitted over HTTPS
   - Prevents token interception

4. **Implement Token Refresh**
   - Add refresh token mechanism for better UX
   - Allow users to stay logged in longer

5. **Add Rate Limiting**
   ```bash
   npm install express-rate-limit
   ```

6. **Replace In-Memory Storage**
   - Use MongoDB, PostgreSQL, or another database
   - In-memory storage loses data on server restart

7. **Add Password Strength Validation**
   - Minimum length requirements
   - Special characters, numbers, uppercase

8. **Implement Logout Mechanism**
   - Token blacklisting or short expiration times
   - Clear tokens from client storage

---

## 📦 Dependencies

```json
{
  "bcryptjs": "^2.x.x",    // Password hashing
  "jsonwebtoken": "^9.x.x", // JWT generation/verification
  "cors": "^2.x.x",         // Cross-Origin Resource Sharing
  "express": "^5.x.x"       // Web framework
}
```

---

## 🧪 Testing the Implementation

### Test 1: Successful Registration
```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Expected: 201 status, user object returned
```

### Test 2: Duplicate Registration (Should Fail)
```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Expected: 409 Conflict error
```

### Test 3: Successful Login
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Expected: 200 status, JWT token returned
```

### Test 4: Failed Login (Wrong Password)
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrongpass"}'

# Expected: 401 Unauthorized error
```

### Test 5: Access Protected Route Without Token
```bash
curl -X GET http://localhost:3000/dashboard

# Expected: 401 Unauthorized error
```

### Test 6: Access Protected Route With Valid Token
```bash
TOKEN="<your_jwt_token_here>"
curl -X GET http://localhost:3000/dashboard \
  -H "Authorization: Bearer $TOKEN"

# Expected: 200 status, dashboard data returned
```

### Test 7: Access Protected Route With Invalid Token
```bash
curl -X GET http://localhost:3000/dashboard \
  -H "Authorization: Bearer invalid_token"

# Expected: 403 Forbidden error
```

### Test 8: Submit Booking With Authentication
```bash
TOKEN="<your_jwt_token_here>"
curl -X POST http://localhost:3000/api/booking \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"date":"2025-10-15","time":"18:00","guests":4}'

# Expected: 201 status, booking confirmation returned
```

---

## 🐛 Troubleshooting

### Issue: "Access token is required"
**Solution:** Include the Authorization header with Bearer token
```bash
-H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Issue: "Invalid or expired token"
**Causes:**
1. Token has expired (> 1 hour old)
2. Token is malformed
3. JWT_SECRET changed after token was issued

**Solution:** Login again to get a fresh token

### Issue: "User with this email already exists"
**Solution:** Use a different email or login with existing credentials

### Issue: Server not starting
**Solution:** Check if all dependencies are installed
```bash
npm install
```

---

## 📚 Additional Resources

- [JWT.io](https://jwt.io/) - JWT debugger and documentation
- [bcrypt.js Documentation](https://www.npmjs.com/package/bcryptjs)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

## 🎯 Next Steps

Consider implementing these enhancements:

1. **Email Verification** - Confirm user email addresses
2. **Password Reset** - Allow users to reset forgotten passwords
3. **Account Deletion** - GDPR compliance
4. **User Roles** - Admin vs regular user permissions
5. **Session Management** - Track active sessions
6. **Two-Factor Authentication** - Additional security layer
7. **OAuth Integration** - Google, Facebook, GitHub login
8. **Activity Logging** - Track user actions for security
9. **Database Integration** - Replace in-memory storage
10. **API Documentation** - Swagger/OpenAPI integration

---

**Last Updated:** October 2, 2025
**Version:** 1.0.0
**Status:** ✅ Production Ready (with recommended security enhancements)
