const fs = require('fs');
const path = require('path');
require('dotenv').config();

const connectDB = require('../config/database');
const Image = require('../models/Image');
const MenuItem = require('../models/MenuItem');
const Category = require('../models/Category');

// Menu data with proper categories and descriptions
const menuData = {
    categories: [
        { name: 'Pastries', description: 'Fresh baked goods and sweet treats' },
        { name: 'Beverages', description: 'Hot and cold drinks to warm your soul' },
        { name: 'Sandwiches', description: 'Hearty sandwiches made with love' },
        { name: 'Soups', description: 'Warm, comforting soups for any season' }
    ],
    items: [
        { name: 'Blueberry Muffin', category: 'Pastries', price: 3.50, description: 'Fresh blueberries with golden crumb', imageFile: 'bluberry muffin.jpg' },
        { name: 'Chocolate Croissant', category: 'Pastries', price: 4.25, description: 'Buttery pastry with dark chocolate', imageFile: 'chocolate crossiant.jpg' },
        { name: 'Apple Turnover', category: 'Pastries', price: 3.75, description: 'Warm spiced apples in puff pastry', imageFile: 'apple turnover.jpg' },
        { name: 'Espresso', category: 'Beverages', price: 2.50, description: 'Rich, bold coffee shot', imageFile: 'hot1.jpg' },
        { name: 'Latte', category: 'Beverages', price: 4.50, description: 'Smooth espresso with steamed milk', imageFile: 'hot2.webp' },
        { name: 'Cappuccino', category: 'Beverages', price: 4.00, description: 'Espresso with thick foam', imageFile: 'hot3.jpg' },
        { name: 'BLT Sandwich', category: 'Sandwiches', price: 8.99, description: 'Classic bacon, lettuce, tomato', imageFile: 'Blt.jpg' },
        { name: 'Club Sandwich', category: 'Sandwiches', price: 9.50, description: 'Triple-decker delight', imageFile: 'club sandwitch.avif' },
        { name: 'Grilled Cheese', category: 'Sandwiches', price: 7.50, description: 'Three cheese blend', imageFile: 'grilled.webp' },
        { name: 'Tomato Basil Soup', category: 'Soups', price: 6.50, description: 'Creamy with fresh basil', imageFile: 'tomato.jpg' },
        { name: 'Broccoli Cheddar Soup', category: 'Soups', price: 6.75, description: 'Rich and cheesy', imageFile: 'brocalli cheddar soup.jpg' },
        { name: 'Chinese Noodle Soup', category: 'Soups', price: 7.25, description: 'Savory broth with noodles', imageFile: 'chinese noodle soup.jpg' }
    ]
};

async function seedMenuData() {
    try {
        console.log('🔌 Connecting to database...');
        await connectDB();
        
        console.log('🗑️  Clearing existing menu data...');
        await MenuItem.deleteMany({});
        await Category.deleteMany({});
        
        console.log('📂 Creating categories...');
        const createdCategories = {};
        
        for (const categoryData of menuData.categories) {
            const category = new Category({
                name: categoryData.name,
                description: categoryData.description
            });
            
            await category.save();
            createdCategories[categoryData.name] = category._id;
            console.log(`✅ Created category: ${categoryData.name}`);
        }
        
        console.log('🍽️  Creating menu items...');
        const images = await Image.find({});
        
        for (const itemData of menuData.items) {
            // Find the corresponding image
            const image = images.find(img => 
                img.originalName === itemData.imageFile
            );
            
            if (!image) {
                console.log(`⚠️  Image not found for ${itemData.name} (${itemData.imageFile})`);
            }
            
            const menuItem = new MenuItem({
                name: itemData.name,
                description: itemData.description,
                price: itemData.price,
                category: createdCategories[itemData.category],
                image: image ? image._id : null,
                imageUrl: image ? image.url : '',
                available: true
            });
            
            await menuItem.save();
            console.log(`✅ Created menu item: ${itemData.name} ${image ? '(with image)' : '(no image)'}`);
        }
        
        console.log('✨ Menu data seeding completed successfully!');
        
        // Verify the data
        const categoryCount = await Category.countDocuments();
        const menuItemCount = await MenuItem.countDocuments();
        const itemsWithImages = await MenuItem.countDocuments({ image: { $ne: null } });
        
        console.log('📊 Summary:');
        console.log(`   - Categories created: ${categoryCount}`);
        console.log(`   - Menu items created: ${menuItemCount}`);
        console.log(`   - Items with images: ${itemsWithImages}`);
        console.log(`   - Items without images: ${menuItemCount - itemsWithImages}`);
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

// Run the seeder
if (require.main === module) {
    seedMenuData();
}

module.exports = { seedMenuData };