const mongoose = require('mongoose');

// Booking Schema
const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    bookingDate: {
        type: String,
        required: true
    },
    bookingTime: {
        type: String,
        required: true
    },
    partySize: {
        type: Number,
        required: true,
        min: 1,
        max: 20
    },
    occasion: {
        type: String,
        enum: ['birthday', 'anniversary', 'date', 'business', 'friends', 'other', ''],
        default: ''
    },
    preferences: {
        type: [String],
        default: []
    },
    specialRequests: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['confirmed', 'cancelled', 'completed'],
        default: 'confirmed'
    }
}, {
    timestamps: true
});

// Create and export Booking model
const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;