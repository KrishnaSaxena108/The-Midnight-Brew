/**
 * ========================================
 * THE MIDNIGHT BREW - AUTH UTILITY
 * ========================================
 * Centralized authentication and API utilities
 * Handles JWT storage, retrieval, and automatic
 * inclusion in API requests
 */

// ========================================
// CONFIGURATION
// ========================================

const API_BASE_URL = window.location.origin; // Use same origin
const TOKEN_KEY = 'authToken';
const USER_KEY = 'user';

// ========================================
// TOKEN MANAGEMENT
// ========================================

/**
 * Get stored auth token from localStorage or sessionStorage
 * @returns {string|null} JWT token or null if not found
 */
function getToken() {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

/**
 * Store auth token in localStorage or sessionStorage
 * @param {string} token - JWT token to store
 * @param {boolean} remember - If true, use localStorage (persistent), else sessionStorage (session only)
 */
function setToken(token, remember = false) {
    if (remember) {
        localStorage.setItem(TOKEN_KEY, token);
    } else {
        sessionStorage.setItem(TOKEN_KEY, token);
    }
}

/**
 * Remove auth token from both localStorage and sessionStorage
 */
function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
}

/**
 * Check if user is authenticated (has valid token)
 * Note: This only checks if token exists, not if it's valid
 * @returns {boolean} True if token exists
 */
function isAuthenticated() {
    return !!getToken();
}

/**
 * Decode JWT token payload (without verification)
 * @param {string} token - JWT token
 * @returns {object|null} Decoded payload or null if invalid
 */
function decodeToken(token) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        
        const payload = JSON.parse(atob(parts[1]));
        return payload;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
}

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} True if token is expired
 */
function isTokenExpired(token) {
    const payload = decodeToken(token);
    if (!payload || !payload.exp) return true;
    
    return payload.exp * 1000 < Date.now();
}

/**
 * Get token expiry time
 * @param {string} token - JWT token
 * @returns {Date|null} Expiry date or null if invalid
 */
function getTokenExpiry(token) {
    const payload = decodeToken(token);
    if (!payload || !payload.exp) return null;
    
    return new Date(payload.exp * 1000);
}

// ========================================
// USER MANAGEMENT
// ========================================

/**
 * Get stored user data
 * @returns {object|null} User object or null
 */
function getUser() {
    const userStr = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    if (!userStr) return null;
    
    try {
        return JSON.parse(userStr);
    } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
    }
}

/**
 * Store user data
 * @param {object} user - User object
 * @param {boolean} remember - If true, use localStorage, else sessionStorage
 */
function setUser(user, remember = false) {
    const userStr = JSON.stringify(user);
    if (remember) {
        localStorage.setItem(USER_KEY, userStr);
    } else {
        sessionStorage.setItem(USER_KEY, userStr);
    }
}

/**
 * Remove user data from storage
 */
function clearUser() {
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(USER_KEY);
}

/**
 * Clear all auth data (token + user)
 */
function clearAuth() {
    clearToken();
    clearUser();
}

// ========================================
// ERROR HANDLING & NOTIFICATIONS
// ========================================

/**
 * Show notification message to user
 * @param {string} message - Message to display
 * @param {string} type - Type of notification ('error', 'warning', 'success', 'info')
 * @param {number} duration - Duration in milliseconds (default: 4000)
 */
