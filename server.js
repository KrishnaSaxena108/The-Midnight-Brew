// Load environment variables first
require('dotenv').config();

const express = require('express');
const path = require('path');
const morgan = require('morgan');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/database');
const User = require('./models/User');
const Booking = require('./models/Booking');
const Session = require('./models/Session');
const Category = require('./models/Category');
const MenuItem = require('./models/MenuItem');
const { 
    generateToken, 
    authenticateToken, 
    optionalAuth, 
    invalidateSession, 
    invalidateAllUserSessions, 
    cleanupExpiredSessions 
} = require('./auth/middleware');

const { requireAdmin } = require('./auth/admin-middleware');

// Image upload configuration
const multer = require('multer');
const Image = require('./models/Image');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, 'public/uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = file.originalname.replace(ext, '').toLowerCase().replace(/[^a-z0-9]/g, '-');
        cb(null, name + '-' + uniqueSuffix + ext);
    }
});

const fileFilter = (req, file, cb) => {
    // Get allowed file types from environment or use defaults
    const allowedTypes = (process.env.UPLOAD_ALLOWED_TYPES || 'image/jpeg,image/png,image/jpg,image/gif,image/webp').split(',');
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Only these file types are allowed: ${allowedTypes.join(', ')}`), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: parseInt(process.env.UPLOAD_MAX_FILE_SIZE) || (5 * 1024 * 1024), // 5MB default
    }
});

const app = express();
const PORT = process.env.PORT || 3000;

// Logging setup
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);
const accessLogStream = fs.createWriteStream(path.join(logsDir, 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));
app.use(morgan('dev'));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Request tracking
app.use((req, res, next) => {
    req.timestamp = new Date().toISOString();
    req.requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    next();
});

// Response time tracking (for monitoring only)
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        // Response time logging removed for production
    });
    next();
});

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Serve CSS and JS files with proper paths
app.get('/css/styles.css', (req, res) => res.sendFile(path.join(__dirname, 'public/css/styles.css')));
app.get('/js/theme.js', (req, res) => res.sendFile(path.join(__dirname, 'public/js/theme.js')));
app.get('/js/booking.js', (req, res) => res.sendFile(path.join(__dirname, 'public/js/booking.js')));
app.get('/js/auth-nav.js', (req, res) => res.sendFile(path.join(__dirname, 'public/js/auth-nav.js')));

// Backward compatibility routes (optional)
app.get('/styles.css', (req, res) => res.redirect('/css/styles.css'));
app.get('/theme.js', (req, res) => res.redirect('/js/theme.js'));
app.get('/booking.js', (req, res) => res.redirect('/js/booking.js'));
app.get('/auth-nav.js', (req, res) => res.redirect('/js/auth-nav.js'));

// Authentication Routes
// Register endpoint
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName, phone } = req.body;

        // Validate required fields
        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Hash password
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user
        const newUser = new User({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            phone: phone || ''
        });

        await newUser.save();

        // Generate JWT token with session
        const token = await generateToken(newUser, req);

        // Set cookie
        const cookieMaxAge = (parseInt(process.env.COOKIE_MAX_AGE_HOURS) || 24) * 60 * 60 * 1000;
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: cookieMaxAge
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                id: newUser._id,
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                phone: newUser.phone
            },
            token
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token with session
        const token = await generateToken(user, req);

        // Set cookie
        const cookieMaxAge = (parseInt(process.env.COOKIE_MAX_AGE_HOURS) || 24) * 60 * 60 * 1000;
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: cookieMaxAge
        });

        // Determine redirect URL based on user role
        const redirectUrl = user.role === 'admin' ? '/admin/dashboard' : '/dashboard';

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                role: user.role || 'user'
            },
            token,
            redirectUrl
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Logout endpoint
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
    try {
        // Invalidate the current session
        await invalidateSession(req.user.sessionId);
        
        res.clearCookie('token');
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.clearCookie('token');
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    }
});

// Logout from all devices endpoint
app.post('/api/auth/logout-all', authenticateToken, async (req, res) => {
    try {
        // Invalidate all sessions for the current user
        await invalidateAllUserSessions(req.user.userId);
        
        res.clearCookie('token');
        res.json({
            success: true,
            message: 'Logged out from all devices successfully'
        });
    } catch (error) {
        console.error('Logout all error:', error);
        res.clearCookie('token');
        res.json({
            success: true,
            message: 'Logged out from all devices successfully'
        });
    }
});

// Get current user endpoint
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                role: user.role || 'user'
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Protected booking endpoint
app.post('/api/bookings', authenticateToken, async (req, res) => {
    try {
        const { bookingDate, bookingTime, partySize, occasion, preferences, specialRequests } = req.body;

        // Validate required fields
        if (!bookingDate || !bookingTime || !partySize) {
            return res.status(400).json({
                success: false,
                message: 'Please provide booking date, time, and party size'
            });
        }

        // Create new booking
        const newBooking = new Booking({
            userId: req.user.userId,
            bookingDate,
            bookingTime,
            partySize: parseInt(partySize),
            occasion: occasion || '',
            preferences: preferences || [],
            specialRequests: specialRequests || ''
        });

        await newBooking.save();

        // Populate user details
        await newBooking.populate('userId', 'firstName lastName email phone');

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            booking: newBooking
        });

    } catch (error) {
        console.error('Booking creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create booking'
        });
    }
});

// Get user bookings
app.get('/api/bookings', authenticateToken, async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user.userId })
            .populate('userId', 'firstName lastName email phone')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            bookings
        });

    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch bookings'
        });
    }
});

// Cancel/Delete booking
app.delete('/api/bookings/:id', authenticateToken, async (req, res) => {
    try {
        const booking = await Booking.findOne({
            _id: req.params.id,
            userId: req.user.userId
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        booking.status = 'cancelled';
        await booking.save();

        res.json({
            success: true,
            message: 'Booking cancelled successfully'
        });

    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel booking'
        });
    }
});

// ============ CATEGORY API ENDPOINTS ============

// Get all categories
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.json({
            success: true,
            categories: categories
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load categories'
        });
    }
});

// Create new category
app.post('/api/categories', requireAdmin, async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Category name is required'
            });
        }

        // Check if category already exists
        const existingCategory = await Category.findOne({ name: name.trim() });
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'Category with this name already exists'
            });
        }

        const category = new Category({
            name: name.trim(),
            description: description ? description.trim() : ''
        });

        await category.save();
        
        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            category: category
        });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create category'
        });
    }
});

// Update category
app.put('/api/categories/:id', requireAdmin, async (req, res) => {
    try {
        const { name, description } = req.body;
        const categoryId = req.params.id;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Category name is required'
            });
        }

        // Check if another category with the same name exists
        const existingCategory = await Category.findOne({ 
            name: name.trim(),
            _id: { $ne: categoryId }
        });
        
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'Category with this name already exists'
            });
        }

        const category = await Category.findByIdAndUpdate(
            categoryId,
            {
                name: name.trim(),
                description: description ? description.trim() : ''
            },
            { new: true }
        );

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.json({
            success: true,
            message: 'Category updated successfully',
            category: category
        });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update category'
        });
    }
});

// Delete category
app.delete('/api/categories/:id', requireAdmin, async (req, res) => {
    try {
        const categoryId = req.params.id;

        // Check if category has menu items
        const menuItemsCount = await MenuItem.countDocuments({ category: categoryId });
        if (menuItemsCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete category. It has ${menuItemsCount} menu items. Please delete or move the menu items first.`
            });
        }

        const category = await Category.findByIdAndDelete(categoryId);
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete category'
        });
    }
});

