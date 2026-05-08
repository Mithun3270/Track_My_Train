const mongoose = require('mongoose');

const TrainSchema = new mongoose.Schema({
	trainNumber: { type: String, required: true, unique: true },
	trainName: { type: String, required: true },
	source: { type: String, required: true },
	destination: { type: String, required: true },
	route: [
		{
			stationName: String,
			stationCode: String,
			arrivalTime: Date,
			departureTime: Date,
			distance: Number,
			platform: String
		}
	],
	schedule: {
		departureTime: { type: Date, required: true },
		arrivalTime: { type: Date, required: true },
		duration: Number,
		frequency: String // daily, weekly, etc
	},
	status: { 
		type: String, 
		enum: ['Running', 'Delayed', 'Cancelled', 'Scheduled'],
		default: 'Scheduled'
	},
	currentStation: { type: String },
	currentLocation: {
		latitude: Number,
		longitude: Number,
		lastUpdated: Date
	},
	delayMinutes: { type: Number, default: 0 },
	capacity: {
		total: Number,
		available: Number
	},
	trainType: { 
		type: String, 
		enum: ['Express', 'Local', 'Superfast', 'Rajdhani', 'Shatabdi'],
		default: 'Express'
	},
	amenities: [String], // wifi, food, sleeper, ac, etc
	fare: {
		general: Number,
		ac: Number,
		sleeper: Number
	},
	operator: String,
	isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Train', TrainSchema);