function showNotification(message, type = 'info', duration = 4000) {
    // Remove any existing notifications
    const existing = document.querySelector('.auth-notification');
    if (existing) existing.remove();
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `auth-notification auth-notification-${type}`;
    
    // Icon based on type
    const icons = {
        error: '❌',
        warning: '⚠️',
        success: '✅',
        info: 'ℹ️'
    };
    
    notification.innerHTML = `
        <span class="auth-notification-icon">${icons[type] || icons.info}</span>
        <span class="auth-notification-message">${message}</span>
        <button class="auth-notification-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    // Add styles if not already present
    if (!document.querySelector('#auth-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'auth-notification-styles';
        style.textContent = `
            .auth-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                min-width: 300px;
                max-width: 500px;
                padding: 15px 20px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                display: flex;
                align-items: center;
                gap: 12px;
                z-index: 10000;
                animation: slideInRight 0.3s ease-out;
            }
            
            .auth-notification-error {
                border-left: 4px solid #dc3545;
                background: #fff5f5;
            }
            
            .auth-notification-warning {
                border-left: 4px solid #ffc107;
                background: #fffbf0;
            }
            
            .auth-notification-success {
                border-left: 4px solid #28a745;
                background: #f0fff4;
            }
            
            .auth-notification-info {
                border-left: 4px solid #17a2b8;
                background: #f0f9ff;
            }
            
            .auth-notification-icon {
                font-size: 20px;
                flex-shrink: 0;
            }
            
            .auth-notification-message {
                flex: 1;
                color: #333;
                font-size: 14px;
                line-height: 1.5;
            }
            
            .auth-notification-close {
                background: none;
                border: none;
                font-size: 24px;
                color: #999;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
                flex-shrink: 0;
                transition: color 0.2s;
            }
            
            .auth-notification-close:hover {
                color: #333;
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
            
            @media (max-width: 576px) {
                .auth-notification {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                    min-width: auto;
                    max-width: none;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add to document
    document.body.appendChild(notification);
    
    // Auto-remove after duration
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

/**
 * Get friendly error message based on status code
 * @param {number} status - HTTP status code
 * @param {string} defaultMessage - Default message if no specific message found
 * @returns {string} Friendly error message
 */
function getErrorMessage(status, defaultMessage = 'An error occurred') {
    const messages = {
        400: 'Invalid request. Please check your input.',
        401: 'Your session has expired. Please log in again.',
        403: 'Access denied. You do not have permission for this action.',
        404: 'The requested resource was not found.',
        409: 'This resource already exists.',
        422: 'Invalid data provided. Please check your input.',
        429: 'Too many requests. Please try again later.',
        500: 'Server error. Please try again later.',
        502: 'Service temporarily unavailable. Please try again.',
        503: 'Service temporarily unavailable. Please try again.',
        504: 'Request timeout. Please try again.'
    };
    
    return messages[status] || defaultMessage;
}

// ========================================
// AUTHENTICATED FETCH WRAPPER
// ========================================

/**
 * Make an authenticated API request
 * Automatically includes JWT token in Authorization header
 * Supports HTTP-only cookies (preferred) + localStorage/sessionStorage fallback
 * 
 * @param {string} endpoint - API endpoint (e.g., '/api/booking')
 * @param {object} options - Fetch options (method, body, headers, etc.)
 * @returns {Promise<Response>} Fetch response
 */
async function authFetch(endpoint, options = {}) {
    // Build full URL
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    
    // Get token (fallback for Authorization header if no HTTP-only cookie)
    const token = getToken();
    
    // Prepare headers
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    // Add Authorization header if token exists (fallback mechanism)
    // Server will prefer HTTP-only cookie if present
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Prepare fetch options
    const fetchOptions = {
        ...options,
        headers,
        credentials: 'include' // Important: Send cookies with request
    };
    
    try {
        const response = await fetch(url, fetchOptions);
        
        // Handle 401 Unauthorized (token expired or invalid)
        if (response.status === 401) {
            console.warn('Authentication failed (401) - Token expired or invalid');
            const errorMessage = getErrorMessage(401);
            showNotification(errorMessage, 'error', 5000);
            
            // Clear auth data
            clearAuth();
            
            // Redirect to login after short delay (allow user to see message)
            setTimeout(() => {
                if (typeof window !== 'undefined' && !window.location.pathname.includes('login')) {
                    window.location.href = '/login.html?reason=expired';
                }
            }, 2000);
        }
        
        // Handle 403 Forbidden (authenticated but not authorized)
        if (response.status === 403) {
            console.warn('Access forbidden (403) - Insufficient permissions');
            const errorMessage = getErrorMessage(403);
            showNotification(errorMessage, 'error', 5000);
            
            // Check if token is expired
            const token = getToken();
            if (token && isTokenExpired(token)) {
                clearAuth();
                setTimeout(() => {
                    if (typeof window !== 'undefined' && !window.location.pathname.includes('login')) {
                        window.location.href = '/login.html?reason=expired';
                    }
                }, 2000);
            }
        }
        
        // Handle other error status codes with friendly messages
        if (!response.ok && response.status !== 401 && response.status !== 403) {
            const errorMessage = getErrorMessage(response.status);
            console.error(`API Error (${response.status}):`, errorMessage);
            
            // Try to get error message from response
            try {
                const errorData = await response.clone().json();
                if (errorData.message || errorData.error) {
                    showNotification(errorData.message || errorData.error, 'error');
                } else {
                    showNotification(errorMessage, 'error');
                }
            } catch {
                showNotification(errorMessage, 'error');
            }
        }
        
        return response;
        
    } catch (error) {
        console.error('Auth fetch error:', error);
        
        // Network error or other fetch error
        if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
            showNotification('Unable to connect to server. Please check your connection.', 'error');
        } else {
            showNotification('An unexpected error occurred. Please try again.', 'error');
        }
        
        throw error;
    }
}

/**
 * Convenience method for GET requests
 * @param {string} endpoint - API endpoint
 * @param {object} options - Additional fetch options
 * @returns {Promise<Response>} Fetch response
 */
async function authGet(endpoint, options = {}) {
    return authFetch(endpoint, { ...options, method: 'GET' });
}

/**
 * Convenience method for POST requests
 * @param {string} endpoint - API endpoint
 * @param {object} data - Request body data
 * @param {object} options - Additional fetch options
 * @returns {Promise<Response>} Fetch response
 */
async function authPost(endpoint, data, options = {}) {
    return authFetch(endpoint, {
        ...options,
        method: 'POST',
        body: JSON.stringify(data)
    });
}

/**
 * Convenience method for PUT requests
 * @param {string} endpoint - API endpoint
 * @param {object} data - Request body data
 * @param {object} options - Additional fetch options
 * @returns {Promise<Response>} Fetch response
 */
async function authPut(endpoint, data, options = {}) {
    return authFetch(endpoint, {
        ...options,
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

/**
 * Convenience method for DELETE requests
 * @param {string} endpoint - API endpoint
 * @param {object} options - Additional fetch options
 * @returns {Promise<Response>} Fetch response
 */
async function authDelete(endpoint, options = {}) {
    return authFetch(endpoint, { ...options, method: 'DELETE' });
}

// ========================================
// AUTHENTICATION ACTIONS
// ========================================

/**
 * Login user and store auth data
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {boolean} remember - Remember me option
 * @returns {Promise<object>} API response data
 */
async function login(email, password, remember = false) {
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include' // Important: Receive cookies
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
        // Store token and user data
        setToken(data.token, remember);
        setUser(data.user, remember);
    }
    
    return { response, data };
}

/**
 * Register new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} name - User name (optional)
 * @returns {Promise<object>} API response data
 */
async function register(email, password, name) {
    const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, name: name || undefined })
    });
    
    const data = await response.json();
    return { response, data };
}

