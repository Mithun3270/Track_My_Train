const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
	username: { type: String, required: true, unique: true },
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	phoneNumber: { type: String },
	firstName: String,
	lastName: String,
	profilePicture: String,
	savedTrains: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Train'
	}],
	bookings: [{
		trainId: mongoose.Schema.Types.ObjectId,
		bookingDate: Date,
		journeyDate: Date,
		status: { type: String, enum: ['Confirmed', 'Cancelled', 'Completed'] }
	}],
	bookedSeats: [{
		seatId: mongoose.Schema.Types.ObjectId,
		trainId: mongoose.Schema.Types.ObjectId,
		seatNumber: String,
		fare: Number,
		foodFare: { type: Number, default: 0 },
		onboardFood: { type: String, enum: ['None', 'Veg', 'Non-Veg'], default: 'None' },
		bookingRef: { type: String, default: '' },
		bookedDate: Date,
		status: { type: String, enum: ['Hold', 'Confirmed', 'Cancelled'], default: 'Hold' }
	}],
	preferences: {
		notifications: { type: Boolean, default: true },
		language: { type: String, default: 'en' },
		theme: { type: String, enum: ['light', 'dark'], default: 'light' }
	},
	emergencyContacts: [{
		name: String,
		phoneNumber: String,
		relationship: String
	}],
	isVerified: { type: Boolean, default: false },
	role: { type: String, enum: ['user', 'admin'], default: 'user' },
	lastLogin: Date
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function(next) {
	if (!this.isModified('password')) return next();
	try {
		const salt = await bcrypt.genSalt(10);
		this.password = await bcrypt.hash(this.password, salt);
		next();
	} catch (err) {
		next(err);
	}
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(password) {
	return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);
