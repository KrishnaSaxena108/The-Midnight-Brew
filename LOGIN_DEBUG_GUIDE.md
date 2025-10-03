# 🔍 Login "Unable to Connect to Server" - Debugging Guide

## Current Status

✅ **Server is RUNNING** - http://localhost:3000  
✅ **Login API endpoint works** - Returns 401 for invalid credentials  
✅ **CORS is configured** - Headers present  
❓ **Issue occurs in browser** - Need to see actual error  

---

## What I've Done

### 1. Enhanced Error Logging in login.html
Added detailed console logging to see:
- What email is being used
- What API URL is being called
- Full error details including name, message, and stack trace
- More specific error messages based on error type

### 2. Created Debug Test Page
**File:** `test-login-debug.html`  
**URL:** http://localhost:3000/test-login-debug.html

**Tests:**
1. ✅ Check if auth.js is loaded
2. 🌐 Test server connection
3. 📡 Test login API directly
4. 🔐 Test Auth.login() function
5. ⚠️ Capture and display console errors

---

## How to Debug

### Step 1: Use the Test Page (Recommended)
1. Open: http://localhost:3000/test-login-debug.html
2. Click each test button in order
3. Note which test fails
4. Report the error message

### Step 2: Use Login Page with Console
1. Open: http://localhost:3000/login.html
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Try to login with any credentials
5. Check console for detailed error logs:
   ```
   🔐 Attempting login with: ...
   📍 API Base URL: ...
   📥 Login response received: ... (if successful)
   🚨 Login error (catch block): ... (if failed)
   ```

### Step 3: Check Network Tab
1. In DevTools, go to **Network** tab
2. Try to login
3. Look for a request to `/login`
4. Check:
   - ❓ Is the request being sent?
   - ❓ What is the status code?
   - ❓ What is the response?

---

## Possible Causes & Solutions

### Cause 1: auth.js Not Loading
**Symptoms:** 
- Console error: "Auth is not defined"
- Test page shows Auth.js failed to load

**Solution:**
- Check if `auth.js` file exists
- Check browser console for 404 errors
- Verify `<script src="auth.js"></script>` is present

### Cause 2: Server Not Running
**Symptoms:**
- Test page server connection fails
- Console error: "Failed to fetch"
- Network tab shows request failed

**Solution:**
```bash
# Check if server is running
curl http://localhost:3000/api/health

# If not, start it:
node server.js
```

### Cause 3: Wrong API URL
**Symptoms:**
- Console shows wrong URL being called
- 404 errors in network tab

**Current Config:**
```javascript
const API_BASE_URL = window.location.origin;
// Should be: http://localhost:3000
```

**Check:**
- Open console and type: `window.location.origin`
- Should output: `http://localhost:3000`

### Cause 4: CORS Issue
**Symptoms:**
- Console error: "CORS policy"
- Network tab shows "CORS error"

**Check server.js has:**
```javascript
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    // ... other CORS headers
});
```

### Cause 5: JavaScript Error Before Auth.login()
**Symptoms:**
- Console shows error before "Attempting login" message
- Some variables undefined

**Solution:**
- Check console for any errors when page loads
- Verify all form elements exist

### Cause 6: Network/Firewall Blocking
**Symptoms:**
- curl works but browser doesn't
- "Failed to fetch" error

**Solution:**
- Check browser extensions (ad blockers)
- Check firewall settings
- Try in incognito mode

---

## Quick Fixes to Try

### Fix 1: Hard Refresh
```
Ctrl + Shift + R (or Cmd + Shift + R on Mac)
```
Clears cache and reloads everything.

### Fix 2: Check Browser Console
Open DevTools (F12) and look for:
- ❌ Red error messages
- ⚠️ Yellow warnings
- Any mentions of "Auth", "fetch", or "CORS"

### Fix 3: Verify Server is Running
```bash
# In terminal:
curl http://localhost:3000/api/health

# Should return:
{"success":true,"status":"healthy","timestamp":"..."}
```

### Fix 4: Test with curl
```bash
# Try login with curl:
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Should return error (account doesn't exist) but server responds:
{"success":false,"error":"Authentication Failed","message":"Invalid email or password"}
```

---

## What Info I Need

To help fix this, please provide:

1. **Test Page Results:**
   - Which tests pass? ✅
   - Which tests fail? ❌
   - What error messages appear?

2. **Browser Console Output:**
   - Copy/paste all messages when you try to login
   - Especially look for 🔐, 📍, 📥, 🚨 emoji messages

3. **Network Tab Info:**
   - Is a request to `/login` being sent?
   - What is the status code?
   - What is the response body?

4. **Screenshot (if possible):**
   - Browser console with errors
   - Network tab showing the request
   - Test page results

---

## Expected Normal Flow

### When Login Works Correctly:

**Console Output:**
```
🔐 Attempting login with: { email: "test@test.com", rememberMe: false }
📍 API Base URL: http://localhost:3000
📥 Login response received: { ok: false, status: 401, success: false }
❌ Login failed: { success: false, error: "Authentication Failed", message: "Invalid email or password" }
```

**User Sees:**
- Error message: "Invalid email or password" (if wrong credentials)
- Success message + redirect (if correct credentials)

### When There's a Connection Problem:

**Console Output:**
```
🔐 Attempting login with: ...
📍 API Base URL: http://localhost:3000
🚨 Login error (catch block): TypeError: Failed to fetch
Error name: TypeError
Error message: Failed to fetch
Error stack: ...
```

**User Sees:**
- "Network error: Cannot reach server. Please check if the server is running."

---

## Files Modified

1. **login.html** - Enhanced error logging
2. **test-login-debug.html** - Created diagnostic page

## Files to Check

1. **auth.js** - Authentication utility
2. **server.js** - Backend with login endpoint
3. **login.html** - Login form and handlers

---

## Next Steps

1. ✅ Open test-login-debug.html
2. ✅ Click all test buttons
3. ✅ Report which test fails
4. ✅ Copy error messages from console
5. ✅ I'll fix the exact issue once I know what's failing

---

**Last Updated:** October 3, 2025  
**Status:** Debugging in progress  
**Test Page:** http://localhost:3000/test-login-debug.html