/**
 * Logout user and clear auth data
 * @param {string} redirectUrl - URL to redirect to after logout (default: '/login.html')
 * @returns {Promise<void>}
 */
async function logout(redirectUrl = '/login.html') {
    try {
        // Call logout endpoint to clear HTTP-only cookie
        await fetch(`${API_BASE_URL}/logout`, {
            method: 'POST',
            credentials: 'include'
        });
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        // Always clear local auth data
        clearAuth();
        
        // Redirect to login page
        if (redirectUrl) {
            window.location.href = redirectUrl;
        }
    }
}

/**
 * Check if user is logged in and redirect if not
 * @param {string} redirectUrl - URL to redirect to if not authenticated (default: '/login.html')
 */
function requireAuth(redirectUrl = '/login.html') {
    if (!isAuthenticated()) {
        window.location.href = redirectUrl;
        return false;
    }
    
    const token = getToken();
    if (isTokenExpired(token)) {
        console.warn('Token expired - clearing auth and redirecting');
        clearAuth();
        window.location.href = redirectUrl;
        return false;
    }
    
    return true;
}

/**
 * Redirect to dashboard if already authenticated
 * @param {string} dashboardUrl - URL to redirect to (default: '/dashboard.html')
 */
function redirectIfAuthenticated(dashboardUrl = '/dashboard.html') {
    if (isAuthenticated()) {
        const token = getToken();
        if (!isTokenExpired(token)) {
            window.location.href = dashboardUrl;
        } else {
            clearAuth();
        }
    }
}

