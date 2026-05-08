const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const {
  getAllFoodItems,
  getStationsWithFood,
  getFoodItemById,
  placeOrder,
  getMyOrders,
  getOrderStatus,
  cancelOrder,
  updateOrderStatus,
  addFoodItem,
} = require('../controllers/foodController');

// ─── PUBLIC ROUTES (no auth needed) ────
router.get('/', getAllFoodItems);                    // GET /api/food
router.get('/stations', getStationsWithFood);        // GET /api/food/stations
router.get('/:id', getFoodItemById);                // GET /api/food/:id

// ─── AUTH ROUTES ────
router.post('/orders/place', auth, placeOrder);          // POST /api/food/orders/place
router.get('/orders/my', auth, getMyOrders);             // GET /api/food/orders/my
router.get('/orders/:id', auth, getOrderStatus);         // GET /api/food/orders/:id
router.put('/orders/:id/cancel', auth, cancelOrder);     // PUT /api/food/orders/:id/cancel

// ─── ADMIN ROUTES ────
router.post('/admin/items', auth, adminOnly, addFoodItem);                          // POST /api/food/admin/items
router.put('/admin/orders/:id/status', auth, adminOnly, updateOrderStatus);         // PUT /api/food/admin/orders/:id/status

module.exports = router;
