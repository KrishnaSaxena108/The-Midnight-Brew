const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function setupAdmin() {
    try {
        // Connect to database
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/midnight-brew';
        await mongoose.connect(MONGODB_URI);

        // Get admin credentials from environment
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        
        if (!adminEmail || !adminPassword) {
            console.log('❌ Admin credentials not found in environment variables');
            console.log('Please set ADMIN_EMAIL and ADMIN_PASSWORD in .env file');
            process.exit(1);
        }

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminEmail });
        
        if (existingAdmin && existingAdmin.role === 'admin') {
            console.log('✅ Admin user already exists and configured');
            process.exit(0);
        }

        // Create or update admin user
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
        const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

        if (existingAdmin) {
            // Update existing user to admin
            existingAdmin.password = hashedPassword;
            existingAdmin.role = 'admin';
            await existingAdmin.save();
            console.log('✅ Existing user upgraded to admin');
        } else {
            // Create new admin user
            const adminUser = new User({
                email: adminEmail,
                password: hashedPassword,
                firstName: 'Admin',
                lastName: 'User',
                phone: '+1234567890',
                role: 'admin'
            });
            await adminUser.save();
            console.log('✅ New admin user created');
        }

        console.log(`📧 Admin Email: ${adminEmail}`);
        console.log('🚀 Admin setup completed successfully!');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error setting up admin:', error.message);
        process.exit(1);
    }
}

// Only run if called directly (not imported)
if (require.main === module) {
    setupAdmin();
}

module.exports = { setupAdmin };