const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({

    name: {
        type: String,
        maxlength: 100,
        required: true,
        trim: true,
        unique: true
    },

    description:{
        type: String,
        maxlength: 500,
        trim: true
    }
},{
    timestamps: true
});

const Category = mongoose.model('Category', CategorySchema);
module.exports = Category;