// ============ MENU ITEMS API ENDPOINTS ============

// Get all menu items
app.get('/api/menu-items', async (req, res) => {
    try {
        const menuItems = await MenuItem.find().sort({ name: 1 });
        res.json({
            success: true,
            items: menuItems
        });
    } catch (error) {
        console.error('Get menu items error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load menu items'
        });
    }
});

// Create new menu item
app.post('/api/menu-items', requireAdmin, async (req, res) => {
    try {
        const { name, description, price, imageUrl, imageId, categoryId } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Menu item name is required'
            });
        }

        if (!price || price <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid price is required'
            });
        }

        if (!categoryId) {
            return res.status(400).json({
                success: false,
                message: 'Category is required'
            });
        }

        // Verify category exists
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(400).json({
                success: false,
                message: 'Selected category does not exist'
            });
        }

        const menuItem = new MenuItem({
            name: name.trim(),
            description: description ? description.trim() : '',
            price: parseFloat(price),
            category: categoryId,
            image: imageId || null,
            imageUrl: imageUrl ? imageUrl.trim() : ''
        });

        await menuItem.save();
        
        res.status(201).json({
            success: true,
            message: 'Menu item created successfully',
            item: menuItem
        });
    } catch (error) {
        console.error('Create menu item error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create menu item'
        });
    }
});

