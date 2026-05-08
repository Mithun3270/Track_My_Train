const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	trainId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Train'
	},
	type: {
		type: String,
		enum: ['delay', 'arrival', 'cancellation', 'booking', 'alert', 'info'],
		required: true
	},
	title: { type: String, required: true },
	message: { type: String, required: true },
	isRead: { type: Boolean, default: false },
	isPushed: { type: Boolean, default: false },
	priority: { 
		type: String, 
		enum: ['low', 'medium', 'high', 'critical'],
		default: 'medium'
	},
	actionUrl: String,
	metadata: {
		delayMinutes: Number,
		newStation: String,
		trainNumber: String
	}
}, { timestamps: true });

// Auto-delete old notifications after 30 days
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.model('Notification', NotificationSchema);
