/**
 * seedFood.js — Seeds railway station food court data
 * Run with: node seedFood.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const FoodItem = require('./models/FoodItem');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/trackmytrain';

const foodItems = [
  // ─── Chennai Central ───
  { name: 'Chicken Biryani', description: 'Fragrant basmati rice cooked with tender chicken, saffron & aromatic spices', price: 180, category: 'Main Course', emoji: '🍛', station: 'Chennai', hotelName: 'Saravana Bhavan Express', hotelRating: 4.5, isVeg: false, prepTime: 15, calories: 620, tags: ['bestseller', 'spicy'] },
  { name: 'Masala Dosa', description: 'Crispy golden dosa filled with spiced potato masala, served with sambar & chutneys', price: 80, category: 'Breakfast', emoji: '🫓', station: 'Chennai', hotelName: 'Saravana Bhavan Express', hotelRating: 4.5, isVeg: true, prepTime: 10, calories: 320, tags: ['popular', 'veg'] },
  { name: 'Idli Sambar (6 pcs)', description: 'Soft steamed idlis served with hot sambar and 3 types of chutney', price: 60, category: 'Breakfast', emoji: '🍚', station: 'Chennai', hotelName: 'Saravana Bhavan Express', hotelRating: 4.5, isVeg: true, prepTime: 5, calories: 240, tags: ['light', 'healthy'] },
  { name: 'Paneer Butter Masala + Naan', description: 'Creamy tomato-butter gravy with soft paneer cubes and 2 fresh naan', price: 160, category: 'Main Course', emoji: '🫕', station: 'Chennai', hotelName: 'Hotel Sree Krishna', hotelRating: 4.2, isVeg: true, prepTime: 12, calories: 580, tags: ['popular'] },
  { name: 'Filter Coffee', description: 'Authentic South Indian filter coffee, freshly brewed with chicory blend', price: 30, category: 'Beverages', emoji: '☕', station: 'Chennai', hotelName: 'Saravana Bhavan Express', hotelRating: 4.5, isVeg: true, prepTime: 3, calories: 80, tags: ['must-try'] },
  { name: 'Veg Thali', description: 'Complete meal — rice, dal, 2 sabzis, roti, raita, pickle & papad', price: 120, category: 'Thali', emoji: '🍽️', station: 'Chennai', hotelName: 'Hotel Sree Krishna', hotelRating: 4.2, isVeg: true, prepTime: 8, calories: 750, tags: ['value', 'complete meal'] },
  { name: 'Samosa (2 pcs)', description: 'Crispy golden pastry filled with spiced potatoes and peas', price: 25, category: 'Snacks', emoji: '🥟', station: 'Chennai', hotelName: 'Station Snack Bar', hotelRating: 3.9, isVeg: true, prepTime: 5, calories: 280, tags: ['quick', 'popular'] },
  { name: 'Cold Lassi', description: 'Thick chilled yogurt drink — sweet or salted, topped with cream', price: 45, category: 'Beverages', emoji: '🥛', station: 'Chennai', hotelName: 'Station Snack Bar', hotelRating: 3.9, isVeg: true, prepTime: 3, calories: 200, tags: ['refreshing'] },

  // ─── Mumbai ───
  { name: 'Vada Pav', description: 'Mumbai\'s iconic street food — spiced potato vada in soft pav with chutneys', price: 30, category: 'Snacks', emoji: '🍔', station: 'Mumbai', hotelName: 'Mumbai Dabba Co.', hotelRating: 4.3, isVeg: true, prepTime: 5, calories: 290, tags: ['iconic', 'must-try'] },
  { name: 'Pav Bhaji', description: 'Spiced mixed vegetable mash served with buttered pav, onion & lemon', price: 90, category: 'Snacks', emoji: '🍛', station: 'Mumbai', hotelName: 'Mumbai Dabba Co.', hotelRating: 4.3, isVeg: true, prepTime: 8, calories: 420, tags: ['popular', 'filling'] },
  { name: 'Chicken Tikka Roll', description: 'Smoky grilled chicken with onion rings & mint chutney in a flaky paratha roll', price: 130, category: 'Snacks', emoji: '🌯', station: 'Mumbai', hotelName: 'Bombay Kitchen', hotelRating: 4.4, isVeg: false, prepTime: 10, calories: 480, tags: ['bestseller'] },
  { name: 'Bombay Sandwich', description: 'Toasted with chutney, beetroot, cucumber, potato & cheese', price: 70, category: 'Breakfast', emoji: '🥪', station: 'Mumbai', hotelName: 'Bombay Kitchen', hotelRating: 4.4, isVeg: true, prepTime: 5, calories: 350, tags: ['quick'] },
  { name: 'Mango Lassi', description: 'Thick mango yogurt shake with real Alphonso mango pulp', price: 60, category: 'Beverages', emoji: '🥭', station: 'Mumbai', hotelName: 'Mumbai Dabba Co.', hotelRating: 4.3, isVeg: true, prepTime: 3, calories: 220, tags: ['refreshing', 'seasonal'] },
  { name: 'Non-Veg Thali', description: 'Rice, dal makhani, chicken curry, 2 roti, raita, salad & dessert', price: 195, category: 'Thali', emoji: '🍽️', station: 'Mumbai', hotelName: 'Bombay Kitchen', hotelRating: 4.4, isVeg: false, prepTime: 12, calories: 900, tags: ['complete meal', 'value'] },

  // ─── New Delhi ───
  { name: 'Butter Chicken + Roti', description: 'Classic rich tomato-cream gravy with tender chicken, served with 3 rotis', price: 175, category: 'Main Course', emoji: '🍗', station: 'New Delhi', hotelName: 'Delhi Express Kitchen', hotelRating: 4.6, isVeg: false, prepTime: 12, calories: 680, tags: ['bestseller', 'must-try'] },
  { name: 'Chole Bhature', description: 'Fluffy deep-fried bhature with spicy chickpea curry & pickle', price: 100, category: 'Breakfast', emoji: '🍛', station: 'New Delhi', hotelName: 'Punjabi Dhaba Rail', hotelRating: 4.4, isVeg: true, prepTime: 8, calories: 590, tags: ['popular', 'heavy'] },
  { name: 'Rajma Chawal', description: 'Red kidney beans in aromatic gravy served with steamed basmati rice', price: 110, category: 'Main Course', emoji: '🍚', station: 'New Delhi', hotelName: 'Punjabi Dhaba Rail', hotelRating: 4.4, isVeg: true, prepTime: 10, calories: 520, tags: ['comfort food'] },
  { name: 'Aloo Tikki Chaat', description: 'Crispy potato patties with yogurt, tamarind chutney & spices', price: 50, category: 'Snacks', emoji: '🥔', station: 'New Delhi', hotelName: 'Delhi Street Bites', hotelRating: 4.1, isVeg: true, prepTime: 5, calories: 310, tags: ['street food'] },
  { name: 'Sweet Lassi', description: 'Chilled creamy yogurt drink with rose water & saffron', price: 50, category: 'Beverages', emoji: '🥛', station: 'New Delhi', hotelName: 'Delhi Express Kitchen', hotelRating: 4.6, isVeg: true, prepTime: 3, calories: 190, tags: ['refreshing'] },
  { name: 'Gulab Jamun (4 pcs)', description: 'Soft milk dumplings soaked in rose-flavoured sugar syrup', price: 55, category: 'Desserts', emoji: '🍮', station: 'New Delhi', hotelName: 'Delhi Express Kitchen', hotelRating: 4.6, isVeg: true, prepTime: 2, calories: 380, tags: ['sweet', 'popular'] },

  // ─── Kolkata ───
  { name: 'Fish Curry + Rice', description: 'Bengali rohu fish in mustard oil gravy with steamed rice', price: 160, category: 'Main Course', emoji: '🐟', station: 'Kolkata', hotelName: 'Kolkata Mishti Kitchen', hotelRating: 4.5, isVeg: false, prepTime: 15, calories: 540, tags: ['local specialty'] },
  { name: 'Kathi Roll', description: 'Egg-coated paratha rolled with spiced chicken & onion, classic Kolkata style', price: 90, category: 'Snacks', emoji: '🌯', station: 'Kolkata', hotelName: 'Roll House Express', hotelRating: 4.3, isVeg: false, prepTime: 8, calories: 420, tags: ['iconic', 'must-try'] },
  { name: 'Mishti Doi', description: 'Traditional sweetened Bengali yogurt, chilled and thick', price: 45, category: 'Desserts', emoji: '🍮', station: 'Kolkata', hotelName: 'Kolkata Mishti Kitchen', hotelRating: 4.5, isVeg: true, prepTime: 2, calories: 180, tags: ['local specialty', 'sweet'] },
  { name: 'Chai (Masala Tea)', description: 'Strong, spiced railway chai brewed with ginger, cardamom & tulsi', price: 15, category: 'Beverages', emoji: '🍵', station: 'Kolkata', hotelName: 'Platform Chai Wala', hotelRating: 4.0, isVeg: true, prepTime: 3, calories: 70, tags: ['must-try', 'classic'] },

  // ─── Bangalore ───
  { name: 'Set Dosa (3 pcs)', description: 'Soft spongy set dosas with potato saagu, coconut chutney & sambar', price: 75, category: 'Breakfast', emoji: '🥞', station: 'Bangalore', hotelName: 'Udupi Grand Station', hotelRating: 4.4, isVeg: true, prepTime: 8, calories: 380, tags: ['popular', 'light'] },
  { name: 'Pulao + Raita', description: 'Fragrant vegetable pulao cooked with whole spices, served with boondi raita', price: 95, category: 'Main Course', emoji: '🍚', station: 'Bangalore', hotelName: 'Udupi Grand Station', hotelRating: 4.4, isVeg: true, prepTime: 10, calories: 450, tags: ['light', 'healthy'] },
  { name: 'Chicken Biriyani (Dum)', description: 'Hyderabadi-style dum biryani with whole spices, served with mirchi ka salan', price: 190, category: 'Main Course', emoji: '🍛', station: 'Bangalore', hotelName: 'Hyderabadi Grill Rail', hotelRating: 4.7, isVeg: false, prepTime: 15, calories: 690, tags: ['bestseller', 'spicy'] },
  { name: 'Fresh Lime Soda', description: 'Chilled fresh lime with soda — sweet, salted or masala', price: 40, category: 'Beverages', emoji: '🥤', station: 'Bangalore', hotelName: 'Station Snack Bar', hotelRating: 4.0, isVeg: true, prepTime: 2, calories: 60, tags: ['refreshing'] },
];

async function seedFood() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing food items
    await FoodItem.deleteMany({});
    console.log('🗑️  Cleared existing food items');

    // Insert all food items
    const inserted = await FoodItem.insertMany(foodItems);
    console.log(`🍽️  Seeded ${inserted.length} food items across ${[...new Set(foodItems.map(f => f.station))].length} stations`);

    const byStation = foodItems.reduce((acc, f) => {
      acc[f.station] = (acc[f.station] || 0) + 1;
      return acc;
    }, {});
    Object.entries(byStation).forEach(([s, c]) => console.log(`   📍 ${s}: ${c} items`));

    console.log('✅ Food court seeding complete!');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

seedFood();
