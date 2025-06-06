// models/MenuItem.js
// ================================
const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Menu item name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['appetizer', 'main', 'dessert', 'beverage', 'salad'],
      message: '{VALUE} is not a valid category'
    }
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  ingredients: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true
  }],
  availability: {
    type: Boolean,
    default: true
  },
  imageUrl: {
    type: String,
    trim: true
  },
  nutritionalInfo: {
    calories: {
      type: Number,
      min: 0
    },
    protein: {
      type: Number,
      min: 0
    },
    carbs: {
      type: Number,
      min: 0
    },
    fat: {
      type: Number,
      min: 0
    }
  },
  customizationOptions: [{
    name: {
      type: String,
      required: true
    },
    options: [String],
    additionalPrice: {
      type: Number,
      default: 0,
      min: 0
    }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
menuItemSchema.index({ name: 'text', description: 'text' });
menuItemSchema.index({ category: 1 });
menuItemSchema.index({ tags: 1 });
menuItemSchema.index({ price: 1 });
menuItemSchema.index({ availability: 1 });

module.exports = mongoose.model('MenuItem', menuItemSchema);