const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { 
    type: String, 
    enum: ['Breakfast', 'Main Course', 'Snacks', 'Beverages', 'Desserts', 'Thali'],
    required: true 
  },
  emoji: { type: String, default: '🍽️' },
  imageUrl: { type: String, default: '' },
  station: { type: String, required: true },
  hotelName: { type: String, required: true },
  hotelRating: { type: Number, default: 4.0 },
  isVeg: { type: Boolean, default: true },
  isAvailable: { type: Boolean, default: true },
  prepTime: { type: Number, default: 15 }, // minutes
  calories: { type: Number, default: 0 },
  tags: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('FoodItem', foodItemSchema);
