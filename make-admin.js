const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/midnight-brew';

async function makeAdmin() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = process.argv[2];
        if (!email) {
            console.log('Usage: node make-admin.js <email>');
            process.exit(1);
        }

        const user = await User.findOne({ email });
        if (!user) {
            console.log(`User with email ${email} not found`);
            process.exit(1);
        }

        user.role = 'admin';
        await user.save();

        console.log(`✅ User ${email} is now an admin`);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

makeAdmin();