/**
 * Start token expiry monitor
 * Checks token expiry every minute and logs out if expired
 * @param {boolean} autoStart - Whether to start monitoring immediately (default: true)
 * @returns {number} Interval ID (can be used to stop monitoring with clearInterval)
 */
function startTokenExpiryMonitor(autoStart = true) {
    if (!autoStart) return null;
    
    const checkInterval = 60000; // Check every minute
    
    const intervalId = setInterval(() => {
        if (isAuthenticated()) {
            const token = getToken();
            
            if (isTokenExpired(token)) {
                console.warn('Token expired - logging out user');
                showNotification('Your session has expired. Please log in again.', 'warning', 5000);
                
                clearAuth();
                
                setTimeout(() => {
                    if (!window.location.pathname.includes('login')) {
                        window.location.href = '/login.html?reason=expired';
                    }
                }, 2000);
                
                clearInterval(intervalId);
            } else {
                // Check if token is expiring soon (within 5 minutes)
                const expiry = getTokenExpiry(token);
                const now = new Date();
                const timeUntilExpiry = expiry - now;
                const fiveMinutes = 5 * 60 * 1000;
                
                if (timeUntilExpiry > 0 && timeUntilExpiry <= fiveMinutes) {
                    const minutesLeft = Math.ceil(timeUntilExpiry / 60000);
                    showNotification(
                        `Your session will expire in ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}. Please save your work.`,
                        'warning',
                        6000
                    );
                }
            }
        } else {
            // No token found, stop monitoring
            clearInterval(intervalId);
        }
    }, checkInterval);
    
    return intervalId;
}

/**
 * Check token expiry on page load
 * Shows warning if token is expired and redirects
 */
function checkTokenOnLoad() {
    if (isAuthenticated()) {
        const token = getToken();
        
        if (isTokenExpired(token)) {
            console.warn('Token already expired on page load');
            showNotification('Your session has expired. Redirecting to login...', 'error', 3000);
            
            clearAuth();
            
            setTimeout(() => {
                if (!window.location.pathname.includes('login')) {
                    window.location.href = '/login.html?reason=expired';
                }
            }, 2000);
            
            return false;
        }
    }
    
    return true;
}

// ========================================
// EXPORTS (for non-module usage)
// ========================================

// If not using ES6 modules, attach to window object
if (typeof window !== 'undefined' && !window.Auth) {
    window.Auth = {
        // Token management
        getToken,
        setToken,
        clearToken,
        isAuthenticated,
        decodeToken,
        isTokenExpired,
        getTokenExpiry,
        
        // User management
        getUser,
        setUser,
        clearUser,
        clearAuth,
        
        // Error handling & notifications
        showNotification,
        getErrorMessage,
        
        // Fetch utilities
        authFetch,
        authGet,
        authPost,
        authPut,
        authDelete,
        
        // Authentication actions
        login,
        register,
        logout,
        requireAuth,
        redirectIfAuthenticated,
        
        // Token expiry monitoring
        startTokenExpiryMonitor,
        checkTokenOnLoad
    };
}