// Update menu item
app.put('/api/menu-items/:id', requireAdmin, async (req, res) => {
    try {
        const { name, description, price, imageUrl, imageId, categoryId } = req.body;
        const itemId = req.params.id;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Menu item name is required'
            });
        }

        if (!price || price <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid price is required'
            });
        }

        if (!categoryId) {
            return res.status(400).json({
                success: false,
                message: 'Category is required'
            });
        }

        // Verify category exists
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(400).json({
                success: false,
                message: 'Selected category does not exist'
            });
        }

        const menuItem = await MenuItem.findByIdAndUpdate(
            itemId,
            {
                name: name.trim(),
                description: description ? description.trim() : '',
                price: parseFloat(price),
                category: categoryId,
                image: imageId || null,
                imageUrl: imageUrl ? imageUrl.trim() : ''
            },
            { new: true }
        );

        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found'
            });
        }

        res.json({
            success: true,
            message: 'Menu item updated successfully',
            item: menuItem
        });
    } catch (error) {
        console.error('Update menu item error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update menu item'
        });
    }
});

// Delete menu item
app.delete('/api/menu-items/:id', requireAdmin, async (req, res) => {
    try {
        const itemId = req.params.id;

        const menuItem = await MenuItem.findByIdAndDelete(itemId);
        
        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found'
            });
        }

        res.json({
            success: true,
            message: 'Menu item deleted successfully'
        });
    } catch (error) {
        console.error('Delete menu item error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete menu item'
        });
    }
});

// ============ IMAGES API ENDPOINTS ============

// Upload image
app.post('/api/images/upload', requireAdmin, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }

        const { category = 'general', alt = '', description = '' } = req.body;

        // Create image record in database
        const imageRecord = new Image({
            filename: req.file.filename,
            originalName: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            path: req.file.path,
            url: `/uploads/${req.file.filename}`,
            category,
            alt,
            description
        });

        await imageRecord.save();

        res.json({
            success: true,
            message: 'Image uploaded successfully',
            image: {
                id: imageRecord._id,
                filename: imageRecord.filename,
                originalName: imageRecord.originalName,
                url: imageRecord.url,
                category: imageRecord.category,
                alt: imageRecord.alt,
                description: imageRecord.description
            }
        });
    } catch (error) {
        console.error('Image upload error:', error);
        // Clean up uploaded file if database save fails
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({
            success: false,
            message: 'Failed to upload image'
        });
    }
});

// Get all images
app.get('/api/images', async (req, res) => {
    try {
        const { category, limit = 50, page = 1 } = req.query;
        
        let filter = { isActive: true };
        if (category) {
            filter.category = category;
        }

        const images = await Image.find(filter)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .select('-path'); // Don't expose file system paths

        const totalImages = await Image.countDocuments(filter);

        res.json({
            success: true,
            images: images,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalImages / parseInt(limit)),
                totalImages: totalImages,
                hasMore: (parseInt(page) * parseInt(limit)) < totalImages
            }
        });
    } catch (error) {
        console.error('Get images error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve images'
        });
    }
});

