const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    mimetype: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['menu-item', 'category', 'cafe', 'general'],
        default: 'general'
    },
    alt: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for faster queries
imageSchema.index({ category: 1, isActive: 1 });
imageSchema.index({ filename: 1 }, { unique: true });

const Image = mongoose.model('Image', imageSchema);
module.exports = Image;