// Load environment variables
require('dotenv').config();

const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastActivity: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        default: () => {
            const hours = parseInt(process.env.SESSION_TIMEOUT_HOURS) || 24;
            return new Date(Date.now() + hours * 60 * 60 * 1000);
        }
    },
    userAgent: String,
    ipAddress: String
});

// Index for automatic cleanup of expired sessions
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Method to check if session is expired
sessionSchema.methods.isExpired = function() {
    return new Date() > this.expiresAt;
};

// Method to refresh session
sessionSchema.methods.refresh = function() {
    this.lastActivity = new Date();
    const hours = parseInt(process.env.SESSION_TIMEOUT_HOURS) || 24;
    this.expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
    return this.save();
};

module.exports = mongoose.model('Session', sessionSchema);