// Get image by ID
app.get('/api/images/:id', async (req, res) => {
    try {
        const image = await Image.findById(req.params.id);
        
        if (!image) {
            return res.status(404).json({
                success: false,
                message: 'Image not found'
            });
        }

        res.json({
            success: true,
            image: {
                id: image._id,
                filename: image.filename,
                originalName: image.originalName,
                url: image.url,
                category: image.category,
                alt: image.alt,
                description: image.description,
                mimetype: image.mimetype,
                size: image.size,
                createdAt: image.createdAt
            }
        });
    } catch (error) {
        console.error('Get image error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve image'
        });
    }
});

// Update image metadata
app.put('/api/images/:id', requireAdmin, async (req, res) => {
    try {
        const { category, alt, description } = req.body;
        
        const image = await Image.findByIdAndUpdate(
            req.params.id,
            { 
                ...(category && { category }),
                ...(alt !== undefined && { alt }),
                ...(description !== undefined && { description })
            },
            { new: true, runValidators: true }
        );

        if (!image) {
            return res.status(404).json({
                success: false,
                message: 'Image not found'
            });
        }

        res.json({
            success: true,
            message: 'Image updated successfully',
            image: {
                id: image._id,
                filename: image.filename,
                originalName: image.originalName,
                url: image.url,
                category: image.category,
                alt: image.alt,
                description: image.description
            }
        });
    } catch (error) {
        console.error('Update image error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update image'
        });
    }
});

