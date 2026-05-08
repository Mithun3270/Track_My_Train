const Notification = require('../models/Notification');

// Get user notifications
exports.getNotifications = async (req, res) => {
	try {
		const userId = req.userId;
		const limit = req.query.limit || 20;

		const notifications = await Notification.find({ userId })
			.sort({ createdAt: -1 })
			.limit(parseInt(limit))
			.populate('trainId', 'trainNumber trainName');

		res.json(notifications);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error' });
	}
};

// Get unread notification count
exports.getUnreadCount = async (req, res) => {
	try {
		const userId = req.userId;

		const count = await Notification.countDocuments({ userId, isRead: false });

		res.json({ unreadCount: count });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error' });
	}
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
	try {
		const { notificationId } = req.params;

		const notification = await Notification.findByIdAndUpdate(
			notificationId,
			{ isRead: true },
			{ new: true }
		);

		if (!notification) {
			return res.status(404).json({ error: 'Notification not found' });
		}

		res.json(notification);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error' });
	}
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
	try {
		const userId = req.userId;

		await Notification.updateMany({ userId }, { isRead: true });

		res.json({ message: 'All notifications marked as read' });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error' });
	}
};

// Delete notification
exports.deleteNotification = async (req, res) => {
	try {
		const { notificationId } = req.params;

		const notification = await Notification.findByIdAndDelete(notificationId);

		if (!notification) {
			return res.status(404).json({ error: 'Notification not found' });
		}

		res.json({ message: 'Notification deleted' });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error' });
	}
};

// Clear all notifications
exports.clearAll = async (req, res) => {
	try {
		const userId = req.userId;

		await Notification.deleteMany({ userId });

		res.json({ message: 'All notifications cleared' });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error' });
	}
};
