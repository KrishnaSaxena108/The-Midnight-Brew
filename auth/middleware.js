require('dotenv').config();

const jwt = require('jsonwebtoken');
const Session = require('../models/Session');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET;


const generateToken = async (user, req) => {
    const sessionId = crypto.randomUUID();
    
    
    const session = new Session({
        sessionId,
        userId: user.id,
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip || req.connection.remoteAddress
    });
    
    await session.save();
    
    return jwt.sign(
        { 
            userId: user.id, 
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            sessionId: sessionId
        },
        JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
};

// Verify JWT token middleware with session validation
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1] || req.cookies.token;

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Access token is required' 
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Check if session exists and is active
        const session = await Session.findOne({
            sessionId: decoded.sessionId,
            userId: decoded.userId,
            isActive: true
        });

        if (!session) {
            return res.status(401).json({ 
                success: false, 
                message: 'Session expired or invalid' 
            });
        }

        // Check if session is expired
        if (session.isExpired()) {
            session.isActive = false;
            await session.save();
            return res.status(401).json({ 
                success: false, 
                message: 'Session expired' 
            });
        }

        // Refresh session activity
        await session.refresh();
        
        req.user = decoded;
        req.session = session;
        next();
    } catch (err) {
        return res.status(403).json({ 
            success: false, 
            message: 'Invalid or expired token' 
        });
    }
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1] || req.cookies.token;

    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Check if session exists and is active
        const session = await Session.findOne({
            sessionId: decoded.sessionId,
            userId: decoded.userId,
            isActive: true
        });

        if (session && !session.isExpired()) {
            // Refresh session activity
            await session.refresh();
            req.user = decoded;
            req.session = session;
        } else {
            req.user = null;
        }
    } catch (err) {
        req.user = null;
    }
    
    next();
};

// Invalidate session (logout)
const invalidateSession = async (sessionId) => {
    try {
        await Session.updateOne(
            { sessionId },
            { isActive: false }
        );
        return true;
    } catch (error) {
        console.error('Error invalidating session:', error);
        return false;
    }
};

// Invalidate all sessions for a user (logout from all devices)
const invalidateAllUserSessions = async (userId) => {
    try {
        await Session.updateMany(
            { userId, isActive: true },
            { isActive: false }
        );
        return true;
    } catch (error) {
        console.error('Error invalidating user sessions:', error);
        return false;
    }
};

// Clean up expired sessions (can be called periodically)
const cleanupExpiredSessions = async () => {
    try {
        const result = await Session.deleteMany({
            $or: [
                { expiresAt: { $lt: new Date() } },
                { isActive: false }
            ]
        });
        return result.deletedCount;
    } catch (error) {
        console.error('Error cleaning up sessions:', error);
        return 0;
    }
};

module.exports = {
    generateToken,
    authenticateToken,
    optionalAuth,
    invalidateSession,
    invalidateAllUserSessions,
    cleanupExpiredSessions,
    JWT_SECRET
};