// Delete image
app.delete('/api/images/:id', requireAdmin, async (req, res) => {
    try {
        const image = await Image.findById(req.params.id);
        
        if (!image) {
            return res.status(404).json({
                success: false,
                message: 'Image not found'
            });
        }

        // Check if image is being used by menu items or categories
        const menuItemsUsingImage = await MenuItem.countDocuments({ image: image._id });
        const categoriesUsingImage = await Category.countDocuments({ image: image._id });
        
        if (menuItemsUsingImage > 0 || categoriesUsingImage > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete image. It is being used by ${menuItemsUsingImage} menu item(s) and ${categoriesUsingImage} categor(ies).`
            });
        }

        // Delete file from filesystem
        if (fs.existsSync(image.path)) {
            fs.unlinkSync(image.path);
        }

        // Delete from database
        await Image.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Image deleted successfully'
        });
    } catch (error) {
        console.error('Delete image error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete image'
        });
    }
});

// Bulk upload images
app.post('/api/images/bulk-upload', requireAdmin, upload.array('images', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No image files provided'
            });
        }

        const { category = 'general' } = req.body;
        const uploadedImages = [];
        const errors = [];

        for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];
            
            try {
                const imageRecord = new Image({
                    filename: file.filename,
                    originalName: file.originalname,
                    mimetype: file.mimetype,
                    size: file.size,
                    path: file.path,
                    url: `/uploads/${file.filename}`,
                    category,
                    alt: file.originalname.replace(/\.[^/.]+$/, ""), // Remove extension for alt text
                    description: `Uploaded image: ${file.originalname}`
                });

                await imageRecord.save();
                uploadedImages.push({
                    id: imageRecord._id,
                    filename: imageRecord.filename,
                    originalName: imageRecord.originalName,
                    url: imageRecord.url,
                    category: imageRecord.category
                });
            } catch (error) {
                errors.push({
                    filename: file.originalname,
                    error: error.message
                });
                // Clean up failed upload
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            }
        }

        res.json({
            success: true,
            message: `Successfully uploaded ${uploadedImages.length} image(s)`,
            uploaded: uploadedImages,
            errors: errors
        });
    } catch (error) {
        console.error('Bulk upload error:', error);
        // Clean up any uploaded files on error
        if (req.files) {
            req.files.forEach(file => {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to upload images'
        });
    }
});

// ============ DEBUG API ENDPOINTS ============

// Debug endpoint to check menu data
app.get('/api/debug/menu', async (req, res) => {
    try {
        const categories = await Category.find({});
        const menuItems = await MenuItem.find({}).populate('image');
        const images = await Image.find({});
        
        res.json({
            success: true,
            debug: {
                categories: categories.map(cat => ({ id: cat._id, name: cat.name })),
                menuItems: menuItems.map(item => ({
                    id: item._id,
                    name: item.name,
                    category: item.category,
                    image: item.image,
                    imageUrl: item.imageUrl
                })),
                images: images.map(img => ({ id: img._id, filename: img.filename, url: img.url }))
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============ USERS API ENDPOINTS ============

// Get all users (admin only)
app.get('/api/users', requireAdmin, async (req, res) => {
    try {
        const users = await User.find({}, '-password').sort({ createdAt: -1 });
        res.json({
            success: true,
            users: users
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load users'
        });
    }
});

// Frontend routes - now serving from public folder
app.get('/', optionalAuth, (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));
app.get('/home', optionalAuth, (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));
app.get('/menu', optionalAuth, (req, res) => res.sendFile(path.join(__dirname, 'public/menu.html')));
app.get('/contact', optionalAuth, (req, res) => res.sendFile(path.join(__dirname, 'public/contact.html')));

// Protected booking page - requires authentication
app.get('/booking', authenticateToken, (req, res) => res.sendFile(path.join(__dirname, 'public/booking.html')));

// Login page
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public/login.html')));

// Register page
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'public/register.html')));

// Dashboard page - requires authentication
app.get('/dashboard', authenticateToken, (req, res) => res.sendFile(path.join(__dirname, 'public/dashboard.html')));

// Admin dashboard - requires admin authentication
app.get('/admin/dashboard', requireAdmin, (req, res) => res.sendFile(path.join(__dirname, 'public/admin/dashboard.html')));

app.get('/about', (req, res) => {
    const aboutHTML = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>About - The Midnight Brew</title>
            <style>
                body { font-family: 'Georgia', serif; max-width: 800px; margin: 50px auto; padding: 20px; background-color: #1a1a1a; color: #f5f5f5; line-height: 1.6; }
                h1 { color: #d4a574; border-bottom: 2px solid #d4a574; padding-bottom: 10px; }
                h2 { color: #c89666; margin-top: 30px; }
                .highlight { color: #d4a574; font-weight: bold; }
                a { color: #d4a574; text-decoration: none; }
                a:hover { text-decoration: underline; }
            </style>
        </head>
        <body>
            <h1>☕ About The Midnight Brew</h1>
            <h2>Our Story</h2>
            <p>Welcome to <span class="highlight">The Midnight Brew</span> - a cozy late-night café where coffee meets creativity.</p>
            <h2>Our Mission</h2>
            <p>We provide a welcoming space where you can work, relax, create, or simply enjoy a perfectly crafted cup of coffee at any hour.</p>
            <p><a href="/">← Back to Home</a> | <a href="/menu">View Menu →</a> | <a href="/contact">Contact Us →</a></p>
        </body>
        </html>`;
    res.send(aboutHTML);
});

// API routes
app.get('/api/info', (req, res) => {
    const cafeInfo = {
        success: true,
        data: {
            name: 'The Midnight Brew',
            tagline: 'A cozy late-night café where coffee meets creativity',
            established: '2020',
            hours: { weekdays: '10:00 AM - 12:00 AM', weekends: '10:00 AM - 2:00 AM' },
            location: { address: '123 Coffee Street, Brew City', zipCode: '12345' },
            contact: { email: 'info@themidnightbrew.com', phone: '+1 (555) 123-4567' }
        }
    };
    res.json(cafeInfo);
});

app.get('/api/menu', async (req, res) => {
    try {
        // Fetch categories from database
        const categories = await Category.find({ }).sort({ name: 1 });
        
        // Fetch menu items from database with populated image and category data
        const menuItems = await MenuItem.find({ available: true })
            .populate('image', 'url alt originalName')
            .populate('category', 'name')
            .sort({ name: 1 });

        // Transform data for frontend
        const categoryNames = categories.map(cat => cat.name);
        const items = menuItems.map(item => ({
            id: item._id,
            name: item.name,
            category: item.category ? item.category.name : 'Uncategorized',
            price: item.price,
            description: item.description || '',
            image: item.image ? item.image.url : (item.imageUrl || '/uploads/placeholder.jpg'),
            alt: item.image ? item.image.alt : item.name,
            available: item.available
        }));

        const menuData = {
            success: true,
            timestamp: new Date().toISOString(),
            data: {
                categories: categoryNames,
                items: items
            }
        };
        
        res.json(menuData);
        
    } catch (error) {
        console.error('Menu fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch menu data'
        });
    }
});

app.get('/api/menu/:category', async (req, res) => {
    try {
        const category = req.params.category;
        
        // Find menu items in the specified category
        const menuItems = await MenuItem.find({ 
            category: { $regex: new RegExp(category, 'i') }, 
            available: true 
        })
        .populate('image', 'url alt originalName')
        .sort({ name: 1 });
        
        if (menuItems.length > 0) {
            const items = menuItems.map(item => ({
                id: item._id,
                name: item.name,
                category: item.category,
                price: item.price,
                description: item.description || '',
                image: item.image ? item.image.url : (item.imageUrl || '/uploads/placeholder.jpg'),
                alt: item.image ? item.image.alt : item.name,
                available: item.available
            }));
            
            res.json({ 
                success: true, 
                category: category, 
                count: items.length, 
                items: items 
            });
        } else {
            res.status(404).json({ 
                success: false, 
                message: `No items found in category: ${category}` 
            });
        }
        
    } catch (error) {
        console.error('Menu category fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch menu items for category'
        });
    }
});

