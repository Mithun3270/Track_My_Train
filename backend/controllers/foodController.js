const FoodItem = require('../models/FoodItem');
const FoodOrder = require('../models/FoodOrder');

// ─── GET ALL FOOD ITEMS (public — no auth needed) ────
exports.getAllFoodItems = async (req, res) => {
  try {
    const { station, category, veg } = req.query;
    const filter = { isAvailable: true };
    if (station) filter.station = { $regex: station, $options: 'i' };
    if (category) filter.category = category;
    if (veg !== undefined) filter.isVeg = veg === 'true';
    const items = await FoodItem.find(filter).sort({ category: 1, price: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch food items', message: err.message });
  }
};

// ─── GET STATIONS THAT HAVE FOOD COURTS ────
exports.getStationsWithFood = async (req, res) => {
  try {
    const stations = await FoodItem.distinct('station');
    res.json(stations);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stations', message: err.message });
  }
};

// ─── GET SINGLE FOOD ITEM ────
exports.getFoodItemById = async (req, res) => {
  try {
    const item = await FoodItem.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch item', message: err.message });
  }
};

// ─── PLACE FOOD ORDER (auth required) ────
exports.placeOrder = async (req, res) => {
  try {
    const { trainId, station, items, deliveryNote } = req.body;
    if (!trainId || !station || !items || items.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate and enrich items with current prices
    const enrichedItems = [];
    let totalAmount = 0;
    for (const item of items) {
      const foodItem = await FoodItem.findById(item.foodItemId);
      if (!foodItem || !foodItem.isAvailable) {
        return res.status(400).json({ error: `Item ${item.name || item.foodItemId} not available` });
      }
      const qty = item.quantity || 1;
      enrichedItems.push({
        foodItemId: foodItem._id,
        name: foodItem.name,
        price: foodItem.price,
        quantity: qty,
      });
      totalAmount += foodItem.price * qty;
    }

    const order = new FoodOrder({
      userId: req.userId,
      trainId,
      station,
      items: enrichedItems,
      totalAmount,
      deliveryNote: deliveryNote || '',
      estimatedDelivery: new Date(Date.now() + 20 * 60 * 1000), // 20 minutes from now
    });
    await order.save();
    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (err) {
    res.status(500).json({ error: 'Failed to place order', message: err.message });
  }
};

// ─── GET USER'S ORDERS ────
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await FoodOrder.find({ userId: req.userId })
      .populate('items.foodItemId', 'name emoji category')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders', message: err.message });
  }
};

// ─── GET SINGLE ORDER STATUS ────
exports.getOrderStatus = async (req, res) => {
  try {
    const order = await FoodOrder.findOne({ _id: req.params.id, userId: req.userId });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order', message: err.message });
  }
};

// ─── CANCEL ORDER ────
exports.cancelOrder = async (req, res) => {
  try {
    const order = await FoodOrder.findOne({ _id: req.params.id, userId: req.userId });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (['Ready', 'Delivered'].includes(order.status)) {
      return res.status(400).json({ error: 'Cannot cancel order at this stage' });
    }
    order.status = 'Cancelled';
    await order.save();
    res.json({ message: 'Order cancelled', order });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel order', message: err.message });
  }
};

// ─── ADMIN: UPDATE ORDER STATUS ────
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await FoodOrder.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ message: 'Status updated', order });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status', message: err.message });
  }
};

// ─── ADMIN: ADD FOOD ITEM ────
exports.addFoodItem = async (req, res) => {
  try {
    const item = new FoodItem(req.body);
    await item.save();
    res.status(201).json({ message: 'Food item added', item });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add item', message: err.message });
  }
};
