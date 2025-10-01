# 🚀 Middleware & Error Handling - Quick Reference

## Start Server
```bash
node server.js
```

## Middleware Stack (Execution Order)

1. **Morgan Logger** - HTTP logging (file + console)
2. **express.json()** - Parse JSON bodies (10MB limit)
3. **express.urlencoded()** - Parse form data
4. **CORS** - Cross-origin headers
5. **Security Headers** - XSS, clickjacking protection
6. **Request Tracking** - Add `req.requestId` & `req.timestamp`
7. **Response Timer** - Log response time
8. **Static Files** - Serve HTML/CSS/JS/images
9. **Custom Logger** - Detailed request info
10. **Error Handlers** - 404 + Global error handler

## Key Files

| File | Purpose |
|------|---------|
| `server.js` | Main server with middleware |
| `logs/access.log` | HTTP request logs (Morgan) |
| `MIDDLEWARE_ERROR_HANDLING_GUIDE.md` | Complete documentation |
| `MIDDLEWARE_IMPLEMENTATION_SUMMARY.md` | Implementation details |

## Testing Commands

### Test API Routes
```bash
curl http://localhost:3000/api/menu
curl http://localhost:3000/api/status
curl http://localhost:3000/api/health
```

### Test 404 Handler
```bash
curl http://localhost:3000/invalid-route
```

**Expected Response:**
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

### Test Invalid JSON (Error Handler)
```bash
curl -X POST http://localhost:3000/api/booking \
  -H "Content-Type: application/json" \
  -d '{invalid}'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "SyntaxError",
  "statusCode": 400,
  "message": "Invalid JSON format in request body."
}
```

### Monitor Logs
```bash
tail -f logs/access.log
```

### Check Log File
```bash
cat logs/access.log
ls -lh logs/access.log
```

## Graceful Shutdown

### Stop Server (Ctrl+C)
```
Press Ctrl+C in server terminal
```

**Console Output:**
```
👋 SIGINT received (Ctrl+C). Starting graceful shutdown...
✅ Server closed. Process terminating...
```

### Kill Process
```bash
# Find PID
ps aux | grep node

# Kill gracefully
kill <PID>
```

## Utility Functions

### Wrap Async Routes
```javascript
app.get('/api/data', asyncHandler(async (req, res) => {
    const data = await fetchData();
    res.json(data);
}));
```

### Create Validation Error
```javascript
if (!name) {
    const error = createValidationError('Name is required', [
        { field: 'name', message: 'Name cannot be empty' }
    ]);
    return next(error);
}
```

## Request Properties

Every request has:
- `req.requestId` - Unique ID (e.g., `1730470892802-k2j9x5t3a`)
- `req.timestamp` - ISO 8601 timestamp
- `req.body` - Parsed JSON/form data
- `req.method` - HTTP method (GET, POST, etc.)
- `req.url` - Request URL
- `req.ip` - Client IP address

## Error Response Format

All errors return:
```json
{
  "success": false,
  "error": "ErrorName",
  "statusCode": 400,
  "message": "Human-readable message",
  "timestamp": "ISO timestamp",
  "requestId": "unique-id",
  "path": "/api/route"
}
```

## Console Output Examples

### Incoming Request
```
============================================================
📍 Incoming Request
   Method:    GET
   URL:       /api/menu
   Timestamp: 2025-10-01T14:41:32.802Z
   Request ID: 1730470892802-k2j9x5t3a
   IP:        ::1
   User-Agent: curl/7.68.0
============================================================
```

### Response Time
```
⏱️  Request to GET /api/menu took 45ms
```

### Morgan Console (dev format)
```
GET /api/menu 200 45.232 ms - 1234
```

### 404 Error
```
❌ 404 Error: Route not found - GET /invalid-route
```

### Server Error
```
❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌
🚨 SERVER ERROR OCCURRED
────────────────────────────────────────────────────────────
Request ID: 1730470892802-k2j9x5t3a
Timestamp:  2025-10-01T14:41:32.802Z
Method:     POST
URL:        /api/booking
IP:         ::1
────────────────────────────────────────────────────────────
Error Details:
Name:       ValidationError
Message:    Invalid date format
Stack:      [stack trace here]
❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌
```

## Status Codes

| Code | Error Type | Description |
|------|-----------|-------------|
| 200 | Success | Request successful |
| 400 | ValidationError | Invalid input data |
| 401 | UnauthorizedError | Authentication required |
| 404 | Not Found | Route does not exist |
| 500 | Internal Server Error | Unexpected server error |

## Security Headers

| Header | Value | Protection |
|--------|-------|-----------|
| `X-Frame-Options` | SAMEORIGIN | Clickjacking |
| `X-Content-Type-Options` | nosniff | MIME sniffing |
| `X-XSS-Protection` | 1; mode=block | XSS attacks |
| `Access-Control-Allow-Origin` | * | CORS |

## Environment Variables

```bash
# Set environment
export NODE_ENV=production

# Or inline
NODE_ENV=production node server.js
```

**Effects:**
- Stack traces hidden in production
- Error details reduced
- Performance optimizations

## Monitoring Endpoints

```bash
# Server status
curl http://localhost:3000/api/status

# Health check
curl http://localhost:3000/api/health

# Server info
curl http://localhost:3000/api/info
```

## Common Issues & Solutions

### Issue: Logs not appearing
**Solution:** Check `logs/` directory exists and has write permissions

### Issue: 404 on static files
**Solution:** Verify `express.static()` middleware is before error handlers

### Issue: CORS errors
**Solution:** Check `Access-Control-Allow-Origin` header is set

### Issue: Request body is undefined
**Solution:** Ensure `express.json()` middleware is before routes

### Issue: Server won't shut down gracefully
**Solution:** Verify server reference is saved: `server = app.listen(...)`

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Update CORS to specific origins
- [ ] Add `helmet` middleware
- [ ] Add rate limiting
- [ ] Configure log rotation
- [ ] Enable HTTPS
- [ ] Add authentication
- [ ] Use process manager (PM2)
- [ ] Set up monitoring
- [ ] Configure backups

## Additional Dependencies for Production

```bash
# Enhanced security
npm install helmet

# Rate limiting
npm install express-rate-limit

# Compression
npm install compression

# Validation
npm install express-validator

# Process manager
npm install -g pm2
```

## PM2 Commands

```bash
# Start with PM2
pm2 start server.js --name "midnight-brew"

# View logs
pm2 logs midnight-brew

# Restart
pm2 restart midnight-brew

# Stop
pm2 stop midnight-brew

# Monitor
pm2 monit

# Startup on boot
pm2 startup
pm2 save
```

## Documentation

1. **MIDDLEWARE_ERROR_HANDLING_GUIDE.md** - Complete guide (26KB)
2. **MIDDLEWARE_IMPLEMENTATION_SUMMARY.md** - Implementation details (15KB)
3. **QUICK_REFERENCE_MIDDLEWARE.md** - This file

## Support

For detailed information, see:
- `MIDDLEWARE_ERROR_HANDLING_GUIDE.md` - In-depth middleware documentation
- `ROUTES_GUIDE.md` - Route documentation
- `DATA_SERVING_GUIDE.md` - API data documentation

---

**Last Updated:** October 1, 2025  
**Version:** 1.0.0  
**Server Port:** 3000  
**Status:** ✅ Production Ready