app.get('/api/booking/timeslots', (req, res) => {
    const timeSlots = {
        success: true,
        date: req.query.date || new Date().toISOString().split('T')[0],
        data: {
            lunch: [{ time: '11:00 AM', available: true }, { time: '12:00 PM', available: true }],
            afternoon: [{ time: '2:00 PM', available: true }, { time: '3:00 PM', available: true }],
            dinner: [{ time: '6:00 PM', available: true }, { time: '7:00 PM', available: true }],
            lateNight: [{ time: '8:00 PM', available: true }, { time: '9:00 PM', available: true }]
        }
    };
    res.json(timeSlots);
});

app.get('/api/featured', (req, res) => {
    const featuredData = {
        success: true,
        data: {
            itemOfTheDay: { name: 'Midnight Latte', description: 'Special blend with vanilla and caramel', price: 5.50 },
            mostPopular: [
                { id: 5, name: 'Latte', orders: 145, rating: 4.8 },
                { id: 2, name: 'Chocolate Croissant', orders: 132, rating: 4.9 }
            ]
        }
    };
    res.json(featuredData);
});

app.get('/api/hours', (req, res) => {
    const hoursText = `THE MIDNIGHT BREW - OPERATING HOURS
Monday-Friday: 10:00 AM - 12:00 AM
Saturday-Sunday: 10:00 AM - 2:00 AM
Call us: +1 (555) 123-4567`;
    res.type('text/plain').send(hoursText);
});

app.get('/api/welcome', (req, res) => {
    res.send('Welcome to The Midnight Brew! ☕ Where coffee meets creativity. 🌙');
});

app.get('/api/specials', (req, res) => {
    const specialsData = {
        success: true,
        date: new Date().toISOString().split('T')[0],
        data: {
            dailySpecials: [
                { id: 1, name: 'Midnight Combo', description: 'Any coffee + any pastry', price: 7.00, validUntil: '11:59 PM' }
            ]
        }
    };
    res.json(specialsData);
});

app.get('/api/status', (req, res) => {
    const statusData = {
        success: true,
        server: 'The Midnight Brew API',
        status: 'online',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    };
    res.json(statusData);
});

app.get('/api/health', (req, res) => {
    res.json({ success: true, status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/api/admin/categories', requireAdmin, async (req, res) => {
    try{
        const categories = await Category.find().sort({createdAt: -1});
        res.json({
            success: true,
            message: 'Categories retrieved successfully',
            categories: categories
        });
    }
    catch (error){
        res.status(500).json({
            success: false,
            message: 'Error fetching categories',
            error: error.message
        });
    }
});

app.post('/api/admin/categories', requireAdmin, async (req, res) => {
    try{
        const {name, description} = req.body;

        if(!name){
             return res.status(400).json({
                success: false,
                message: 'Category name is required'
            });
        }

        const category = new Category({
            name: name.trim(),
            description: description?.trim()
        });

        await category.save();

          res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: category
        });
    } catch (error){
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Category name already exists'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error creating category',
            error: error.message
        });
    }
});

app.put('/api/admin/categories/:id', requireAdmin, async (req, res) => {
    try {
        const { name, description } = req.body;
        const categoryId = req.params.id;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Category name is required'
            });
        }

        const category = await Category.findByIdAndUpdate(
            categoryId,
            {
                name: name.trim(),
                description: description?.trim()
            },
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.json({
            success: true,
            message: 'Category updated successfully',
            data: category
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Category name already exists'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error updating category',
            error: error.message
        });
    }
});

app.delete('/api/admin/categories/:id', requireAdmin, async (req, res) => {
    try {
        const categoryId = req.params.id;

        const menuItemsUsingCategory = await MenuItem.countDocuments({ category: categoryId });
        if (menuItemsUsingCategory > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete category. ${menuItemsUsingCategory} menu items are using this category.`
            });
        }

        const category = await Category.findByIdAndDelete(categoryId);
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.json({
            success: true,
            message: 'Category deleted successfully',
            data: category
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting category',
            error: error.message
        });
    }
});

app.get('/api/admin/menu-items', requireAdmin, async (req, res) => {
    try {
        const menuItems = await MenuItem.find()
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            message: 'Menu items retrieved successfully',
            items: menuItems
        });
    } catch (error) {
        console.error('Error fetching menu items:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching menu items',
            error: error.message
        });
    }
});

app.get('/api/admin/menu-items/:id', requireAdmin, async (req, res) => {
    try {
        const menuItem = await MenuItem.findById(req.params.id);
        
        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found'
            });
        }

        res.json({
            success: true,
            message: 'Menu item retrieved successfully',
            data: menuItem
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching menu item',
            error: error.message
        });
    }
});

app.post('/api/admin/menu-items', requireAdmin, async (req, res) => {
    try {
        const { name, description, price, category, image, available } = req.body;
        
        console.log('Creating menu item with data:', { name, description, price, category, image, available });
        
        if (!name || !price || !category) {
            return res.status(400).json({
                success: false,
                message: 'Name, price, and category are required'
            });
        }

        if (price <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Price must be greater than 0'
            });
        }

        // Check if category exists by name (since we store category as string)
        const categoryExists = await Category.findOne({ name: category });
        if (!categoryExists) {
            return res.status(400).json({
                success: false,
                message: `Category '${category}' does not exist`
            });
        }

        const menuItem = new MenuItem({
            name: name.trim(),
            description: description?.trim() || '',
            price: parseFloat(price),
            category: category,
            image: image || '',
            available: available !== undefined ? available : true
        });

        await menuItem.save();

        res.status(201).json({
            success: true,
            message: 'Menu item created successfully',
            item: menuItem
        });
    } catch (error) {
        console.error('Error creating menu item:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating menu item',
            error: error.message
        });
    }
});

app.put('/api/admin/menu-items/:id', requireAdmin, async (req, res) => {
    try {
        const { name, description, price, category, image, available } = req.body;
        const menuItemId = req.params.id;

        console.log('Updating menu item:', menuItemId, 'with data:', { name, description, price, category, image, available });

        if (name && !name.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Name cannot be empty'
            });
        }

        if (price && price <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Price must be greater than 0'
            });
        }

        if (category) {
            // Check if category exists by name (since we store category as string)
            const categoryExists = await Category.findOne({ name: category });
            if (!categoryExists) {
                return res.status(400).json({
                    success: false,
                    message: `Category '${category}' does not exist`
                });
            }
        }

        const updateData = {};
        if (name) updateData.name = name.trim();
        if (description !== undefined) updateData.description = description?.trim() || '';
        if (price) updateData.price = parseFloat(price);
        if (category) updateData.category = category;
        if (image !== undefined) updateData.image = image;
        if (available !== undefined) updateData.available = available;

        const menuItem = await MenuItem.findByIdAndUpdate(
            menuItemId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found'
            });
        }

        res.json({
            success: true,
            message: 'Menu item updated successfully',
            item: menuItem
        });
    } catch (error) {
        console.error('Error updating menu item:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating menu item',
            error: error.message
        });
    }
});

app.delete('/api/admin/menu-items/:id', requireAdmin, async (req, res) => {
    try {
        const menuItemId = req.params.id;

        const menuItem = await MenuItem.findByIdAndDelete(menuItemId);
        
        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found'
            });
        }

        res.json({
            success: true,
            message: 'Menu item deleted successfully',
            data: menuItem
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting menu item',
            error: error.message
        });
    }
});

app.patch('/api/admin/menu-items/:id/availability', requireAdmin, async (req, res) => {
    try {
        const menuItemId = req.params.id;
        const { available } = req.body;

        if (typeof available !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'Available must be a boolean value'
            });
        }

        const menuItem = await MenuItem.findByIdAndUpdate(
            menuItemId,
            { available },
            { new: true }
        );

        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found'
            });
        }

        res.json({
            success: true,
            message: `Menu item ${available ? 'enabled' : 'disabled'} successfully`,
            data: menuItem
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating menu item availability',
            error: error.message
        });
    }
});

// Error handlers
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        error: 'Not Found',
        statusCode: 404,
        requestedUrl: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
    });
});

app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    const statusCode = err.statusCode || err.status || 500;
    res.status(statusCode).json({
        success: false,
        error: err.name || 'Internal Server Error',
        statusCode: statusCode,
        message: err.message || 'An unexpected error occurred',
        timestamp: new Date().toISOString()
    });
});

// Initialize MongoDB connection and start server
const startServer = async () => {
    try {
        await // Connect to database
connectDB();

// Optional one-time seeding function (commented out for production)
// Uncomment this if you need to seed initial data on first run
/*
async function seedInitialData() {
    try {
        // Only seed if completely empty database
        const categoriesCount = await Category.countDocuments();
        const menuItemsCount = await MenuItem.countDocuments();
        
        if (categoriesCount === 0 && menuItemsCount === 0) {
            console.log('Seeding initial data for first run...');
            
            // Create categories first
            const categories = await Category.create([
                { name: 'Beverages', description: 'Hot and cold beverages' },
                { name: 'Pastries', description: 'Fresh baked pastries and desserts' }
            ]);
            
            // Create menu items with proper category references
            await MenuItem.create([
                { name: 'Espresso', category: categories[0]._id, price: 2.50, description: 'Rich, bold coffee shot', available: true },
                { name: 'Blueberry Muffin', category: categories[1]._id, price: 3.50, description: 'Fresh blueberries with golden crumb', available: true }
            ]);
            
            console.log('Initial data seeded successfully');
        }
    } catch (error) {
        console.error('Seeding error:', error.message);
    }
}

// Run once on server start only if needed
// seedInitialData();
*/
        
        // Invalidate all existing sessions on server restart
        await Session.updateMany({}, { isActive: false });
        
        // Clean up expired sessions
        await cleanupExpiredSessions();
        
        const server = app.listen(PORT, () => {
            console.log(`🚀 The Midnight Brew Server running at http://localhost:${PORT}`);
        });
        
        // Graceful shutdown
        process.on('SIGTERM', () => {
            console.log('SIGTERM received. Shutting down gracefully...');
            server.close(() => {
                console.log('Process terminated');
            });
        });
        
        return server;
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Start the server
startServer();

module.exports = { app };